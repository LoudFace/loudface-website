import { Worker } from "@notionhq/workers";
import * as Schema from "@notionhq/workers/schema";

export const worker = new Worker();

export const liveIndex = worker.database("liveSiteIndex", {
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
			"Last Sanity Sync": Schema.date(),
		},
	},
});
