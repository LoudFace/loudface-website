#!/usr/bin/env python3
"""Build context-aware em-dash replacement patches.

Strategy decision based on heuristics:
- "X — Y" where Y starts with a capital letter and forms an independent clause → period
- "X — Y — Z" three-clause pattern → comma,comma  (the middle is parenthetical)
- "X — Y" where Y is a noun phrase or appositive → comma
- "X — Y" at end of sentence (before period) → comma
- Default fallback when ambiguous → comma (safer than period)
"""
import json
import re
import sys

def extract_around(text, pos, width=80):
    """Get context window around position."""
    s = max(0, pos - width)
    e = min(len(text), pos + width + 1)
    return text[s:e], s

def is_sentence_end(c):
    return c in ".!?"

def decide_replacement(text, pos):
    """Decide whether to use period, comma, or parens replacement.

    Returns one of: 'period', 'comma', 'parens'.
    """
    # Get a wider window for analysis
    before_text = text[max(0, pos-150):pos]
    after_text = text[pos+1:min(len(text), pos+150)]

    # Find the em-dash positions in the broader vicinity
    # If there's another em-dash within ~80 chars after this one, it's a parens pattern
    next_dash_idx = after_text.find("—")
    if next_dash_idx != -1 and next_dash_idx < 80:
        # Check there isn't a sentence break between them
        between = after_text[:next_dash_idx]
        if not re.search(r"[.!?]\s+[A-Z]", between):
            return 'parens'

    prev_dash_idx = before_text.rfind("—")
    if prev_dash_idx != -1 and (len(before_text) - prev_dash_idx) < 80:
        between = before_text[prev_dash_idx+1:]
        if not re.search(r"[.!?]\s+[A-Z]", between):
            # This is the second dash of a parens pattern; already handled by first one
            # We'll just use comma here as fallback for the second dash
            return 'comma_second'

    # Strip HTML tags from the immediate after-text to find what follows
    after_stripped = re.sub(r"<[^>]+>", "", after_text)
    # Skip whitespace
    after_stripped_clean = after_stripped.lstrip()

    if not after_stripped_clean:
        return 'comma'

    # If after the em-dash is a clear independent clause (subject + verb), use period
    # Heuristic: check if first 3 words include a common verb
    first_words = after_stripped_clean.split()[:5]
    first_chunk = " ".join(first_words).lower()

    # Look for common verbs/pronouns suggesting independent clause
    independent_markers = [
        r"\bthe\s+\w+\s+(is|are|was|were|has|have|will|do|does|did|can|would|could|should|may|might)\b",
        r"\b(it|we|you|they|i|he|she|that|this|these|those)\s+(is|are|was|were|has|have|will|do|does|did|can|would|could|should|may|might|need|want|get|gets|got|make|makes|made|see|sees|saw|know|knows|knew)\b",
        r"\b(but|so|then|now|here|there)\s+(it|we|you|they|the)\b",
    ]

    for pattern in independent_markers:
        if re.search(pattern, first_chunk):
            return 'period'

    # Check if before the em-dash ends in a clear clause-final state
    # e.g., ending in "...is X — Y" suggests appositive (comma)
    # vs. ending in "...completed the task — Y starts" (period)

    before_stripped = re.sub(r"<[^>]+>", "", before_text)
    before_stripped_clean = before_stripped.rstrip()

    # Pull the last sentence fragment
    # Find the last period/newline boundary
    last_break = max(
        before_stripped_clean.rfind("."),
        before_stripped_clean.rfind("!"),
        before_stripped_clean.rfind("?"),
        before_stripped_clean.rfind("\n"),
        before_stripped_clean.rfind(">"),
    )
    fragment = before_stripped_clean[last_break+1:].strip() if last_break >= 0 else before_stripped_clean.strip()

    # If the fragment ends in a verb-noun pattern (subject + verb + complement), likely an independent clause
    # so the em-dash likely introduces another independent → period
    # But this is hard to detect; default to comma if uncertain

    return 'comma'


def apply_replacement_at_position(text, pos, strategy):
    """Apply em-dash replacement at the given position, return new text."""
    # The em-dash is at `pos`. Look at surrounding spaces.
    # Pattern: "X — Y"  (em-dash typically has space before and after)

    # Find the em-dash and its surrounding whitespace
    em_dash = "—"

    # Determine boundaries
    start = pos
    end = pos + 1

    # Skip whitespace before
    while start > 0 and text[start-1] in " \t":
        start -= 1
    # Skip whitespace after
    while end < len(text) and text[end] in " \t":
        end += 1

    before_char = text[start-1] if start > 0 else ""
    after_char = text[end] if end < len(text) else ""

    if strategy == 'period':
        # "X — Y" → "X. Y"  (capitalize Y)
        # Need to capitalize first letter after the em-dash
        replacement = ". "
        # Find next character (the first letter after the space)
        if after_char.isalpha() and after_char.islower():
            return text[:start] + replacement + after_char.upper() + text[end+1:]
        return text[:start] + replacement + text[end:]
    elif strategy == 'comma':
        return text[:start] + ", " + text[end:]
    elif strategy == 'comma_second':
        return text[:start] + ", " + text[end:]
    elif strategy == 'parens':
        # First em-dash of a "X — Y — Z" pair → " ("
        return text[:start] + " (" + text[end:]
    elif strategy == 'parens_close':
        # Second em-dash of a "X — Y — Z" pair → ") "
        return text[:start] + ") " + text[end:]

    # Fallback
    return text[:start] + ", " + text[end:]


def patch_field(text):
    """Patch all em-dashes in a single text field, smart-matching parens patterns.

    Returns the new text and a count of changes.
    """
    if not text or "—" not in text:
        return text, 0

    # First, find all em-dash positions in non-table regions
    table_ranges = []
    for m in re.finditer(r"<table[\s\S]*?</table>", text, flags=re.IGNORECASE):
        table_ranges.append((m.start(), m.end()))

    positions = []
    for m in re.finditer(r"—", text):
        pos = m.start()
        in_table = any(s <= pos < e for s, e in table_ranges)
        if not in_table:
            positions.append(pos)

    if not positions:
        return text, 0

    # Pair up parens patterns: if two em-dashes are within 80 chars and no sentence break, treat as pair
    strategies = []  # parallel to positions
    i = 0
    while i < len(positions):
        pos = positions[i]
        if i + 1 < len(positions):
            next_pos = positions[i+1]
            between = text[pos+1:next_pos]
            # If between is short (<80 chars) and doesn't contain a sentence break
            # AND the between text doesn't look like two separate sentences (no ". " followed by capital)
            if (next_pos - pos) < 100 and not re.search(r"[.!?]\s+[A-Z]", between):
                # Check the content of `between` more carefully:
                # If `between` is a clear parenthetical (noun phrase or short clause), pair them
                between_stripped = re.sub(r"<[^>]+>", "", between).strip()
                # Simple heuristic: parenthetical if the between text doesn't have a subject-verb followed by an object
                # We'll just trust the proximity check for now
                if len(between_stripped) < 80:
                    strategies.append('parens')
                    strategies.append('parens_close')
                    i += 2
                    continue
        # Single em-dash; decide period vs comma
        strategy = decide_replacement(text, pos)
        if strategy == 'comma_second':
            strategy = 'comma'
        strategies.append(strategy)
        i += 1

    # Apply replacements in reverse order so positions don't shift
    new_text = text
    for pos, strategy in reversed(list(zip(positions, strategies))):
        new_text = apply_replacement_at_position(new_text, pos, strategy)

    return new_text, len(positions)


def main():
    with open(".claude/audit/em-dash-sweep/em-dash-report.json") as f:
        report = json.load(f)

    with open(".claude/audit/em-dash-sweep/all-posts.json") as f:
        all_data = json.load(f)

    # Build post lookup by _id
    posts_by_id = {p["_id"]: p for p in all_data["result"]}

    patches = []

    for affected in report["affected"]:
        post_id = affected["_id"]
        post = posts_by_id[post_id]
        slug = affected["slug"]

        patch = {
            "_id": post_id,
            "_rev": post["_rev"],
            "slug": slug,
            "fields": {},
            "change_counts": {},
            "strategies": {},
        }

        # Patch content
        if post.get("content"):
            new_content, n = patch_field(post["content"])
            if n > 0:
                patch["fields"]["content"] = new_content
                patch["change_counts"]["content"] = n

        # Patch excerpt (no table exclusion since unlikely)
        if post.get("excerpt"):
            new_excerpt, n = patch_field(post["excerpt"])
            if n > 0:
                patch["fields"]["excerpt"] = new_excerpt
                patch["change_counts"]["excerpt"] = n

        # Patch metaDescription
        if post.get("metaDescription"):
            new_meta, n = patch_field(post["metaDescription"])
            if n > 0:
                patch["fields"]["metaDescription"] = new_meta
                patch["change_counts"]["metaDescription"] = n

        # Note: FAQ answers are inside faq array, we need to handle them specially in the mutation
        # We'll fetch the full faq array and patch in place
        faq_answers = post.get("faqAnswers") or []
        faq_changes = []
        for i, ans in enumerate(faq_answers):
            if ans:
                new_ans, n = patch_field(ans)
                if n > 0:
                    faq_changes.append({"index": i, "newAnswer": new_ans, "count": n})
        if faq_changes:
            patch["faq_changes"] = faq_changes
            patch["change_counts"]["faq"] = sum(c["count"] for c in faq_changes)

        patches.append(patch)

    with open(".claude/audit/em-dash-sweep/patches.json", "w") as f:
        json.dump(patches, f, indent=2, ensure_ascii=False)

    total = sum(sum(p["change_counts"].values()) for p in patches)
    print(f"Built patches for {len(patches)} posts, {total} total em-dashes replaced")
    for p in patches:
        cc = p["change_counts"]
        parts = [f"{k}={v}" for k, v in cc.items()]
        print(f"  /blog/{p['slug']}: {', '.join(parts)}")


if __name__ == "__main__":
    main()
