"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchPublishedPosts = fetchPublishedPosts;
// Minimal Sanity GROQ client over fetch. No SDK dependency.
const PROJECT_ID = "xjjjqhgt";
const DATASET = "production";
const API_VERSION = "2025-03-29";
async function fetchPublishedPosts() {
    const token = process.env.SANITY_API_TOKEN;
    if (!token)
        throw new Error("SANITY_API_TOKEN missing");
    const groq = `*[_type in ["blogPost", "caseStudy"] && defined(slug.current) && !(_id in path("drafts.**"))] {
		_id,
		"type": _type,
		"slug": slug.current,
		"title": name,
		"publishedDate": publishedDate,
		"lastUpdated": lastUpdated,
		"metaDescription": metaDescription
	} | order(publishedDate desc)`;
    const url = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}?query=${encodeURIComponent(groq)}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Sanity fetch failed: ${res.status} ${body.slice(0, 200)}`);
    }
    const data = (await res.json());
    return data.result;
}
