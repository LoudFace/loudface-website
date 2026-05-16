import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
const env = readFileSync(".env.local", "utf8").split("\n").reduce((a, l) => { const m = l.match(/^([^=]+)=(.*)$/); if (m) a[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, ""); return a; }, {});
const client = createClient({ projectId: "xjjjqhgt", dataset: "production", apiVersion: "2025-03-29", useCdn: false, token: env.SANITY_API_TOKEN });
const doc = await client.fetch(`*[_type == "blogPost" && slug.current == "webflow-agency-pricing"][0]{_id, name, metaTitle, metaDescription, excerpt, lastUpdated, "contentLength": length(content)}`);
console.log(JSON.stringify(doc, null, 2));
