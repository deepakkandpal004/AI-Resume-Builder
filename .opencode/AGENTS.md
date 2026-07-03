# Project Context

## Tech Stack
- **Frontend**: React 19.1.1, Vite 7.x, Tailwind CSS, Redux Toolkit, React Router
- **Backend**: Express, MongoDB (Mongoose), JWT auth
- **AI**: Groq (LLaMA 3.3 70B) via OpenAI SDK, ImageKit for image transforms
- **Deploy**: Vercel (auto-deploys from `main` branch)

## Project Structure
- `/client` — React app (Vite)
- `/server` — Express API

## Common Commands
- Dev server: `cd client && npm run dev`
- Tests: `npx vitest run` (from `client/`)
- Lint: `npx eslint src/` (from `client/`)
- Deploy: `npx vercel --prod` (from root) — or just `git push origin main` triggers auto-deploy

## Features Built
1. **AI Bullet Rewriter** — `POST /api/ai/rewrite-bullets` rewrites experience bullets with action verbs, quantifiable results. UI button in ExperienceForm.
2. **Version History / Rollback** — Auto-saves resume snapshot before every manual save (cap 20). `VersionHistoryPanel` modal to browse/restore. Routes: `GET /api/resumes/versions/:resumeId`, `POST /api/resumes/restore/:resumeId/:versionId`.

## Known Fixes
- `useCallback` + async functions → caused TDZ error in Vite production bundle. Reverted to plain async functions.
- Photo effect was stored but never applied to template images. Fixed by calling `applyPhotoEffect()` in `MinimalImageTemplate.jsx`.
- Page format was hardcoded to `"letter"` in Preview.jsx. Fixed to use `styleOptions.pageSize`.
- On-screen preview didn't reflect page size. Fixed by setting dynamic width (794px A4 / 816px Letter).

## Common Issues
- `installHook.js ReferenceError: Cannot access 'w' before initialization` → browser extension (React DevTools) + React 19 incompatibility. Disable/update extension.
