# Deploy Command

Build and deploy the LoudFace website to Webflow Cloud.

## Instructions

1. **Run the build** to verify no errors:
   ```bash
   npm run build
   ```

2. **Check Webflow CLI authentication**:
   ```bash
   webflow auth status
   ```
   If not authenticated, run `webflow auth login`

3. **Deploy to Webflow Cloud**:
   ```bash
   webflow cloud deploy
   ```

4. **Verify deployment** by confirming:
   - Build completed successfully
   - No errors in deployment output
   - Report the deployment status to the user

For detailed deployment workflow with troubleshooting, reference the deploy skill at `.claude/skills/deploy/SKILL.md`.
