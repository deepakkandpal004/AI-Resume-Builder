# Resume Builder

A full-stack resume builder with AI-powered writing assistance, ATS scoring, cover letter generation, and interview prep. Built with React, Node.js, and Groq AI.

![Resume Builder](https://img.shields.io/badge/stack-MERN-blue) ![License](https://img.shields.io/badge/license-ISC-green) ![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)

---

## What it does

- Build a resume from scratch or import an existing PDF — the AI parses it into structured data automatically
- Live preview updates as you type, with 7 templates and full color/font/spacing customization
- **ATS Score Checker** — paste a job description, get a compatibility score with matched/missing keywords and improvement suggestions ranked by score impact
- **Resume Tailor** — rewrites your summary, experience, and skills to match a specific JD
- **Cover Letter Generator** — generates a tailored cover letter in formal, conversational, or enthusiastic tone
- **Interview Prep** — generates 10 role-specific questions with suggested answers across Behavioural, Technical, Situational, and Role-Specific categories
- Profile photo upload with background removal, face-crop, and live photo effect preview
- Auto-save with 2.5s debounce, resume completeness score, and clean PDF export

---

## Tech stack

**Frontend**
- React 19, Vite 7
- Redux Toolkit (auth, ATS, cover letter, interview state)
- Tailwind CSS v4
- React Router v7
- `@dnd-kit` for drag-to-reorder sections
- `html2pdf.js` for PDF export
- `react-pdftotext` for PDF import

**Backend**
- Node.js + Express 5
- MongoDB + Mongoose
- JWT authentication
- Multer for file handling
- Groq AI (llama-3.3-70b-versatile) via OpenAI-compatible SDK
- ImageKit for image CDN, transforms, and background removal

---

## Project structure

```
Resume Builder/
├── client/                   # React frontend
│   ├── src/
│   │   ├── app/features/     # Redux slices (auth, ats, coverLetter, interview)
│   │   ├── assets/templates/ # Resume template components
│   │   ├── components/       # Forms, panels, UI components
│   │   ├── hooks/            # useImageUpload, useTheme
│   │   ├── pages/            # Dashboard, ResumeBuilder, Preview, Home
│   │   └── utils/            # imagekit.js, completeness.js, templateHelpers.js
│   └── public/
└── server/                   # Express backend
    ├── config/               # DB, AI, ImageKit, Multer setup
    ├── controllers/          # Route handlers
    ├── middlewares/          # Auth, rate limiters
    ├── models/               # Mongoose schemas
    ├── routes/               # API route definitions
    └── services/             # ATS scoring logic
```

---

## Getting started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- [Groq API key](https://console.groq.com) — free tier available
- [ImageKit account](https://imagekit.io) — free tier available

### 1. Clone the repo

```bash
git clone https://github.com/deepakkandpal004/Resume-Builder-SaaS.git
cd "Resume-Builder-SaaS"
```

### 2. Server setup

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

GROQ_API_KEY=your_groq_api_key
GROQ_BASE_URL=https://api.groq.com/openai/v1
GROQ_MODEL=llama-3.3-70b-versatile

IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
```

```bash
npm run server
```

### 3. Client setup

```bash
cd client
npm install
```

Create `client/.env.local`:

```env
VITE_BASE_URL=http://localhost:3000
VITE_IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
VITE_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
```

```bash
npm run dev
```

Open `http://localhost:5173`

---

## Environment variables reference

| Variable | Where | Description |
|---|---|---|
| `MONGODB_URI` | server | MongoDB connection string |
| `JWT_SECRET` | server | Secret for signing JWT tokens |
| `GROQ_API_KEY` | server | Groq API key for AI features |
| `GROQ_MODEL` | server | Model name (default: `llama-3.3-70b-versatile`) |
| `IMAGEKIT_PUBLIC_KEY` | server + client | ImageKit public key |
| `IMAGEKIT_PRIVATE_KEY` | server only | ImageKit private key — never expose to client |
| `IMAGEKIT_URL_ENDPOINT` | server + client | Your ImageKit URL endpoint |
| `VITE_BASE_URL` | client | Backend API base URL |

---

## API overview

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/users/register` | Register a new user |
| `POST` | `/api/users/login` | Login, returns JWT |
| `GET` | `/api/users/resumes` | List all resumes for current user |
| `POST` | `/api/resumes/create` | Create a new resume |
| `PUT` | `/api/resumes/update` | Update resume data |
| `DELETE` | `/api/resumes/delete/:id` | Delete a resume |
| `GET` | `/api/resumes/public/:id` | Get a public resume (no auth) |
| `GET` | `/api/imagekit/auth` | Get ImageKit upload auth token |
| `POST` | `/api/ai/upload-resume` | Parse a PDF resume with AI |
| `POST` | `/api/ai/enhance-pro-sum` | AI-enhance professional summary |
| `POST` | `/api/ai/enhance-job-desc` | AI-enhance job description bullet |
| `POST` | `/api/ai/tailor-resume` | Tailor resume to a job description |
| `POST` | `/api/ai/ats-score` | Run ATS scan (1/day free tier) |
| `GET` | `/api/ai/ats-score/:resumeId` | Get ATS scan history |
| `POST` | `/api/ai/generate-cover-letter` | Generate cover letter (3/day free tier) |
| `GET` | `/api/ai/cover-letter/:resumeId` | Get cover letter history |
| `DELETE` | `/api/ai/cover-letter/:id` | Delete a cover letter |
| `POST` | `/api/ai/interview-questions` | Generate interview Q&A (3/day free tier) |
| `GET` | `/api/ai/interview-questions/:resumeId` | Get saved interview question sets |

---

## Free tier limits

| Feature | Free tier |
|---|---|
| ATS scans | 1 per day |
| Cover letters | 3 per day |
| Interview prep sets | 3 per day |
| Resume tailoring | Unlimited |
| AI enhancements | Unlimited |

---

## Running tests

```bash
# Server tests
cd server && npm test

# Client tests
cd client && npm test
```

---

## Deployment

The project is configured for deployment with:
- **Client** → any static host (Vercel, Netlify, GitHub Pages)
- **Server** → any Node.js host (Render, Railway, Fly.io)

A GitHub Actions workflow is included at `.github/workflows/deploy.yml`.

Set `VITE_BASE_URL` in your client environment to your deployed server URL before building.

```bash
cd client && npm run build   # outputs to client/dist/
```

---

## License

ISC — see [LICENSE](LICENSE) for details.
