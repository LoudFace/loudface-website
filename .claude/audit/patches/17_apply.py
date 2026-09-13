#!/usr/bin/env python3
"""Patch 17: webflow-and-lottie-animations — T5 (stack-locked CTA)."""
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _patch_helper import fetch_post, mutate_post, apply_replacements

SLUG = "webflow-and-lottie-animations"
res = fetch_post(SLUG)
content = res["content"]

replacements = [
    # T5 — stack-locked CTA: "Webflow engagements... as part of SEO + AEO program"
    (
        'we run Webflow engagements that include performance-conscious motion design as part of the SEO + AEO program',
        'we run dual-track SEO + AEO programs for B2B SaaS where performance-conscious motion design is part of the build',
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
