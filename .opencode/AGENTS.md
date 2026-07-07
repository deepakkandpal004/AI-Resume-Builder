# Project Context

## Tech Stack
- **Frontend**: React 19.1.1, Vite 7.x, Tailwind CSS v4, Redux Toolkit, React Router v7
- **Backend**: Express 5, MongoDB (Mongoose), JWT auth, Groq AI (Llama 3.3 70B)
- **Payments**: Razorpay
- **Image**: ImageKit.io
- **Deploy**: Vercel (client), Render (server) — auto-deploys from `main` branch

## Project Structure
- `/client` — React app (Vite 7)
- `/server` — Express API (ES modules)

## Home Page Sections (as of July 2026)
`Banner → Navbar → Hero → StatsBar → Features → TemplateShowcase → AIFeatures → HowItWorks → Testimonials → Pricing → FAQ → CTA → Footer`

### Components
| Component | Description |
|-----------|-------------|
| `Hero.jsx` | Animated gradient bg, floating resume mockup (ModernTemplate rendered with dummy data), CTA |
| `StatsBar.jsx` | Animated counters (7 Templates, 95% ATS, 1000+ Resumes, 100% Free) via IntersectionObserver |
| `Features.jsx` | 6 cards with inline SVG illustrations (no Tailwind fill classes — uses direct `fill` + `stroke` hex values) |
| `TemplateShowcase.jsx` | Mini live-renders of 6 templates using actual template components scaled down |
| `AIFeatures.jsx` | 4 AI tool cards (ATS, Cover Letter, Interview, Tailor) |
| `Testimonials.jsx` | 3 testimonial cards with star ratings |
| `Pricing.jsx` | Free vs ₹299 Premium side-by-side comparison |
| `FAQ.jsx` | Accordion with 6 questions |
| `CallToAction.jsx` | Enhanced gradient card with glassmorphism badge |
| `Footer.jsx` | Social links (GitHub, Twitter, LinkedIn, Email) |
| `useScrollReveal.js` | Custom IntersectionObserver hook for scroll-triggered reveal animations |
| `Title.jsx` | Reusable section heading component |

## Design Notes
- SVG illustrations in Features must use direct hex values (`fill="#818cf8"`), NOT Tailwind classes or JS variables — Tailwind v4 doesn't reliably process fill classes on SVG elements
- `aspect-[3/2]` works in Tailwind v4 for container aspect ratios
- Scroll reveal uses `reveal`/`visible` CSS classes with `transitionDelay` for staggered animations
- Animation classes in `index.css`: `.reveal`, `@keyframes float`, `@keyframes gradient-shift`, `.animate-float`

## Common Commands
- Dev server (client): `cd client && npm run dev`
- Dev server (server): `cd server && npm run server`
- Tests: `npx vitest run` (from `client/` or `server/`)
- Lint: `npm run lint` (from `client/`)
- Build: `npm run build` (from `client/`)

## Features Built
1. **AI Bullet Rewriter** — `POST /api/ai/rewrite-bullets` rewrites experience bullets with action verbs, quantifiable results. UI button in ExperienceForm.
2. **Version History / Rollback** — Auto-saves resume snapshot before every manual save (cap 20). `VersionHistoryPanel` modal to browse/restore. Routes: `GET /api/resumes/versions/:resumeId`, `POST /api/resumes/restore/:resumeId/:versionId`.
3. **Home Page Redesign (Jul 2026)** — Complete revamp with 11 sections, scroll-reveal animations, live template previews, animated counters, SVG illustrations, pricing table, FAQ accordion, testimonials.

## Known Fixes
- `useCallback` + async functions → caused TDZ error in Vite production bundle. Reverted to plain async functions.
- Photo effect was stored but never applied to template images. Fixed by calling `applyPhotoEffect()` in `MinimalImageTemplate.jsx`.
- Page format was hardcoded to `"letter"` in Preview.jsx. Fixed to use `styleOptions.pageSize`.
- On-screen preview didn't reflect page size. Fixed by setting dynamic width (794px A4 / 816px Letter).
- SVG fill classes in Tailwind v4 don't work reliably — always use inline `fill="#hex"` attributes on SVG elements.

## Common Issues
- `installHook.js ReferenceError: Cannot access 'w' before initialization` → browser extension (React DevTools) + React 19 incompatibility. Disable/update extension.
