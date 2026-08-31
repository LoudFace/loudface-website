# Design Decisions

<!-- Lazy-loaded — loaded only when a task requires prior rationale or decision reference.
     Append-only log. Never delete entries; mark superseded ones with a note.
     Format: ### YYYY-MM-DD — {title} followed by **Status**: accepted | rejected | tried -->

### 2026-01-01 — Example decision entry

**Status**: accepted

We chose X over Y because Z. The key constraint was [constraint]. Alternatives considered:
- Option A — rejected because [reason]
- Option B — tried but caused [issue]

### 2026-08-01 — LOOP A hero: 52px uniform H1 instead of --text-display (92px)

**Status**: accepted

Fixing the "two sizes inside one H1" defect on the LOOP A editorial-sidebar concept (artboard 1AF-0). The review brief allowed either a uniform 52px or pushing to --text-display (92px) for more scale conviction against the Ditto/usvc references.

Chose uniform 52px because the headline copy ("Your website converts. / Your organic traffic compounds.") is long-form (23 + 32 characters) and the left column's content width is fixed at 536px by the existing two-column hero grid. At 92px the second line alone measures ~900px+ — 2× the available width — which would force an ugly multi-line break well past what "wrapping naturally" can absorb, or require widening the left column enough to shrink the card marquee below a usable size. At 52px the line wraps cleanly to "Your organic traffic" / "compounds." (both same size, same weight), which resolves the flagged defect without destabilizing the bento grid on the right.

Options considered:
- --text-display (92px) as written in the concept's own aspirational note — rejected: overflows the 536px column by roughly 2x with this copy length; would need a copy rewrite (out of scope for a style-fix pass) or a grid restructure (regresses the card marquee this concept's caliber note calls "the one genuinely on-brand move").
- Widening the left column to fit 92px — rejected: shrinks Right Bento below the width needed for the 240/240/280 three-card layout, reopening the "sliver" and "gutter" defects this same pass just fixed.
- Uniform 52px with natural wrap — accepted: zero layout risk, directly fixes the cited defect, keeps the card marquee intact.

Follow-up: a real push to display scale is still the right long-term caliber move, but it wants a headline copy pass (shorter line breaks, ~10-12 characters/line) done together with a grid rebalance — flagging as a separate task rather than bundling into this fix pass.

<!-- Add new decisions above this comment, newest first. -->
