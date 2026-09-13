// Minimal Sanity GROQ client over fetch. No SDK dependency.
const PROJECT_ID = "xjjjqhgt";
const DATASET = "production";
const API_VERSION = "2025-03-29";

export interface SanityPost {
	_id: string;
	type: "blogPost" | "caseStudy";
	slug: string;
	title: string;
	publishedDate: string | null;
	lastUpdated: string | null;
	metaDescription: string | null;
}

// Used by gscMetrics + peecCitations to drop metric rows for URLs that aren't
// in Sanity (prevents orphan rows when GSC/Peec sees URLs we don't track).
export async function fetchAllowedUrls(): Promise<Set<string>> {
	const posts = await fetchPublishedPosts();
	const out = new Set<string>();
	for (const p of posts) {
		const prefix = p.type === "blogPost" ? "/blog/" : "/case-studies/";
		out.add(`https://www.loudface.co${prefix}${p.slug}`);
	}
	return out;
}

export async function fetchPublishedPosts(): Promise<SanityPost[]> {
	const token = process.env.SANITY_API_TOKEN;
	if (!token) throw new Error("SANITY_API_TOKEN missing");

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
	const data = (await res.json()) as { result: SanityPost[] };
	return data.result;
}
