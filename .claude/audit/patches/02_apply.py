#!/usr/bin/env python3
"""Patch 02: how-to-structure-content-for-ai-extraction — T5 (stack-locked opener + CTA)."""
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _patch_helper import fetch_post, mutate_post, apply_replacements

SLUG = "how-to-structure-content-for-ai-extraction"
res = fetch_post(SLUG)
content = res["content"]

replacements = [
    # T5 — Webflow-locked opener
    (
        "I've shipped Webflow client sites with and without the 40-60 word rule enforced",
        "I've shipped B2B SaaS client sites with and without the 40-60 word rule enforced",
    ),
    # T5 — Webflow-locked CTA framing
    (
        "If you're building or refreshing a Webflow site for AEO outcomes",
        "If you're building or refreshing a B2B SaaS site for AEO outcomes",
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
