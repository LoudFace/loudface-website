# Client feedback tool

A private way for a client (and the team) to report bugs, changes, new
requests and questions straight from the website, and for the team to track
every one of them in one place. Test phase: LoudFace's own site, one team
member (Tamara) only.

## What it does

- **A "Feedback" button** in the bottom-right corner. It exists only in a
  browser that opened a private link. Every other visitor sees nothing and
  downloads none of its code.
- **New request:** point at any section of the page (or leave it empty for a
  general request), pick a type (Bug, Change, New page or feature, Question),
  pick an urgency (Urgent, This week, No rush), write a note, send. The page,
  a screenshot of the section with the part outlined in red, the date, and
  the screen size and browser are added automatically.
- **My requests:** every request from this client with its status, expected
  delivery date and a reply thread.
- **Team board** at `/feedback/board` (team links only): every client's
  requests, three views over the same records (By status, By page, List),
  filters for client, type, urgency and owner. The team sets status,
  priority, owner, expected delivery and can correct the type. Every change
  is kept in a history. "Open at the section" opens the page scrolled to the
  exact section with it highlighted.

Statuses: New, Accepted, In progress, Ready for your check, Done, Won't do.
Clients never see the team's priority or the history.

## Turning it on

It is off until two environment variables exist. With them missing, every
link and page of the tool answers 404.

| Name | Value |
|---|---|
| `FEEDBACK_ACCESS` | JSON list of private links, one per person: `[{"token":"<random, 32+ chars>","client":"loudface","name":"Tamara","role":"team"}]` |
| `FEEDBACK_COOKIE_SECRET` | `openssl rand -hex 32` |

Make a token with `openssl rand -base64 33 | tr '+/' '-_' | tr -d '=\n'`.
The private link is then `https://www.loudface.co/fb/<token>`; add
`?to=/pricing` to open a specific page. `role` is `team` (sees every client,
opens the board, edits) or `client` (sees and sends only its own client's
requests). `client` is the client's Spine slug.

Set them in Vercel → loudface-website → Settings → Environment Variables
(Production), then redeploy. Locally they live in `.env.local`.

**Revoke a person:** remove their entry from `FEEDBACK_ACCESS` and redeploy.
Their browser loses access on its next request. **Leave feedback mode** in the
panel signs one browser out; the link signs it back in.

## Where the requests are kept

`src/lib/feedback/store.ts`. On Vercel: the Redis database already used by
the AI visibility audit (`REDIS_URL`), under `fb:*` keys, screenshots
included. Locally without `REDIS_URL`: JSON files in `.feedback-data/`
(git-ignored).

## Moving it into the Spine and the Team App

Built for it, not connected yet:
- Every record is one flat, Spine-shaped row (`src/lib/feedback/types.ts`):
  `client_slug` on every row, snake_case fields, an append-only `events`
  trail like Spine change events, and a `source` field that already allows
  `slack` and `email` for the intake that comes later.
- Everything reads and writes through the `FeedbackStore` interface. The
  Spine version is a second implementation of that interface; the widget,
  the API and the board stay as they are.
- `GET /api/feedback/export` (team only) returns every request as
  `feedback_request.v1` JSON for a one-time import.
- The Team App needs two views over the same rows: per client (a Requests
  tab on the client page) and agency-wide (this board's By status view).

## Files

| What | Where |
|---|---|
| Record shape and labels | `src/lib/feedback/types.ts` |
| Private links and the signed cookie | `src/lib/feedback/access.ts` |
| Storage | `src/lib/feedback/store.ts` |
| Input checks | `src/lib/feedback/validate.ts` |
| Private link | `src/app/fb/[token]/route.ts` |
| API | `src/app/api/feedback/*` |
| Button and panel | `src/components/feedback/*` (mounted in `src/app/layout.tsx`) |
| Team board | `src/app/(feedback)/feedback/board/*` |
