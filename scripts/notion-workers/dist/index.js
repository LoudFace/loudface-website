"use strict";
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
//   SANITY_API_TOKEN          — same token as .env.local
//   GSC_SERVICE_ACCOUNT_JSON  — full JSON of a Google service account key
//                                with read access to the GSC property
//   PEEC_API_TOKEN            — from app.peec.ai → Settings → API Keys
Object.defineProperty(exports, "__esModule", { value: true });
const databases_js_1 = require("./databases.js");
// Side-effect imports register pacers and syncs against `worker` from databases.ts.
require("./pacers.js");
require("./syncs/sanity-sync.js");
require("./syncs/gsc-metrics.js");
require("./syncs/peec-citations.js");
exports.default = databases_js_1.worker;
