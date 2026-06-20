#!/usr/bin/env python3
"""
Push a markdown draft into a Notion page's body as blocks.

Used by the content loop to put the actual draft INSIDE the Notion calendar
entry (per CLAUDE.md: "Drafts live inside the database entries"), not in a
separate file on disk.

Usage:
  python3 scripts/push-draft-to-notion.py \
      --draft .claude/drafts/toku-vs-bitwage-2026.md \
      --page  367b6339-4d10-8137-bdb0-cae41cd7ee0e \
      [--replace]   # delete existing children first
      [--status Draft]   # also update Status property

Handles: # h1, ## h2, ### h3, paragraphs, bold, italic, inline code,
links, bulleted/numbered lists, blockquotes, GitHub-style tables, code
fences. Splits paragraphs >2000 chars into segments. Batches block writes
to <=100 per request (Notion API limit).

Reads NOTION_API_TOKEN from workers/loudface-seo-sync/.env if not set in env.
"""

import argparse
import json
import os
import re
import sys
import time
import urllib.request
import urllib.error
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
ENV_PATH = REPO_ROOT / "workers" / "loudface-seo-sync" / ".env"
NOTION_VERSION = "2025-09-03"
NOTION_BASE = "https://api.notion.com/v1"


# ---------- env --------------------------------------------------------------

def load_env_file(path: Path) -> None:
    if not path.exists():
        return
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" not in line:
            continue
        k, v = line.split("=", 1)
        k = k.strip()
        v = v.strip()
        if k and k not in os.environ:
            os.environ[k] = v


# ---------- inline rich-text parser ------------------------------------------

INLINE_BOLD = re.compile(r"\*\*(.+?)\*\*")
INLINE_ITAL = re.compile(r"(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)")
INLINE_CODE = re.compile(r"`([^`]+)`")
INLINE_LINK = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")

# Token types: ("text", str), ("bold", str), ("italic", str), ("code", str), ("link", (text, url))


def tokenize_inline(s: str):
    """Convert a string with markdown inline syntax into a list of typed tokens."""
    tokens = [("text", s)]

    def split_pattern(pattern, kind):
        nonlocal tokens
        out = []
        for tok in tokens:
            if tok[0] != "text":
                out.append(tok)
                continue
            text = tok[1]
            last = 0
            for m in pattern.finditer(text):
                if m.start() > last:
                    out.append(("text", text[last:m.start()]))
                if kind == "link":
                    out.append(("link", (m.group(1), m.group(2))))
                else:
                    out.append((kind, m.group(1)))
                last = m.end()
            if last < len(text):
                out.append(("text", text[last:]))
        tokens = out

    # Order matters: code first (so we don't bold inside backticks), then link, then bold, then italic
    split_pattern(INLINE_CODE, "code")
    split_pattern(INLINE_LINK, "link")
    split_pattern(INLINE_BOLD, "bold")
    split_pattern(INLINE_ITAL, "italic")
    return tokens


def tokens_to_rich_text(tokens):
    """Convert tokenized inline content to Notion rich_text array."""
    out = []
    for kind, val in tokens:
        if kind == "text":
            if not val:
                continue
            out.append({"type": "text", "text": {"content": val}})
        elif kind == "bold":
            out.append({
                "type": "text",
                "text": {"content": val},
                "annotations": {"bold": True},
            })
        elif kind == "italic":
            out.append({
                "type": "text",
                "text": {"content": val},
                "annotations": {"italic": True},
            })
        elif kind == "code":
            out.append({
                "type": "text",
                "text": {"content": val},
                "annotations": {"code": True},
            })
        elif kind == "link":
            text, url = val
            out.append({
                "type": "text",
                "text": {"content": text, "link": {"url": url}},
            })
    return out


def text_to_rich_text(s: str):
    """Cap each text segment to <=2000 chars (Notion API limit)."""
    tokens = tokenize_inline(s)
    rich = tokens_to_rich_text(tokens)
    # Split any segment over 2000 chars
    capped = []
    for r in rich:
        content = r["text"]["content"]
        if len(content) <= 2000:
            capped.append(r)
        else:
            for i in range(0, len(content), 2000):
                chunk = dict(r)
                chunk["text"] = dict(r["text"])
                chunk["text"]["content"] = content[i:i + 2000]
                capped.append(chunk)
    return capped


# ---------- markdown → blocks ------------------------------------------------

def parse_markdown(md: str):
    """Parse markdown into a list of Notion block dicts."""
    # Strip YAML front-matter if present
    if md.startswith("---\n"):
        end = md.find("\n---\n", 4)
        if end != -1:
            md = md[end + 5:]

    blocks = []
    lines = md.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.rstrip()

        # Blank line
        if not stripped.strip():
            i += 1
            continue

        # Code fence
        if stripped.startswith("```"):
            lang = stripped[3:].strip() or "plain text"
            code_lines = []
            i += 1
            while i < len(lines) and not lines[i].rstrip().startswith("```"):
                code_lines.append(lines[i])
                i += 1
            i += 1  # skip closing fence
            code_text = "\n".join(code_lines)
            blocks.append({
                "object": "block",
                "type": "code",
                "code": {
                    "rich_text": [{"type": "text", "text": {"content": code_text[:2000]}}],
                    "language": lang if lang in NOTION_CODE_LANGS else "plain text",
                },
            })
            continue

        # Headings
        h_match = re.match(r"^(#{1,3})\s+(.*)$", stripped)
        if h_match:
            level = len(h_match.group(1))
            text = h_match.group(2)
            blocks.append({
                "object": "block",
                "type": f"heading_{level}",
                f"heading_{level}": {"rich_text": text_to_rich_text(text)},
            })
            i += 1
            continue

        # Blockquote
        if stripped.startswith("> "):
            quote_lines = []
            while i < len(lines) and lines[i].rstrip().startswith("> "):
                quote_lines.append(lines[i].rstrip()[2:])
                i += 1
            blocks.append({
                "object": "block",
                "type": "quote",
                "quote": {"rich_text": text_to_rich_text(" ".join(quote_lines))},
            })
            continue

        # Bulleted list (- or *)
        if re.match(r"^[-*]\s+", stripped):
            bullet_match = re.match(r"^[-*]\s+(.*)$", stripped)
            blocks.append({
                "object": "block",
                "type": "bulleted_list_item",
                "bulleted_list_item": {"rich_text": text_to_rich_text(bullet_match.group(1))},
            })
            i += 1
            continue

        # Numbered list (1. 2. etc.)
        if re.match(r"^\d+\.\s+", stripped):
            num_match = re.match(r"^\d+\.\s+(.*)$", stripped)
            blocks.append({
                "object": "block",
                "type": "numbered_list_item",
                "numbered_list_item": {"rich_text": text_to_rich_text(num_match.group(1))},
            })
            i += 1
            continue

        # Table (consecutive | lines)
        if stripped.startswith("|") and stripped.endswith("|"):
            table_lines = []
            while i < len(lines):
                t = lines[i].rstrip()
                if not (t.startswith("|") and t.endswith("|")):
                    break
                table_lines.append(t)
                i += 1
            block = parse_table(table_lines)
            if block:
                blocks.append(block)
            continue

        # Paragraph (accumulate consecutive non-blank, non-special lines)
        para_lines = [stripped]
        i += 1
        while i < len(lines):
            nxt = lines[i].rstrip()
            if not nxt.strip():
                break
            if (
                re.match(r"^#{1,3}\s+", nxt)
                or nxt.startswith("```")
                or nxt.startswith("> ")
                or re.match(r"^[-*]\s+", nxt)
                or re.match(r"^\d+\.\s+", nxt)
                or (nxt.startswith("|") and nxt.endswith("|"))
            ):
                break
            para_lines.append(nxt)
            i += 1
        para_text = " ".join(para_lines)
        blocks.append({
            "object": "block",
            "type": "paragraph",
            "paragraph": {"rich_text": text_to_rich_text(para_text)},
        })

    return blocks


def parse_table(table_lines):
    """Convert |---|---|--- GitHub-style table to a Notion table block."""
    rows = []
    for line in table_lines:
        # Skip separator rows (---|---|---)
        cells = [c.strip() for c in line.strip("|").split("|")]
        if all(re.match(r"^:?-+:?$", c) for c in cells if c):
            continue
        rows.append(cells)
    if not rows:
        return None
    width = max(len(r) for r in rows)
    # Pad short rows
    rows = [r + [""] * (width - len(r)) for r in rows]
    return {
        "object": "block",
        "type": "table",
        "table": {
            "table_width": width,
            "has_column_header": True,
            "has_row_header": False,
            "children": [
                {
                    "object": "block",
                    "type": "table_row",
                    "table_row": {
                        "cells": [text_to_rich_text(c) for c in row],
                    },
                }
                for row in rows
            ],
        },
    }


# Notion supports a fixed set of code language identifiers
NOTION_CODE_LANGS = {
    "abap", "arduino", "bash", "basic", "c", "clojure", "coffeescript", "c++", "c#", "css",
    "dart", "diff", "docker", "elixir", "elm", "erlang", "flow", "fortran", "f#", "gherkin",
    "glsl", "go", "graphql", "groovy", "haskell", "html", "java", "javascript", "json",
    "julia", "kotlin", "latex", "less", "lisp", "livescript", "lua", "makefile", "markdown",
    "markup", "matlab", "mermaid", "nix", "objective-c", "ocaml", "pascal", "perl", "php",
    "plain text", "powershell", "prolog", "protobuf", "python", "r", "reason", "ruby",
    "rust", "sass", "scala", "scheme", "scss", "shell", "sql", "swift", "typescript",
    "vb.net", "verilog", "vhdl", "visual basic", "webassembly", "xml", "yaml",
}


# ---------- Notion API -------------------------------------------------------

def notion_request(method: str, path: str, body=None):
    url = f"{NOTION_BASE}{path}"
    headers = {
        "Authorization": f"Bearer {os.environ['NOTION_API_TOKEN']}",
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
    }
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body_text = e.read().decode("utf-8")
        raise RuntimeError(f"{method} {url} → {e.code}\n{body_text}") from None


def list_existing_children(page_id: str):
    """Return list of (block_id, type) for direct children of the page."""
    out = []
    cursor = None
    while True:
        path = f"/blocks/{page_id}/children?page_size=100"
        if cursor:
            path += f"&start_cursor={cursor}"
        res = notion_request("GET", path)
        for child in res.get("results", []):
            out.append((child["id"], child["type"]))
        if res.get("has_more"):
            cursor = res.get("next_cursor")
        else:
            break
    return out


def delete_block(block_id: str):
    notion_request("DELETE", f"/blocks/{block_id}")


def append_blocks(page_id: str, blocks):
    """Append blocks to page in batches of 100 (Notion API limit)."""
    appended = 0
    for i in range(0, len(blocks), 100):
        batch = blocks[i:i + 100]
        notion_request("PATCH", f"/blocks/{page_id}/children", {"children": batch})
        appended += len(batch)
        # Light throttle
        time.sleep(0.4)
    return appended


def update_status(page_id: str, status_name: str):
    notion_request("PATCH", f"/pages/{page_id}", {
        "properties": {"Status": {"status": {"name": status_name}}},
    })


# ---------- main -------------------------------------------------------------

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--draft", required=True, help="Path to markdown draft")
    ap.add_argument("--page", required=True, help="Notion page ID")
    ap.add_argument("--replace", action="store_true",
                    help="Delete existing children before appending")
    ap.add_argument("--status", help="Optional: update Status property after push")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    load_env_file(ENV_PATH)
    if "NOTION_API_TOKEN" not in os.environ:
        sys.exit("ERROR: NOTION_API_TOKEN not set (looked in .env too)")

    draft_path = Path(args.draft)
    if not draft_path.is_absolute():
        draft_path = REPO_ROOT / draft_path
    if not draft_path.exists():
        sys.exit(f"ERROR: draft not found: {draft_path}")
    md = draft_path.read_text()
    blocks = parse_markdown(md)
    print(f"Parsed {len(blocks)} blocks from {draft_path}")

    if args.dry_run:
        for i, b in enumerate(blocks[:15]):
            print(f"  [{i:>3}] {b['type']}")
        if len(blocks) > 15:
            print(f"  ... and {len(blocks) - 15} more")
        return

    if args.replace:
        existing = list_existing_children(args.page)
        print(f"Replacing: found {len(existing)} existing child blocks. Deleting...")
        for bid, btype in existing:
            try:
                delete_block(bid)
            except Exception as e:
                print(f"  WARN: failed to delete {bid} ({btype}): {e}")
        print(f"Deleted {len(existing)} children")

    appended = append_blocks(args.page, blocks)
    print(f"Appended {appended} blocks to page {args.page}")

    if args.status:
        update_status(args.page, args.status)
        print(f"Updated Status → {args.status}")

    print("Done.")


if __name__ == "__main__":
    main()
