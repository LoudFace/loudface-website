#!/usr/bin/env python3
"""Patch 05: why-saas-companies-are-moving-to-webflow-in-2026 — T7 (multi-month ramp) + T5 (CTA)."""
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _patch_helper import fetch_post, mutate_post, apply_replacements

SLUG = "why-saas-companies-are-moving-to-webflow-in-2026-and-what-they-gain"
res = fetch_post(SLUG)
content = res["content"]

replacements = [
    # T7 — Months 4-6 ramp framing
    (
        "<li><strong>Months 4-6: Ship AEO architecture across the site.</strong> Direct-answer paragraphs, FAQPage schema, /answers directory, programmatic pages.</li>",
        "<li><strong>Week 1 onward: Ship AEO architecture in parallel.</strong> Direct-answer paragraphs, FAQPage schema, /answers directory, programmatic pages. First batch goes live in week one, weekly Showcases compound from there.</li>",
    ),
    # T5 — Webflow-locked CTA
    (
        'we run B2B SaaS Webflow engagements as part of our SEO + AEO program',
        'we run dual-track SEO + AEO programs for B2B SaaS',
    ),
]

new_content, applied = apply_replacements(content, replacements)
print(f"Applied {len(applied)} replacements")
for a in applied:
    print(f"  - {a}")
if not applied:
    sys.exit(1)
result = mutate_post(res["_id"], res["_rev"], new_content, None, None)
print(json.dumps(result))
