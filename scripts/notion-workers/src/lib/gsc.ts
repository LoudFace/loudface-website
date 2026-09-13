// GSC Search Analytics over fetch. Caller supplies an OAuth access token.

const SITE_URL = "https://www.loudface.co/";

export interface GscRow {
	url: string;
	clicks: number;
	impressions: number;
	position: number;
}

export async function fetchPageMetrics(args: {
	accessToken: string;
	startDate: string;
	endDate: string;
	rowLimit?: number;
}): Promise<GscRow[]> {
	const endpoint = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`;

	const out: GscRow[] = [];
	let startRow = 0;
	const pageSize = 25_000; // GSC max per page
	const cap = args.rowLimit ?? 100_000;

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
				Authorization: `Bearer ${args.accessToken}`,
				"content-type": "application/json",
			},
			body: JSON.stringify(body),
		});
		if (!res.ok) {
			throw new Error(`GSC query failed: ${res.status} ${await res.text()}`);
		}
		const data = (await res.json()) as {
			rows?: Array<{
				keys: string[];
				clicks: number;
				impressions: number;
				position: number;
			}>;
		};
		const rows = data.rows ?? [];
		for (const r of rows) {
			out.push({
				url: r.keys[0]!,
				clicks: r.clicks,
				impressions: r.impressions,
				position: r.position,
			});
		}
		if (rows.length < pageSize) break;
		startRow += rows.length;
	}
	return out;
}
