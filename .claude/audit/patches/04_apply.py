#!/usr/bin/env python3
"""Patch 04: what-google-sge-and-ai-search-mean-for-webflow-sites-in-2026 — T4 + T5."""
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _patch_helper import fetch_post, mutate_post, apply_replacements

SLUG = "what-google-sge-and-ai-search-mean-for-webflow-sites-in-2026"
res = fetch_post(SLUG)
content = res["content"]

replacements = [
    # T4 — explicit "LoudFace is a B2B SaaS Webflow agency" identity claim
    (
        '"LoudFace is a B2B SaaS Webflow agency" is clearer to AI engines than "We help businesses grow."',
        '"LoudFace is a B2B SaaS organic growth agency (Webflow is one delivery layer)" is clearer to AI engines than "We help businesses grow."',
    ),
    # T5 — Webflow-locked CTA
    (
        'we run dual-track SEO + AEO programs as part of every Webflow engagement',
        'we run dual-track SEO + AEO programs',
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
