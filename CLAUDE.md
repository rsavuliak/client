# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server
npm run build     # TypeScript check + Vite production build
npm run lint      # ESLint
npm run preview   # Preview production build locally
```

No test suite is configured.

## Architecture

React 19 SPA with TypeScript, built with Vite and styled using Tailwind CSS 4 + shadcn/ui (new-york style, slate base color).

**Routing** — React Router DOM 7. Routes are declared in `src/App.tsx`; `BrowserRouter` lives in `src/main.tsx`. Current routes: `/` (Main), `/login`, `/signup`.

**State** — Zustand store at `src/services/useAuthStore.ts` holds auth state (`user`, `isAuthenticated`, `isLoading`) with `setUser`, `clearUser`, `finishLoading` actions.

**API layer** — Axios client configured in `src/services/api.ts` pointing to `https://auth.savuliak.com/api/v1` with `withCredentials: true`. All auth calls (login, register, logout, refresh, me, Google OAuth) live in `src/services/authService.ts`. To develop against a local backend, swap the base URL to the commented-out `http://localhost:8080/api/v1`.

**Layout** — `src/App.tsx` uses a `SidebarProvider`/`SidebarInset` shell. `AppSidebar` reads auth state to conditionally show login/logout controls. The main content area renders the route outlet.

**Path alias** — `@/*` maps to `src/*` (configured in both `vite.config.ts` and `tsconfig.app.json`).

## Deployment

Multi-stage Docker build (Node 18 → Nginx alpine) served via `nginx.conf`. GitHub Actions (`.github/workflows/deploy.yml`) triggers on pushes to `main`, rsync-copies files to a DigitalOcean droplet, and runs `docker compose up -d --build` remotely.
