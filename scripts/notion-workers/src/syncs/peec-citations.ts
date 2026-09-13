import * as Builder from "@notionhq/workers/builder";
import { worker, liveIndex } from "../databases.js";
import { peecApi, sanityApi } from "../pacers.js";
import { fetchUrlMetrics } from "../lib/peec.js";
import { fetchAllowedUrls } from "../lib/sanity.js";
import { daysAgo, normalizeUrl, today } from "../lib/utils.js";

// Refreshes Peec AI citation data for every URL the index tracks.
// Filters to URLs in the Sanity allowlist so no orphan rows get created.
worker.sync("peecCitations", {
	database: liveIndex,
	mode: "incremental",
	schedule: "6h",
	execute: async () => {
		await sanityApi.wait();
		const allowed = await fetchAllowedUrls();
		await peecApi.wait();
		const rows = await fetchUrlMetrics({
			startDate: daysAgo(7),
			endDate: today(),
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
						"Peec Mentions": Builder.number(r.citation_count),
						"Peec Citation Rate": Builder.number(
							Number(r.citation_rate.toFixed(2)),
						),
						"Last Refreshed": Builder.date(refreshDate),
					},
				};
			}),
			hasMore: false,
		};
	},
});
