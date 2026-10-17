# Deploying Talking Bobo to Cloudflare Pages with GitHub Auto Deploy

This repository is fully configured for automatic deployments on Cloudflare Pages via GitHub. Both the frontend static assets and the serverless backend API functions (`/api/*`) deploy seamlessly.

---

## Architecture Overview

- **Frontend**: Built using Vite (`npm run build`), producing optimized static assets in `/dist`.
- **Backend Edge APIs**: Handled natively by Cloudflare Pages Functions in `/functions/api/`:
  - `POST /api/token` — Generates single-use Gemini Live WebSocket audio tokens directly at the edge.
  - `GET /api/config` — Returns model, persona, and voice configuration.
  - `GET /api/guestbook` & `POST /api/guestbook` — Manages guestbook entries.
  - `POST /api/hit` & `GET /api/hits` — Visitor odometer counter.
- **Routing & Headers**: Configured via `public/_routes.json` and `public/_headers` (copied into `dist/` on build).

---

## Option 1: Cloudflare Native Git Integration (Recommended & Easiest)

With this method, Cloudflare Pages connects directly to your GitHub repository and deploys on every `git push`.

### Step 1: Push Code to GitHub
Ensure all your project code is committed and pushed to your GitHub repository:
```bash
git add .
git commit -m "Configure Cloudflare Pages deployment"
git push origin main
```

### Step 2: Create a Cloudflare Pages Project
1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. In the left navigation, go to **Workers & Pages** > **Create application** > **Pages** tab.
3. Click **Connect to Git** and select your GitHub account and the `talking-bobo` repository.

### Step 3: Configure Build Settings
Fill in the following build configuration:
- **Project name**: `talking-bobo`
- **Production branch**: `main` (or `master`)
- **Framework preset**: `Vite`
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/` (leave default)

### Step 4: Configure Environment Variables
Before clicking "Save and Deploy", expand **Environment variables**:
- **Variable name**: `GEMINI_API_KEY`
- **Value**: Your Google Gemini API Key from Google AI Studio.

*(Optional variables)*:
- `LIVE_MODEL`: `gemini-2.5-flash-native-audio-preview-09-2025` (default)
- `VOICE`: `Puck` (default)

### Step 5: Save and Deploy!
Click **Save and Deploy**. Cloudflare will build the site, compile your serverless edge functions, and provide you with a live `*.pages.dev` URL!

From this point forward, every `git push` to your `main` branch will automatically build and deploy within seconds.

---

## Option 2: Deploy via GitHub Actions

If you prefer building and deploying through GitHub Actions, a complete workflow file is already included at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

### Step 1: Add GitHub Repository Secrets
In your GitHub repository, navigate to **Settings** > **Secrets and variables** > **Actions** > **New repository secret**:
1. `CLOUDFLARE_API_TOKEN`: Create an API token in your Cloudflare Profile with `Cloudflare Pages: Edit` permissions.
2. `CLOUDFLARE_ACCOUNT_ID`: Find your Account ID in your Cloudflare dashboard URL or Workers/Pages overview page.

### Step 2: Push to GitHub
Whenever you push to `main` (or trigger the workflow manually in the GitHub Actions tab), GitHub Actions will:
1. Install dependencies (`npm install`).
2. Run Vite build (`npm run build`).
3. Deploy the build output and functions to Cloudflare Pages automatically.

---

## Optional: Enable Permanent KV Persistence for Guestbook & Hits

By default, the edge functions work out-of-the-box with graceful in-memory storage. To persist guestbook entries and the odometer visitor counter permanently across Cloudflare's edge:

1. In the Cloudflare Dashboard, go to **Workers & Pages** > **KV** > **Create a namespace**.
2. Name it `bobo-data`.
3. Go to your Pages project > **Settings** > **Functions** > **KV namespace bindings**.
4. Click **Add binding**:
   - **Variable name**: `BOBO_KV`
   - **KV namespace**: Select `bobo-data`.
5. Redeploy your project. The functions will automatically detect and use `BOBO_KV`!
