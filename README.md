This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## Project Notes — aivisa

### Environment

Create a `.env.local`:

```bash
NEXT_PUBLIC_API_BASE=https://your-api.example.com
```

Environment is validated at runtime in `src/lib/env.ts`.

### Runtime config (dev/deploy)

We centralized backend/analytics base URLs in `src/config/runtime.ts` to avoid hard-coded `http://localhost:8080`:

- Variables:
	- `APP_ENV`: `dev` | `deploy` (optional). Defaults to `dev` when `NODE_ENV=development`, otherwise `deploy`.
	- `BACKEND_URL`: Base URL of your backend (e.g., `https://api.example.com`).
	- `ANALYTICS_PROXY_BASE`: Base URL for analytics proxy (defaults to `BACKEND_URL` if set, otherwise same dev fallback).

- Behavior:
	- In `dev` stage, if `BACKEND_URL`/`ANALYTICS_PROXY_BASE` are not set, they fall back to `http://localhost:8080`.
	- In `deploy` stage, callers will require these to be set explicitly (runtime error if missing when needed).

- Usage:
	- Server helpers import from `@/config/runtime`:
		- `runtimeConfig.backendBaseUrl` and `requireBackendBaseUrl()`
		- `runtimeConfig.analyticsBaseUrl` and `requireAnalyticsBaseUrl()`

- Dev proxy:
	- `next.config.ts` rewrites `/api/:path*` to `${BACKEND_URL || 'http://localhost:8080'}/api/:path*` only in development.

Examples:

`.env.local` (development)

```bash
# optional in dev — falls back to localhost:8080 when not set
APP_ENV=dev
BACKEND_URL=http://localhost:8080
# ANALYTICS_PROXY_BASE=http://localhost:8080  # optional; will default to BACKEND_URL

# client-only example from existing setup
NEXT_PUBLIC_API_BASE=http://localhost:3000
```

Deployment (e.g., `.env.production` or platform env vars)

```bash
APP_ENV=deploy
BACKEND_URL=https://api.example.com
ANALYTICS_PROXY_BASE=https://analytics.example.com
NEXT_PUBLIC_API_BASE=https://www.example.com
```

### Docker build & run

One-click container build and run using Next.js standalone output:

Optional: prepare envs for production
```bash
cp .env.example .env.production.local
# edit values inside
```

Build image (build-time will embed NEXT_PUBLIC_ vars into client bundle):
```bash
./scripts/docker-build.sh latest
```

Run container (runtime reads server envs from .env.production.local):
```bash
./scripts/docker-run.sh latest
```

### Push to AWS ECR

```bash
# login (script handles auto repository creation)
./scripts/ecr-push.sh ap-northeast-1 123456789012 aivisa-web v1
```

Then deploy on ECS/Fargate or your Kubernetes cluster, providing runtime env vars (BACKEND_URL, ANALYTICS_PROXY_BASE, NEXT_PUBLIC_API_BASE) via your task definition or secrets manager.

### Security headers

Security headers (CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy) are defined in `next.config.ts`. Adjust CSP to match external origins you use (analytics, CDN, etc.).

### Static visa catalog

Stable visa slugs and localized names live in `src/data/visaCatalog.ts`. Pages under `/[locale]/visa/[slug]` and `/[locale]/visa/[slug]/documents` are statically generated with `generateStaticParams`, `dynamicParams=false`, and ISR via `revalidate`.

### Tracking API (/api/track)

A minimal same-origin tracking API is implemented for dev/BFF usage:

- POST `/api/track/anon/ensure` -> `{ aid, createdAt, lastSeenAt }`
- POST `/api/track/device` -> `{ deviceId, aid, firstSeenAt, lastSeenAt }`
- POST `/api/track/session` -> `{ sessionId, aid, startedAt, isBot }`
- POST `/api/track/session/{id}/end` -> `{ sessionId, endedAt, duration }`

Client wrapper and hook:

- `src/lib/track/client.ts` exports `initTracking`, `ensureAnon`, `upsertDevice`, `startSession`, `endSession`
- `src/hooks/useTracking.ts` exposes a React hook; `src/components/analytics/TrackBootstrapClient.tsx` wires it in layout

Notes:

- Anonymous id `aid` is stored in `localStorage`
- `sendBeacon` is preferred for session end with fetch fallback
- Timestamps are ISO 8601 UTC (with Z); render as Asia/Tokyo as needed
- Implementation uses in-memory store (non-persistent)
