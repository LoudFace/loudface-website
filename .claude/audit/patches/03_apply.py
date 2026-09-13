#!/usr/bin/env python3
"""Patch 03: how-to-become-a-trusted-llm-source — T4 (Webflow agency positioning)."""
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _patch_helper import fetch_post, mutate_post, apply_replacements

SLUG = "how-to-become-a-trusted-llm-source"
res = fetch_post(SLUG)
content = res["content"]

replacements = [
    # T4 — Webflow agency framing as a category positioning example
    (
        '"Webflow agency for B2B SaaS with dual-track SEO + AEO programs" is clear; "marketing solutions provider" is not.',
        '"B2B SaaS organic growth agency running dual-track SEO + AEO programs" is clear; "marketing solutions provider" is not.',
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
