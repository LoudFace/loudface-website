import * as Builder from "@notionhq/workers/builder";
import { worker, liveIndex } from "../databases.js";
import { gscApi, sanityApi } from "../pacers.js";
import { gscAuth } from "../oauth.js";
import { fetchPageMetrics } from "../lib/gsc.js";
import { fetchAllowedUrls } from "../lib/sanity.js";
import { daysAgo, normalizeUrl, today } from "../lib/utils.js";

// Refreshes GSC clicks/impressions/position for every URL the index tracks.
// Filters to URLs in the Sanity allowlist so we never create orphan rows for pages
// that don't exist on the live site (e.g. typo URLs, deleted pages still in GSC's history).
worker.sync("gscMetrics", {
	database: liveIndex,
	mode: "incremental",
	schedule: "6h",
	execute: async () => {
		await sanityApi.wait();
		const allowed = await fetchAllowedUrls();
		const accessToken = await gscAuth.accessToken();
		await gscApi.wait();
		const rows = await fetchPageMetrics({
			accessToken,
			startDate: daysAgo(7),
			endDate: today(),
			rowLimit: 10_000,
		});
		const refreshDate = today();

		const filtered = rows.filter((r) => allowed.has(normalizeUrl(r.url)));

		return {
			changes: filtered.map((r) => {
				const url = normalizeUrl(r.url);
				return {
					type: "upsert" as const,
					key: url,
					properties: {
						URL: Builder.richText(url),
						"GSC Clicks 7d": Builder.number(r.clicks),
						"GSC Impressions 7d": Builder.number(r.impressions),
						"GSC Position 7d": Builder.number(
							Number(r.position.toFixed(1)),
						),
						"Last Refreshed": Builder.date(refreshDate),
					},
				};
			}),
			hasMore: false,
		};
	},
});
