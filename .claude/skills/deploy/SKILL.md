# Deploy to Webflow Cloud

Deploy the LoudFace website to Webflow Cloud hosting via GitHub.

## Pre-flight Checklist

Before deploying, verify:

1. **Build passes locally**
   ```bash
   npm run build
   ```

2. **No TypeScript errors**
   - Check console output for type errors

3. **Static assets use `asset()` function**
   - All hardcoded image paths must use `asset('/images/...')`
   - See CLAUDE.md "Static Assets" section

4. **Environment variables**
   - Local: `.env` file with `WEBFLOW_SITE_API_TOKEN`
   - Production: Auto-injected by Webflow Cloud

5. **CMS API routes working**
   ```bash
   # Start dev server and test
   curl http://localhost:4321/api/cms/case-studies
   ```

## Deploy Steps

### 1. Build the project
```bash
npm run build
```

### 2. Commit your changes
```bash
git add .
git commit -m "Your descriptive commit message"
```

### 3. Push to GitHub (triggers automatic deployment)
```bash
git push origin main
```

Webflow Cloud is connected to the GitHub repository and automatically deploys when changes are pushed to `main`.

**Note:** There is no `webflow cloud deploy` CLI command. Deployment is git-based only.

## Post-Deploy Verification

1. Wait 1-2 minutes for Webflow to complete the build
2. Visit the live site (www.loudface.co)
3. Test CMS-driven pages load correctly
4. Check dynamic routes (`/work/[slug]`)
5. Verify images and assets load (check browser console for 404s)
6. Test Cal.com booking modal opens

## Troubleshooting

### Static Assets 404 in Production

If images show locally but 404 in production:

1. Check if the image path uses `asset()` function
2. Verify the file exists in `public/images/`
3. For JSON content images, apply `asset()` at render time

```astro
<!-- Wrong -->
<img src="/images/icon.svg" />

<!-- Correct -->
<img src={asset('/images/icon.svg')} />
```

### CMS Data Not Loading

- Verify collection IDs in CLAUDE.md
- Check API token permissions in Webflow dashboard
- Test API routes locally first
- Check Webflow Cloud environment variables are set

### Build Failures

- Check `astro.config.mjs` for correct adapter
- Verify `output: 'server'` is set
- Check Cloudflare adapter is installed
- Run `npm run build` locally to see errors

## Rollback

Webflow Cloud maintains deployment history. To rollback:
1. Go to Webflow Dashboard → Site → Hosting
2. Select previous deployment
3. Click "Restore"
