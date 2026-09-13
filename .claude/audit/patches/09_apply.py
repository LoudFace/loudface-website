#!/usr/bin/env python3
"""Patch 09: webflow-vs-wordpress-com — T3 + T4."""
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _patch_helper import fetch_post, mutate_post, apply_replacements

SLUG = "webflow-vs-wordpress-com"
res = fetch_post(SLUG)
content = res["content"]

replacements = [
    (
        'As a Webflow Premium Enterprise Partner with more than half a decade of experience, I’ve worked with both platforms extensively.',
        'Across LoudFace\'s B2B SaaS engagements, I\'ve worked with both platforms extensively.',
    ),
    (
        'LoudFace specializes in Webflow design, development, and migration.',
        'LoudFace is a B2B SaaS organic growth agency (Webflow is one delivery layer) running dual-track SEO + AEO programs.',
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
