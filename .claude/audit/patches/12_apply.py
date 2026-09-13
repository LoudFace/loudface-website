#!/usr/bin/env python3
"""Patch 12: webflow-vs-wix-studio — T3 + T4."""
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _patch_helper import fetch_post, mutate_post, apply_replacements

SLUG = "webflow-vs-wix-studio"
res = fetch_post(SLUG)
content = res["content"]

replacements = [
    (
        'As a Webflow Premium Enterprise Partner, I’ve worked with countless clients who started on Wix’s standard editor and were later confused about switching between Wix’s Studio and Webflow.',
        'Across LoudFace\'s B2B SaaS engagements, I\'ve worked with clients who started on Wix\'s standard editor and were later confused about switching between Wix\'s Studio and Webflow.',
    ),
    (
        'At <strong id="">LoudFace</strong>, we handle everything—from auditing your current site to building a scalable, custom design in Webflow.',
        'At <strong id="">LoudFace</strong>, we run dual-track SEO + AEO programs for B2B SaaS companies (Webflow is one delivery layer).',
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
