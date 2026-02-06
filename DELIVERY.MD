# DELIVERY.MD — Client & WordPress Integrator Handoff

This document is the single source of truth for delivery. It freezes the backend/frontend contract and flags what must be finalized before handoff.

---

## 1. System Overview

**Pilates Video App** is a full-stack application that provides authenticated access to a catalog of Pilates exercises (metadata, images, video URLs) sourced from a Google Sheet. Users log in with email/password; role-based access (admin, mat, machine, combined) controls which exercises they see. Admins can sync data from Google Sheets and manage users.

- **Backend (this repo):** Express API on Node.js; MongoDB for users and exercises; JWT auth; Google Sheets API (read-only) for sync. Serves only JSON (and one CSV download). No HTML rendering. No WordPress logic.
- **Frontend (this repo):** React SPA (Vite). Login, exercise feed, video player, admin user management, sync and restore. Consumes the backend API. Assumes it is served from the same origin as the API (or a configured base path) so that `/api` is same-origin or CORS is configured.
- **WordPress (outside this repo):** Hosting and routing only. Expected to serve the built SPA under a path (e.g. `/pilates-app`) and to proxy `/api` to this backend, or to point a subdomain at this stack. No shared auth, no WordPress plugins, no PHP in this deliverable.

---

## 2. Production URLs

| Item | Current / Required value | Notes |
|------|---------------------------|--------|
| **API base URL** | Same origin as frontend, path: `/api` | e.g. `https://example.com/api` or `http://IP/api`. Frontend must be built with `VITE_API_URL=/api` so requests are same-origin. |
| **Frontend base path** | `/` (standalone) or e.g. `/pilates-app/` (under WordPress) | Not set in code today; see §6. **Flag:** Base path for WordPress embedding is undefined in [client/vite.config.ts](client/vite.config.ts) and [client/src/main.tsx](client/src/main.tsx). |
| **Same-origin / CORS** | Same-origin recommended | Backend uses `cors()` with no options (allows any origin). For production, same-origin (Nginx proxy of `/api`) avoids CORS. |

**Flag (hardcoded / missing):**

- [client/src/lib/api.ts](client/src/lib/api.ts) line 2: `VITE_API_URL` defaults to `http://localhost:3000/api` at **build time**. If not set, production builds will call localhost and fail. Must set `VITE_API_URL=/api` (or full same-origin API URL) when building for production.

---

## 3. Backend API Contract (CRITICAL)

All endpoints are under the **API base** (e.g. `/api`). Request/response encoding is UTF-8. Error messages in responses are currently in Hebrew.

### Root (no prefix)

| Method | Path | Description | Auth | Request | Response | Errors |
|--------|------|-------------|------|---------|----------|--------|
| GET | `/` | Welcome | No | — | `{ "message": "Welcome to the Pilates Video App API" }` | — |
| GET | `/health` | Liveness | No | — | `{ "status": "ok", "timestamp": "<ISO>" }` | — |

**Note:** When Nginx proxies `location /api/` to the Node app, the Node app receives paths **with** the `/api` prefix. Express mounts auth at `/api/auth` and exercises at `/api/exercises`, so external URL `GET /api/health` is **not** defined (Node has no `/api/health`). External health check should use a path the proxy maps to Node’s `/health`, or a dedicated Nginx location. **Flag:** See §12.

### Auth — prefix `/api/auth`

| Method | Path | Description | Auth | Request | Response | Errors |
|--------|------|-------------|------|---------|----------|--------|
| POST | `/api/auth/login` | Login | No | `{ "email": string, "password": string }` | `{ "token": string, "user": { "id": string, "email": string, "role": string } }` | 400 missing fields; 401 wrong credentials; 500 config |
| GET | `/api/auth/me` | Current user | Yes | — | `{ "id": string, "email": string, "role": string }` | 401 no/invalid token; 404 user not found; 500 |
| GET | `/api/auth/users` | List users (admin) | Admin | — | Array of `{ "id", "email", "role" }` | 401; 403 non-admin; 500 |
| POST | `/api/auth/users` | Create user (admin) | Admin | `{ "email": string, "password": string, "role"?: "admin" \| "mat" \| "machine" \| "combined" }` | 201 `{ "message": string, "user": { "id", "email", "role" } }` | 400 validation/duplicate; 401; 403; 500 |
| DELETE | `/api/auth/users/:id` | Delete user (admin) | Admin | — | 200 `{ "message": string }` | 400 delete self; 401; 403; 404; 500 |

### Exercises — prefix `/api/exercises`

| Method | Path | Description | Auth | Request | Response | Errors |
|--------|------|-------------|------|---------|----------|--------|
| GET | `/api/exercises` | List exercises (role-filtered) | Yes | — | Array of Exercise objects (see schema below) | 401; 500 |
| GET | `/api/exercises/:id` | Single exercise | Yes | — | Exercise object | 401; 403 role; 404; 500 |
| POST | `/api/exercises/sync` | Sync from Google Sheet (admin) | Admin | — | `{ "message": string, "count": number }` | 401; 403; 500 |
| GET | `/api/exercises/restore` | Download CSV of all exercises (admin) | Admin | — | **Body: CSV file** (Content-Type: text/csv) | 401; 403; 404 no data; 500 |

**Exercise object shape (API):**  
`_id`, `Name`, and optionally: `Page`, `Machine_setup`, `Exercise_move`, `Function_target_muscles`, `Strengthen`, `Stretch`, `Cues`, `Modifications`, `Contraindications`, `Peel_backs`, `Repetitions`, `Level`, `Image_URL`, `Video_URL`, `Machine_type`, `Series`, `order`, plus timestamps. All optional fields may be omitted or null.

**Missing / needs finalization (§12):**

- Error response shape is not normalized (sometimes `{ "message": string }`, no shared code or schema).
- Health endpoint not exposed under `/api` when proxying; integrator must define how to health-check.

---

## 4. Authentication Model

| Aspect | Implementation |
|--------|-----------------|
| **Auth type** | JWT (Bearer token) |
| **Token source** | Issued on `POST /api/auth/login` in response body `token`. |
| **Storage (frontend)** | `localStorage`: keys `token` and `user` (JSON string of `{ id, email, role }`). [client/src/lib/api.ts](client/src/lib/api.ts), [client/src/contexts/AuthContext.tsx](client/src/contexts/AuthContext.tsx). |
| **Token lifetime** | Configurable via `JWT_EXPIRES_IN`; default `7d`. [server/src/config/env.ts](server/src/config/env.ts). |
| **Refresh** | **None.** No refresh endpoint; user must log in again when token expires. **Flag:** See §12. |
| **Sent on requests** | Header: `Authorization: Bearer <token>`. |

Auth is fully implemented for login, protected routes, and admin checks. No session store; stateless JWT only.

---

## 5. Frontend Integration Contract

- **Embedding in WordPress:** **Not implemented in code.** Expected options: (1) WordPress serves the built SPA under a path (e.g. `/pilates-app`) with Nginx or Apache routing that path to the built static files, or (2) iframe to the deployed SPA URL. No script mount or WordPress-specific hook is in this repo.
- **DOM element:** React mounts into `#root` ([client/index.html](client/index.html) line 16). If embedded in WordPress, the page must provide a div with `id="root"` (or the build’s `index.html` is served as-is under a path).
- **Routing:** Browser history (`BrowserRouter`). [client/src/main.tsx](client/src/main.tsx). For subpath embedding, `basename` must be set (e.g. `/pilates-app`) and base path in Vite must match; **currently not set** → **Flag:** §12.
- **Refresh:** SPA handles in-app navigation. Full page refresh reloads the SPA; auth state is from localStorage (token persists until expiry or logout).
- **WordPress globals:** No reliance on WordPress or window globals in the frontend code.

---

## 6. Frontend Configuration Surface

| Value | How set | Requires rebuild? | Notes |
|-------|---------|--------------------|--------|
| **API base URL** | `VITE_API_URL` at build time | **Yes** | Default `http://localhost:3000/api`. Must be `/api` (or full same-origin URL) for production. |
| **Public keys / feature flags** | None in code | — | — |

**Flag:** No runtime config (e.g. single JS config file or env injected by server). API base is compile-time only. Missing config abstraction for base path when embedding under WordPress.

---

## 7. Environment Variables

| Variable | Where used | Required (production) | Default |
|----------|------------|------------------------|---------|
| `PORT` | Backend | No | `3000` |
| `NODE_ENV` | Backend | No | `development` |
| `MONGODB_URI` | Backend | Yes | — |
| `JWT_SECRET` | Backend | Yes | — |
| `JWT_EXPIRES_IN` | Backend | No | `7d` |
| `GOOGLE_SERVICE_ACCOUNT_PATH` | Backend | Yes | — |
| `GOOGLE_SHEET_ID` | Backend | Yes | — |
| `VITE_API_URL` | Frontend (build) | Yes for prod build | `http://localhost:3000/api` |
| `ADMIN_EMAIL` | Backend (create-admin script) | No | `admin@example.com` |
| `ADMIN_PASSWORD` | Backend (create-admin script) | No | `admin123` |

**Flags:**

- **Missing `.env.example`:** No `server/.env.example` in repo. Integrator has no checklist of required backend vars.
- **Secrets:** No secrets should be hardcoded; all above are from env. Service account JSON is a file path on the server, not in repo.
- Unused variables: none identified.

---

## 8. Data & Persistence

- **Database:** MongoDB. Single database (name from `MONGODB_URI`; e.g. `pilates`).
- **Collections:**
  - **users** — from model [server/src/models/User.ts](server/src/models/User.ts). Fields: `email`, `password` (hashed), `role`, timestamps. Index: unique on `email` (schema).
  - **exercises** — from model [server/src/models/Exercise.ts](server/src/models/Exercise.ts). Fields: see Exercise schema; `Name` required, rest optional. No explicit index on `Machine_type` or `order` in code.
- **Ownership:** Backend owns all writes. Google Sheet is read-only source for sync; no write-back.
- **Backup:** Not implemented in this repo. Assumed to be responsibility of the deployment/hosting.

**Flags:**

- No explicit MongoDB indexes beyond unique email. Queries by `Machine_type` and `order` could benefit from indexes for scale.
- Exercise schema allows optional fields; validation is minimal (Name required). Risky if Sheet columns change without backend update.

---

## 9. Security & Exposure

| Item | Status |
|------|--------|
| **Publicly exposed ports** | Determined by deployment. Backend listens on `PORT` (e.g. 3000); Nginx typically proxies and does not expose 3000. |
| **Auth-less endpoints** | `GET /`, `GET /health`, `POST /api/auth/login`. All others require JWT; admin-only routes enforce role. |
| **File upload** | None. Restore is a generated CSV download. |
| **Rate limiting** | **Not implemented.** No rate-limit middleware in [server/src/index.ts](server/src/index.ts) or routes. **Flag:** §12. |
| **CORS** | `cors()` with no options (all origins). Acceptable when frontend is same-origin; consider restricting in production if API is on different domain. |

---

## 10. Operational Ownership Boundary

- **Backend (this repo):** Express app, MongoDB connection, auth, Google Sheets sync, exercise and user APIs. Deploy, run, and maintain the Node process and its env (including service account file path). Not responsible: WordPress, PHP, hosting of WordPress content, DNS, SSL (can be Nginx/load balancer).
- **Frontend (this repo):** Build the SPA; provide static assets (and, if needed, base path / basename for WordPress path). Not responsible: WordPress theme, plugins, or how WordPress serves the SPA (path vs iframe).
- **Explicit exclusions:** WordPress core, themes, plugins, hosting provider’s panel, DNS, backup strategy for MongoDB, content of the Google Sheet (content ownership is client’s).

---

## 11. Known Limitations

- **Browser support:** Not documented. App uses modern React and fetch; no explicit support matrix.
- **Performance:** No pagination on `GET /api/exercises`; full list returned. May not scale to very large catalogs.
- **Scaling:** Single Node process; no clustering or horizontal scaling in repo. MongoDB and Google API are external limits.
- **i18n:** Error and UI strings are Hebrew; no locale switching.
- **Health when proxied:** `GET /health` exists on Node at root; with `/api` proxy only, there is no external `/api/health` route. See §3 and §12.

---

## 12. Missing / Needs Finalization (MOST IMPORTANT)

Actionable gaps to resolve before handoff:

1. **Health check path when using `/api` proxy**  
   - **File(s):** Nginx (or proxy) config; [server/src/index.ts](server/src/index.ts) (health at `/health`).  
   - **Impact:** Integrator cannot call `GET /api/health`; Node has no route for `/api/health`. Either add `GET /api/health` on Express that returns same body as `/health`, or document a separate proxy rule for `GET /health` so health is reachable externally.

2. **Frontend base path for WordPress subpath**  
   - **File(s):** [client/vite.config.ts](client/vite.config.ts) (no `base`), [client/src/main.tsx](client/src/main.tsx) (no `basename` on `BrowserRouter`).  
   - **Impact:** If the SPA is served at e.g. `yoursite.com/pilates-app`, assets and client-side routes will 404 unless `base: '/pilates-app/'` and `<BrowserRouter basename="/pilates-app">` are set and the app is rebuilt.

3. **VITE_API_URL must be set at build time**  
   - **File(s):** [client/src/lib/api.ts](client/src/lib/api.ts) line 2.  
   - **Impact:** Default is localhost; production build without `VITE_API_URL=/api` (or full URL) will call wrong origin. Document in deployment and for integrator.

4. **No `.env.example` for server**  
   - **File(s):** Repo has no `server/.env.example`.  
   - **Impact:** Integrator and ops lack a checklist of required env vars. Add a file listing all variables from §7.

5. **No rate limiting**  
   - **File(s):** [server/src/index.ts](server/src/index.ts).  
   - **Impact:** API is open to brute-force and abuse. Consider adding rate limiting (e.g. on `/api/auth/login`) before handoff or document as accepted risk.

6. **Error response shape not normalized**  
   - **File(s):** All route handlers in [server/src/routes/auth.ts](server/src/routes/auth.ts), [server/src/routes/exercises.ts](server/src/routes/exercises.ts).  
   - **Impact:** Clients can rely only on `message` for errors; no shared `code` or `status` field. Acceptable but should be explicit in contract (§3).

7. **No token refresh**  
   - **File(s):** [server/src/routes/auth.ts](server/src/routes/auth.ts), [client/src/lib/api.ts](client/src/lib/api.ts).  
   - **Impact:** When JWT expires (default 7d), user must log in again. Document as current behavior; add refresh only if required.

8. **Restore endpoint returns blob, not JSON**  
   - **File(s):** [server/src/routes/exercises.ts](server/src/routes/exercises.ts) (restore), [client/src/lib/api.ts](client/src/lib/api.ts) (`restoreSpreadsheet` returns `Blob`).  
   - **Impact:** Documented in §3; no change needed, but ensure integrator does not expect JSON from `/api/exercises/restore`.

---

## Rules

- This file is factual. Where something is unclear, it is marked **undefined** or **Flag**.
- No endpoints or behavior are invented; all are taken from the codebase.
- This file is intended to be sufficient for legal/technical handoff.

## End State

When this file is agreed and the items in §12 are either resolved or explicitly accepted as-is, the system is considered **delivery-complete**.
