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

**Routing** — React Router DOM 7. Routes are declared in `src/App.tsx`; `BrowserRouter` lives in `src/main.tsx`. Current routes: `/` (Main), `/login`, `/signup`, `/settings`.

**State** — Zustand store at `src/services/useAuthStore.ts` holds auth state (`user`, `profile`, `isAuthenticated`, `isLoading`) with `setUser`, `clearUser`, `finishLoading`, `setProfile`, `clearProfile` actions. `profile` is the `UserProfile` from the User Service (display name, avatar, settings, etc.).

**API layer** — Two Axios clients:
- `src/services/api.ts` → Auth Service at `https://auth.savuliak.com/api/v1`. All auth calls (login, register, logout, refresh, me, Google OAuth) live in `src/services/authService.ts`. Local dev: `http://localhost:8080/api/v1`.
- `src/services/userApi.ts` → User Service at `https://users.savuliak.com/api/v1/users`. Profile calls (`GET /me`, `PATCH /me`) live in `src/services/userService.ts`. Local dev: `http://localhost:8081/api/v1/users`.

Both clients use `withCredentials: true` — the shared `token` cookie from the Auth Service authenticates both.

**Layout** — `src/App.tsx` uses a `SidebarProvider`/`SidebarInset` shell. `AppSidebar` reads auth state to conditionally show login/logout controls. Breadcrumb is route-aware. The main content area renders the route outlet.

**Path alias** — `@/*` maps to `src/*` (configured in both `vite.config.ts` and `tsconfig.app.json`).

## Deployment

Multi-stage Docker build (Node 18 → Nginx alpine) served via `nginx.conf`. GitHub Actions (`.github/workflows/deploy.yml`) triggers on pushes to `main`, rsync-copies files to a DigitalOcean droplet, and runs `docker compose up -d --build` remotely.
