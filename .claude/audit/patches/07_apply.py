#!/usr/bin/env python3
"""Patch 07: best-webflow-agencies — T2 (pricing) + T7 (week 2 → week 1)."""
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _patch_helper import fetch_post, mutate_post, apply_replacements

SLUG = "best-webflow-agencies"
res = fetch_post(SLUG)
content = res["content"]

replacements = [
    # T2 — pricing range erasing Solo
    (
        '<p><strong>Pricing:</strong> typically $80K-$200K for the first 12 months on a B2B SaaS engagement.</p>',
        '<p><strong>Pricing:</strong> typically $60K-$216K+ across Solo ($5K/mo), Dual (~$10K/mo), and Scale ($18K+/mo) Autopilot tiers for the first 12 months on a B2B SaaS engagement.</p>',
    ),
    # T7 — week 2 → week 1 (ships from week one)
    (
        "They should appear at week 2.",
        "They should appear in week one.",
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
