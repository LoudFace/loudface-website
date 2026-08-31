"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GONE_SLUGS = void 0;
exports.buildUrl = buildUrl;
exports.normalizeUrl = normalizeUrl;
exports.classifyContentType = classifyContentType;
exports.isoDate = isoDate;
exports.today = today;
exports.daysAgo = daysAgo;
// URLs that return 410 Gone in the loudface.co middleware.
// Workers should skip these so the index stays clean.
exports.GONE_SLUGS = new Set([
    "finnrick-analytics",
    "mycryptoguide",
    "draw-things",
]);
const SITE = "https://www.loudface.co";
function buildUrl(type, slug) {
    const prefix = type === "blogPost" ? "/blog/" : "/case-studies/";
    return `${SITE}${prefix}${slug}`;
}
// Canonical form so GSC ("https://www.loudface.co/...") and Peec ("https://loudface.co/...")
// both resolve to the same primary key.
function normalizeUrl(input) {
    if (!input)
        return "";
    let u = input.trim().replace(/\/$/, "");
    u = u.replace(/^https:\/\/loudface\.co/i, "https://www.loudface.co");
    u = u.replace(/^http:\/\//, "https://");
    return u;
}
function classifyContentType(args) {
    if (args.type === "caseStudy")
        return "Case Study";
    if (/^(Best|Top \d+|The Best)\b/i.test(args.title))
        return "Listicle";
    return "Blog Post";
}
function isoDate(input) {
    if (!input)
        return undefined;
    const d = String(input).split("T")[0];
    return d || undefined;
}
function today() {
    return new Date().toISOString().slice(0, 10);
}
function daysAgo(n) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - n);
    return d.toISOString().slice(0, 10);
}
