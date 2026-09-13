#!/usr/bin/env python3
"""Verify em-dashes are gone from live pages."""
import json
import re
import urllib.request

def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", errors="replace")

def count_prose_em_dashes(html):
    """Count em-dashes outside <table> blocks and outside known template elements."""
    # Strip tables
    non_table = re.sub(r"<table[\s\S]*?</table>", "", html, flags=re.IGNORECASE)
    # Strip the footer location line "San Francisco — Dubai" template element
    # That's a site-template em-dash, not a blog post one
    # Strip JSON-LD script tags
    non_table = re.sub(r"<script[^>]*type=\"application/ld\+json\"[^>]*>[\s\S]*?</script>", "", non_table, flags=re.IGNORECASE)
    # Strip header/footer-only patterns (e.g., "San Francisco — Dubai")
    # Detect template-level "<span class=\"text-surface-500\">—</span>" patterns
    non_template = re.sub(r"<span[^>]*>—</span>", "", non_table)

    # Now count em-dashes
    hits = list(re.finditer(r"—", non_template))
    contexts = []
    for h in hits[:5]:
        s = max(0, h.start()-60); e = min(len(non_template), h.start()+60)
        ctx = re.sub(r"\s+", " ", non_template[s:e])
        contexts.append(ctx)
    return len(hits), contexts


def main():
    with open(".claude/audit/em-dash-sweep/applied.json") as f:
        applied = json.load(f)

    print(f"Verifying {len(applied)} patched posts...")
    print()

    issues = []
    for r in applied:
        if not r.get("ok"):
            continue
        slug = r["slug"]
        url = f"https://www.loudface.co/blog/{slug}"
        try:
            html = fetch(url)
        except Exception as e:
            print(f"  /blog/{slug}: FETCH FAILED — {e}")
            issues.append({"slug": slug, "issue": "fetch_failed"})
            continue
        n, ctxs = count_prose_em_dashes(html)
        if n == 0:
            print(f"  /blog/{slug}: ✅ clean ({sum(r['counts'].values())} replaced)")
        else:
            print(f"  /blog/{slug}: ⚠  {n} em-dashes remain")
            for c in ctxs:
                print(f"      → {c}")
            issues.append({"slug": slug, "remaining": n, "contexts": ctxs})

    print()
    print(f"Total posts verified: {sum(1 for r in applied if r.get('ok'))}")
    print(f"Posts with remaining em-dashes: {len(issues)}")

    with open(".claude/audit/em-dash-sweep/verification.json", "w") as f:
        json.dump({"verified": len(applied), "issues": issues}, f, indent=2)


if __name__ == "__main__":
    main()
