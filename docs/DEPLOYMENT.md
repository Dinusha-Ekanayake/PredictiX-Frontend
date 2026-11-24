# Frontend deployment on Vercel

The frontend is a Next.js 16 app hosted on Vercel. It talks to the PredictiX API on the EC2 instance; see the backend repository's `docs/EC2_Deployment.md`.

## Release flow

| Branch | What Vercel does |
|---|---|
| `master` | Production deployment (`predicti-x-frontend.vercel.app`) |
| `dev`, feature branches, pull requests | Preview deployment with its own URL |

Changes reach `master` only through a pull request from `dev`, after the **CI** workflow passes:
- lint and type check;
- unit tests;
- production build;
- Playwright end-to-end tests;
- `npm audit`.

Vercel builds independently of CI, so CI is the merge gate and Vercel is the delivery step.

## Project settings

| Setting | Value |
|---|---|
| Framework preset | Next.js |
| Root directory | repository root |
| Install command | default (`npm ci`; the lockfile is authoritative) |
| Build command | default (`next build`) |
| Node.js version | 22.x (from `engines` in `package.json`, matching CI) |
| Production branch | `master` |

## Environment variables

Set these under **Project Settings → Environment Variables**, for both Production and Preview. All of them are inlined at build time, so **redeploy after changing any of them**.

| Variable | Required | Production value |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | yes | `https://13.232.200.154.sslip.io` |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | The Supabase project URL, used only to allow its storage host for uploaded images |
| `NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS` | no | `true` during the demo phase, `false` afterwards |
| `NEXT_PUBLIC_WS_URL` | no | Leave unset: it defaults to the API URL with `https` → `wss` |
| `NEXT_PUBLIC_CHATBOT_URL` | no | Leave unset: the chatbot is served by the API |

The build checks its configuration (`next.config.ts`). A Vercel build fails if `NEXT_PUBLIC_API_URL` is missing or malformed, or if it is not `https` in production. Browsers block calls from an HTTPS page to an HTTP API, so a misconfigured deployment fails loudly at build time instead of quietly breaking in users' browsers.

The frontend holds no Supabase key. Every read, write and upload goes through the API (backend ADR-0008). If an older `NEXT_PUBLIC_SUPABASE_ANON_KEY` is still set in the Vercel project, delete it.

Never add a service-role key or any other secret under a `NEXT_PUBLIC_` name. Those values are readable by anyone who opens the site.

## Backend settings the frontend depends on

- **CORS.** The API allows the production and preview Vercel domains by default. Add any other domain, such as a custom one, to `ALLOWED_ORIGINS` in the backend `.env` and restart the service.
- **Realtime notifications.** These use a WebSocket to `/ws/notifications/...`. The backend's nginx site (`deploy/nginx/predictix.conf`) forwards the upgrade; without it the notification bell stays empty.

## Security headers

`next.config.ts` sends `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` and HSTS on every response. It also sends a Content-Security-Policy in **report-only** mode, with `connect-src` limited to the API (HTTPS and WebSocket). Once the browser console shows no CSP reports across the app, switch the header to the enforcing `Content-Security-Policy`.

## Verify a deployment

1. Open the deployment and sign in with a demo account.
2. Open the dashboard. Data loads, and the network tab shows calls to the API host over HTTPS with no CORS errors.
3. Trigger a notification (for example, assign a ticket). The bell updates without a reload, and the WebSocket shows `101 Switching Protocols`.
4. Export an asset report as a PDF.

## Rollback

In **Deployments**, open the last good production deployment and choose **Promote to Production** (Instant Rollback). Then revert the faulty commit on `master` through a pull request, so the next build does not reintroduce it.
