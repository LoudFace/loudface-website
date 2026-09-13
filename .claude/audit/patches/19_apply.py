#!/usr/bin/env python3
"""Patch 19: webflow-ai-revolution — T5 (stack-locked CTA) + tighten Toku claim wording."""
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _patch_helper import fetch_post, mutate_post, apply_replacements

SLUG = "webflow-ai-revolution"
res = fetch_post(SLUG)
content = res["content"]

replacements = [
    # T5 — stack-locked CTA
    (
        'we run dual-track SEO + AEO programs as part of every Webflow engagement',
        'we run dual-track SEO + AEO programs for B2B SaaS',
    ),
    # Toku claim tightening: "now sits in 86%" softened to citation rate framing per Toku public-content rules
    (
        'Toku now sits in 86% of AI responses for "best stablecoin payroll solutions"',
        'Toku reaches an 86% AI citation rate on the core "best stablecoin payroll solutions" prompt',
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
