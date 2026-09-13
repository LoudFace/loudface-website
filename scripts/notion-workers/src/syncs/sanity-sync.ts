import * as Builder from "@notionhq/workers/builder";
import { worker, liveIndex } from "../databases.js";
import { sanityApi } from "../pacers.js";
import { fetchPublishedPosts } from "../lib/sanity.js";
import {
	GONE_SLUGS,
	buildUrl,
	classifyContentType,
	isoDate,
	today,
} from "../lib/utils.js";

// Source of truth for: Title, URL, Content Type, Publish Date, Last Updated, Meta Description.
// Runs hourly. Replace mode so unpublished Sanity docs disappear from the index.
// Writes "Last Sanity Sync" on every row so you can see at a glance when the content
// metadata was last verified — distinct from "Last Refreshed" (metric data).
worker.sync("sanitySync", {
	database: liveIndex,
	mode: "replace",
	schedule: "1h",
	execute: async () => {
		await sanityApi.wait();
		const posts = (await fetchPublishedPosts()).filter(
			(p) => !GONE_SLUGS.has(p.slug),
		);
		const syncDate = today();

		return {
			changes: posts.map((p) => {
				const url = buildUrl(p.type, p.slug);
				const pd = isoDate(p.publishedDate);
				const lu = isoDate(p.lastUpdated);
				return {
					type: "upsert" as const,
					key: url,
					properties: {
						Title: Builder.title(p.title),
						URL: Builder.richText(url),
						"Content Type": Builder.select(
							classifyContentType({ type: p.type, title: p.title }),
						),
						"Meta Description": Builder.richText(p.metaDescription ?? ""),
						"Last Sanity Sync": Builder.date(syncDate),
						...(pd ? { "Publish Date": Builder.date(pd) } : {}),
						...(lu ? { "Last Updated": Builder.date(lu) } : {}),
					},
				};
			}),
			hasMore: false,
		};
	},
});
