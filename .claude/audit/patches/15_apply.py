#!/usr/bin/env python3
"""Patch 15: top-10-saas-tools-for-webflow — T8 (listicle slop) + T3/T4 (certified agency closer)."""
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _patch_helper import fetch_post, mutate_post, apply_replacements

SLUG = "top-10-saas-tools-for-webflow"
res = fetch_post(SLUG)
content = res["content"]

replacements = [
    # T8 — generic listicle opener
    (
        '<p id="">If you\'re looking to maximize the potential of Webflow, the innovative web design platform, you\'ve come to the right place.</p>',
        '<p id="">Webflow runs the page, but the SaaS tools wired into it run the workflows. Below: 10 tools that consistently earn their place on a B2B SaaS marketing site, with the use cases that justify each.</p>',
    ),
    # T3/T4 — certified-agency closer
    (
        '<p id="">And if you ever need assistance, remember that we at <a href="https://www.loudface.co/" id=""><strong id="">LoudFace</strong></a> are always ready to help. As a Webflow certified agency, we possess the expertise to assist you in navigating the world of Webflow and its many integrations. Feel free to reach out!</p>',
        '<p id="">If you\'re wiring these tools into a B2B SaaS marketing site, <a href="https://www.loudface.co/services/seo-aeo"><strong>LoudFace runs dual-track SEO + AEO programs</strong></a> where integration choices are made with citation and conversion outcomes in mind, not just feature parity.</p>',
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
