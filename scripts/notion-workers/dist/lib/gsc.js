"use strict";
// GSC Search Analytics over fetch.
// Auth: service-account JSON key signed into a short-lived OAuth access token.
// Secret: GSC_SERVICE_ACCOUNT_JSON (full JSON contents of the service-account key file).
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchPageMetrics = fetchPageMetrics;
const node_crypto_1 = require("node:crypto");
const SITE_URL = "https://www.loudface.co/";
const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
let cachedToken = null;
async function getAccessToken() {
    if (cachedToken && cachedToken.expiresAt > Date.now() + 60000) {
        return cachedToken.token;
    }
    const raw = process.env.GSC_SERVICE_ACCOUNT_JSON;
    if (!raw)
        throw new Error("GSC_SERVICE_ACCOUNT_JSON missing");
    const key = JSON.parse(raw);
    const now = Math.floor(Date.now() / 1000);
    const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const claims = base64url(JSON.stringify({
        iss: key.client_email,
        scope: SCOPE,
        aud: key.token_uri,
        iat: now,
        exp: now + 3600,
    }));
    const signingInput = `${header}.${claims}`;
    const signer = (0, node_crypto_1.createSign)("RSA-SHA256");
    signer.update(signingInput);
    const signature = signer
        .sign(key.private_key)
        .toString("base64")
        .replace(/=+$/, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
    const jwt = `${signingInput}.${signature}`;
    const res = await fetch(key.token_uri, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
            assertion: jwt,
        }),
    });
    if (!res.ok) {
        throw new Error(`GSC token exchange failed: ${res.status} ${await res.text()}`);
    }
    const tok = (await res.json());
    cachedToken = {
        token: tok.access_token,
        expiresAt: Date.now() + tok.expires_in * 1000,
    };
    return tok.access_token;
}
function base64url(input) {
    return Buffer.from(input)
        .toString("base64")
        .replace(/=+$/, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
}
async function fetchPageMetrics(args) {
    const token = await getAccessToken();
    const endpoint = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`;
    const out = [];
    let startRow = 0;
    const pageSize = 25000; // GSC max per page
    const cap = args.rowLimit ?? 100000;
    while (out.length < cap) {
        const body = {
            startDate: args.startDate,
            endDate: args.endDate,
            dimensions: ["page"],
            rowLimit: Math.min(pageSize, cap - out.length),
            startRow,
        };
        const res = await fetch(endpoint, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "content-type": "application/json",
            },
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            throw new Error(`GSC query failed: ${res.status} ${await res.text()}`);
        }
        const data = (await res.json());
        const rows = data.rows ?? [];
        for (const r of rows) {
            out.push({
                url: r.keys[0],
                clicks: r.clicks,
                impressions: r.impressions,
                position: r.position,
            });
        }
        if (rows.length < pageSize)
            break;
        startRow += rows.length;
    }
    return out;
}
