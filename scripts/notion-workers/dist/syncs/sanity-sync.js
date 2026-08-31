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
const sanity_js_1 = require("../lib/sanity.js");
const utils_js_1 = require("../lib/utils.js");
// Source of truth for: Title, URL, Content Type, Publish Date, Last Updated, Meta Description.
// Runs hourly. Replace mode so unpublished Sanity docs disappear from the index.
databases_js_1.worker.sync("sanitySync", {
    database: databases_js_1.liveIndex,
    mode: "replace",
    schedule: "1h",
    execute: async () => {
        await pacers_js_1.sanityApi.wait();
        const posts = (await (0, sanity_js_1.fetchPublishedPosts)()).filter((p) => !utils_js_1.GONE_SLUGS.has(p.slug));
        return {
            changes: posts.map((p) => {
                const url = (0, utils_js_1.buildUrl)(p.type, p.slug);
                const pd = (0, utils_js_1.isoDate)(p.publishedDate);
                const lu = (0, utils_js_1.isoDate)(p.lastUpdated);
                return {
                    type: "upsert",
                    key: url,
                    properties: {
                        Title: Builder.title(p.title),
                        URL: Builder.richText(url),
                        "Content Type": Builder.select((0, utils_js_1.classifyContentType)({ type: p.type, title: p.title })),
                        "Meta Description": Builder.richText(p.metaDescription ?? ""),
                        ...(pd ? { "Publish Date": Builder.date(pd) } : {}),
                        ...(lu ? { "Last Updated": Builder.date(lu) } : {}),
                    },
                };
            }),
            hasMore: false,
        };
    },
});
