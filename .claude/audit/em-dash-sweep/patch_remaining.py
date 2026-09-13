#!/usr/bin/env python3
"""Patch remaining em-dashes in FAQ questions and chart fields."""
import json
import os
import sys
import time
import urllib.request
import re

TOKEN = "skgvB8Mahk2kTqhqBCzCwTYjB6K80MQgPzlXPNZSifrRdbZhboAxAnXogFHFtfZnyNnGdA4Npzr9NDP28wtnxmnTcYYPS4j0mMtmbHLxjSTFfHAdVKMzmSRS2IzpaozlPAKXX1ZxN1zPs0RaaAQpqsVJeaUfSPX0zSFWtHDzOh9Lw5KCM4tO"
PROJECT_ID = "xjjjqhgt"
DATASET = "production"
LAST_UPDATED = "2026-05-25T20:00:00.000Z"

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


def replace_em_dash_simple(text):
    """Simple em-dash replacement: prefer period for FAQ questions, comma for chart labels.

    Chart labels like "Traffic agency — ToFu" should become "Traffic agency, ToFu" (comma).
    FAQ questions like "Is X — Y?" should become "Is X, Y?" (comma — questions usually keep flow).
    """
    if not text or "—" not in text:
        return text, 0
    new_text = re.sub(r"\s*—\s*", ", ", text)
    return new_text, text.count("—")


def main():
    with open(".claude/audit/em-dash-sweep/all-posts-chart.json") as f:
        data = json.load(f)

    mutations = []
    summary = []

    for post in data["result"]:
        slug = post.get("slug")
        if not slug or slug in REDIRECTED:
            continue

        set_ops = {}
        change_count = 0

        # FAQ questions
        faq_questions = post.get("faqQuestions") or []
        for i, q in enumerate(faq_questions):
            if q and "—" in q:
                new_q, n = replace_em_dash_simple(q)
                set_ops[f"faq[{i}].question"] = new_q
                change_count += n

        # Visuals chart fields
        for vi, v in enumerate(post.get("visualsChart") or []):
            for fname in ["title", "xAxis", "yAxis", "source"]:
                val = v.get(fname)
                if val and "—" in val:
                    new_val, n = replace_em_dash_simple(val)
                    set_ops[f"visuals[{vi}].chart.{fname}"] = new_val
                    change_count += n

            labels = v.get("labels") or []
            for li, lab in enumerate(labels):
                if lab and "—" in lab:
                    new_lab, n = replace_em_dash_simple(lab)
                    set_ops[f"visuals[{vi}].chart.data[{li}].label"] = new_lab
                    change_count += n

        if not set_ops:
            continue

        set_ops["lastUpdated"] = LAST_UPDATED
        mutations.append({
            "patch": {
                "id": post["_id"],
                "ifRevisionID": post["_rev"],
                "set": set_ops,
            }
        })
        summary.append({"slug": slug, "changes": change_count, "ops": list(set_ops.keys())})

    print(f"Mutations to apply: {len(mutations)} (total {sum(s['changes'] for s in summary)} em-dashes)")
    for s in summary:
        print(f"  /blog/{s['slug']}: {s['changes']} → {s['ops']}")

    # Apply one by one (we want individual transactions for clarity)
    results = []
    for mut, info in zip(mutations, summary):
        body = json.dumps({"mutations": [mut]}).encode("utf-8")
        url = f"https://{PROJECT_ID}.api.sanity.io/v2021-10-21/data/mutate/{DATASET}"
        req = urllib.request.Request(url, data=body, method="POST")
        req.add_header("Authorization", f"Bearer {TOKEN}")
        req.add_header("Content-Type", "application/json")
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                d = json.loads(resp.read().decode("utf-8"))
                tx = d.get("transactionId")
                print(f"  applied /blog/{info['slug']} → tx {tx}")
                results.append({**info, "ok": True, "tx_id": tx})
        except urllib.error.HTTPError as e:
            err = e.read().decode("utf-8", errors="replace")
            print(f"  FAILED /blog/{info['slug']}: HTTP {e.code}: {err[:200]}")
            results.append({**info, "ok": False, "error": err[:200]})
        time.sleep(0.3)

    # Save
    log = ".claude/audit/em-dash-sweep/applied-remaining.json"
    with open(log, "w") as f:
        json.dump(results, f, indent=2)


if __name__ == "__main__":
    main()
