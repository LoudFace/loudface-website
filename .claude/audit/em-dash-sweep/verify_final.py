#!/usr/bin/env python3
"""Final verification: count em-dashes ONLY in prose, properly excluding tables and template UI."""
import json
import re
import urllib.request

def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", errors="replace")


def count_prose_em_dashes(html):
    """Strip:
    1. <table>...</table> blocks (both literal and <-escaped)
    2. <script type="application/ld+json">...</script> blocks
    3. React server payload tables (escaped as <table...)
    4. Footer location pattern <span ...>—</span> (single-char em-dash in span)
    """
    # Strip literal tables
    s = re.sub(r"<table[\s\S]*?</table>", "", html, flags=re.IGNORECASE)
    # Strip JSON-LD script blocks
    s = re.sub(r"<script[^>]*application/ld\+json[^>]*>[\s\S]*?</script>", "", s, flags=re.IGNORECASE)
    # Strip Next.js __next_f payload (escaped React tree containing escaped tables)
    s = re.sub(r"<script>self\.__next_f\.push\([\s\S]*?\)</script>", "", s)
    # Strip Next.js page data scripts
    s = re.sub(r"<script\b[^>]*>[\s\S]*?self\.__next_f[\s\S]*?</script>", "", s)
    # Strip escaped React data tables (look for u003ctable patterns)
    s = re.sub(r"u003ctable[\s\S]*?u003c/table\\u003e", "", s)
    s = re.sub(r"\\u003ctable[\s\S]*?\\u003c/table\\u003e", "", s)
    # Strip single-char em-dash spans (template UI like "San Francisco — Dubai")
    s = re.sub(r"<span[^>]*>\s*—\s*</span>", "", s)

    hits = list(re.finditer(r"—", s))
    contexts = []
    for h in hits[:5]:
        start = max(0, h.start()-60)
        end = min(len(s), h.start()+60)
        ctx = re.sub(r"\s+", " ", s[start:end])
        contexts.append(ctx)
    return len(hits), contexts


def main():
    with open(".claude/audit/em-dash-sweep/applied.json") as f:
        applied = json.load(f)
    # Also include the remaining patches
    extra = []
    try:
        with open(".claude/audit/em-dash-sweep/applied-remaining.json") as f:
            extra = json.load(f)
    except FileNotFoundError:
        pass
    extra_slugs = {r["slug"] for r in extra if r.get("ok")}

    print(f"Verifying {len(applied)} patched posts...")
    issues = []
    clean = 0
    for r in applied:
        if not r.get("ok"):
            continue
        slug = r["slug"]
        url = f"https://www.loudface.co/blog/{slug}"
        try:
            html = fetch(url)
        except Exception as e:
            issues.append({"slug": slug, "issue": "fetch_failed", "err": str(e)})
            continue
        n, ctxs = count_prose_em_dashes(html)
        if n == 0:
            clean += 1
        else:
            issues.append({"slug": slug, "remaining": n, "contexts": ctxs})

    print(f"Clean: {clean}/{len(applied)}")
    print(f"Issues: {len(issues)}")
    for i in issues:
        print(f"  /blog/{i['slug']}: {i.get('remaining', '?')}")
        for c in i.get("contexts", [])[:2]:
            print(f"      → {c[:140]}")

    with open(".claude/audit/em-dash-sweep/verification-final.json", "w") as f:
        json.dump({"clean": clean, "issues": issues}, f, indent=2)


if __name__ == "__main__":
    main()
