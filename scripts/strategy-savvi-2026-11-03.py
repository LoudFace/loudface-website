# SAVVI Financial, Full strategy tab (3 Nov 2026): the worked example for
# the proposal skill. Run: python3 scripts/strategy-savvi-2026-11-03.py out.json
# then write the JSON to the proposal's `strategy` field (proposals dataset).
import json, sys

# SAVVI's full strategy (3 Nov 2026). Numbers: Ahrefs US (keywords explorer,
# SERP overview, referring domains, 3 Nov), the proposal's own charts (Ahrefs,
# 25 Oct), ChatGPT with web search (26 Oct) and the 4 Nov crawl of all 197
# pages on savvifi.com behind the Technical audit tab (audit-savvi-2026-11-04.py).

n = 0
def k():
    global n
    n += 1
    return f"s{n:03d}"

def rows(*rs, skip=()):
    return [{"_key": k(), "cells": list(r), **({"tone": "skip"} if i in skip else {})} for i, r in enumerate(rs)]

def items(*its):
    return [{"_key": k(), "lead": a, "text": b} for a, b in its]

def steps(*ss):
    return [{"_key": k(), "label": a, "title": b, "items": list(c)} for a, b, c in ss]

strategy = {
    "heading": "The full strategy for SAVVI",
    "summary": (
        "SAVVI already has what AI engines look for: original research, 59 press pieces, 1,122 linking sites and partners "
        "like Voya. Almost none of it sits on a page that answers a buyer's question. The strategy turns that proof into pages "
        "and mentions for three buyers: employers choosing a platform, brokers and partners choosing what to offer, and "
        "employees deciding where the next dollar goes. We take the low-difficulty buyer searches first, then the contested ones."
    ),
    "source": "Read 26 October to 4 November 2026: Ahrefs (US), ChatGPT with web search, and a crawl of all 197 pages on savvifi.com.",
    "bets": [
        {"_key": k(), "title": "Own the next-dollar question",
         "text": "ChatGPT already names SAVVI first when an employee asks whether the next dollar goes to the 401(k), the HSA or debt. No rival owns that moment. We build it out: \"hsa vs 401k\" (350 searches a month, difficulty 1) and \"pay off debt or invest\" (300, difficulty 2)."},
        {"_key": k(), "title": "Get on the employer's shortlist",
         "text": "Employers search \"financial wellness platform\" 700 times a month, difficulty 1, and advertisers pay $14 a click for it. Review sites and blog posts hold it, not a vendor. Comparison pages, named case studies and G2 reviews put SAVVI on that list."},
        {"_key": k(), "title": "Be what brokers and partners hear",
         "text": "SAVVI sells through Voya and brokers. When a broker asks AI which tools to offer clients, it names Benefitfocus and Voya, not SAVVI. Pages for brokers and partners, and a place on SHRM and the lists rivals already appear on."},
    ],
    "blocks": [
        {"_key": k(), "kind": "table", "topic": "keywords",
         "heading": "Keywords we would target first",
         "intro": "Ranked by buyer intent and how winnable each one is. Searches are US searches a month. Difficulty is Ahrefs' score from 0 to 100. Cost per click is what advertisers pay, a sign of what a buyer is worth.",
         "columns": ["Search", "Searches a month", "Difficulty", "Cost per click", "Who ranks today", "Our page", "When"],
         "rows": rows(
             ("financial wellness platform", "700", "1", "$14", "Review sites and blog lists", "Product page for employers", "Month 1"),
             ("financial wellness programs for employees", "350", "0", "$15", "Lincoln Financial, Chime blog", "Guide: choosing a program", "Month 1"),
             ("financial wellness benefits", "150", "0", "$7", "Equifax, BrightPlan blog (4th)", "Product page section", "Month 1"),
             ("benefits decision support tools", "150", "0", "$6", "Benefitfocus, a vendor list", "SelectSmart, retitled for the problem", "Month 1"),
             ("hsa vs 401k", "350", "1", "$0.10", "Reddit, WEX blog", "Next-dollar guide and calculator", "Month 2"),
             ("pay off debt or invest", "300", "2", "$0.40", "Fidelity, Reddit", "Next-dollar guide", "Month 2"),
             ("financial wellness companies", "350", "12", "$7", "Shortlister vendor list, FinFit", "Ranked comparison", "Month 2"),
             ("financial literacy for employees", "200", "4", "$5", "SHRM, The American College", "Research page on Finances on Fire", "Month 2"),
             ("financial wellness providers", "100", "13", "$9", "Shortlister, ADP", "Comparison hub", "Month 3"),
             ("financial wellness software", "100", "9", "$4.50", "Gartner reviews, Paychex", "Comparison hub", "Month 3"),
             ("financial wellness program", "250", "18", "$4.50", "University and non-profit programmes", "Guide", "Month 3"),
             ("employee financial wellness", "400", "21", "$11", "PwC, ADP, Mercer", "Pillar guide", "Month 3"),
             ("student loan 401k match", "60", "0", "$3.50", "Reddit, Student Loan Planner", "SECURE 2.0 guide", "Month 3"),
             ("retirement income planning tools", "70", "0", "$3", "Advisor blogs", "Retirement income page", "Month 3"),
             ("hsa contribution limits 2026", "47,000", "46", "$0.03", "Not checked yet", "Yearly limits page", "Later"),
             ("pay off debt or save for retirement", "350", "68", "$1.10", "Not checked yet", "Next-dollar guide", "Later"),
         ),
         "note": "Ahrefs, US, 3 November 2026. \"Who ranks today\" is the top of Google's results that day. The last two are later bets: big or hard, worth it once the site has strength."},

        {"_key": k(), "kind": "table", "topic": "questions",
         "heading": "AI questions we would track",
         "intro": "The questions SAVVI's three buyers ask ChatGPT, Perplexity and Google's AI. We track about 100, each asked several ways, every day on each engine. These twelve set the groups; you correct the full list at kickoff.",
         "columns": ["Buyer", "Question", "What ChatGPT says today", "Our page"],
         "rows": rows(
             ("Employer", "Benefits decision support for open enrollment", "No SAVVI. Names Jellyvision ALEX, Nayya, Businessolver, PlanSource", "SelectSmart, retitled"),
             ("Employer", "Financial wellness platforms for employees", "No SAVVI. Names Northstar, BrightPlan, Financial Finesse, LearnLux", "Platform page and comparison hub"),
             ("Employer", "Is SAVVI Financial a good platform?", "\"Promising\", but G2 lists zero reviews", "G2 profile and reviews"),
             ("Employer", "Best alternatives to Jellyvision ALEX", "Measured in week one", "SAVVI vs ALEX"),
             ("Employer", "What is the ROI of a financial wellness benefit?", "Measured in week one", "SelectSmart ROI page"),
             ("Employer", "How do we reduce retirement leakage?", "Measured in week one", "Retirement leakage research page"),
             ("Broker", "Benefits tools brokers can offer clients", "No SAVVI. Names Benefitfocus and Voya", "Page for brokers"),
             ("Partner", "White-label financial guidance API", "No SAVVI. Names Candidly, Addition Wealth, Quinn Advisor", "Partner and API page"),
             ("Partner", "Retirement income tools for employees", "No SAVVI. Names Empower, Edelman Financial Engines, Fidelity", "Retirement income page"),
             ("Employee", "Next dollar: 401(k), HSA or debt?", "SAVVI named first, with Voya and Vanguard", "Next-dollar guide (protect)"),
             ("Employee", "Should I max out my HSA or 401(k) first?", "Measured in week one", "HSA vs 401(k) guide"),
             ("Employee", "Should I pay off debt or invest?", "Measured in week one", "Next-dollar guide"),
         ),
         "note": "ChatGPT with web search, asked live on 26 October 2026. The number we report on each question is how often the answer names SAVVI."},

        {"_key": k(), "kind": "table", "topic": "competitors",
         "heading": "Competitors, and where SAVVI can win",
         "intro": "Who AI names instead of SAVVI, what each one has, and the gap SAVVI can take.",
         "columns": ["Competitor", "Linking sites", "Google keywords", "AI names them for", "Where SAVVI can win"],
         "rows": rows(
             ("Jellyvision ALEX", "2,615", "224", "Open enrollment decision support", "Its Google traffic is employee explainers, such as \"how much does short term disability pay\" (1,700 a month). Not the next-dollar question SAVVI already wins in ChatGPT."),
             ("Nayya", "1,892", "52", "Open enrollment decision support", "Holds \"benefits decision support tools\" with a blog post at difficulty 0. A dedicated page can take it."),
             ("BrightPlan", "2,003", "59", "Financial wellness platforms", "4th for \"financial wellness benefits\" with a blog post. Its homepage ranks for \"financial wellness providers\"."),
             ("Financial Finesse", "2,695", "255", "Financial wellness platforms", "The most linking sites of the group. SAVVI's research can earn the same kind of coverage."),
             ("LearnLux", "1,324", "163", "Financial wellness platforms", "Close to SAVVI on links, yet ranks for 163 searches: proof the gap is pages, not authority."),
             ("Candidly", "1,900", "—", "White-label financial guidance", "First for \"401k student loan match\". A SECURE 2.0 guide and a partner page compete directly."),
             ("SAVVI today", "1,122", "10, 7 of them its own name", "The next-dollar question", "Links are close to Nayya's. The gap is pages that answer buyers, not authority."),
         ),
         "note": "Linking sites and keyword counts: Ahrefs, 25 October 2026, as charted in the proposal. Candidly was not in that keyword chart."},

        {"_key": k(), "kind": "table", "topic": "content",
         "heading": "The first 20 pieces",
         "intro": "In order. The first three are written with your team to set the voice. Every piece goes through your legal review; we agree that turnaround in week one, and the pace follows it.",
         "columns": ["#", "Piece", "Type", "What it targets", "Month"],
         "rows": rows(
             ("1", "Financial wellness platform for employers", "Product page", "\"financial wellness platform\" (700)", "1"),
             ("2", "SAVVI vs Jellyvision ALEX", "Comparison", "ALEX alternatives; decision-support questions", "1"),
             ("3", "How to choose an employee financial wellness program", "Guide with checklist", "\"financial wellness programs for employees\" (350)", "1"),
             ("4", "Benefits decision support tools, compared", "Ranked list", "\"benefits decision support tools\" (150)", "2"),
             ("5", "SAVVI vs Nayya", "Comparison", "Decision-support questions", "2"),
             ("6", "SAVVI vs BrightPlan", "Comparison", "Financial wellness questions", "2"),
             ("7", "SAVVI vs Candidly", "Comparison", "White-label guidance questions", "2"),
             ("8", "HSA vs 401(k): where the next dollar goes", "Guide and calculator", "\"hsa vs 401k\" (350)", "2"),
             ("9", "Pay off debt or invest?", "Guide", "\"pay off debt or invest\" (300)", "2"),
             ("10", "Case study with a named customer", "Case study", "\"Is SAVVI a good platform?\"", "2"),
             ("11", "Financial wellness companies, compared", "Ranked list", "\"financial wellness companies\" (350)", "3"),
             ("12", "Financial literacy at work: what Finances on Fire found", "Research page", "\"financial literacy for employees\" (200)", "3"),
             ("13", "Financial wellness benefits employers offer in 2026", "Guide", "\"financial wellness benefits\" (150)", "3"),
             ("14", "Financial guidance brokers can offer clients", "Page for brokers", "Broker questions", "3"),
             ("15", "White-label financial guidance for platforms", "Partner page", "White-label API questions", "3"),
             ("16", "Retirement income planning tools for employees", "Product page", "\"retirement income planning tools\" (70)", "3"),
             ("17", "The student loan 401(k) match under SECURE 2.0", "Guide", "\"student loan 401k match\" (60)", "3"),
             ("18", "The ROI of a financial wellness benefit", "Guide", "ROI questions", "3"),
             ("19", "Second named case study", "Case study", "Proof for every buyer", "3"),
             ("20", "Finances on Fire 2026, refreshed", "Refresh", "Main heading, title and description AI can read", "3"),
         ),
         "note": "After the first 20, a piece every working day, picked from the keyword and question lists by what is losing and what can win."},

        {"_key": k(), "kind": "table", "topic": "offsite",
         "heading": "Where we would get SAVVI mentioned",
         "intro": "Sites AI already cites for SAVVI's buyers, or that link to two or more rivals and not to SAVVI. Ranked by relevance and real readers, then authority.",
         "columns": ["Site", "What it is", "Why it matters", "What we would do", "When"],
         "rows": rows(
             ("G2", "Review site", "ChatGPT checks it and finds zero SAVVI reviews; links to 4 of 6 rivals", "Complete the profile and ask real clients for reviews", "Weeks 1 to 4"),
             ("Shortlister (myshortlister.com)", "Benefits vendor lists", "Its lists rank 2nd for \"financial wellness companies\" and 4th for \"benefits decision support tools\"", "Claim and complete SAVVI's listings", "Weeks 1 to 4"),
             ("Gartner Peer Insights", "Software reviews", "Ranks 1st for \"financial wellness software\"", "Listing and client reviews", "Month 2"),
             ("HR Lineup, HRTech SaaS, G2 roundups", "Lists ChatGPT cites", "Cited in the answers to the questions above", "Pitch the list writers, with SAVVI's research as the reason", "Months 2 to 3"),
             ("Select Software Reviews", "Buyer guide", "Ranks 2nd for \"financial wellness platform\"", "Pitch for inclusion in the buyer guide", "Month 2"),
             ("SHRM (shrm.org)", "HR association", "Links to 5 of 6 rivals; ranks 2nd for \"financial literacy for employees\"", "Offer Finances on Fire findings to its resources and events", "Month 3 on"),
             ("Fortune, Fast Company, Forbes, Inc.", "Business press", "Each links to 4 to 6 rivals", "Pitch the next Finances on Fire release as a data story", "Months 3 to 6"),
             ("fintech.global, TechRSeries, RecruitingDaily", "Trade press", "Each links to 4 or 5 rivals", "Partner news and research briefs", "Months 2 to 4"),
             ("Zero-traffic link sites", "Link farms", "Link to 4 or 5 rivals, but have no readers", "Skip: AI does not cite them and they can hurt", "Never"),
             skip=(8,),
         ),
         "note": "Link gap from Ahrefs, 3 November 2026: among each rival's 250 strongest linking sites, those linking to two or more rivals and not to SAVVI. Results pages from Ahrefs the same day."},

        {"_key": k(), "kind": "list",
         "heading": "What we would fix in the first week",
         "intro": "The Day 1 and Week 1 rows of the Technical audit tab, from a crawl of all 197 pages on savvifi.com on 4 November. Speed, broken links and the full list are in that tab.",
         "items": items(
             ("No sitemap", "/sitemap.xml returns a 404 and robots.txt is empty, so Google gets no list of the 100+ articles. We publish a sitemap with honest dates and a robots.txt that lets AI crawlers in."),
             ("142 pages with no description", "72% of pages. We write each one around the question the page answers."),
             ("164 pages with no main heading", "Including the Finances on Fire report. The article template marks each title as a sub-heading, so one template change fixes 159 articles."),
             ("No canonical tags", "None of the 197 pages names its main address, and tracking-link copies such as ?utm_source=chatgpt.com answer as separate pages. Search engines see duplicates."),
             ("3 broken pages, one in the menu", "/products/savvi-wealth-partners answers Not Found and sits in the menu on 196 pages. /how-it-works/ and /product-selectsmart/ are linked from articles."),
             ("Titles that name the product", "122 titles run past 60 characters, and the product pages are titled \"SelectSmart\" and \"Next-Dollar\". We title them by the problem they solve."),
         ),
         "note": "Fixed on today's site in week one, then built into the new site in month two. Speed and script weight are in the Technical audit tab."},

        {"_key": k(), "kind": "steps",
         "heading": "The first 12 weeks, worked back from February",
         "steps": steps(
             ("Weeks 1 to 2", "Fix and measure", ["The first-week fixes above", "Tracking wired into Pipedrive", "Baseline: about 100 AI questions, Google, leads", "Kickoff: brief, Content Bible, competitors"]),
             ("Weeks 3 to 4", "Lists and voice", ["Keyword and question lists agreed with you", "Three calibration pieces through legal review", "G2 and Shortlister profiles complete", "Brand direction"]),
             ("Weeks 5 to 6", "Build begins", ["New site designed in the new brand", "Pages for employers, brokers and partners", "SAVVI vs ALEX and Nayya live"]),
             ("Weeks 7 to 8", "Build", ["New site built, all fixes carried over", "Next-dollar guides live", "First named case study"]),
             ("Weeks 9 to 10", "Launch-ready", ["A piece every working day", "Pitches to the lists AI cites", "Gartner and G2 reviews coming in"]),
             ("Weeks 11 to 12", "First report", ["Leads and pipeline from search and AI", "AI answers naming SAVVI, per engine", "The next quarter's plan"]),
         )},

        {"_key": k(), "kind": "table",
         "heading": "How we measure",
         "intro": "Leads first, then AI answers, then Google. Every number against today's baseline.",
         "columns": ["Measure", "Today", "How we read it", "Reported"],
         "rows": rows(
             ("Leads and pipeline from search and AI", "Baseline in week one", "PostHog, joined to Pipedrive", "Monthly, first in the report"),
             ("AI answers that name SAVVI", "1 of 6 test questions", "About 100 questions, every day, per engine", "Weekly"),
             ("Google searches SAVVI ranks for", "10, 7 of them its own name", "Ahrefs and Search Console", "Monthly"),
             ("Clicks from non-branded searches", "Baseline in week one", "Search Console", "Weekly"),
             ("G2 reviews", "0", "G2", "Monthly"),
             ("Sites linking to SAVVI", "1,122", "Ahrefs", "Monthly"),
         )},
    ],
    "quickWins": [
        "Sitemap, descriptions, headings and canonical tags fixed in week one",
        "Pages for the low-difficulty buyer searches: platform, programs, benefits, decision support",
        "Four comparison pages and the first named case study",
        "G2 and Shortlister profiles complete, and the first real reviews",
    ],
    "longBets": [
        "Own the next-dollar questions employees ask, built on Finances on Fire",
        "Be the platform brokers and partners hear about when they ask AI",
        "Earned press and a SHRM presence from SAVVI's research",
        "The contested terms, such as \"employee financial wellness\", once the site can win them",
    ],
}

json.dump(strategy, open(sys.argv[1], "w"), indent=1, ensure_ascii=False)
words = len(json.dumps(strategy, ensure_ascii=False).split())
print("blocks", len(strategy["blocks"]), "approx words", words)
