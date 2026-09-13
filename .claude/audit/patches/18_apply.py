#!/usr/bin/env python3
"""Patch 18: webflow-and-auth0-guide — T5 (stack-locked CTA)."""
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _patch_helper import fetch_post, mutate_post, apply_replacements

SLUG = "webflow-and-auth0-guide"
res = fetch_post(SLUG)
content = res["content"]

replacements = [
    # T5 — stack-locked CTA
    (
        'we run Webflow engagements that include auth architecture decisions as part of the SEO + AEO program',
        'we run dual-track SEO + AEO programs for B2B SaaS where auth architecture decisions are part of the build',
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
