# Deploy to Webflow Cloud

Deploy the LoudFace Next.js website to Webflow Cloud hosting via GitHub.

## Pre-flight Checklist

Before deploying, verify:

1. **Build passes locally**
   ```bash
   npm run build
   ```

2. **No TypeScript errors**
   - Check console output for type errors

3. **Required Webflow Cloud files exist**
   - `webflow.json` - Framework detection
   - `open-next.config.ts` - OpenNext adapter config
   - `wrangler.jsonc` - Cloudflare Workers config
   - `@opennextjs/cloudflare` in devDependencies

4. **Static assets use `asset()` function**
   - All hardcoded image paths must use `asset('/images/...')`
   - See CLAUDE.md "Static Assets" section

5. **Environment variables**
   - Local: `.env` file with `WEBFLOW_SITE_API_TOKEN`
   - Production: Auto-injected by Webflow Cloud

6. **CMS API routes working**
   ```bash
   # Start dev server and test
   curl http://localhost:3005/api/cms/case-studies
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

1. Wait 2-5 minutes for Webflow to complete the build
2. Check Webflow Cloud dashboard for build status
3. Visit the live site (www.loudface.co)
4. Test CMS-driven pages load correctly
5. Check dynamic routes (`/work/[slug]`)
6. Verify images and assets load (check browser console for 404s)
7. Test Cal.com booking modal opens

## Troubleshooting

### Build Fails: "opennextjs-cloudflare: not found"

The OpenNext adapter is not installed:
```bash
npm install --save-dev @opennextjs/cloudflare
git add package.json package-lock.json
git commit -m "Add @opennextjs/cloudflare adapter"
git push
```

### Build Fails: "webflow.json not found"

Create the framework config file:
```json
// webflow.json
{
  "cloud": {
    "framework": "nextjs"
  }
}
```

### Build Stuck on Interactive Prompt

The `open-next.config.ts` file is missing. Create it:
```typescript
// open-next.config.ts
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({});
```

### Static Assets 404 in Production

If images show locally but 404 in production:

1. Check if the image path uses `asset()` function
2. Verify the file exists in `public/images/`
3. For JSON content images, apply `asset()` at render time

```tsx
// Wrong
<img src="/images/icon.svg" />

// Correct
import { asset } from '@/lib/assets';
<img src={asset('/images/icon.svg')} />
```

### CMS Data Not Loading

- Verify collection IDs in CLAUDE.md
- Check API token permissions in Webflow dashboard
- Test API routes locally first
- Check Webflow Cloud environment variables are set

### Styles Not Working (White/Invisible Text)

Tailwind v4 custom theme may not be loading. Ensure `globals.css` has:

```css
@import "tailwindcss";

@theme {
  --color-primary-500: #6366f1;
  --color-surface-900: #22302e;
  /* ... all custom colors ... */
}
```

**Do NOT use `@config` directive** - it doesn't work with Tailwind v4 PostCSS plugin.

## Rollback

Webflow Cloud maintains deployment history. To rollback:
1. Go to Webflow Dashboard → Site → Webflow Cloud
2. Select previous deployment
3. Click "Restore"

## Required Configuration Files

These files MUST exist for Webflow Cloud deployment:

| File | Content |
|------|---------|
| `webflow.json` | `{"cloud":{"framework":"nextjs"}}` |
| `open-next.config.ts` | OpenNext Cloudflare config |
| `wrangler.jsonc` | Cloudflare Workers config |
| `next.config.ts` | Conditional basePath for production |
