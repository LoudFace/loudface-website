# Client proposals on loudface.co

This replaces sending a Notion doc. A proposal lives at a private link like

```
https://www.loudface.co/p/k7m2xq9vhtrn4bwsd83pfy6cza
```

The client opens the link, types an access code once, and reads the proposal.
Nobody can find it by guessing, search engines will not index it, you can
switch it off at any time, and it turns itself off on a date you choose.

You also get to see what happened: whether they opened it, whether they
unlocked it, whether they ever reached the price, and how far down they read.

---

## Before the first proposal — a five-minute setup, once

Three of these steps can only be done by you, because they need an owner login
at Sanity and at Vercel.

### 1. Create the private dataset

Proposals do NOT live in the same place as the website content. The website
dataset is **public** — anyone who knows our Sanity project ID can read
everything in it. Pricing must never sit there.

1. Go to https://www.sanity.io/manage/project/xjjjqhgt/datasets
2. Click **Add dataset**.
3. Name it exactly `proposals`.
4. Set visibility to **Private**. This is the whole point — do not leave it public.
5. Create.

> If you prefer the terminal: `npx sanity dataset create proposals --visibility private`
> (run it inside the loudface-website folder, after `npx sanity login`).

### 2. Create a read token for it

1. Go to https://www.sanity.io/manage/project/xjjjqhgt/api#tokens
2. **Add API token** → name it `proposals-read` → permission **Viewer** → Save.
3. Copy the token. Sanity shows it once.

### 3. Put three values into Vercel and into your local file

In Vercel → loudface-website → Settings → Environment Variables, add these to
**Production, Preview and Development**:

| Name | Value |
|---|---|
| `SANITY_PROPOSALS_TOKEN` | the Viewer token from step 2 |
| `PROPOSAL_COOKIE_SECRET` | a random string — run `openssl rand -hex 32` and paste the output |

Then put the same two lines in your local `.env.local` so proposals work on
your machine too. `.env.example` already lists them with the same notes.

Redeploy after adding them. Until `SANITY_PROPOSALS_TOKEN` exists, every
proposal link answers "page not found" — safe, but not useful.

**What `PROPOSAL_COOKIE_SECRET` does:** it signs the small cookie that
remembers a client already typed the right code. If it is missing, everything
still works, but every deploy asks your clients for the code again.

---

## Making a proposal

1. Go to **https://www.loudface.co/studio/proposals**. That is a separate
   editor from the normal CMS at `/studio`, pointed at the private dataset.
   Proposals do not appear in the normal CMS and never should.
2. **Proposal → Create new.**
3. The **Access** tab:
   - **Title** — the headline the client reads at the top of the page.
   - **Client name** — e.g. `Jaris`.
   - **Prepared for** — the people who will read it, one name per line.
   - **Link token** — already filled in for you, and locked. Do not retype it.
     Changing it breaks any link you have already sent.
   - **Access code** — already filled in for you, e.g. `K7M2-QX4P`. You can
     replace it with something friendlier. Case does not matter to the client.
   - **Valid until** — the last day the link works. After that it answers
     "page not found".
   - **Status** — leave on **Draft** while you write. The link 404s until you
     set it to **Sent**.
   - **Contact email** — shown at the top and bottom of the page.
4. The **Content** tab:
   - **Hero summary** — two or three sentences under the headline.
   - **Price line** — the money sentence, e.g.
     `$5,000/mo flat. 3-month minimum, then month to month.` It sits in a white
     card right under the header, which is the first thing anyone scrolls to.
   - **Sections** — add as many blocks as you need, in any order:
     - **Text** — heading plus paragraphs, bold, links, bullets.
     - **Table** — column headers plus rows.
     - **Pricing tiers** — up to three cards; tick **Recommended** on one.
     - **Timeline** — Month 1 / Month 2 / Month 3 style rows.
     - **Bullet list** — bullets with an optional bold lead-in.
   - Leave a block's heading empty and it runs on from the block above it.
5. Set **Status** to **Sent**.
6. **Publish**. Nothing is live until you publish — the page only ever reads
   published documents.

## Sending it

Send the link and the code in **two separate messages**. Email the link, then
put the code in a second email, or say it on the call. If both sit in one
forwarded email, the gate has done nothing.

```
Link:  https://www.loudface.co/p/<the link token>
Code:  <the access code>
```

## Turning one off

Any one of these kills access immediately:

- Change the **access code**. Everyone who already unlocked it gets asked
  again, and the old code no longer works. This is the fastest revoke.
- Set **Status** to **Expired** (or back to **Draft**). The link 404s.
- Let **Valid until** pass. The link 404s on its own.

## What you can see afterwards

In PostHog, filtered to these event names:

| Event | Means |
|---|---|
| `proposal_opened` | someone loaded the link |
| `proposal_unlocked` | someone typed the right code |
| `proposal_pricing_viewed` | someone actually scrolled to the money |
| `proposal_section_viewed` | fires once per section they reached |

Every event carries `proposal_token`, and everything after the unlock also
carries `client_name`, so you can filter one client's behaviour.

One caveat: this obeys the same cookie-consent rule as the rest of the site.
A reader in the EU/UK/Switzerland who has never accepted cookies on
loudface.co produces no events. US and most other readers do.

## Printing

Clients forward proposals internally as PDFs, so Cmd+P is a supported output.
It prints without the access form, keeps the dark header and the pricing cards
in colour, and avoids splitting tables and cards across pages.

## Seeding the Jaris proposal

The Jaris proposal is already written as a script, ported from the Notion page:

```bash
# see what it will write, without writing anything
node scripts/create-proposal-jaris.mjs --dry-run

# actually write it (needs SANITY_API_TOKEN or SANITY_PROPOSALS_WRITE_TOKEN)
node scripts/create-proposal-jaris.mjs
```

It prints the link and the access code once, at the end. It writes the
proposal as a **Draft**, so open `/studio/proposals`, read it, then set the
status to **Sent**.

The Notion page also had four case-study videos and a review-links line. There
is no video block in the proposal schema, so those were not ported — send them
the way you always have.

## Things worth knowing

- **The link alone is not the secret.** The token is 26 random characters, so
  nobody guesses it. But if a client forwards the email, the new reader has
  the link. The access code is what makes that second step deliberate.
- **Wrong codes are rate limited** to 8 tries per 15 minutes per reader.
  The counter lives in one server's memory, so it resets on a deploy and is
  not shared between servers. Good enough for a handful of proposals; it would
  need Redis if proposals ever carried something truly sensitive.
- **Nothing leaks in a link preview.** Slack, Gmail and LinkedIn all unfurl
  pasted links. Every proposal shows the same generic card: "LoudFace
  proposal", no client name, no price, no image.
- **Nothing leaks before the code is typed.** The page does not fetch the
  proposal at all until the cookie checks out, so there is nothing in the page
  source to find. Verified by reading the raw source, not by trusting the code.
- **Google cannot index these.** `/p/` sends `X-Robots-Tag: noindex, nofollow,
  noarchive` on every response. Do NOT add `/p/` to robots.txt — a blocked
  crawler never fetches the page, so it never reads that header, and the bare
  URL can still end up in search results.

## For whoever maintains this

| Thing | Where |
|---|---|
| Page and gate | `src/app/(proposal)/p/[token]/page.tsx` |
| Code submission | `src/app/(proposal)/p/[token]/actions.ts` |
| Locked screen | `src/app/(proposal)/p/[token]/AccessGate.tsx` |
| Crypto, expiry, rate limit | `src/lib/proposal-access.ts` |
| Token generation | `src/lib/proposal-token.ts` |
| Private dataset client | `src/sanity/lib/proposalsClient.ts` |
| Schema | `src/sanity/schemas/proposal.ts` |
| Proposals Studio config | `sanity.proposals.config.ts` |
| Rendering | `src/components/proposal/ProposalDocument.tsx` |
| Analytics | `src/components/proposal/ProposalAnalytics.tsx` |
| Print + document CSS | `src/app/(proposal)/proposal.css` |
| noindex header | `next.config.ts`, the `/p/:path*` block |

The rule that must not be broken: **the locked page never fetches proposal
content.** `fetchProposalGate()` returns only the token, access code, validity
date and status. `fetchProposalContent()` runs strictly after the cookie
verifies. A client-side hide would be a failure, not a fix.
