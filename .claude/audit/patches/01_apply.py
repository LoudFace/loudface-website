#!/usr/bin/env python3
"""Patch 01: schema-markup-for-aeo-2026 — T4 (Webflow agency in JSON-LD desc) + T2 (priceRange)."""
import json
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _patch_helper import fetch_post, mutate_post, apply_replacements

SLUG = "schema-markup-for-aeo-2026"

res = fetch_post(SLUG)
content = res["content"]
meta = res["metaDescription"]
faq = res["faq"]

replacements = [
    # T4 — JSON-LD description: "Webflow agency for B2B SaaS"
    (
        '"description": "Webflow agency for B2B SaaS running dual-track SEO + AEO programs. We build sites that get cited by ChatGPT, Perplexity, and Google AI Overviews."',
        '"description": "B2B SaaS organic growth agency running dual-track SEO + AEO programs (Webflow is one delivery layer). We build sites that get cited by ChatGPT, Perplexity, and Google AI Overviews."',
    ),
    # T2 — priceRange in JSON-LD
    (
        '"priceRange": "$80,000-$200,000"',
        '"priceRange": "$60,000-$216,000"',
    ),
]

new_content, applied = apply_replacements(content, replacements)
print(f"Applied {len(applied)} replacements")
for a in applied:
    print(f"  - {a}")

if not applied:
    print("No matches!")
    sys.exit(1)

result = mutate_post(res["_id"], res["_rev"], new_content, None, None)
print("Mutation result:", json.dumps(result))
