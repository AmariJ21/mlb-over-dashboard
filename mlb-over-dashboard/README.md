# MLB Over 5.5 — Signal Dashboard

Shows today's MLB games ranked by the probability of going over 5.5 runs, based on each team's recent scoring history.

**No API keys needed. No database. Completely free to run.**

---

## What it does

- Pulls today's MLB schedule from the free MLB Stats API
- Fetches each team's runs scored over their last 5 and 10 games
- Uses a Poisson model to estimate the probability of going over 5.5 combined runs
- Ranks games from highest to lowest opportunity
- Explains everything in plain English — no jargon

---

## Deploy in ~10 minutes (free)

### Step 1 — Push to GitHub

1. Create a new repo at [github.com/new](https://github.com/new)
   - Name it `mlb-over-dashboard`
   - Set to **Public**
   - Do NOT check "Add a README"
2. Open your terminal in this folder and run:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mlb-over-dashboard.git
git push -u origin main
```

### Step 2 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign up with your GitHub account (free)
2. Click **"Add New Project"**
3. Find and import your `mlb-over-dashboard` repo
4. Leave all settings as default — Vercel auto-detects Next.js
5. Click **Deploy**

You'll have a live URL in about 2 minutes. Every time you push to GitHub, Vercel automatically redeploys.

---

## Run locally

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000)

---

## Project structure

```
mlb-over-dashboard/
├── src/
│   └── app/
│       ├── api/
│       │   └── games/
│       │       └── route.js   ← fetches MLB data, runs the model
│       ├── page.js            ← the dashboard UI
│       ├── layout.js          ← page wrapper
│       └── globals.css        ← styles
├── package.json
├── next.config.js
└── README.md
```

---

## Roadmap

- **v1 (now):** Live MLB data, Poisson model, plain English UI
- **v2:** Kalshi odds integration — real edge calculation vs market
- **v3:** Historical backtesting, model accuracy tracking
- **v4:** XGBoost model with pitcher ERA, ballpark factors, weather

---

## Data sources

- **MLB Stats API** — `statsapi.mlb.com` — free, official, no key required
- **Kalshi API** — coming in v2
