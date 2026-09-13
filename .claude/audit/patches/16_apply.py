#!/usr/bin/env python3
"""Patch 16: preview-cms-pages-blog-posts — T9 (mild meta-commentary)."""
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _patch_helper import fetch_post, mutate_post, apply_replacements

SLUG = "preview-cms-pages-blog-posts"
res = fetch_post(SLUG)
content = res["content"]

replacements = [
    # T9 — meta-commentary "In this guide, I'll walk you through..."
    (
        '<p id="">In this guide, I\'ll walk you through the different methods for previewing CMS pages and blog posts in Webflow. I\'ll cover everything you need, from using the Designer tool to leveraging Webflow\'s staging site for a real-world preview.</p>',
        '<p id="">Below: every method for previewing CMS pages and blog posts in Webflow, from the Designer tool to the staging site for a real-world preview.</p>',
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
