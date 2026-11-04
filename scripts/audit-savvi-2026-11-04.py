# SAVVI Financial, Technical audit tab (4 Nov 2026): the worked example for
# the proposal skill. Run: python3 scripts/audit-savvi-2026-11-04.py out.json
# then write the JSON to the proposal's `audit` field (proposals dataset).
#
# Kelsey asked on the 3 Nov call for "a bit more depth" on the technical side:
# other vendors had shown her 404s, heavy JavaScript and long load times, and
# she sees those as "do not pass go". Every number below was measured on
# 4 Nov 2026: LibreCrawl read the site twice (no JavaScript, then rendered;
# the two matched page for page), each page was re-fetched and parsed for
# headings, descriptions and canonical tags (LibreCrawl misses an H1 wrapped
# in <em>), Google PageSpeed Insights ran five page types on phone and
# desktop, and Ahrefs listed broken backlinks.
import json, sys

n = 0
def k():
    global n
    n += 1
    return f"a{n:03d}"

def rows(*rs, skip=()):
    return [{"_key": k(), "cells": list(r), **({"tone": "skip"} if i in skip else {})} for i, r in enumerate(rs)]

def items(*its):
    return [{"_key": k(), "lead": a, "text": b} for a, b in its]

def steps(*ss):
    return [{"_key": k(), "label": a, "title": b, "items": list(c)} for a, b, c in ss]

def stats(*ts):
    return [{"_key": k(), "value": v, "label": l, **({"tone": t} if t else {})} for v, l, t in ts]

audit = {
    "heading": "The technical audit of savvifi.com",
    "summary": (
        "The site is on Webflow and builds its pages on the server, so Google and AI crawlers can read every word, and none "
        "of them is blocked. What holds it back is hygiene and weight: no sitemap, no canonical tags, 142 pages with no "
        "description, 164 pages with no main heading, a broken menu link on almost every page, and phone pages that take up to 5 "
        "seconds to show their main image, twice what Google calls good. Most of it is a Webflow setting or one template change."
    ),
    "source": (
        "Run 4 November 2026: a crawl of all 197 pages on savvifi.com, read twice (without JavaScript, as AI crawlers read "
        "it, and with it, as Google does), Google PageSpeed Insights on five page types, phone and desktop, and Ahrefs."
    ),
    "stats": stats(
        ("197", "pages crawled, twice", "neutral"),
        ("196 of 197", "pages carry a broken menu link", "bad"),
        ("None", "sitemap: /sitemap.xml returns 404", "bad"),
        ("0 of 197", "pages name their main address (canonical tag)", "bad"),
        ("142", "pages with no description", "bad"),
        ("164", "pages with no main heading", "bad"),
        ("68", "phone speed score, home page (90 is good)", "bad"),
        ("5.0 s", "for the main image to show on a phone, home page (2.5 is good)", "bad"),
        ("514 KB", "of Google tags downloaded on every page, compressed, loaded three ways", "bad"),
        ("4", "broken pages other sites still link to", "bad"),
        ("5 of 5", "AI and search crawlers let in, tested on one article", "good"),
        ("373 of 375", "images have alt text", "good"),
    ),
    "blocks": [
        {"_key": k(), "kind": "table",
         "heading": "Blockers, fixed first",
         "intro": "The do-not-pass-go list. Each one stops Google or an AI engine from finding, trusting or quoting a page.",
         "columns": ["Issue", "What we found", "Pages", "Fix"],
         "rows": rows(
             ("Broken menu link", "/products/savvi-wealth-partners returns a 404 and sits in the menu", "196", "Link the live page, redirect the old address"),
             ("No sitemap", "/sitemap.xml returns a 404, so Google gets no list of the 164 articles", "All", "Switch on Webflow's sitemap, submit it in Search Console"),
             ("Empty robots.txt", "The file exists but says nothing: no sitemap line", "All", "Name the sitemap, keep AI crawlers allowed"),
             ("No canonical tags", "No page names its main address; tracking-tag copies such as ?utm_source=chatgpt.com answer as separate pages", "197", "Set Webflow's global canonical address"),
             ("No main heading", "164 pages have no H1. On 159 articles the template marks the title as a sub-heading (H2)", "164", "Change one element in the article template to H1, then fix the other 5"),
             ("No description", "21 pages have none and 121 have an empty one, so Google and AI write their own", "142", "Write each around the question the page answers"),
             ("Same title on 18 pages", "\"SAVVI Financial\" on the home, author, legal and insights pages", "18", "One title per page, naming the problem"),
             ("Several main headings", "Up to 21 H1s on a page (Terms of use 21, SelectSmart 8)", "14", "One H1 per page"),
             ("Titles cut off in Google", "Article titles over 60 characters", "122", "Rewrite, question first"),
         )},

        {"_key": k(), "kind": "table",
         "heading": "Speed, page by page",
         "intro": "Google's PageSpeed Insights on a mid-range phone and on desktop, three runs per page. The table shows the middle run, with the phone range in brackets. A score of 90 is good; the main image should show within 2.5 seconds.",
         "columns": ["Page", "Phone score", "Main image, phone", "Desktop score", "JavaScript", "What slows it"],
         "rows": rows(
             ("Home", "68 (60 to 69)", "5.0 s", "82", "714 KB", "Hero image set to load last; the layout jumps as it loads"),
             ("Employer solutions", "72 (63 to 80)", "4.9 s", "79", "714 KB", "Hero image set to load last; 677 KB of images"),
             ("Financial wellness", "75 (59 to 78)", "2.4 s", "78", "1.6 MB", "YouTube player loads on open, before anyone presses play"),
             ("Insights", "81 (79 to 86)", "3.7 s", "88", "700 KB", "Fonts and scripts block the first paint"),
             ("An article", "74 (71 to 78)", "3.7 s", "86", "680 KB", "Fonts and scripts block the first paint"),
         ),
         "note": "Google has no data from real Chrome users for savvifi.com yet (too little traffic), so these are lab runs. We re-run the same five pages after every fix."},

        {"_key": k(), "kind": "list",
         "heading": "Why the JavaScript is heavy",
         "intro": "You were right that the site carries too much JavaScript: about 700 KB downloaded on every page (2.8 MB once unpacked), and 290 KB of it never runs on the page that loads it. It comes from six places.",
         "items": items(
             ("Google's tag, three times", "gtag.js, Tag Manager and a first-party copy of the Google tag all load on every page, 514 KB of the 700. One tag through Tag Manager does the same job, and three may count some visits twice, which matters before we take a baseline."),
             ("Two copies of jQuery", "Webflow's own (3.5.1) and a second one (3.6.0), plus a carousel library and two Finsweet scripts, all on every page."),
             ("YouTube on open", "The product page loads YouTube's full player, about 1 MB and 0.8 seconds of phone processing, before anyone presses play. A preview image that loads the player on click removes it."),
             ("Fonts that block the page", "Google's WebFont loader asks for four families in 16 weights and holds the first paint, 1.1 to 1.8 seconds on a phone. Two families, loaded the modern way, do the same."),
             ("Hero images set to load last", "On the home and employer pages the biggest image is marked lazy, so the browser fetches it after everything else."),
             ("Images larger than shown", "Up to 430 KB per page could be saved by serving images at the size they show, in WebP or AVIF."),
         )},

        {"_key": k(), "kind": "table",
         "heading": "Broken links, inside and outside the site",
         "intro": "A link to a dead page wastes the visit and the trust the linking site passes on. The broken menu link sits on 196 pages, and a crawler counts it once per page: that is why other audits report around 200 errors. Ahrefs rates a site's strength from 0 to 100.",
         "columns": ["Linked from", "Strength", "Broken address", "Fix"],
         "rows": rows(
             ("Your own menu, on 196 pages", "", "/products/savvi-wealth-partners", "Link the live page"),
             ("Voya, in a plan newsletter (PDF)", "77", "/legal/formadv", "Redirect to /legal/form-adv"),
             ("Fintech Magazine", "77", "/news/myhealthmoney", "Redirect to the closest live page"),
             ("LeadIQ, SAVVI's company profile", "71", "/news/selectsmart-roi", "Redirect to /selectsmart-roi"),
             ("Three of your articles", "", "/product-selectsmart/", "Point them at /products/selectsmart"),
             ("Two of your articles", "", "/how-it-works/", "Point them at the live page"),
             ("A spam login-guide page", "1", "/partners", "Leave it"),
             skip=(6,),
         )},

        {"_key": k(), "kind": "list",
         "heading": "What AI crawlers see",
         "intro": "Your point on the call: the technical basics for Google carry over to AI. Here is how ChatGPT, Claude and Perplexity read the site today.",
         "items": items(
             ("They are let in", "GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot and Googlebot all got the full page when we requested an article as each of them. Nothing blocks them, and we keep it that way. Webflow does not give us server logs, so we cannot see how often each one visits; the tracked answers show that instead."),
             ("The words are in the page", "Webflow builds each page on the server, so a crawler that does not run JavaScript still reads the text. Rendering the JavaScript changed nothing on any of the 197 pages. The JavaScript slows people down, not crawlers."),
             ("But the page does not say what it is about", "With no main heading on 164 pages and no description on 142, a crawler has to guess the topic from the body. That is what we fix first."),
             ("Some structured data, not the useful kind", "164 articles carry article markup and the home page names the company. Nothing marks up the products, the FAQ answers or reviews, which AI engines use to quote facts."),
             ("No llms.txt", "/llms.txt returns a 404. We add one that lists the pages answering buyer questions."),
             ("No social previews", "181 of 197 pages have no Open Graph title, so a link pasted into Slack, LinkedIn or an AI chat shows no proper title or image."),
         )},

        {"_key": k(), "kind": "list",
         "heading": "What already works",
         "items": items(
             ("One clean address", "http, https, savvifi.com and www all reach https://www.savvifi.com in one step."),
             ("Indexable", "No page tells Google to stay away. Google's basic SEO check passes on all five page types, 91 to 100, but it reads one page at a time: the sitemap, canonical and link problems above are site-wide."),
             ("Alt text", "373 of 375 images describe themselves."),
             ("Real content", "Only 3 pages have under 300 words. The 164 articles and the Finances on Fire research are the raw material the strategy builds on."),
         )},

        {"_key": k(), "kind": "steps",
         "heading": "The fix order",
         "steps": steps(
             ("Step 1", "Blockers", ["Sitemap on, robots.txt names it, submitted in Search Console", "Global canonical address", "Menu link fixed, four old addresses redirected", "Article template title made the H1"]),
             ("Step 2", "Hygiene", ["142 descriptions, each around the page's question", "18 duplicate titles and 14 pages with several H1s", "Social preview tags on every page"]),
             ("Step 3", "Speed", ["One Google tag, one jQuery", "Two font families, loaded without blocking", "Hero images load first; YouTube on click", "Target: phone score 85 or more and main image under 2.5 s on every template"]),
             ("Step 4", "AI readability", ["Product, FAQ and review markup", "llms.txt", "122 long article titles rewritten", "This audit run again, before and after side by side"]),
         ),
         "note": "The new site is built and checked against all of these before it goes live. The rules are in the Preliminary strategy tab."},

        {"_key": k(), "kind": "table",
         "heading": "How we ran it",
         "intro": "So you can compare it with the other audits you have seen, and so we can run it again after the fixes.",
         "columns": ["Check", "Tool", "Covered", "When"],
         "rows": rows(
             ("Every page: status, titles, descriptions, headings, canonicals, links, images, markup", "LibreCrawl (as Screaming Frog does)", "197 pages, twice", "4 Nov 2026"),
             ("Headings and descriptions, read from the raw page", "Our own parser", "197 pages", "4 Nov 2026"),
             ("Speed and Core Web Vitals", "Google PageSpeed Insights", "5 page types, phone and desktop", "4 Nov 2026"),
             ("Broken links from other sites", "Ahrefs", "Every link Ahrefs knows", "4 Nov 2026"),
             ("Crawler access", "Requests as GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot, Googlebot", "One article", "4 Nov 2026"),
         )},
    ],
}

json.dump(audit, open(sys.argv[1], "w"), indent=1, ensure_ascii=False)
words = len(json.dumps(audit, ensure_ascii=False).split())
print("stats", len(audit["stats"]), "blocks", len(audit["blocks"]), "approx words", words)
