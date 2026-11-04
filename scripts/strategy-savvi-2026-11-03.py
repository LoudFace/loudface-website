# SAVVI Financial, Preliminary strategy tab: the worked example for the
# proposal skill. Run: python3 scripts/strategy-savvi-2026-11-03.py out.json
# then write the JSON to the proposal's `strategy` field (proposals dataset).
import json, sys

# Rewritten 4 Nov 2026 after a buyer-eye review against both calls with
# Kelsey (26 Oct intro, 3 Nov follow-up) and LoudFace's Answer Chain
# (loudface.co/methodology). What the review found and this version fixes:
# SAVVI sells mostly through partners (Voya, Benefitfocus) and brokers, not
# direct to employers or employees, so the plan leads with partner and broker
# answers; the old "ChatGPT names SAVVI first" claim did not repeat (0 of 4
# runs today), so it is replaced by a sample of both engines; legal review and
# the rebuild get their own blocks.
#
# Numbers: ChatGPT (gpt-6.1-sol, web search) and Perplexity (sonar-pro, web
# search) through DataForSEO, one run per question on 4 Nov 2026, with the
# next-dollar question asked three ways, twice each on ChatGPT. Cited pages
# from the same runs (8 shortlist questions x 2 engines, 15 of 16 answers
# returned sources). Ahrefs US (3 Nov; competitors 25 Oct). The 4 Nov crawl
# of all 197 pages (audit-savvi-2026-11-04.py). Client results from the live
# case studies on loudface.co, read 4 Nov.

n = 0
def k():
    global n
    n += 1
    return f"p{n:03d}"

def rows(*rs, skip=()):
    return [{"_key": k(), "cells": list(r), **({"tone": "skip"} if i in skip else {})} for i, r in enumerate(rs)]

def items(*its):
    return [{"_key": k(), "lead": a, "text": b} for a, b in its]

def steps(*ss):
    return [{"_key": k(), "label": a, "title": b, "items": list(c)} for a, b, c in ss]

KEYWORDS = [
    ("financial wellness platform", "700", "1", "$14", "Review sites and blog lists", "Ranked comparison for employers"),
    ("financial wellness programs for employees", "350", "0", "$15", "Lincoln Financial, Chime blog", "Guide: choosing a program"),
    ("benefits decision support tools", "150", "0", "$6", "Benefitfocus, a vendor list", "Ranked comparison"),
    ("financial wellness benefits", "150", "0", "$7", "Equifax, BrightPlan blog (4th)", "Employer page section"),
    ("financial wellness companies", "350", "12", "$7", "Shortlister vendor list, FinFit", "Ranked comparison"),
    ("financial literacy for employees", "200", "4", "$5", "SHRM, The American College", "Finances on Fire research page"),
    ("financial wellness providers", "100", "13", "$9", "Shortlister, ADP", "Ranked comparison"),
    ("financial wellness software", "100", "9", "$4.50", "Gartner reviews, Paychex", "Ranked comparison"),
    ("retirement income planning tools", "70", "0", "$3", "Advisor blogs", "Retirement income page"),
    ("student loan 401k match", "60", "0", "$3.50", "Reddit, Student Loan Planner", "SECURE 2.0 guide"),
    ("hsa vs 401k", "350", "1", "$0.10", "Reddit, WEX blog", "Next-dollar answer page"),
    ("pay off debt or invest", "300", "2", "$0.40", "Fidelity, Reddit", "Next-dollar answer page"),
    ("financial wellness program", "250", "18", "$4.50", "University and non-profit programmes", "Guide"),
    ("employee financial wellness", "400", "21", "$11", "PwC, ADP, Mercer", "Pillar guide"),
]
VOLUME = sum(int(r[1].replace(",", "")) for r in KEYWORDS)

strategy = {
    "heading": "A preliminary strategy for SAVVI",
    "summary": (
        "SAVVI sells through partners and brokers to employers, so the answer that matters is the one a partner, a broker "
        "or a benefits leader gets when they ask AI which tool to offer. Today AI names SAVVI when asked about SAVVI or for "
        "a next-dollar tool, and almost nowhere else: once in 16 answers to the broker, partner and employer questions we sampled. Those answers "
        "lean on a short list of third-party pages and reports. That is why, as you said on our first call, AI is the more "
        "level field against VC-backed rivals, and it is where we would start."
    ),
    "source": (
        "Read 26 October to 4 November 2026: ChatGPT and Perplexity with web search, a crawl of all 197 pages on "
        "savvifi.com, Ahrefs (US), and our two calls with you."
    ),
    "caveat": (
        "We built this from public data only, with one run per AI question. It will change after kickoff, once we have "
        "talked it through with you and can see your Search Console, Pipedrive, partner plans and the product messaging you "
        "are writing for the launch. Read it as our current thinking, to argue with."
    ),
    "bets": [
        {"_key": k(), "title": "Get onto the shortlists AI reads",
         "text": "When an employer or broker asks AI for decision-support or financial wellness tools, both engines drew on the same few ranked lists: HR Tech SaaS, LeadChange Group, Guideflow, Shortlister, HR Lineup. SAVVI was named in 1 of 16 answers to those questions. Being evaluated for a place on the most-cited lists is the shortest route to being named."},
        {"_key": k(), "title": "Be named through your partners",
         "text": "ChatGPT cited Nayya through its page on ADP's site, and Benefitfocus's own decision-support overview. SAVVI sells through Voya and Benefitfocus. A SAVVI page on each partner's site, in the same words as savvifi.com, is proof a VC-backed rival cannot buy."},
        {"_key": k(), "title": "Publish the numbers only SAVVI holds",
         "text": "Asked about the ROI of financial wellness or about 401(k) leakage, neither engine named a single vendor; they quoted surveys and reports. SAVVI has Finances on Fire and a data team. Research pages built on SAVVI's own numbers answer the first question your leadership asks: is this benefit worth paying for."},
    ],
    "blocks": [
        {"_key": k(), "kind": "table",
         "heading": "Our method, applied to SAVVI",
         "intro": "We call our method the Answer Chain: eight stages that take a brand from being read by AI, to being cited, to being named, and then to leads. Here is where SAVVI stands on each, and our first move.",
         "columns": ["Stage", "SAVVI today", "What we would do"],
         "rows": rows(
             ("1. Baseline, per engine", "Named in 1 of 16 answers to broker, partner and employer questions in our sample. No tracked baseline yet.", "Track about 100 questions every day on ChatGPT, Perplexity and Google's AI, before any work ships."),
             ("2. Access", "The five AI and search crawlers we tested are let in, and every word is in the HTML. No sitemap, no canonical tags.", "Fix the blockers in the Technical audit tab."),
             ("3. Entity", "The homepage, the employer page and the product pages each describe SAVVI differently.", "One sentence and one category name, set with the rebrand and used everywhere."),
             ("4. Format", "Product pages and long articles. No ranked lists or comparisons, which are what AI lifts.", "Lead each page with the unit its question wants: a ranked list, a comparison table or a short answer."),
             ("5. Original material", "Finances on Fire, the Spotlight report and PhD authors, but few pages an engine can quote a number from cleanly.", "Research pages on ROI and leakage from SAVVI's own data, signed by your experts."),
             ("6. Corroboration", "No SAVVI partner page among the sources AI cited, and no SAVVI reviews on G2.", "Partner pages, evaluation requests to the lists AI reads, reviews agreed with legal."),
             ("7. Selection over volume", "Nothing chased yet.", "A few placements, ranked by how often AI cites the page, not by its authority score."),
             ("8. Report through to revenue", "Pipedrive is in place; we have not yet seen how lead sources are logged.", "Each engine, then visits, leads and deals, with partner and broker sources logged."),
         ),
         "note": "The full method, with our own numbers, is at loudface.co/methodology."},

        {"_key": k(), "kind": "table", "topic": "questions",
         "heading": "What AI says today, by buyer",
         "intro": "Twelve questions, asked the way partners, brokers, benefits leaders and employees ask them, on 4 November. One run each varies, so read this as a first look, not the baseline.",
         "columns": ["Buyer", "Question", "Names SAVVI?", "Who it names instead"],
         "rows": rows(
             ("Broker", "Which benefits decision tools can a broker offer clients?", "Neither", "Benefitfocus (ChatGPT); ALEX and Nayya (Perplexity)"),
             ("Partner", "Who offers a white-label financial guidance API?", "Neither", "Candidly, BrightPlan"),
             ("Partner", "Best retirement income planning tools for employees?", "Neither", "Fidelity, Empower, Vanguard"),
             ("Employer", "Best benefits decision support tools for open enrollment?", "Neither", "Jellyvision ALEX, Nayya, Businessolver, Picwell"),
             ("Employer", "Best financial wellness platforms for employees?", "Neither", "LearnLux, BrightPlan, SmartDollar, Financial Finesse"),
             ("Employer", "Best alternatives to Jellyvision ALEX?", "Perplexity", "Nayya, Businessolver, Picwell"),
             ("Employer", "What is the ROI of a financial wellness benefit?", "Neither", "No vendor named"),
             ("Employer", "How do employers reduce 401(k) leakage?", "Neither", "No vendor named"),
             ("Employee", "Where should my next dollar go: 401(k), HSA or debt?", "ChatGPT, 0 of 5 runs", "No vendor: cites the CFPB, the IRS and Vanguard"),
             ("Employee", "Is there a tool that tells me where my next dollar should go?", "ChatGPT, 2 of 2 runs", "SAVVI, citing its Next-Dollar page"),
             ("Employee", "Max out my HSA or my 401(k) first?", "Neither", "No vendor named"),
             ("Employee", "Pay off debt or invest?", "Neither", "Vanguard, Fidelity"),
         ),
         "note": "ChatGPT and Perplexity, both with web search, through DataForSEO, 4 November 2026. On 26 October one ChatGPT session named SAVVI first for the next-dollar question; the repeat runs today did not. That is why we report a tracked panel, never a single answer."},

        {"_key": k(), "kind": "table", "topic": "offsite",
         "heading": "The pages AI reads before it answers",
         "intro": "The third-party pages the engines cited when we asked eight broker, partner and employer questions on both engines, most-cited first.",
         "columns": ["Page", "What it is", "Cited in", "What we would do"],
         "rows": rows(
             ("LeadChange Group: financial wellness platforms, with its compare and mid-market pages", "Ranked lists", "4 answers, both engines", "Ask to be evaluated on all three pages"),
             ("HR Tech SaaS: best benefits decision support tools", "Ranked list", "4 answers, both engines", "Ask to be evaluated, with SAVVI's decision-support data"),
             ("Guideflow: financial wellness software", "Ranked list", "3 answers, both engines", "Ask to be evaluated"),
             ("Reddit: r/humanresources and r/CFP threads", "HR and planner discussions", "ChatGPT, on 7 of the 8 questions", "Nothing planted. If your legal team agrees, your experts answer real questions under their own names"),
             ("Nayya's page on ADP's site; Benefitfocus's decision-support overview", "Partner pages", "3 answers, ChatGPT", "A SAVVI page on Voya's and Benefitfocus's sites"),
             ("Shortlister: benefits decision support vendor list", "Vendor directory", "2 answers, ChatGPT", "Claim and complete SAVVI's listing"),
             ("HR Lineup, Select Software Reviews, Wellable, Ignition Benefits", "Ranked lists and buyer guides", "2 answers each", "Ask to be evaluated"),
             ("G2", "Review site", "ChatGPT found no SAVVI reviews on 26 October", "Complete the profile; how to ask for reviews is agreed with your legal team first"),
             ("Sites that link to rivals but have no readers", "Link farms", "Not cited", "Skip: AI does not read them, and they can hurt"),
             skip=(8,),
         ),
         "note": "Same 4 November runs. A page earns a place here by how often AI cites it, not by its authority score. At kickoff we rank them on the full panel. We never buy a link and never make one conditional."},

        {"_key": k(), "kind": "table",
         "heading": "What has worked for clients like SAVVI",
         "intro": "The closest matches from our own client work, and what each means for this plan.",
         "columns": ["Client", "What we did", "What moved", "What it means for SAVVI"],
         "rows": rows(
             ("Toku, B2B payroll on Workday, ADP and Rippling", "One narrow wedge, and one page per HR system it plugs into", "97.8% AI visibility on its category's top question; its Rippling page rose from position 17.2 to 7.8 in Google", "Your partners are SAVVI's Rippling: a page for each, and decision support before the broad terms"),
             ("Transalis, B2B EDI software", "Guides and comparison pages on a rebuilt site", "AI visibility from 5.2% to 16.5% on the same 73 questions; from the 21st to the 1st site ChatGPT cites on them", "Measured on a fixed set of questions, per engine: how we would report SAVVI"),
             ("Delshad Legal, a regulated practice", "Every claim checked against its source before publishing", "Google clicks per week 16 times the June level; case enquiries per week 2.7 times the weeks before August", "The same check, built around your legal review"),
             ("Pond, an AI task marketplace", "Alternatives pages for named rivals", "ChatGPT cited its Applause and Testlio alternatives page one day after it went live", "SAVVI's ALEX alternatives page, where Perplexity already names SAVVI"),
         ),
         "note": "Each figure is from that client's case study on loudface.co, read 4 November 2026."},

        {"_key": k(), "kind": "list",
         "heading": "Who SAVVI is, to an AI engine",
         "intro": "An engine repeats the words it finds about a company. Where they disagree, it picks the flattest one. This is the step that joins your brand work to AI answers.",
         "items": items(
             ("Several descriptions today", "The homepage says \"Financial Fortitude Begins in the Workplace\", the employer page \"All-In-One Financial Guidance\", and the product pages financial wellness, open enrollment and retirement paychecks. An engine has to guess which category SAVVI belongs to."),
             ("One sentence, one category", "With the rebrand we write one sentence that says what SAVVI is and who it serves, and pick the category name buyers actually type. Both go on every page, partner listing and profile."),
             ("Product names after the problem", "SelectSmart and Next-Dollar mean little to an engine on their own, and two unrelated apps already call themselves Next Dollar. Each product page leads with the decision it helps with, then the name."),
             ("Your experts, by name", "Author pages already exist for Gina Mourtzinou, Alex Sauer-Budge and Brian Harrison. We put them on the research pages as named authors and reviewers, with their credentials marked up for engines. Engines and buyers both weigh who stands behind a number."),
         )},

        {"_key": k(), "kind": "table", "topic": "content",
         "heading": "What we would publish first",
         "intro": "Ordered by how SAVVI sells: partners and brokers first, then employers, then the employee questions SAVVI's product answers. The first three rebuild pages you already have; they are written with you to set the voice.",
         "columns": ["#", "Page", "Format", "The question it answers"],
         "rows": rows(
             ("1", "The broker page, rebuilt around what a broker asks (today: \"Stand Out With All-In-One Employee Financial Guidance\")", "Short answer, then a comparison table", "Broker questions, where Benefitfocus, ALEX and Nayya are named"),
             ("2", "The partner page, rebuilt to say what a platform gets and who already offers SAVVI", "Partner page, naming the partners", "\"White-label financial guidance API\""),
             ("3", "The SelectSmart ROI page, rebuilt as the ROI of a financial wellness benefit, from SAVVI's data", "Research page, signed by your experts", "ROI questions, where AI names no vendor"),
             ("4", "Jellyvision ALEX alternatives", "Comparison table", "The one shortlist question where SAVVI is already named"),
             ("5", "Benefits decision support tools, compared", "Ranked list, SAVVI's place disclosed", "\"benefits decision support tools\""),
             ("6", "Retirement leakage: what SAVVI's data shows", "Research page", "Leakage questions, where AI names no vendor"),
             ("7", "Where should the next dollar go: 401(k), HSA or debt?", "Short answer first, then SAVVI's method", "The money question itself, now answered by the CFPB and Vanguard"),
             ("8", "Finances on Fire, rebuilt so each finding can be quoted", "Research page", "Financial stress and literacy questions"),
             ("9", "A named case study with an employer or partner", "Case study", "\"Is SAVVI a good platform?\""),
             ("10", "SAVVI vs Nayya, and SAVVI vs BrightPlan", "Comparison tables", "Decision-support and wellness shortlists"),
             ("11", "Financial wellness platforms for employers, compared", "Ranked list, SAVVI's place disclosed", "\"financial wellness platform\" (700 searches a month)"),
             ("12", "HSA or 401(k) first?", "Short answer, then a worked example", "\"hsa vs 401k\" (350 searches a month)"),
         ),
         "note": "After these, a page every working day while your legal review keeps pace, chosen from the tracked questions by what is losing and what can win."},

        {"_key": k(), "kind": "list",
         "heading": "Built to pass your legal review",
         "intro": "Everything SAVVI publishes goes through your legal team. We plan the work around that, not past it.",
         "items": items(
             ("Claims approved once", "We keep a library of the claims, numbers and disclosures your legal team has approved. Drafts draw on it, so most pages arrive with nothing new to review."),
             ("A source behind every claim", "Every number in a draft links to its source on file. A claim without one does not reach a page."),
             ("Reviews and testimonials", "For an adviser, reviews, testimonials and ratings can fall under the SEC's marketing rule. We agree with your legal team how to ask for them and how to show them before we ask anyone, on G2 or anywhere else."),
             ("One batch a week", "Drafts reach legal in one weekly batch, with every change marked. The pace of publishing follows their turnaround."),
             ("Fair comparisons", "Every comparison states its date and sources and describes rivals fairly, so legal can sign it off and AI can quote it."),
         )},

        {"_key": k(), "kind": "list",
         "heading": "The new site, without the old site's problems",
         "intro": "You told us you don't want to repeat the last build. These are the rules the new site is built and checked against before it goes live.",
         "items": items(
             ("Readable without JavaScript", "Every page's words stay in the HTML, as they are today, and AI crawlers stay allowed."),
             ("Light by default", "One Google tag, one copy of each library, fonts that don't hold the page, the main image loaded first. The target on every template: a phone score of 85 or more, and the main image showing within 2.5 seconds."),
             ("Nothing lost in the move", "Each of today's 197 addresses gets a redirect or a reason, and every link other sites point at still lands."),
             ("Checked before launch", "A launch check runs every page for broken links, headings, descriptions, canonical tags, the sitemap, speed and tracking. The site goes live when it passes."),
             ("Yours to run", "Whether it stays on Webflow we decide with you. Either way your team edits pages without us, and the rules are written down with the site."),
         )},

        {"_key": k(), "kind": "list",
         "heading": "What we would fix first",
         "intro": "The blockers on today's site, from the Technical audit tab. Fixed on today's site first, then carried into the new one.",
         "items": items(
             ("Sitemap and robots.txt", "/sitemap.xml returns a 404 and robots.txt is empty, so Google gets no list of the 164 articles."),
             ("Canonical tags", "None of the 197 pages names its main address, so tracking-link copies such as ?utm_source=chatgpt.com count as separate pages."),
             ("Main headings", "164 pages have no H1. 159 of them are articles whose template marks the title as a sub-heading, so one template change fixes those."),
             ("Descriptions and titles", "142 pages have no description, and product pages are titled by product name. We write each around the question the page answers, through your legal review."),
             ("One broken menu link", "/products/savvi-wealth-partners is Not Found and sits in the menu on 196 pages. A crawler counts it once per page, which is why other audits report around 200 errors."),
         ),
         "note": "Speed, script weight and the full list are in the Technical audit tab."},

        {"_key": k(), "kind": "steps",
         "heading": "How the work runs, in order",
         "steps": steps(
             ("Step 1", "Measure, then fix the blockers", ["Per-engine baseline on about 100 questions", "Sitemap, canonical tags, headings, the menu link", "Tracking checked: one Google tag, leads into Pipedrive"]),
             ("Step 2", "Agree the questions and the voice", ["The 100 questions built with you, by buyer, from rivals' answers and your positioning", "Content Bible, with 20 or more competitors", "Three calibration pieces through legal"]),
             ("Step 3", "Brand, and the one sentence", ["Brand direction, evolved from today's guidelines", "One sentence and one category name", "Templates your team can use without us"]),
             ("Step 4", "The new site", ["Built and checked against the rules above", "Every address redirected", "Broker, partner and research pages in place"]),
             ("Step 5", "Publish and get named", ["A page every working day, at legal's pace", "Evaluation requests to the lists AI reads", "Partner pages, where your partners agree"]),
             ("Step 6", "Report and re-plan", ["Each engine, then visits, leads and deals", "What moved, and what did not", "The next bets, chosen from the results"]),
         )},

        {"_key": k(), "kind": "table",
         "heading": "How we measure",
         "intro": "Read as a chain, from the answer to the deal, and never blended across engines. Where a link is thin we report the thinness rather than fill it in.",
         "columns": ["Link", "What we read", "Where it comes from"],
         "rows": rows(
             ("AI answers", "How often each engine names SAVVI, cites savvifi.com, where SAVVI sits in the answer, and how warmly", "Peec AI: ChatGPT, Perplexity and Google's AI, about 100 questions a day"),
             ("Google", "Clicks and impressions on searches that don't name SAVVI", "Your Search Console"),
             ("Visits from AI", "People arriving from ChatGPT, Perplexity and others, first touch. A floor, not a total", "Your analytics, once the three Google tags are one"),
             ("Leads", "Demo requests and contact forms, with \"How did you hear about SAVVI?\"", "Your site and Pipedrive"),
             ("Partner and broker deals", "Deals partners and brokers bring, with the source asked and logged", "Pipedrive, set up with you"),
             ("Revenue", "What those leads and deals turned into", "Pipedrive"),
         ),
         "note": "A partner-led sale often leaves no trail on your website, so the partner and broker line matters as much as site leads. Your site loads Google's tag three ways, which may count some visits twice; we check that before the baseline."},

        {"_key": k(), "kind": "list",
         "heading": "What we need from you",
         "intro": "The plan moves at the speed of these. Most are a one-off at kickoff.",
         "items": items(
             ("A legal reviewer", "A named person and a weekly slot. The pace of publishing follows them."),
             ("Access", "Webflow, Google Tag Manager, Search Console and Pipedrive, read-only where you prefer."),
             ("Your positioning", "The product messaging you are writing for the launch, so the pages and the one-sentence description match it."),
             ("Names", "Which customers and partners we may name, and an introduction to each partner's marketing team."),
             ("Your experts' time", "An hour with your data team to choose the numbers for the research pages, and their review of each one."),
             ("What we decide together", "Which buyer comes first this year, whether the site stays on Webflow, and the final list of 100 questions."),
         )},

        {"_key": k(), "kind": "table", "topic": "competitors",
         "heading": "Competitors, and where SAVVI can win",
         "intro": "Who AI names instead of SAVVI, what each one has, and the gap SAVVI can take. Benefitfocus and Voya are your partners, not rivals, so they are not here.",
         "columns": ["Competitor", "Linking sites", "Google keywords", "AI names them for", "Where SAVVI can win"],
         "rows": rows(
             ("Jellyvision ALEX", "2,615", "224", "Open enrollment decision support", "Its Google traffic is employee explainers, such as \"how much does short term disability pay\" (1,700 a month), not decision support."),
             ("Nayya", "1,892", "52", "Decision support; ALEX alternatives", "Holds \"benefits decision support tools\" with a blog post at difficulty 0, and is cited through ADP. A dedicated page and a partner page compete directly."),
             ("BrightPlan", "2,003", "59", "Wellness platforms; white-label guidance", "4th for \"financial wellness benefits\" with a blog post. Its homepage ranks for \"financial wellness providers\"."),
             ("Financial Finesse", "2,695", "255", "Financial wellness platforms", "The most linking sites of the group. SAVVI's research can earn the same kind of coverage."),
             ("LearnLux", "1,324", "163", "Financial wellness platforms", "Close to SAVVI on links, yet ranks for 163 searches: its pages answer buyers' questions."),
             ("Candidly", "1,900", "—", "White-label financial guidance", "First for \"401k student loan match\". A SECURE 2.0 guide and a partner page compete directly."),
             ("SAVVI today", "1,122", "10, 7 of them its own name", "A next-dollar tool, when asked for one", "Fewer linking sites than any rival here, but close to LearnLux, which ranks for 163 searches. The gap is pages that answer buyers, not authority."),
         ),
         "note": "Linking sites and keyword counts: Ahrefs, 25 October 2026. \"AI names them for\": the 4 November runs above. The full set of 20 or more competitors comes with the Content Bible at kickoff."},

        {"_key": k(), "kind": "table", "topic": "keywords",
         "heading": "Google searches worth a page",
         "intro": f"Ranked by buyer intent and how winnable each is. Together these {len(KEYWORDS)} come to about {VOLUME:,} US searches a month: Google is a small, steady source here, and the bigger prize is the AI answers above, which draw on the same pages. Difficulty is Ahrefs' score from 0 to 100; cost per click is what advertisers pay, a sign of what a buyer is worth.",
         "columns": ["Search", "Searches a month", "Difficulty", "Cost per click", "Who ranks today", "Our page"],
         "rows": rows(*KEYWORDS),
         "note": "Ahrefs, US, 3 November 2026. \"Who ranks today\" is the top of Google's results that day. The last two are contested: worth it once the site has strength."},
    ],
    "quickWins": [
        "Sitemap, canonical tags, headings and the broken menu link fixed first",
        "Evaluation requests to the lists AI cites most for decision support and financial wellness",
        "The ALEX alternatives comparison, where Perplexity already names SAVVI",
        "Broker and partner pages, and the ROI research page from SAVVI's data",
    ],
    "longBets": [
        "SAVVI named by default when a broker or partner asks AI which tool to offer",
        "SAVVI's numbers become the ones the category quotes on ROI and leakage",
        "A SAVVI page on each partner's site, in the same words as savvifi.com",
        "The contested Google terms, such as \"employee financial wellness\", once the site can win them",
    ],
}

json.dump(strategy, open(sys.argv[1], "w"), indent=1, ensure_ascii=False)
words = len(json.dumps(strategy, ensure_ascii=False).split())
print("blocks", len(strategy["blocks"]), "approx words", words, "keyword volume", VOLUME)
