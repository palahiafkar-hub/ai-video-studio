# AI Video Studio V9 — deployment starter

V9 is a deploy-ready starter package. It is **not yet deployed to a public URL**. Hosting account creation, deployment, and secret configuration require the user's action.

## Included
- `index.html`: mobile-friendly app UI, project storage in browser, draft/template mode, AI generation and scene-revision calls.
- `server.js`: Node 20 server serving the web app and proxying AI requests through server-side environment secrets.
- `render.yaml`: Blueprint config for Render (Node web service).
- `Dockerfile`: container build starter.
- `manifest.json`, `sw.js`, `icon.svg`: PWA support files.
- `.env.example`: placeholder environment config; do not use real keys in this file or commit secrets.

## Deploy to Render (beginner-friendly)
1. Create a GitHub repository and upload the contents of this package (not the ZIP file itself). Keep `.env.example`, but **never commit real API keys**.
2. In Render, choose **New → Blueprint** and connect the repository. Render reads `render.yaml` and creates a web service.
3. In the service's Environment settings, add `OPENAI_API_KEY` (your secret key) and `OPENAI_MODEL` (a model identifier available to your API account). Save and redeploy.
4. Open the generated Render URL, then visit `/api/health`. It should show `ok: true`; `aiConfigured: true` indicates both env vars are present (it does not expose them).
5. Open the web app using HTTPS. On supported Android browsers, use menu → **Add to Home screen** / **Install app**.

## Run locally
Use Node 20 or newer. Set environment variables in your terminal or use Node's env-file option:
`node --env-file=.env server.js`
Then open `http://localhost:3000`. Copy `.env.example` to `.env` and replace placeholders only on your local machine. Keep `.env` private.

## Endpoints
- `GET /api/health`: status and whether API configuration exists; no secret values are returned.
- `POST /api/generate`, `POST /api/revise`: accepts `{ "prompt": "..." }`, forwards to OpenAI Responses API.

## Security/limitations
- Basic in-memory rate limit: 10 calls/minute/IP. For production use, add auth, shared persistent rate limiter, quotas, billing/abuse controls, and logging/monitoring.
- Project storage remains in each user's browser (localStorage); it is not synced across devices or backed up on the server.
- AI API usage is charged separately from ChatGPT subscription. Google Flow is a separate tool; V9 prepares prompts and workflow but does not call Flow's video-generation service directly.
- The included service worker may cache app shell resources. Do not cache private API responses or secrets.
- Free hosting may sleep, have limited resources, or change availability. Check the host's current pricing/limits before selecting a plan.
