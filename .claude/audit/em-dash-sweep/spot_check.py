#!/usr/bin/env python3
"""Spot-check em-dash replacements by extracting before/after pairs."""
import json
import re

def context_window(text, pos, before=60, after=80):
    s = max(0, pos - before)
    e = min(len(text), pos + after)
    return text[s:e]

def find_corresponding_window(orig_text, new_text, orig_pos, before=60, after=80):
    """Find the same conceptual window in new_text given orig_pos in orig_text."""
    # Use the prefix to find offset
    prefix = orig_text[max(0, orig_pos-30):orig_pos].rstrip(" \t")
    # Find this prefix in new_text
    idx = new_text.find(prefix)
    if idx < 0:
        return None
    new_pos = idx + len(prefix)
    s = max(0, new_pos - before)
    e = min(len(new_text), new_pos + after)
    return new_text[s:e]

def main():
    with open('.claude/audit/em-dash-sweep/all-posts.json') as f:
        all_data = json.load(f)
    with open('.claude/audit/em-dash-sweep/patches.json') as f:
        patches = json.load(f)

    posts_by_id = {p['_id']: p for p in all_data['result']}

    # Sample 10 different posts; show 2-3 fixes each
    sample = [
        'answer-engine-optimization-guide-2026',
        'webflow-vs-wordpress-com',
        'eeat-in-the-age-of-ai',
        'best-aeo-tools-for-b2b-saas-2026',
        'share-of-answer',
        'webflow-vs-wix-studio',
        'how-to-become-a-trusted-llm-source',
        'webflow-vs-framer-for-b2b-saas-2026',
        'best-b2b-saas-seo-agencies',
        'schema-markup-for-aeo-2026',
    ]

    for slug in sample:
        patch = next((p for p in patches if p['slug'] == slug), None)
        if not patch:
            continue
        orig = posts_by_id[patch['_id']]
        print(f"=== /blog/{slug} ===")
        for field, new_val in patch.get('fields', {}).items():
            orig_val = orig.get(field, '') or ''
            # Strip tables for content
            if field == 'content':
                table_ranges = [(m.start(), m.end()) for m in re.finditer(r"<table[\s\S]*?</table>", orig_val, flags=re.IGNORECASE)]
            else:
                table_ranges = []
            positions = []
            for m in re.finditer('—', orig_val):
                pos = m.start()
                if not any(s <= pos < e for s, e in table_ranges):
                    positions.append(pos)
            for i, pos in enumerate(positions[:3]):
                before_ctx = context_window(orig_val, pos)
                after_ctx = find_corresponding_window(orig_val, new_val, pos)
                print(f"  [{field}] Hit {i+1}:")
                print(f"    BEFORE: ...{before_ctx}...")
                print(f"    AFTER:  ...{after_ctx}...")
        # Also faq
        if patch.get('faq_changes'):
            faq_field = orig.get('faqAnswers') or []
            for fc in patch['faq_changes'][:2]:
                idx = fc['index']
                old_ans = faq_field[idx]
                new_ans = fc['newAnswer']
                positions = [m.start() for m in re.finditer('—', old_ans)]
                for j, pos in enumerate(positions[:2]):
                    before_ctx = context_window(old_ans, pos)
                    after_ctx = find_corresponding_window(old_ans, new_ans, pos)
                    print(f"  [faq[{idx}]] Hit {j+1}:")
                    print(f"    BEFORE: ...{before_ctx}...")
                    print(f"    AFTER:  ...{after_ctx}...")
        print()

if __name__ == '__main__':
    main()
