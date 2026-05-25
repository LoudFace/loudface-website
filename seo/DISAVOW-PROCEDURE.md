# Quarterly Disavow Check — LoudFace SEO Hygiene

Run this procedure on **Jan 1, Apr 1, Jul 1, Oct 1**. Interim run if the
`is_spam` count in the most-recent-100 ref domains exceeds 30 between quarters.

The baseline was established **2026-05-26** after a Magna AI competitive analysis
surfaced an active spam attack on LoudFace's backlink profile. Status at baseline:
**COMPROMISED** — ~85% of the most-recent 100 referring domains were
spam-pattern PBNs, brand-impersonation lookalikes, and scraper shells.

## The 5-step procedure

### 1. Pull fresh ref-domain data

Use the Ahrefs MCP `site-explorer-referring-domains` for `loudface.co`:
- `mode=subdomains`
- `order_by=first_seen:desc`
- `limit=100`
- `select=domain,domain_rating,first_seen,total_links,anchor_text_sample,is_spam`

Save the JSON snapshot to `.claude/audit/disavow-YYYY-Q.json` for version history.

### 2. Cross-check with GSC

1. Open [Google Search Console](https://search.google.com/search-console) → Links → External links → Top linking sites.
2. Export the CSV.
3. Diff the GSC export against the Ahrefs snapshot — any domain in GSC that Ahrefs missed gets manual review.

### 3. Pattern-match against the kill list

Flag any domain matching one of these patterns. Most can be classified in seconds.

| Pattern | What to look for | Action |
|---|---|---|
| **TLD clusters** | `.shop`, `.site`, `.website`, `.online`, `.xyz`, `.top`, `.store` with SEO-templated names (`*-seo-*`, `*-link-*`, `*-rank-*`, `*-backlink-*`, `*-pbn-*`, `*-outreach-*`) | Disavow |
| **Magna operator signature** | `seoexpress-*.store`, `buybacklinks.agency`, `thetoprankingseo.shop` | Disavow + Slack alert |
| **Brand impersonation** | Anchors using `getloudface.*`, `tryloudface.*`, `myloudface.*`, `hello-loudface.*`, `hi-loudface.*`, `hub-loudface.*`, `clickloudface.*`, `contactloudface.*` | Disavow + investigate competitor |
| **DR-padded expired shells** | `itxoft-*.site`, `fiverr-*.site` style — high DR with zero traffic | Disavow |
| **IP cluster repeats** | Same IP behind 5+ different domains. Known bad ranges: 92.249.46.x, 118.139.176.x, 159.198.47.x, 184.168.115.60 | Disavow whole cluster |
| **DR-velocity anomaly** | 10+ new DR-50+ domains in a 7-day window with 0 traffic | Investigate immediately, likely disavow |
| **Location-spam anchors** | "Web design agency [city] [state]" style anchors | Disavow |
| **Sudden link spikes** | Single domain delivering 4,000+ dofollow links in one shot | Disavow |
| **Ahrefs `is_spam=true` + DR > 30** | Flagged shells with padded DR | Disavow |

### 4. Update `seo/disavow.txt`

- Append new domains to the appropriate section in `seo/disavow.txt`.
- **Never delete entries** — disavows are additive. No downside to keeping old ones.
- Keep section headers organized (PBN cluster / expired shells / scrapers / brand impersonation / etc.) for future readability.
- Commit the change with message: `seo: quarterly disavow update YYYY-Q (added N domains)`.

### 5. Upload to Google Search Console

1. Go to [https://search.google.com/search-console/disavow-links](https://search.google.com/search-console/disavow-links).
2. Select the `loudface.co` property.
3. Click **Replace File** (not Append — the file is the complete spec).
4. Upload `seo/disavow.txt`.
5. Confirm.

Google takes **4–6 weeks** to reprocess. Watch the GSC Links report monthly
for the next quarter to see when the toxic links start dropping.

Log the upload in the Notion Activity Log:
- Title: `Disavow upload YYYY-Q`
- Rowcount before/after
- Date

## Red flags to escalate immediately (don't wait for quarterly)

1. **Brand impersonation domains showing up as linking targets.** This is competitor activity, not random spam. Document the source domain and escalate.
2. **Sudden 7-day spike of 50+ DR 30+ domains pointing at us.** Negative SEO blast in progress. Disavow now, don't wait.
3. **`*loudface*` lookalike domains delivering links via 301 chains.** Trace the redirect chain in `curl -ILv https://<lookalike-domain>`. Note the final destination.
4. **GSC sends a manual action notice** ("unnatural links to your site"). This is the worst-case outcome. File reconsideration request after cleaning + disavow upload.

## Defensive moves baked in

- `seo/disavow.txt` is version-controlled in this repo. Every quarter's update is in `git log`.
- The procedure runs against Ahrefs + GSC together, so we don't rely on a single tool.
- The disavow file is uploaded via GSC's official tool, which is the only path Google honors.

## Last update

- **2026-05-26 (baseline)**: ~60 domains across PBN/expired/scraper categories. See git history.
