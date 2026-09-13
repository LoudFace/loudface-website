#!/usr/bin/env python3
"""Find em-dashes in blog posts outside <table> blocks."""
import json
import re
import sys

REDIRECTED = {
    "aeo-agency-pricing-for-b2b-saas-2026",
    "aeo-for-webflow-how-to-make-your-site-discoverable-by-ai-search-engines",
    "aeo-strategies-that-work",
    "ai-first-content-architecture",
    "cms-for-marketers-2026",
    "how-ai-webflow-systems-reduce-development-costs-for-scaling-teams",
    "how-to-choose-the-right-webflow-agency-for-your-brand",
    "how-to-future-proof-your-webflow-website-for-search-and-ai-agents",
    "is-webflow-good-for-ecommerce-the-honest-2026-review-features-costs-alternatives",
    "is-webflow-good-for-small-businesses",
    "seo-vs-aeo-webflow",
    "seo-vs-aeo-what-actually-changes-for-your-webflow-site-in-2026",
    "the-future-of-webflow",
    "the-future-of-webflow-ai-assisted-design-development-and-optimization",
    "the-problem-with-traditional-webflow-agencies",
    "top-webflow-agency",
    "understanding-webflow-pricing",
    "webflow-vs-framer",
    "webflow-website-design",
    "webflow-zapier-integration",
    "webflows-new-brand-overhaul-and-platform-updates",
    "why-are-startups-switching-to-webflow",
    "why-choose-loudface-webflow-agency",
}

def strip_tables(html):
    """Remove <table>...</table> blocks for prose-only em-dash detection."""
    if not html:
        return html or ""
    return re.sub(r"<table[\s\S]*?</table>", "", html, flags=re.IGNORECASE)

def find_em_dashes_with_context(text, field_name, exclude_tables=False):
    """Return list of (field, position, context_snippet) for each em-dash."""
    if not text:
        return []

    if exclude_tables:
        # Identify table ranges to exclude
        table_ranges = []
        for m in re.finditer(r"<table[\s\S]*?</table>", text, flags=re.IGNORECASE):
            table_ranges.append((m.start(), m.end()))
    else:
        table_ranges = []

    hits = []
    for m in re.finditer(r"—", text):
        pos = m.start()
        # Skip if inside a table
        in_table = any(start <= pos < end for start, end in table_ranges)
        if in_table:
            continue
        # Extract ~80 chars context
        start_ctx = max(0, pos - 60)
        end_ctx = min(len(text), pos + 60)
        snippet = text[start_ctx:end_ctx]
        hits.append({
            "field": field_name,
            "position": pos,
            "snippet": snippet,
        })
    return hits

def main():
    with open(".claude/audit/em-dash-sweep/all-posts.json") as f:
        data = json.load(f)

    posts = data["result"]

    affected = []
    skipped_redirect = []
    total_em_dashes = 0

    for post in posts:
        slug = post.get("slug")
        if not slug:
            continue
        if slug in REDIRECTED:
            skipped_redirect.append(slug)
            continue

        hits = []

        # Content: exclude tables
        content = post.get("content") or ""
        hits.extend(find_em_dashes_with_context(content, "content", exclude_tables=True))

        # Excerpt, metaDescription: no table exclusion
        excerpt = post.get("excerpt") or ""
        hits.extend(find_em_dashes_with_context(excerpt, "excerpt"))

        meta = post.get("metaDescription") or ""
        hits.extend(find_em_dashes_with_context(meta, "metaDescription"))

        # FAQ answers
        faq_answers = post.get("faqAnswers") or []
        for i, ans in enumerate(faq_answers):
            if ans:
                ans_hits = find_em_dashes_with_context(ans, f"faq[{i}].answer")
                hits.extend(ans_hits)

        if hits:
            affected.append({
                "slug": slug,
                "_id": post["_id"],
                "_rev": post["_rev"],
                "hits": hits,
            })
            total_em_dashes += len(hits)

    summary = {
        "total_posts": len(posts),
        "skipped_redirect_count": len(skipped_redirect),
        "skipped_redirect": sorted(skipped_redirect),
        "affected_post_count": len(affected),
        "total_em_dashes": total_em_dashes,
        "affected": affected,
    }

    with open(".claude/audit/em-dash-sweep/em-dash-report.json", "w") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)

    print(f"Total posts: {len(posts)}")
    print(f"Skipped (redirected): {len(skipped_redirect)}")
    print(f"Posts with em-dashes in prose: {len(affected)}")
    print(f"Total em-dashes to patch: {total_em_dashes}")
    print()
    for a in affected:
        print(f"  /blog/{a['slug']}: {len(a['hits'])} hits")

if __name__ == "__main__":
    main()
