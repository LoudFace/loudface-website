"use strict";
// Peec AI URL report client.
// Secret: PEEC_API_TOKEN — generate at app.peec.ai → Settings → API Keys.
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUrlMetrics = fetchUrlMetrics;
const PROJECT_ID = "or_85a7fe4b-9032-4b0f-8b98-6deae65495ff";
const BASE = "https://api.peec.ai";
async function fetchUrlMetrics(args) {
    const token = process.env.PEEC_API_TOKEN;
    if (!token)
        throw new Error("PEEC_API_TOKEN missing");
    const out = [];
    let offset = 0;
    const limit = 1000;
    while (true) {
        const body = {
            project_id: PROJECT_ID,
            start_date: args.startDate,
            end_date: args.endDate,
            filters: [{ field: "domain", operator: "in", values: ["loudface.co"] }],
            order_by: [{ field: "citation_count", direction: "desc" }],
            limit,
            offset,
        };
        const res = await fetch(`${BASE}/v1/reports/urls`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "content-type": "application/json",
            },
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            throw new Error(`Peec fetch failed: ${res.status} ${await res.text()}`);
        }
        // Peec returns columnar format {columns, rows, rowCount, totalCount}
        const data = (await res.json());
        const urlIdx = data.columns.indexOf("url");
        const citeIdx = data.columns.indexOf("citation_count");
        const retIdx = data.columns.indexOf("retrieval_count");
        const rateIdx = data.columns.indexOf("citation_rate");
        for (const row of data.rows) {
            out.push({
                url: String(row[urlIdx]),
                citation_count: Number(row[citeIdx] ?? 0),
                retrieval_count: Number(row[retIdx] ?? 0),
                citation_rate: Number(row[rateIdx] ?? 0),
            });
        }
        if (data.rowCount < limit || out.length >= data.totalCount)
            break;
        offset += data.rowCount;
    }
    return out;
}
