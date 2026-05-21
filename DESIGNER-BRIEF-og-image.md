# Designer Brief — /partners Open Graph image (optional)

This is an **optional upgrade.** A code-rendered OG image already ships with the rewrite (`src/app/(site)/partners/opengraph-image.tsx`, generated via `next/og`). It works, it just doesn't have the typographic polish of a designed asset. Use this brief only if we want a designer-rendered PNG.

## Spec

- **Dimensions:** 1200 × 630 px (LinkedIn + Twitter/X standard, also fine for OG general)
- **Format:** PNG, sRGB
- **Filename:** `opengraph-image.png`
- **Destination path:** `src/app/(site)/partners/opengraph-image.png` (Next.js picks this up automatically — delete or rename the existing `opengraph-image.tsx` when swapping in the PNG)
- **Weight target:** <200 KB (LinkedIn caps preview rendering for large images)

## Content

- **Headline (required):** `10% lifetime commission`
- **Subhead (required):** `Refer one B2B SaaS client. Earn for as long as they stay.`
- **Brand mark:** LoudFace wordmark or logo, top-left or bottom-left corner
- **URL line (optional but recommended):** `loudface.co/partners` in the corner

## Visual direction

- **Background:** Dark, matches site theme. The current code-rendered version uses `linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)` — close to the hero of `/partners`. Designer is free to use a different dark treatment as long as it reads on LinkedIn's white card chrome.
- **Headline color:** White
- **Subhead color:** Primary brand purple (around `#a78bfa` / `#c4b5fd`) — needs to pop against the dark background but not compete with the headline
- **Type hierarchy:** Headline ~88px, subhead ~32px (rough — match the rest of LoudFace marketing collateral). Tight tracking on the headline.
- **No stock photography.** Type + brand mark only. The current root OG (`src/app/opengraph-image.tsx`) is the visual reference for tone — keep it in the same family.

## Accessibility / contrast

- Headline contrast against background must clear WCAG AA Large Text (3:1). White on `#0a0a0a` is well over.
- Don't put critical content within 60px of any edge — LinkedIn crops slightly on some surfaces.

## QA after handoff

1. Save final PNG as `opengraph-image.png` at the path above.
2. Delete `opengraph-image.tsx` from the same folder (or rename to `.bak`).
3. Push, deploy.
4. Run https://www.linkedin.com/post-inspector/ on `https://www.loudface.co/partners` to flush LinkedIn's cache.
5. Also check Twitter/X card preview at https://cards-dev.twitter.com/validator if we still publish there.

## If you skip this

The code-rendered fallback (`opengraph-image.tsx`) ships fine. It looks utilitarian — same family as the root OG image — but it's not on-brand-polished. Replace it any time without breaking anything.
