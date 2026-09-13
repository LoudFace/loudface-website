// LoudFace content index worker.
// Three syncs share one managed Notion database ("Live Site Index"):
//   - sanitySync     hourly  · authoritative for Title/URL/Content Type/dates/Meta
//   - gscMetrics     6h      · GSC clicks / impressions / position (7d window)
//   - peecCitations  6h      · Peec AI citation counts (7d window)
//
// All three upsert by the same primary key (URL), so a row published in Sanity
// shows up in the index within the hour and starts collecting metrics on the
// next 6h tick.
//
// Required worker secrets (set via `ntn workers env set KEY=value`):
//   SANITY_API_TOKEN              — same token as .env.local
//   GOOGLE_OAUTH_CLIENT_ID        — OAuth 2.0 Client ID from GCP (web app)
//   GOOGLE_OAUTH_CLIENT_SECRET    — OAuth 2.0 Client secret
//   PEEC_API_TOKEN                — from app.peec.ai → Settings → API Keys

import { worker } from "./databases.js";

// Side-effect imports register pacers, OAuth, syncs, and tools against `worker`.
import "./pacers.js";
import "./oauth.js";
import "./syncs/sanity-sync.js";
import "./syncs/gsc-metrics.js";
import "./syncs/peec-citations.js";
import "./tools/generate-visuals.js";

export default worker;
