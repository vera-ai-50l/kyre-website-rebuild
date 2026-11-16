# Kyre — teardown gallery (trykyre.com)

Public proof asset: 3 AI-infra screens rebuilt (LangSmith, OpenAI Platform, Replicate), each with an Original ↔ Rebuilt toggle + Loading/Empty/Error states.

## Routes
- `/` — gallery landing
- `/teardowns/langsmith` · `/teardowns/openai` · `/teardowns/replicate`

## Run locally
```
npm install
npm run dev
```

## Deploy (pick one)
- **Vercel**: `npx vercel` in this folder → then point trykyre.com at it.
- **Any static host** (Netlify drop, Cloudflare Pages, plain nginx): `npm run build`, then upload the `out/` folder. It's a full static export — no server needed.

## Notes
- "Original" panes are faithful HTML recreations of each tool's UI (built for a fair, pixel-aligned comparison — the real dashboards are behind login).
- All data is realistic fake data. No API keys, no backend.
- Design tokens live in `app/globals.css` (`--color-accent` etc.).
