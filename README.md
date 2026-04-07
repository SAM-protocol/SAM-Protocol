# sam-protocol.org — static site

This folder contains the marketing and documentation landing page for SAM Protocol.

## Stack

- Single-file static HTML (`index.html`)
- Tailwind CSS via CDN (no build step)
- Inter + JetBrains Mono via Google Fonts
- Vercel-ready (`vercel.json` included)

## Local preview

```bash
cd site
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploying to Vercel

### Option A — Vercel + GitHub (recommended, 2 minutes)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Sign in with GitHub
3. **Import Git Repository** → select `SAM-protocol/SAM-Protocol`
4. In the project configuration:
   - **Root Directory** → `site`
   - **Framework Preset** → Other
   - **Build Command** → leave empty
   - **Output Directory** → leave empty
5. Click **Deploy**

Every push to `main` will trigger an automatic redeployment.

### Option B — Vercel CLI

```bash
npm i -g vercel
cd site
vercel --prod
```

## Custom domain

After deployment, in the Vercel project settings:

1. **Domains** → **Add**
2. Enter `sam-protocol.org` (or subdomain)
3. Follow Vercel's DNS instructions (A record or CNAME)

## Files

- `index.html` — the landing page
- `vercel.json` — Vercel config with security headers
- `robots.txt` — allow all crawlers
- `sitemap.xml` — single-page sitemap
