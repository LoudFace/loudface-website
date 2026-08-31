"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const Builder = __importStar(require("@notionhq/workers/builder"));
const databases_js_1 = require("../databases.js");
const pacers_js_1 = require("../pacers.js");
const gsc_js_1 = require("../lib/gsc.js");
const utils_js_1 = require("../lib/utils.js");
// Refreshes GSC clicks/impressions/position for every URL the index tracks.
// Filters to /blog/* and /case-studies/* so the index stays focused on Sanity content.
// If GSC sees a URL Sanity hasn't synced yet, the upsert creates a stub row with just
// URL + metrics; the next sanitySync run fills in Title/Content Type/dates.
databases_js_1.worker.sync("gscMetrics", {
    database: databases_js_1.liveIndex,
    mode: "incremental",
    schedule: "6h",
    execute: async () => {
        await pacers_js_1.gscApi.wait();
        const rows = await (0, gsc_js_1.fetchPageMetrics)({
            startDate: (0, utils_js_1.daysAgo)(7),
            endDate: (0, utils_js_1.today)(),
            rowLimit: 10000,
        });
        const refreshDate = (0, utils_js_1.today)();
        const filtered = rows.filter((r) => /\/blog\/|\/case-studies\//.test(r.url) &&
            !r.url.endsWith("/blog") &&
            !r.url.endsWith("/case-studies"));
        return {
            changes: filtered.map((r) => {
                const url = (0, utils_js_1.normalizeUrl)(r.url);
                return {
                    type: "upsert",
                    key: url,
                    properties: {
                        URL: Builder.richText(url),
                        "GSC Clicks 7d": Builder.number(r.clicks),
                        "GSC Impressions 7d": Builder.number(r.impressions),
                        "GSC Position 7d": Builder.number(Number(r.position.toFixed(1))),
                        "Last Refreshed": Builder.date(refreshDate),
                    },
                };
            }),
            hasMore: false,
        };
    },
});
