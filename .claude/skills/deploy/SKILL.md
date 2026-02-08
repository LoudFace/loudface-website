# Deploy to Vercel

Deploy the LoudFace Next.js website to Vercel via GitHub.

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
   - See CLAUDE.md "Static Image Paths" section

4. **Environment variables set on Vercel**
   - `WEBFLOW_SITE_API_TOKEN` — Webflow CMS API token
   - `WEBFLOW_SITE_ID` — Webflow site identifier
   - Set via Vercel Dashboard → Project → Settings → Environment Variables

5. **CMS API routes working**
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

Vercel is connected to the GitHub repository and automatically deploys when changes are pushed to `main`.

## Post-Deploy Verification

1. Check Vercel dashboard for build status (builds typically take under 1 minute)
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

```tsx
// Wrong
<img src="/images/icon.svg" />

// Correct
import { asset } from '@/lib/assets';
<img src={asset('/images/icon.svg')} />
```

### CMS Data Not Loading

- Verify environment variables are set on Vercel (Settings → Environment Variables)
- Verify collection IDs in CLAUDE.md
- Check API token permissions in Webflow dashboard
- Test API routes locally first

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

**Do NOT use `@config` directive** — it doesn't work with Tailwind v4 PostCSS plugin.

## Rollback

Vercel maintains deployment history. To rollback:
1. Go to Vercel Dashboard → Project → Deployments
2. Find the previous successful deployment
3. Click the three-dot menu → "Promote to Production"
