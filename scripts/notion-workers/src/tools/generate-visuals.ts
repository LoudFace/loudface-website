import { j } from "@notionhq/workers/schema-builder";
import { worker } from "../databases.js";

/**
 * Agent tool: fire the loudface-visuals pipeline for a Notion calendar row.
 *
 * Usage from inside Notion:
 *   @<your-agent> Generate visuals for this page
 *
 * The agent calls this tool with the current page id. We:
 *   1. Read the row's `URL` property (the live loudface.co URL we set on
 *      each Published calendar entry).
 *   2. POST that URL to the loudface-visuals trigger API. The visuals tool
 *      resolves the workspace + Sanity _id, syncs the article into its
 *      local DB, and kicks off the pipeline. autoAttach defaults to true
 *      for Sanity, so visuals land in the document draft within ~5 minutes.
 *   3. Return a markdown line with the job id and a link to the live log,
 *      shown inline in the Notion chat / agent reply.
 *
 * Required env (set via `ntn workers env set`):
 *   VISUALS_API_URL   — base URL of loudface-visuals (e.g. https://visuals.loudface.co)
 *   VISUALS_API_TOKEN — must match TRIGGER_API_TOKEN on the loudface-visuals server
 *
 * Note: Notion's Workers runtime is hosted on Notion's servers, so the
 * VISUALS_API_URL must be reachable from the public internet. localhost
 * won't work — point at a Railway deploy, or expose via ngrok for testing.
 */
worker.tool("generateVisuals", {
	title: "Generate visuals",
	description:
		"Run the loudface-visuals pipeline (illustrations + screenshots + charts) for a calendar row that has a published loudface.co URL. The article must already be Published. Pass the Notion page id of the calendar row.",
	schema: j.object({
		pageId: j
			.string()
			.describe(
				"The Notion page id of the calendar row to generate visuals for. If invoked from a page, use the current page id; otherwise pass the page id explicitly.",
			),
	}),
	outputSchema: j.object({
		ok: j.boolean(),
		message: j.string(),
		jobId: j.string().nullable(),
		articleViewUrl: j.string().nullable(),
	}),
	execute: async ({ pageId }, { notion }) => {
		const apiUrl = process.env.VISUALS_API_URL;
		const apiToken = process.env.VISUALS_API_TOKEN;
		if (!apiUrl || !apiToken) {
			return {
				ok: false,
				message:
					"Worker not configured — VISUALS_API_URL and VISUALS_API_TOKEN must be set. Run `ntn workers env set` for both.",
				jobId: null,
				articleViewUrl: null,
			};
		}

		// 1. Read the calendar row.
		const page = await notion.pages.retrieve({ page_id: pageId });
		const url = extractUrlProperty(page);
		if (!url) {
			return {
				ok: false,
				message:
					"This row has no `URL` property set. The visuals pipeline needs a live loudface.co URL (e.g. https://www.loudface.co/blog/foo). Fill it in and try again.",
				jobId: null,
				articleViewUrl: null,
			};
		}

		// 2. Fire the trigger API.
		const triggerUrl = new URL("/api/triggers/visuals", apiUrl).toString();
		const res = await fetch(triggerUrl, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiToken}`,
				"content-type": "application/json",
			},
			body: JSON.stringify({ url }),
		});

		const body = (await res.json().catch(() => ({}))) as {
			ok?: boolean;
			error?: string;
			jobId?: string;
			articleViewPath?: string;
			workspaceSlug?: string;
		};

		if (!res.ok || !body.ok) {
			return {
				ok: false,
				message: `Trigger API rejected the request (${res.status}): ${body.error ?? "unknown error"}`,
				jobId: null,
				articleViewUrl: null,
			};
		}

		const articleViewUrl = body.articleViewPath
			? new URL(body.articleViewPath, apiUrl).toString()
			: null;
		const jobId = body.jobId ?? null;

		// 3. Return inline-friendly markdown.
		const message = [
			`✨ Visuals pipeline started for **${url}**.`,
			``,
			`Pipeline runs ~5 min: plan → illustrate → screenshot → chart → write to Sanity draft.`,
			``,
			articleViewUrl
				? `**[Watch the live job log →](${articleViewUrl})**`
				: "",
			``,
			`When done, the visuals will be on the Sanity draft. Open the post in Sanity Studio at loudface.co/studio, review, and hit Publish to push them live.`,
		]
			.filter(Boolean)
			.join("\n");

		return { ok: true, message, jobId, articleViewUrl };
	},
});

/**
 * Extract the `URL` property value from a Notion page object. The Website
 * Content database uses `userDefined:URL` as the property name in
 * notion-update-page calls, but the retrieve API returns the property
 * keyed by its display name (`URL`).
 *
 * The property type is `url`, so the value lives at `.url` on that property
 * object. Returns null if missing / empty / unexpected shape.
 */
type PageWithProperties = {
	properties?: Record<string, unknown>;
};

function extractUrlProperty(page: unknown): string | null {
	if (typeof page !== "object" || page === null) return null;
	const props = (page as PageWithProperties).properties;
	if (!props) return null;
	const candidate = props["URL"] ?? props["userDefined:URL"];
	if (typeof candidate !== "object" || candidate === null) return null;
	const url = (candidate as { url?: unknown }).url;
	return typeof url === "string" && url.length > 0 ? url : null;
}
