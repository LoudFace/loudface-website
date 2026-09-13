#!/usr/bin/env python3
"""Apply patches to Sanity via mutation API.

Usage:
    python3 apply_patches.py <start_idx> <end_idx>
"""
import json
import os
import sys
import time
import urllib.parse
import urllib.request

TOKEN = "skgvB8Mahk2kTqhqBCzCwTYjB6K80MQgPzlXPNZSifrRdbZhboAxAnXogFHFtfZnyNnGdA4Npzr9NDP28wtnxmnTcYYPS4j0mMtmbHLxjSTFfHAdVKMzmSRS2IzpaozlPAKXX1ZxN1zPs0RaaAQpqsVJeaUfSPX0zSFWtHDzOh9Lw5KCM4tO"
PROJECT_ID = "xjjjqhgt"
DATASET = "production"

LAST_UPDATED = "2026-05-25T20:00:00.000Z"


def apply_one(patch):
    """Apply patches for one document."""
    set_ops = {"lastUpdated": LAST_UPDATED}
    set_ops.update(patch.get("fields", {}))

    # Handle FAQ changes: we need to set specific array entries by index
    # Use Sanity's patch.set with array path notation: faq[<index>].answer = newAnswer
    if patch.get("faq_changes"):
        for fc in patch["faq_changes"]:
            idx = fc["index"]
            set_ops[f"faq[{idx}].answer"] = fc["newAnswer"]

    # Handle visuals[].alt and visuals[].caption changes
    if patch.get("visual_changes"):
        for vc in patch["visual_changes"]:
            idx = vc["index"]
            field = vc["field"]
            set_ops[f"visuals[{idx}].{field}"] = vc["newValue"]

    mutations = [{
        "patch": {
            "id": patch["_id"],
            "ifRevisionID": patch["_rev"],
            "set": set_ops,
        }
    }]

    body = json.dumps({"mutations": mutations}).encode("utf-8")
    url = f"https://{PROJECT_ID}.api.sanity.io/v2021-10-21/data/mutate/{DATASET}"
    req = urllib.request.Request(url, data=body, method="POST")
    req.add_header("Authorization", f"Bearer {TOKEN}")
    req.add_header("Content-Type", "application/json")

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            tx_id = data.get("transactionId")
            return True, tx_id, None
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8", errors="replace")
        return False, None, f"HTTP {e.code}: {err_body[:300]}"
    except Exception as e:
        return False, None, str(e)


def main():
    start = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    end = int(sys.argv[2]) if len(sys.argv) > 2 else 9999

    with open(".claude/audit/em-dash-sweep/patches.json") as f:
        patches = json.load(f)

    results = []
    total = len(patches)
    print(f"Applying patches {start} to {min(end, total)} of {total}")

    for i, p in enumerate(patches):
        if i < start or i >= end:
            continue
        # Skip empty patches (no fields, no faq, no visuals)
        if not p.get("fields") and not p.get("faq_changes") and not p.get("visual_changes"):
            continue

        slug = p["slug"]
        cc = p.get("change_counts", {})
        total_changes = sum(cc.values())

        ok, tx_id, err = apply_one(p)
        if ok:
            print(f"  [{i}] /blog/{slug}: {total_changes} replacements → tx {tx_id}")
            results.append({"slug": slug, "ok": True, "tx_id": tx_id, "changes": total_changes, "counts": cc})
        else:
            print(f"  [{i}] /blog/{slug}: FAILED — {err}")
            results.append({"slug": slug, "ok": False, "error": err, "counts": cc})

        # Small delay between writes
        time.sleep(0.3)

    # Append results to applied log
    log_path = ".claude/audit/em-dash-sweep/applied.json"
    existing = []
    if os.path.exists(log_path):
        with open(log_path) as f:
            try:
                existing = json.load(f)
            except Exception:
                existing = []
    existing.extend(results)
    with open(log_path, "w") as f:
        json.dump(existing, f, indent=2)

    print(f"\nApplied {sum(1 for r in results if r.get('ok'))} of {len(results)} successfully")


if __name__ == "__main__":
    main()
