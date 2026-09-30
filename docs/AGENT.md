# YuvaLink — Master Rules for the coding agent

## Project
YuvaLink is a fully responsive website for managing members and daily attendance for a community group. Full requirements are in docs/SPEC.md. This file defines HOW you must work. If the two ever conflict, ask me.

## Current state of the repository (already done — do not redo)
- GitHub repo `yuvalink` with two folders: `backend/` and `frontend/`.
- CI in `.github/workflows/ci.yml` with two jobs named `backend` and `frontend`. NEVER rename these jobs or delete the workflow. The backend job runs `npm ci` and `npm test`; the frontend job runs `npm ci`, `npm run lint` and `npm run build`. Every change you make must keep CI green.
- backend: Node 22, CommonJS, Express 5, mongoose, dotenv. `server.js` exposes `GET /api/health` and connects to MongoDB using `MONGODB_URI` from `backend/.env`. npm scripts: start, test, db:indexes.
- frontend: Vite + React (JavaScript, not TypeScript) with ESLint, freshly scaffolded.
- MongoDB Atlas M0 database `yuvalink_dev` is connected. `.env` files are git-ignored and must NEVER be committed.

## Fixed technical decisions (do not change without asking me)
Backend: express, mongoose, dotenv, cors, helmet, compression, express-rate-limit, bcryptjs (not native bcrypt), jsonwebtoken, zod (validation), multer (memory storage), SheetJS.
Testing: Node built-in test runner (`node --test`) + supertest + mongodb-memory-server. Tests must NEVER connect to Atlas.
SheetJS: the copy on the npm registry is outdated and flagged for vulnerabilities. Install SheetJS from its official CDN tarball as described at docs.sheetjs.com (Node.js installation page), and keep the exact version pinned.
Frontend: react-router-dom, lucide-react, plain CSS with CSS variables (no UI framework), SheetJS (for Excel export), pdfmake (for PDF export, see the Gujarati rule below).
State: React Context + useReducer. Members are loaded ONCE after login and filtered/sorted/searched in memory.
Auth: password-only login. Backend returns a JWT (expires in 8 hours). The frontend keeps it in sessionStorage and sends `Authorization: Bearer <token>`. Do NOT use cross-site cookies (they break on iPhone Safari because the frontend and backend live on different domains). Add rate limiting on login (5 attempts per 15 minutes per IP).
API base URL: frontend reads `VITE_API_URL` (default http://localhost:5000). Backend CORS allows only `CORS_ORIGIN` (default http://localhost:5173).

## Time and language rules (important)
- The users are in India. All "today", "current date", birthday-window and attendance-date logic uses the timezone `Asia/Kolkata` (env `APP_TIMEZONE`), NEVER the server's UTC clock. Attendance dates are strings `YYYY-MM-DD`.
- Birth dates are stored as UTC midnight of the chosen calendar date and displayed without any timezone shift.
- Member names, addresses and other text may contain Gujarati or Hindi (Unicode). Everything must handle this: UI font must support Gujarati (use "Noto Sans", "Noto Sans Gujarati" then system fallbacks), search must work with Unicode, and Excel/PDF exports must render Gujarati correctly. For PDF, embed a Noto Sans Gujarati font and verify a real Gujarati sample renders properly; if complex letters render wrongly, switch to rendering the table to an image-based PDF and tell me.

## Quality rules for every phase
1. Fully responsive: phone (360px), tablet (768px), laptop (1366px). No horizontal page scroll. No text cut off. On phones, tables become stacked cards showing every field. Touch targets at least 44x44px. Body text at least 16px on phones. Modals fit the screen (scroll inside; full-screen on phones).
2. Every screen has loading, empty, error and success states. Never show a blank screen.
3. Validate on client AND server. Show clear inline messages.
4. Destructive actions need a confirmation modal. Member delete is a soft delete.
5. Cold start: Render's free tier sleeps. The frontend must ping /api/health on load, show a branded full-screen spinner with the message "Waking up the server, this can take up to a minute...", retry with backoff, and only then show the login page.
6. Accessibility: labels on inputs, visible focus, keyboard-accessible modals (Esc closes, focus trapped), sufficient contrast.
7. Security: never log passwords or tokens; never return passwordHash from any endpoint; sanitise input; use helmet; keep error messages generic for auth.
8. Code quality: small modules, clear names, comments only where the reason is not obvious, no dead code, no console.log left in production paths. Pure logic (filtering, sorting, age, birthday window, group validation, import parsing) lives in separate utility files and has unit tests.
9. Do not add libraries beyond the fixed list without asking me and explaining why.

## Workflow rules for every phase
1. Start on a fresh branch from an updated `main` (branch name is given in the phase prompt). NEVER commit to main. NEVER merge. NEVER force-push.
2. Begin by reading docs/SPEC.md, this file, and the existing code. Post a short plan (files to create or change) and then proceed.
3. Build in small steps; commit with conventional messages (feat:, fix:, test:, chore:).
4. Before finishing run: `npm test` in backend, and `npm run lint` and `npm run build` in frontend. Fix everything until all pass. Also start the app locally and test the main flows yourself (login, the new screens, phone width).
5. Keep `backend/.env.example` and `frontend/.env.example` up to date with every new variable (fake values only).
6. Update README.md with any new setup/run step.
7. At the end: push the branch, then STOP. Give me: (a) a summary of what was built, (b) what I must test manually and how, (c) any assumptions or open questions, (d) a suggested pull request title and description. Do not start the next phase.

## Things you must never do
- Never print, request, or commit secrets, .env files, tokens, or database passwords.
- Never connect tests or scripts to the production database.
- Never delete or weaken CI, tests, validation, or security middleware to make something pass.
- Never run destructive git commands (reset --hard on shared branches, force push, branch deletion of main).
