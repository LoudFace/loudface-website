#!/usr/bin/env python3
"""Build context-aware em-dash replacement patches v2.

Improved strategy:
1. Pair detection — two em-dashes within ~100 chars with parenthetical between → parens
2. Independent clause after em-dash → period (capitalize)
3. List enumeration / appositive → comma
4. Default → comma
"""
import json
import re
import sys


def strip_html(s):
    return re.sub(r"<[^>]+>", "", s)


def is_independent_clause(text_after):
    """Decide if the text after an em-dash is an independent clause.

    An independent clause has a subject + finite verb.
    """
    if not text_after:
        return False
    stripped = strip_html(text_after).lstrip()
    if not stripped:
        return False

    # Get first ~80 chars
    chunk = stripped[:120].lower()

    # Starts with conjunction (and, but, or, so, yet, nor) → NOT independent
    # The em-dash is acting as a connector, comma is right
    if re.match(r"^(and|but|or|so|yet|nor|because|since|while|although|though|when|if|unless|until)\b", chunk):
        return False

    # Strong signals: starts with pronoun + verb
    pronouns = r"(it|we|you|they|i|he|she|that|this|these|those|there|here)"
    verbs = r"(is|are|was|were|has|have|had|will|would|do|does|did|can|could|should|may|might|must|need|want|wants|wanted|get|gets|got|make|makes|made|see|sees|saw|know|knows|knew|think|thinks|thought|feel|feels|felt|come|comes|came|go|goes|went|run|runs|ran|build|builds|built|use|uses|used|find|finds|found|take|takes|took|give|gives|gave|put|puts|let|lets|tell|tells|told|ship|ships|shipped|work|works|worked|earn|earns|earned|sell|sells|sold|drive|drives|drove|beat|beats|stop|stops|stopped|win|wins|won|lose|loses|lost|cost|costs|matter|matters|mean|means|meant|wins|loses|matters)"
    if re.match(rf"^{pronouns}\s+{verbs}\b", chunk):
        return True
    # Starts with "the X is/are/etc"
    if re.match(rf"^the\s+\w+\s+{verbs}\b", chunk):
        return True
    if re.match(rf"^the\s+\w+\s+\w+\s+{verbs}\b", chunk):
        return True
    # "X's Y is/are..."
    if re.match(rf"^\w+'s\s+\w+\s+{verbs}\b", chunk):
        return True
    # "a/an X is/are..."
    if re.match(rf"^(a|an)\s+\w+\s+{verbs}\b", chunk):
        return True
    # "X is/are..." where X is a single noun
    if re.match(rf"^\w+\s+{verbs}\b", chunk):
        return True

    # "yes," or "no," at the start → start of new sentence
    if re.match(r"^(yes|no)\b", chunk):
        return True

    return False


def is_appositive_or_list(text_after, text_before):
    """Detect appositive or list expansion (use comma)."""
    if not text_after:
        return False
    stripped = strip_html(text_after).lstrip()
    if not stripped:
        return False

    chunk = stripped[:120]

    # Starts with article + noun then comma or period (a list of items)
    # e.g., "a US SMB program weights..." OR "tools, research papers, agencies"
    # If it's clearly a noun phrase or list, comma is right

    # Starts lowercase → comma (continuation)
    if chunk[0].islower():
        return True

    # No, capital may still be a proper noun in an appositive
    # Check if the rest doesn't look like a sentence
    return False


def detect_pair_pattern(text, pos1, pos2):
    """Check if two em-dashes at pos1 and pos2 form a parenthetical pair."""
    if pos2 - pos1 > 150:
        return False
    between = text[pos1+1:pos2]
    # If between has a sentence-ending period followed by capital, it's not a pair
    if re.search(r"[.!?]\s+[A-Z]", strip_html(between)):
        return False
    # Limit length: parens should be short clauses
    between_stripped = strip_html(between).strip()
    if len(between_stripped) > 100:
        return False
    if not between_stripped:
        return False
    return True


def decide_strategy(text, pos, paired_with_next=False, second_of_pair=False):
    """Decide replacement strategy for a single em-dash."""
    if paired_with_next:
        return 'parens_open'
    if second_of_pair:
        return 'parens_close'

    # Check if this em-dash is in a heading (h1-h6). Inside headings, prefer comma over period
    # since we shouldn't split a heading into two sentences
    # Look back for opening heading tag without close
    heading_before = re.search(r"<(h[1-6])[^>]*>(?!.*</\1>)", text[max(0, pos-500):pos], re.IGNORECASE)
    in_heading = bool(heading_before)

    # Look at what comes after
    after_text = text[pos+1:pos+200]
    after_stripped = strip_html(after_text).lstrip()

    # Check if the dash introduces a list that ends before a sentence break
    # Pattern: "X — list1, list2, list3. NextSentence" → parens (single-side parens with implied close)
    # But single-side parens aren't valid; if only one em-dash, use comma
    # (parens require pairs and we already handled those)

    if not in_heading and is_independent_clause(after_text):
        return 'period'

    # Common label patterns where period works (sentence break after label)
    before_chunk = strip_html(text[max(0, pos-100):pos]).rstrip()
    if not in_heading and re.search(r"(Bottom line|Result|Outcome|Verdict|TL;DR|Caveat)[:\s]*\w+[\w\s,]*$", before_chunk, re.I):
        return 'period'

    # "Yes/No/Maybe — independent clause" → period
    if re.match(r"^(Yes|No|Maybe)\b", after_stripped):
        if not in_heading:
            return 'period'

    return 'comma'


def apply_at_pos(text, pos, strategy):
    """Apply one replacement at em-dash position. Returns new text."""
    em_dash_pos = pos
    em_dash_end = pos + 1
    # Expand to include surrounding whitespace
    start = em_dash_pos
    while start > 0 and text[start-1] in " \t":
        start -= 1
    end = em_dash_end
    while end < len(text) and text[end] in " \t":
        end += 1

    if strategy == 'period':
        # Skip after_end to find next non-space char to capitalize
        after_idx = end
        # First letter after em-dash should be capitalized
        if after_idx < len(text) and text[after_idx].isalpha() and text[after_idx].islower():
            return text[:start] + ". " + text[after_idx].upper() + text[after_idx+1:]
        return text[:start] + ". " + text[end:]
    elif strategy == 'comma':
        return text[:start] + ", " + text[end:]
    elif strategy == 'parens_open':
        return text[:start] + " (" + text[end:]
    elif strategy == 'parens_close':
        return text[:start] + ") " + text[end:]
    return text[:start] + ", " + text[end:]


def patch_text(text):
    """Process all em-dashes in `text`, returning (new_text, change_count)."""
    if not text or "—" not in text:
        return text, 0

    # Identify table ranges
    table_ranges = [(m.start(), m.end()) for m in re.finditer(r"<table[\s\S]*?</table>", text, flags=re.IGNORECASE)]

    positions = []
    for m in re.finditer(r"—", text):
        p = m.start()
        if not any(s <= p < e for s, e in table_ranges):
            positions.append(p)

    if not positions:
        return text, 0

    # Decide strategies — pair detection first
    strategies = [None] * len(positions)
    i = 0
    while i < len(positions):
        if strategies[i] is not None:
            i += 1
            continue
        pos = positions[i]
        if i+1 < len(positions):
            next_pos = positions[i+1]
            if detect_pair_pattern(text, pos, next_pos):
                # Make this a pair only if the text *before* the first em-dash
                # is part of the same sentence as the text *after* the second em-dash.
                # i.e., it's truly a parenthetical embedded in a sentence.
                between = strip_html(text[pos+1:next_pos]).strip()
                after_second = strip_html(text[next_pos+1:next_pos+150]).lstrip()
                # If after second em-dash continues with lowercase or comma, it's likely a pair
                if after_second and (after_second[0].islower() or after_second[0] in ',;'):
                    strategies[i] = 'parens_open'
                    strategies[i+1] = 'parens_close'
                    i += 2
                    continue
                # Also pair if between is clearly a parenthetical list (commas)
                if "," in between and not is_independent_clause(text[pos+1:next_pos]):
                    # Decide based on what comes after the SECOND dash
                    after_words = after_second.split()[:5]
                    after_chunk_lower = " ".join(after_words).lower()
                    # If after_second starts a new sentence subject ("the X is", "it is"), then pair
                    # else don't pair
                    if re.match(r"^(the|a|an|this|that|these|those|it|we|you|they|i|he|she)\b", after_chunk_lower):
                        # Could go either way; default to pair if between is short list
                        if len(between) < 80:
                            strategies[i] = 'parens_open'
                            strategies[i+1] = 'parens_close'
                            i += 2
                            continue
        # Not paired — single em-dash strategy
        strategies[i] = decide_strategy(text, pos)
        i += 1

    # Apply replacements in reverse order
    new_text = text
    for pos, strategy in reversed(list(zip(positions, strategies))):
        new_text = apply_at_pos(new_text, pos, strategy)

    return new_text, len(positions)


REDIRECTED = {
    "aeo-agency-pricing-for-b2b-saas-2026",
    "aeo-for-webflow-how-to-make-your-site-discoverable-by-ai-search-engines",
    "aeo-strategies-that-work",
    "ai-first-content-architecture",
    "cms-for-marketers-2026",
    "how-ai-webflow-systems-reduce-development-costs-for-scaling-teams",
    "how-to-choose-the-right-webflow-agency-for-your-brand",
    "how-to-future-proof-your-webflow-website-for-search-and-ai-agents",
    "is-webflow-good-for-ecommerce-the-honest-2026-review-features-costs-alternatives",
    "is-webflow-good-for-small-businesses",
    "seo-vs-aeo-webflow",
    "seo-vs-aeo-what-actually-changes-for-your-webflow-site-in-2026",
    "the-future-of-webflow",
    "the-future-of-webflow-ai-assisted-design-development-and-optimization",
    "the-problem-with-traditional-webflow-agencies",
    "top-webflow-agency",
    "understanding-webflow-pricing",
    "webflow-vs-framer",
    "webflow-website-design",
    "webflow-zapier-integration",
    "webflows-new-brand-overhaul-and-platform-updates",
    "why-are-startups-switching-to-webflow",
    "why-choose-loudface-webflow-agency",
}


def main():
    with open(".claude/audit/em-dash-sweep/all-posts-extended.json") as f:
        all_data = json.load(f)

    patches = []
    for post in all_data["result"]:
        slug = post.get("slug")
        if not slug or slug in REDIRECTED:
            continue

        post_id = post["_id"]

        patch = {
            "_id": post_id,
            "_rev": post["_rev"],
            "slug": slug,
            "fields": {},
            "change_counts": {},
        }

        if post.get("content"):
            new_v, n = patch_text(post["content"])
            if n > 0:
                patch["fields"]["content"] = new_v
                patch["change_counts"]["content"] = n

        if post.get("excerpt"):
            new_v, n = patch_text(post["excerpt"])
            if n > 0:
                patch["fields"]["excerpt"] = new_v
                patch["change_counts"]["excerpt"] = n

        if post.get("metaDescription"):
            new_v, n = patch_text(post["metaDescription"])
            if n > 0:
                patch["fields"]["metaDescription"] = new_v
                patch["change_counts"]["metaDescription"] = n

        # thumbnail.alt
        if post.get("thumbnailAlt"):
            new_v, n = patch_text(post["thumbnailAlt"])
            if n > 0:
                patch["fields"]["thumbnail.alt"] = new_v
                patch["change_counts"]["thumbnail.alt"] = n

        # FAQ
        faq_answers = post.get("faqAnswers") or []
        faq_changes = []
        for i, ans in enumerate(faq_answers):
            if ans:
                new_v, n = patch_text(ans)
                if n > 0:
                    faq_changes.append({"index": i, "newAnswer": new_v, "count": n})
        if faq_changes:
            patch["faq_changes"] = faq_changes
            patch["change_counts"]["faq"] = sum(c["count"] for c in faq_changes)

        # visuals[].alt and visuals[].caption
        visuals_alt = post.get("visualsAlt") or []
        visuals_caption = post.get("visualsCaption") or []
        visual_changes = []
        for i, alt in enumerate(visuals_alt):
            if alt:
                new_v, n = patch_text(alt)
                if n > 0:
                    visual_changes.append({"index": i, "field": "alt", "newValue": new_v, "count": n})
        for i, cap in enumerate(visuals_caption):
            if cap:
                new_v, n = patch_text(cap)
                if n > 0:
                    visual_changes.append({"index": i, "field": "caption", "newValue": new_v, "count": n})
        if visual_changes:
            patch["visual_changes"] = visual_changes
            patch["change_counts"]["visuals"] = sum(c["count"] for c in visual_changes)

        # Only keep patches with actual changes
        if any(patch["change_counts"].values()):
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
