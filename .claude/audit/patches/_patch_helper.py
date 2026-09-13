#!/usr/bin/env python3
"""Helper for fetching, patching, and mutating Sanity blog posts."""
import json
import sys
import urllib.parse
import urllib.request
import datetime

TOKEN = "skgvB8Mahk2kTqhqBCzCwTYjB6K80MQgPzlXPNZSifrRdbZhboAxAnXogFHFtfZnyNnGdA4Npzr9NDP28wtnxmnTcYYPS4j0mMtmbHLxjSTFfHAdVKMzmSRS2IzpaozlPAKXX1ZxN1zPs0RaaAQpqsVJeaUfSPX0zSFWtHDzOh9Lw5KCM4tO"
PROJECT_ID = "xjjjqhgt"
DATASET = "production"


def fetch_post(slug: str) -> dict:
    query = (
        f'*[_type == "blogPost" && slug.current == "{slug}"][0]'
        '{_id, _rev, content, metaDescription, faq}'
    )
    url = (
        f"https://{PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/{DATASET}"
        f"?query={urllib.parse.quote(query)}"
    )
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {TOKEN}"})
    with urllib.request.urlopen(req) as resp:
        body = json.loads(resp.read())
    return body["result"]


def mutate_post(doc_id: str, rev: str, content: str, meta: str | None, faq: list | None) -> dict:
    set_payload = {
        "content": content,
        "lastUpdated": "2026-05-25T19:00:00.000Z",
    }
    if meta is not None:
        set_payload["metaDescription"] = meta
    if faq is not None:
        set_payload["faq"] = faq
    body = {
        "mutations": [
            {
                "patch": {
                    "id": doc_id,
                    "ifRevisionID": rev,
                    "set": set_payload,
                }
            }
        ]
    }
    url = f"https://{PROJECT_ID}.api.sanity.io/v2021-10-21/data/mutate/{DATASET}?returnIds=true"
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode(),
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())


def replace_once(text: str, old: str, new: str) -> tuple[str, bool]:
    if old not in text:
        return text, False
    count = text.count(old)
    if count > 1:
        raise ValueError(f"old string not unique (found {count}): {old[:80]!r}")
    return text.replace(old, new), True


def apply_replacements(text: str, replacements: list[tuple[str, str]]) -> tuple[str, list[str]]:
    """Apply each (old, new). Tracks which were applied."""
    applied = []
    for old, new in replacements:
        if old in text:
            text, did = replace_once(text, old, new)
            if did:
                applied.append(old[:60])
    return text, applied


if __name__ == "__main__":
    slug = sys.argv[1]
    res = fetch_post(slug)
    print(json.dumps(res, indent=2)[:2000])
