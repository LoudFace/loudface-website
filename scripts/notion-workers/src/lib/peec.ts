// Peec AI URL report client.
// Secret: PEEC_API_TOKEN — generate at app.peec.ai → Settings → API Keys.
// Auth header: X-API-Key (NOT Authorization: Bearer)
// Endpoint:    POST https://api.peec.ai/customer/v1/reports/urls

const PROJECT_ID = "or_85a7fe4b-9032-4b0f-8b98-6deae65495ff";
const ENDPOINT = "https://api.peec.ai/customer/v1/reports/urls";

export interface PeecRow {
	url: string;
	citation_count: number;
	retrieval_count: number;
	citation_rate: number;
}

export async function fetchUrlMetrics(args: {
	startDate: string;
	endDate: string;
}): Promise<PeecRow[]> {
	const token = process.env.PEEC_API_TOKEN;
	if (!token) throw new Error("PEEC_API_TOKEN missing");

	const out: PeecRow[] = [];
	let offset = 0;
	const limit = 1000;

	while (true) {
		const body = {
			project_id: PROJECT_ID,
			start_date: args.startDate,
			end_date: args.endDate,
			filters: [
				{ field: "domain", operator: "in", values: ["loudface.co"] },
			],
			order_by: [{ field: "citation_count", direction: "desc" }],
			limit,
			offset,
		};
		const res = await fetch(ENDPOINT, {
			method: "POST",
			headers: {
				"X-API-Key": token,
				"content-type": "application/json",
			},
			body: JSON.stringify(body),
		});
		if (!res.ok) {
			throw new Error(`Peec fetch failed: ${res.status} ${await res.text()}`);
		}
		// Response is a JSON array (or possibly { data: [...] }) of row objects.
		const data = await res.json();
		const rows: Array<Record<string, unknown>> = Array.isArray(data)
			? data
			: Array.isArray((data as { data?: unknown }).data)
				? ((data as { data: Array<Record<string, unknown>> }).data)
				: Array.isArray((data as { rows?: unknown }).rows)
					? ((data as { rows: Array<Record<string, unknown>> }).rows)
					: [];

		for (const r of rows) {
			out.push({
				url: String(r.url ?? ""),
				citation_count: Number(r.citation_count ?? 0),
				retrieval_count: Number(r.retrieval_count ?? 0),
				citation_rate: Number(r.citation_rate ?? 0),
			});
		}
		if (rows.length < limit) break;
		offset += rows.length;
	}
	return out;
}
