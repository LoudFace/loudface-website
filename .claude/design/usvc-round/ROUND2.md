# ROUND 2 — brief (read AFTER SCAFFOLD.md + DATA.md; all those rules still hold)

Round 1 built 4 directions (A Field / B Blueprint / C Editorial Index / D Loud Restraint). Arnel's verdict:

- **Favorite hero feeling = D "Loud Restraint":** a calm ink-on-paper field where ONE color-blocked
  headline word (solid-indigo near-square, white text) is the shout. Keep this *feeling*.
- **HARD NEW RULE — the hero must NOT lead with the founder's portrait.** "It shouldn't lead with me as a
  visual." The hero's visual must be **CASE STUDIES (real work screenshots)** or **SOCIAL PROOF (client
  logos / metrics / results)** — Arnel leans toward case-studies-as-the-hero-visual. The founder photo is
  allowed ONLY in the team section, never the hero. (See the real case-study thumbnail URLs + logo URLs +
  the Toku/LoudFace result figures in DATA.md.)

## Round-1 tell fixes (apply everywhere — these are standing vetoes)
- NO dash/rule eyebrow kicker ("— THE CONVERSION & GROWTH TEAM"). Integrate any label into the composition.
- NO numbered section markers ("01", "SHEET 01", "02"). Use words or Roman numerals if you must.
- Darken indigo to **#4F46E5** for any small text/label on white paper (AA contrast — #6366F1 fails at small sizes).
- Keep near-square geometry but loosen the tightest paddings a touch (round 1 was occasionally cramped).

## Type (keep D's pairing): **Geist** (grotesque, all UI/body/headlines) × a serif for the accent + the loud word.
For the loud color-blocked word and serif-italic accents use **Gambarino** (Fontshare, display serif) OR
**Newsreader** italic (Google). NO mono. The serif-italic-indigo accent word is a sanctioned LoudFace signature.

---

# IF YOUR TASK IS THE HERO VARIANTS (heroes.html)
Build **4 distinct hero sections**, each leading with WORK or SOCIAL PROOF as the visual, all in D's
loud-restraint feeling (calm field + one color-blocked word). Stack them in ONE html file, each in its own
full-width `<section>` with a small corner label ("HERO V1 — Work Wall" etc.) and a real LoudFace header on
the first one. Use the loud headline copy: "Your website converts. Your organic traffic **compounds.** One
team runs both." with "compounds." (or "converts.") as the color-blocked solid-indigo word. Each hero also
needs: the sub-paragraph, the ONE pill CTA "Book your strategy call", the "2 client slots open for Q2" chip,
and the "See what AI says about us" link. The FOUR variants:

- **V1 · Work Wall** — the visual is an asymmetric MOSAIC of 4–6 real case-study screenshots (Sanity thumbs:
  Toku, LoudFace, Dimer Health, LIQID, Montblanc, Radisson) as near-square tiles filling the hero's right
  half (or full-bleed behind the headline). The WORK is the hero. A thin real client-logo strip below = social proof.
- **V2 · Living Carousel** — two columns of real case-study screenshots auto-scrolling in opposite directions
  (vertical marquee, masked in a near-square frame) on the hero right — volume of work as motion-proof. A
  "200+ B2B SaaS sites" social-proof chip. (Elevated version of the proven current-site hero.) Respect prefers-reduced-motion (freeze it).
- **V3 · Results-forward** — the visual is OUTCOMES: the real Toku growth curve (inline SVG, Sep 23→Jan 100,
  badge +335%) PLUS 2–3 big result figures each tied to a real client logo (288% Dimer · $200K Outbound ·
  0→86% Toku). Results/social-proof ARE the hero image.
- **V4 · Proof Wall** — lead with breadth: a big "200+" figure + a dense, tasteful wall/marquee of real
  client logos (Montblanc, Radisson, LIQID, Hoxhunt, Eraser, Viaduct…) + a couple case thumbnails. Social
  proof as the hero centerpiece.

Output to: /Users/arnel/Code Projects/LoudFace Agency/loudface-website/.claude/design/usvc-round/heroes.html

---

# IF YOUR TASK IS THE FULL BEST-OF PAGE (best.html)
Assemble the strongest sections from round 1 into ONE coherent page, in D's restraint feeling on white.
Use a **work-led hero (= Hero V1 Work Wall above: case-study mosaic + loud color-blocked word + logo strip)** —
NOT a founder portrait. Then this curated section order (each is the round-1 winner for that job):

1. **Hero** — Work Wall (case-study mosaic) + loud color-blocked word + client-logo strip. (D feel, work visual)
2. **Problem** ("Your website is costing you deals. You just can't see it.") — restrained editorial LIST (round-1 A's treatment), not 5 identical cards.
3. **Two tracks BUILD / GROW** — the converging WIRED NODES (round-1 B): two near-square node-cards wired together on a faint blueprint hairline. Caps as small tracked chips. No "01/02".
4. **Work** — the LEDGER INDEX (round-1 C, the strongest section): real case studies as indexed rows with real thumbnail + result figure right-aligned like an accounting entry (Toku 0→86%, LoudFace 10.4%, Dimer 288%, Outbound $200K, LIQID 100+, Hoxhunt 20+).
5. **Data chapter** — a dark INK chapter: "Organic visibility doesn't spike. It *compounds.* +335%" with the real Toku growth curve as inline SVG (round-1 A/C).
6. **The loud block** — D's full-bleed electric-indigo chapter: giant serif-italic "One team runs both." (declared electric accent #4D5BFF for this one moment). The page's detonation.
7. **Stats** ("Numbers, not adjectives") — the FINANCIAL-TABLE / ruled ledger (round-1 C): 200+, 288%, 4+ yrs, <6 wks as ruled rows with real descriptions.
8. **Process** ("How an engagement works") — measured horizontal timeline, Week 0 → Month 3+ (no numbered markers, use the week labels).
9. **Best-for / not-for** — two cards, green check `--ok` / red x `--no` (tones-for-meaning).
10. **Testimonial** — one big serif pull-quote, named (Daan Smit / Anthony Dean from DATA.md).
11. **Team** — duotone portrait grid of the WHOLE team (group, NOT founder-led). Real photos, grayscale/indigo duotone.
12. **Closing CTA** ("Let's figure out what's holding your site back.") — blueprint-corner instrument panel + the one white pill.
13. **Footer** — real multi-column (Services / Company / Connect) + loudface-inversed.svg on ink.

Output to: /Users/arnel/Code Projects/LoudFace Agency/loudface-website/.claude/design/usvc-round/best.html

Both: self-contained, real media (no all-DOM), real copy, responsive + mobile single-column, named eases,
`:active{scale(.98)}`, prefers-reduced-motion honored, build EVERY section fully (no stubs).
