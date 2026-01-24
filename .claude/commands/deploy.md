# Deploy Command

Build and deploy the LoudFace Next.js website to Webflow Cloud.

## Instructions

1. **Run the build** to verify no errors:
   ```bash
   npm run build
   ```

2. **Commit changes** (if any uncommitted):
   ```bash
   git add .
   git commit -m "Your commit message"
   ```

3. **Push to GitHub** (triggers automatic deployment):
   ```bash
   git push origin main
   ```

4. **Verify deployment** by:
   - Waiting 2-5 minutes for Webflow Cloud to build
   - Checking the live site (www.loudface.co)
   - Verifying images load (no 404s in console)
   - Testing the Cal.com booking modal
   - Testing dynamic routes (`/work/[slug]`)

**Note:** Deployment is git-based. There is no `webflow cloud deploy` CLI command.

## Required Configuration Files

These files MUST exist for Webflow Cloud deployment:

| File | Purpose |
|------|---------|
| `webflow.json` | Framework detection (`{"cloud":{"framework":"nextjs"}}`) |
| `open-next.config.ts` | OpenNext Cloudflare adapter config |
| `wrangler.jsonc` | Cloudflare Workers config |
| `@opennextjs/cloudflare` | Must be in devDependencies |

## Troubleshooting

For detailed deployment workflow with troubleshooting, reference the deploy skill at `.claude/skills/deploy/SKILL.md`.
