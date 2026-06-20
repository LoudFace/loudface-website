import { createClient } from "@sanity/client";
import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf8").split("\n").reduce((a, l) => {
  const m = l.match(/^([^=]+)=(.*)$/);
  if (m) a[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  return a;
}, {});

const client = createClient({
  projectId: "xjjjqhgt",
  dataset: "production",
  apiVersion: "2025-03-29",
  useCdn: false,
  token: env.SANITY_API_TOKEN,
});

// Find AEO-themed posts with existing thumbnails
const result = await client.fetch(`*[_type == "blogPost" && defined(thumbnail) && (slug.current match "*aeo*" || slug.current match "*schema*" || slug.current match "*answer*" || slug.current match "*citation*")]{
  _id,
  name,
  "slug": slug.current,
  "thumbnail": thumbnail{
    "url": asset->url,
    "alt": alt,
    "ref": asset->_id
  }
}`);

console.log(JSON.stringify(result, null, 2));
