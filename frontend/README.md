# LeetCode Portal — React Frontend

UI for `kapilraghav.info/leetcode`.

## Stack
- React 18 + Vite
- React Router v6
- Recharts (progress charts)
- DM Mono + Syne fonts (Google Fonts)
- Zero external UI libraries — all custom components

## Design
Dark terminal aesthetic. Black background, electric green accents, monospace type.

## Pages

| Route | Page | Auth |
|-------|------|------|
| `/leetcode` | Landing — "Are you Kapil?" gate | Public |
| `/leetcode/login` | Admin login | Public |
| `/leetcode/dashboard` | Public progress dashboard | Public |
| `/leetcode/admin` | Admin panel — full CRUD | Admin only |

## Local Setup

```bash
cd leetcode-ui
npm install

# Copy env and set if needed
cp .env.example .env.local
# For local dev, the Vite proxy forwards /api → localhost:8000
# No VITE_API_URL needed locally

npm run dev
# → http://localhost:5173/leetcode
```

Backend must be running on port 8000 for the proxy to work.

## Deploy to Vercel

1. Push to GitHub
2. Import the `leetcode-ui` directory in Vercel
3. Add env var: `VITE_API_URL=https://your-api.onrender.com/api/v1`
4. Deploy — `vercel.json` handles SPA routing

## File Structure

```
src/
  App.jsx                   # Routes + AuthProvider wrapper
  main.jsx                  # Entry point
  index.css                 # Global tokens (CSS variables), resets
  context/
    AuthContext.jsx         # JWT state, login/logout
  lib/
    api.js                  # All API calls (typed, token-aware)
  pages/
    Landing.jsx             # Gate page — two button choice
    Login.jsx               # Admin login form
    Dashboard.jsx           # Public stats homepage
    Admin.jsx               # Full admin CRUD panel
  components/
    ui/index.jsx            # Shared: badges, cards, progress bars, spinner
```

## Key features

- **Landing**: animated grid background, glitch characters, "Are you Kapil?" / "Just browsing" split
- **Login**: clean form, JWT stored in localStorage, auto-redirect if already authed
- **Dashboard**: radial completion chart, difficulty breakdown, per-topic progress bars, top companies
- **Admin panel**:
  - Create/edit/delete topics with sort order
  - Add questions with difficulty, LeetCode URL, company tags, notes, solved flag
  - Company tag editor — type + Enter to add, click × to remove
  - Solutions: write your own solution (with language, complexity), OR fetch web solutions (YouTube + GitHub via scraper)
  - All changes reflect instantly (optimistic local state)
