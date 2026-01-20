# Deploy Command

Build and deploy the LoudFace website to Webflow Cloud.

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
   - Waiting 1-2 minutes for Webflow to build
   - Checking the live site (www.loudface.co)
   - Verifying images load (no 404s in console)
   - Testing the Cal.com booking modal

**Note:** Deployment is git-based. There is no `webflow cloud deploy` CLI command.

For detailed deployment workflow with troubleshooting, reference the deploy skill at `.claude/skills/deploy/SKILL.md`.
