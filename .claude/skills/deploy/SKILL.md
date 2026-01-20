# Deploy to Webflow Cloud

Deploy the LoudFace website to Webflow Cloud hosting.

## Pre-flight Checklist

Before deploying, verify:

1. **Build passes locally**
   ```bash
   npm run build
   ```

2. **No TypeScript errors**
   - Check console output for type errors

3. **Environment variables**
   - Local: `.env` file with `WEBFLOW_SITE_API_TOKEN`
   - Production: Auto-injected by Webflow Cloud

4. **CMS API routes working**
   ```bash
   # Start dev server and test
   curl http://localhost:4321/api/cms/case-studies
   ```

## Deploy Steps

### 1. Build the project
```bash
npm run build
```

### 2. Check authentication
```bash
webflow auth status
```

If not authenticated:
```bash
webflow auth login
```

### 3. Deploy to Webflow Cloud
```bash
webflow cloud deploy
```

For verbose output (debugging):
```bash
webflow cloud deploy --verbose
```

## Post-Deploy Verification

1. Visit the live site
2. Test CMS-driven pages load correctly
3. Check dynamic routes (`/work/[slug]`)
4. Verify images and assets load

## Troubleshooting

### Authentication Issues
```bash
webflow auth logout
webflow auth login
```

### Build Failures
- Check `astro.config.mjs` for correct adapter
- Verify `output: 'server'` is set
- Check Cloudflare adapter is installed

### CMS Data Not Loading
- Verify collection IDs in CLAUDE.md
- Check API token permissions in Webflow dashboard
- Test API routes locally first

## Rollback

Webflow Cloud maintains deployment history. To rollback:
1. Go to Webflow Dashboard → Site → Hosting
2. Select previous deployment
3. Click "Restore"
