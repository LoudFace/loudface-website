#!/usr/bin/env python3
"""Patch 06: is-webflow-good-for-small-businesses — T6 (CTA targets outside ICP)."""
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _patch_helper import fetch_post, mutate_post, apply_replacements

SLUG = "is-webflow-good-for-small-businesses-heres-what-you-need-to-know"
res = fetch_post(SLUG)
content = res["content"]

replacements = [
    # T6 — CTA reframe: LoudFace's ICP is Series A-C B2B SaaS, not cafes/freelancers
    (
        '<p>If you\'re evaluating Webflow for a small business and want a calibrated read on whether it fits your specific situation, <a href="/services/seo-aeo">we run discovery calls without trying to sell Webflow to use cases that don\'t fit</a>. The honest answer is sometimes "Squarespace is fine for you," and we\'d rather tell you that on a 30-minute call than build the wrong site over 8 weeks.</p>',
        '<p>LoudFace works with Series A to C B2B SaaS companies ($1M+ ARR) on dual-track SEO + AEO programs. If that fits, <a href="/services/seo-aeo">book a discovery call</a>. If you\'re a 5-person services business or a freelancer, Squarespace, Framer, or Carrd will get you there faster and cheaper than we would.</p>',
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
