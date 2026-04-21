---
description: Generate inline visuals (illustrations + charts) for a blog post and attach them to a Sanity draft.
allowed-tools: Bash, Read
argument-hint: <slug> [--reference <url-or-path>]
---

Run the visuals pipeline end-to-end for the blog post. Arguments are in `$ARGUMENTS`.

If no slug is provided, ask the user for one first.

Steps:

1. Confirm the slug with the user and show them what will happen (plan → generate images via fal.ai → upload + draft). Note cost: ~$0.15/image for hero/diagram templates, cheaper for spot.
2. If no `--reference` flag was passed, ask whether they want to provide a reference image URL or local path to lock visual style across all illustrations. Without one, styles will drift between shots.
3. Run `npm run visuals:generate -- $ARGUMENTS`.
4. Stream the output to the user.
5. When done, show them:
   - The path to the shot list preview (`.visuals-cache/<slug>/plan.md`) so they can sanity-check the plan.
   - A reminder to review the draft in Sanity Studio at `/studio` before publishing.
6. If anything fails, surface the error clearly and suggest the relevant `--skip-*` flag to resume from where it died:
   - Planner failed → nothing to skip, fix the error and retry
   - Illustration worker failed → after fixing, re-run with `--skip-plan` to reuse the plan
   - Compose failed → re-run with `--skip-plan --skip-illustrate` (images are cached)
