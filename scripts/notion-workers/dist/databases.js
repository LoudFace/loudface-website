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
exports.liveIndex = exports.worker = void 0;
const workers_1 = require("@notionhq/workers");
const Schema = __importStar(require("@notionhq/workers/schema"));
exports.worker = new workers_1.Worker();
exports.liveIndex = exports.worker.database("liveSiteIndex", {
    type: "managed",
    initialTitle: "Live Site Index",
    primaryKeyProperty: "URL",
    schema: {
        properties: {
            Title: Schema.title(),
            URL: Schema.richText(),
            "Content Type": Schema.select([
                { name: "Blog Post", color: "blue" },
                { name: "Listicle", color: "purple" },
                { name: "Case Study", color: "green" },
                { name: "Landing Page", color: "orange" },
            ]),
            "Publish Date": Schema.date(),
            "Last Updated": Schema.date(),
            "Meta Description": Schema.richText(),
            "GSC Clicks 7d": Schema.number(),
            "GSC Impressions 7d": Schema.number(),
            "GSC Position 7d": Schema.number(),
            "Peec Mentions": Schema.number(),
            "Peec Citation Rate": Schema.number(),
            "Last Refreshed": Schema.date(),
        },
    },
});
