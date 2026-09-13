// URLs that return 410 Gone in the loudface.co middleware.
// Workers should skip these so the index stays clean.
export const GONE_SLUGS = new Set<string>([
	"finnrick-analytics",
	"mycryptoguide",
	"draw-things",
]);

const SITE = "https://www.loudface.co";

export function buildUrl(type: "blogPost" | "caseStudy", slug: string): string {
	const prefix = type === "blogPost" ? "/blog/" : "/case-studies/";
	return `${SITE}${prefix}${slug}`;
}

// Canonical form so GSC ("https://www.loudface.co/...") and Peec ("https://loudface.co/...")
// both resolve to the same primary key.
export function normalizeUrl(input: string): string {
	if (!input) return "";
	let u = input.trim().replace(/\/$/, "");
	u = u.replace(/^https:\/\/loudface\.co/i, "https://www.loudface.co");
	u = u.replace(/^http:\/\//, "https://");
	return u;
}

export function classifyContentType(args: {
	type: "blogPost" | "caseStudy";
	title: string;
}): "Blog Post" | "Listicle" | "Case Study" {
	if (args.type === "caseStudy") return "Case Study";
	if (/^(Best|Top \d+|The Best)\b/i.test(args.title)) return "Listicle";
	return "Blog Post";
}

export function isoDate(input: string | undefined | null): string | undefined {
	if (!input) return undefined;
	const d = String(input).split("T")[0];
	return d || undefined;
}

export function today(): string {
	return new Date().toISOString().slice(0, 10);
}

export function daysAgo(n: number): string {
	const d = new Date();
	d.setUTCDate(d.getUTCDate() - n);
	return d.toISOString().slice(0, 10);
}
