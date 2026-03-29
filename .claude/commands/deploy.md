# Deploy Command

Build and deploy the LoudFace Next.js website to Vercel.

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
   - Checking the Vercel dashboard for build status
   - Checking the live site (www.loudface.co)
   - Verifying images load (no 404s in console)
   - Testing the Cal.com booking modal
   - Testing dynamic routes (`/work/[slug]`)

## Environment Variables

CMS env vars must be set on Vercel (Settings → Environment Variables):

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project identifier |
| `NEXT_PUBLIC_SANITY_DATASET` | Sanity dataset name |
| `SANITY_API_TOKEN` | Sanity API token |

## Troubleshooting

For detailed deployment workflow with troubleshooting, reference the deploy skill at `.claude/skills/deploy/SKILL.md`.
