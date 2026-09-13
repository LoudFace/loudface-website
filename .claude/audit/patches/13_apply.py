#!/usr/bin/env python3
"""Patch 13: how-to-optimize-calendly-embed-load-time-on-webflow — T8 (generic agency-slop opener)."""
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _patch_helper import fetch_post, mutate_post, apply_replacements

SLUG = "how-to-optimize-calendly-embed-load-time-on-webflow"
res = fetch_post(SLUG)
content = res["content"]

replacements = [
    # T8 — generic agency-slop opener
    (
        '<p id="">In today\'s fast-paced world, efficiently scheduling appointments and securing prospects has become a necessity rather than a luxury. That\'s where integration tools like Calendly come in.</p>',
        '<p id="">A Calendly embed on a Webflow site is one of the easiest conversion levers for a B2B SaaS marketing site, and one of the easiest to ship slow. The default embed loads ~250KB of JS that blocks the page until it\'s done. This guide shows how to drop it to lazy-load on intent, recovering 1-2 seconds of LCP without losing the booking surface.</p>',
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
