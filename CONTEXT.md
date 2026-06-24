# AI Resume Builder — Product Context

> Single source of truth for the product. Update this file whenever a feature is added, changed, or removed.
> Use it as context when planning new features and for onboarding.

---

## Live URL

https://ai-resume-builder-client-be0f.onrender.com

## Repository

https://github.com/deepakkandpal004/AI-Resume-Builder  
Active branch: `feature/resume-customization`

---

## Architecture Overview

```
Resume Builder/
├── client/          # React SPA (Vite) — frontend
└── server/          # Express REST API — backend
```

Separate apps, deployed independently. Client communicates with server via Axios. Base URL configured via `VITE_BASE_URL` env var.

---

## Tech Stack

### Frontend (`client/`)

| Layer | Technology | Version |
|---|---|---|
| Framework | React | 19.1 |
| Build tool | Vite | 7.x |
| Styling | Tailwind CSS v4 (no `tailwind.config.js`, uses `@theme` in CSS) | 4.1 |
| State management | Redux Toolkit + React-Redux | 2.x / 9.x |
| Routing | React Router DOM | 7.x |
| HTTP client | Axios (base instance at `client/src/configs/api.js`, uses `VITE_BASE_URL`) | 1.x |
| Drag and drop | @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities | 6.x / 10.x / 3.x |
| Icons | Lucide React | 0.546 |
| Notifications | React Hot Toast | 2.x |
| PDF parsing (client-side) | react-pdftotext | 1.x |
| Google Fonts | Inter, Poppins, Merriweather, Playfair Display, Lato, Raleway, Source Serif 4, Nunito Sans, EB Garamond, IBM Plex Serif | — |

### Backend (`server/`)

| Layer | Technology | Version |
|---|---|---|
| Runtime | Node.js with ESM (`"type": "module"`) | — |
| Framework | Express | 5.x |
| Database | MongoDB via Mongoose | 8.x |
| Auth | JWT (`jsonwebtoken`) + bcrypt | 9.x / 6.x |
| File uploads | Multer (disk storage, temp files) | 2.x |
| Image hosting | ImageKit.io (`@imagekit/nodejs`) | 7.x |
| AI | Groq API via OpenAI-compatible SDK (`openai` package, `baseURL = GROQ_BASE_URL`) | 6.x |
| Dev server | Nodemon | 3.x |
| Config | dotenv (`import "dotenv/config"` in server.js) | 17.x |
| CORS | cors | 2.x |

> **Important:** The AI integration uses **Groq** (not OpenAI directly). The `openai` npm package is used as the HTTP client because Groq exposes an OpenAI-compatible API. The model is configured via `GROQ_MODEL` env var.

### Design tokens (Tailwind v4 `@theme` in `index.css`)

- **Brand:** Indigo (`brand-50` → `brand-900`)
- **Accent:** Teal (`accent-50` → `accent-700`)
- **Semantic neutrals:** `ink`, `body`, `muted`, `line`, `canvas`, `surface` (all override-able in `.dark`)
- **Font vars:** `--font-sans` = Inter · `--font-display` = Poppins · `--font-resume` = Inter
- **Dark mode:** class-based (`.dark` on `<html>`), applied before paint via inline `<script>` in `index.html`

---

## Folder Structure

### Client (`client/src/`)

```
App.jsx                          # Root: defines all routes
index.css                        # Global styles, Tailwind @theme tokens, font scoping
main.jsx                         # React DOM entry point

app/
  store.js                       # Redux store (auth slice only)
  features/authSlice.js          # Auth state: { token, user, loading }
                                 # Persists token + user to localStorage

configs/
  api.js                         # Axios instance with baseURL = VITE_BASE_URL

hooks/
  useTheme.js                    # Dark/light theme toggle (localStorage)

pages/
  Home.jsx                       # Landing/marketing page
  Layout.jsx                     # App shell wrapper for protected routes (/app/*)
  Login.jsx                      # Login + Register page
  Dashboard.jsx                  # Resume list, create, upload PDF, edit title, delete
  ResumeBuilder.jsx              # Main builder — owns ALL resume state as useState
  Preview.jsx                    # Public resume view at /view/:resumeId

components/
  Navbar.jsx                     # App top navbar (shows in Layout)
  Logo.jsx
  Loader.jsx
  ThemeToggle.jsx                # Dark/light toggle button

  TemplateSelector.jsx           # Dropdown/selector for 4 templates
  ColorPicker.jsx                # Accent color hex picker
  ResumePreview.jsx              # Receives { data, template, accentColor, styleOptions }
                                 # Renders the active template inside #resume-preview div

  PersonalInfoForm.jsx           # Personal info fields + image upload + bg removal toggle
  ProfessionalSummary.jsx        # Summary textarea + "AI Enhance" button (POST /api/ai/enhance-pro-sum)
  ExperienceForm.jsx             # Multi-entry experience form + "Enhance with AI" per entry
                                 # (POST /api/ai/enhance-job-desc)
  EducationForm.jsx
  ProjectForm.jsx
  SkillsForm.jsx
  SectionManager.jsx             # Rename built-in headings + add/remove custom sections
                                 # Exports DEFAULT_SECTION_HEADINGS constant
  StylesPanel.jsx                # Font family, font size, line spacing,
                                 # heading bold/italic, content bold/italic,
                                 # drag-and-drop section order (@dnd-kit)

  templates/
    ClassicTemplate.jsx          # Single-column, centered header, accent headings
    ModernTemplate.jsx           # Single-column, colored header band, badge skills,
                                 # Education+Skills side-by-side grid
    MinimalTemplate.jsx          # Single-column, minimal typography, uppercase labels
    MinimalImageTemplate.jsx     # Two-column (sidebar: Contact/Education/Skills |
                                 # main: Summary/Experience/Projects), flex header with image

  Home/
    Hero.jsx · Banner.jsx · Features.jsx
    HowItWorks.jsx · CallToAction.jsx
    Footer.jsx · HomeNavbar.jsx · Title.jsx

utils/
  templateHelpers.js             # Shared helpers for all templates (see section below)
```

### Server (`server/`)

```
server.js                        # Entry: loads dotenv, creates Express app, mounts routes
                                 # Uses top-level await for connectDB()

config/
  db.js                          # Mongoose connect to MONGODB_URI/resume-builder
  ai.js                          # Lazy getter: returns OpenAI-compatible client
                                 # pointed at GROQ_BASE_URL with GROQ_API_KEY
                                 # timeout: 25s, maxRetries: 0
  imageKit.js                    # Lazy getter: returns ImageKit client
  multer.js                      # Multer with diskStorage({}) — temp files, no dest

models/
  User.js                        # { name, email, password (hashed), timestamps }
                                 # Instance method: comparePassword(plain) → boolean
  resume.js                      # Full resume schema (see Data Model section)

controllers/
  userController.js              # registerUser, loginUser, getUserId, getUserResumes
  resumeController.js            # createResume, getResumeById, updateResume,
                                 # deleteResume, getPublicResumeById
  aiController.js                # enhanceProfessionalSummary, enhanceJobDescription,
                                 # uploadResume (PDF text → Groq → structured JSON → new Resume)

middlewares/
  authMiddleware.js              # protect: verifies JWT Bearer token, sets req.userId

routes/
  userRoute.js                   # /api/users/*
  resumeRoute.js                 # /api/resumes/*
  aiRoutes.js                    # /api/ai/*
```

---

## Data Model — Resume (`server/models/resume.js`)

```js
{
  userId:               ObjectId (ref: "User"),
  title:                String    (default: "untitled resume"),
  public:               Boolean   (default: false),
  template:             String    (default: "classic"),
                        // "classic" | "modern" | "minimal" | "minimal-image"
  accent_color:         String    (default: "#3B82F6"),  // always stored with #

  professional_summary: String    (default: ""),
  skills:               [String]  (default: []),

  personal_info: {
    image:      String  // ImageKit URL or ""
    full_name:  String
    profession: String
    email:      String
    phone:      String
    location:   String
    linkedin:   String
    website:    String
  },

  experience: [{
    company, position, start_date (YYYY-MM), end_date (YYYY-MM),
    description, is_current (Boolean)
  }],

  project: [{
    name, type, description
  }],

  education: [{
    institution, degree, field, graduation_date (YYYY-MM), gpa
  }],

  // ── Customization fields (added in resume-customization feature) ──

  section_headings: Mixed   // { summary: "About Me", experience: "Work History", ... }
                            // keys not present → template uses DEFAULT_SECTION_HEADINGS

  custom_sections: [{
    id:      String (required, crypto.randomUUID())
    heading: String (default "")
    content: String (default "")
  }],

  style_options: {
    fontFamily:    String   // stored key: "inter"|"georgia"|"merriweather"|"courier"
                            // |"playfair"|"lato"|"raleway"|"sourceserif"
                            // |"nunitosans"|"garamond"|"ibmplexserif"
    fontSize:      Number   // 11–16 (px, base font size on container)
    lineSpacing:   Number   // 1.2 | 1.5 | 1.8
    sectionOrder:  [String] // ordered array of section keys + custom section IDs
    headingBold:   Boolean  // default: true
    headingItalic: Boolean  // default: false
    contentBold:   Boolean  // default: false
    contentItalic: Boolean  // default: false
  }
}
// Schema options: { timestamps: true, minimize: false }
// minimize: false ensures empty objects {} and arrays [] are saved to MongoDB
```

---

## API Routes

### Users — `/api/users`

| Method | Path | Auth | Controller | Description |
|---|---|---|---|---|
| POST | `/register` | No | `registerUser` | Create account, returns token + user |
| POST | `/login` | No | `loginUser` | Login, returns token + user |
| GET | `/data` | Yes | `getUserId` | Get current user (used on app boot) |
| GET | `/resumes` | Yes | `getUserResumes` | Get all resumes for logged-in user |

### Resumes — `/api/resumes`

| Method | Path | Auth | Middleware | Controller | Description |
|---|---|---|---|---|---|
| POST | `/create` | Yes | — | `createResume` | Create blank resume with title |
| GET | `/get/:resumeId` | Yes | — | `getResumeById` | Get resume (owner only), validates ObjectId |
| PUT | `/update` | Yes | `upload.single('image')` → `protect` | `updateResume` | Full resume update (multipart/form-data). Fields: resumeId, resumeData (JSON string), optional image file, removeBackground flag |
| DELETE | `/delete/:resumeId` | Yes | — | `deleteResume` | Delete resume |
| GET | `/public/:resumeId` | No | — | `getPublicResumeById` | Fetch public resume for /view/:id page |

> Note: `upload` middleware runs **before** `protect` on the update route so Multer parses the multipart body before JWT auth reads `req.body`.

### AI — `/api/ai`

| Method | Path | Auth | Controller | Description |
|---|---|---|---|---|
| POST | `/enhance-pro-sum` | Yes | `enhanceProfessionalSummary` | Enhance professional summary text via Groq. Body: `{ userContent }` |
| POST | `/enhance-job-desc` | Yes | `enhanceJobDescription` | Enhance job description text via Groq. Body: `{ userContent }` |
| POST | `/upload-resume` | Yes | `uploadResume` | Parse PDF text → Groq → structured JSON → creates new Resume doc. Body: `{ title, resumeText }` |

---

## State Management (Client)

### Redux store — `auth` slice

```js
{ token, user, loading }
```

- Initialized from `localStorage` on startup (`token` + serialized `user`)
- `login(payload)` sets state + writes to localStorage
- `logout()` clears state + localStorage
- On app boot, `App.jsx` calls `GET /api/users/data` to re-validate token and hydrate `user`

### ResumeBuilder local state

`ResumeBuilder.jsx` owns **all resume state** as a single `resumeData` object in `useState`. The shape mirrors the MongoDB schema exactly. All form components are fully controlled — they receive their slice as props and call `onChange` to update parent state. The full object is serialized as `resumeData` JSON and sent to `PUT /api/resumes/update` on save (inside `FormData` as multipart).

---

## Implemented Features

### 1. Authentication
- Register / Login with name, email, password
- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens, 7-day expiry
- Token + user persisted in `localStorage`
- `protect` middleware: reads `Authorization: Bearer <token>` header, verifies JWT, sets `req.userId`

### 2. Resume Dashboard
- Grid view of all user resumes with accent color strip, title, last-updated date
- **Create Resume** — modal with title input → `POST /api/resumes/create` → navigate to builder
- **Upload Existing Resume (PDF)** — modal: select PDF → `react-pdftotext` extracts text client-side → `POST /api/ai/upload-resume` → Groq parses into structured JSON → new Resume created → navigate to builder
- **Edit title** — inline pencil icon on hover → modal
- **Delete** — confirm dialog → `DELETE /api/resumes/delete/:id`
- Accent color for cards uses `resume.accent_color` with fallback rotation

### 3. Resume Builder (`/app/builder/:resumeId`)
Sidebar has **8 tabs** (section navigation):

| Tab | Component | Purpose |
|---|---|---|
| Personal Info | `PersonalInfoForm` | Name, profession, contact details, profile photo |
| Summary | `ProfessionalSummary` | Freeform text + AI Enhance button |
| Experience | `ExperienceForm` | Multi-entry, each with AI Enhance button |
| Education | `EducationForm` | Multi-entry |
| Projects | `ProjectForm` | Multi-entry |
| Skills | `SkillsForm` | Tag/list input |
| Sections | `SectionManager` | Rename headings + custom sections |
| Styles | `StylesPanel` | Font, size, spacing, bold/italic, section order |

- Progress bar reflecting active tab position
- Previous / Next navigation
- Template selector + color picker in toolbar
- **Save Changes** → `PUT /api/resumes/update` (multipart: `resumeData` JSON + optional image)
- **Download** → `window.print()` with `@page { size: letter; margin: 0 }` CSS
- **Public/Private toggle** → `PUT /api/resumes/update` with `{ public: bool }`
- **Share** → Web Share API (shows when `resume.public === true`)
- Real-time preview in right panel

### 4. Profile Image Upload
- Uploaded via `multipart/form-data` to server
- Stored on **ImageKit.io** in `user-resumes/` folder
- Face-focused crop transform: `tr=c-maintain_ratio,fo-face,w-300,h-300`
- Optional **background removal** via ImageKit `remove-bg` extension (`e-bgremove` transform appended)
- On upload failure, existing image is preserved

### 5. Template System (4 templates)

| Key | Component | Layout |
|---|---|---|
| `classic` | ClassicTemplate | Single column, centered header with accent underline, uppercase section headings in accent color, left border on experience/project entries |
| `modern` | ModernTemplate | Single column, full-width accent header band, pill-style skill badges, Education+Skills conditionally in 2-column grid (single column if only one has data) |
| `minimal` | MinimalTemplate | Single column, very clean, uppercase spaced section labels, font-light body |
| `minimal-image` | MinimalImageTemplate | Flex header (image + name), two-column body: sidebar (Contact, Education, Skills) + main (Summary, Experience, Projects, custom sections) |

All templates:
- Accept `{ data, accentColor, styleOptions }` props — no local state
- Apply `getContainerStyle(styleOptions)` on outermost `div` (font-family, font-size, line-height)
- Apply `getHeadingStyle(styleOptions)` on section heading elements (font-weight, font-style)
- Apply `getContentStyle(styleOptions)` on body/description text (font-weight, font-style)
- Use `buildSectionOrder(styleOptions, customSections)` to resolve render order
- Resolve headings: `data.section_headings?.[key]?.trim() || DEFAULT_SECTION_HEADINGS[key]`
- Render custom sections in order
- Use **`React.Fragment key={sectionKey}`** at the `.map()` level so React reorders DOM correctly when `sectionOrder` changes
- Use **inline styles only** (no Tailwind classes inside templates) so font/size/spacing inherit correctly without specificity conflicts
- Use **`em` units** for all sizes so base `fontSize` on the container scales everything proportionally

### 6. Accent Color
- Hex color picker in builder toolbar
- Stored as `accent_color` (always with `#` prefix)
- Applied to header backgrounds, section heading colors, border colors, badge backgrounds across templates

### 7. Custom Section Headings (`SectionManager`)
- Rename any of 5 built-in headings: Summary, Experience, Education, Projects, Skills
- Max 100 chars. Empty/whitespace input reverts to default on blur
- Stored in `section_headings` map on the resume document
- Preview updates in real time (< 300ms, React state)

### 8. Custom Sections (`SectionManager`)
- Add up to 10 user-defined sections (e.g. Certifications, Volunteering, Awards)
- Each has a heading and freeform text content area
- Newlines preserved with `whitespace-pre-line`
- Remove individual sections (trash icon)
- At save time, sections where both `heading` and `content` are blank are filtered out

### 9. Styles Panel (`StylesPanel`)

**Font Family** (11 options, grouped by category):
- Sans-serif: Inter, Lato, Raleway, Nunito Sans
- Serif: Georgia, Merriweather, Playfair Display, Source Serif 4, EB Garamond, IBM Plex Serif
- Mono: Courier New
- Each button previewed in its own font

**Font Size:** stepper `−` / `+`, range 11–16px, displays current value as `{n}px`

**Line Spacing:** 3 options — Compact (1.2) / Normal (1.5) / Relaxed (1.8)

**Heading Style:** Bold toggle + Italic toggle — applied to all section heading elements. Live preview in panel showing "Professional Experience" in selected styles.

**Content Style:** Bold toggle + Italic toggle — applied to description/body text. Live preview in panel showing sample sentence.

**Section Order:** Drag-and-drop list of all active sections (built-in sections with content + all custom sections). Uses `@dnd-kit`. Order saved as array of section keys in `style_options.sectionOrder`.

### 10. AI Features (powered by Groq)

| Feature | Where | Endpoint | Behaviour |
|---|---|---|---|
| Enhance Professional Summary | Summary tab | `POST /api/ai/enhance-pro-sum` | Sends current summary text to Groq, returns 2-3 sentence enhanced version |
| Enhance Job Description | Experience tab (per entry) | `POST /api/ai/enhance-job-desc` | Sends description + position + company to Groq, returns enhanced bullet-style description |
| Upload Resume from PDF | Dashboard | `POST /api/ai/upload-resume` | `react-pdftotext` extracts text client-side → sent to Groq → parsed into structured JSON → new resume created |

Error handling: 429 (rate limit), 401 (API key), timeout, and generic errors all return user-friendly messages.

### 11. Public Resume View (`/view/:resumeId`)
- Accessible without auth if `resume.public === true`
- `GET /api/resumes/public/:resumeId`
- Renders `ResumePreview` with full `styleOptions` applied (same visual as builder)

### 12. Dark Mode
- Toggled via `.dark` class on `<html>`, persisted in `localStorage`
- Applied before first paint via inline `<script>` in `index.html` to prevent flash
- All UI colors reference CSS variables that flip in `.dark`

---

## Key Utilities (`client/src/utils/templateHelpers.js`)

```js
FONT_FAMILY_MAP
  // Maps stored value → CSS font-family string. 11 entries.
  // e.g. "playfair" → "'Playfair Display', serif"

getContainerStyle(styleOptions)
  // Returns { fontFamily, fontSize: "14px", lineHeight: 1.5 }
  // Safe fallbacks: unknown fontFamily → Inter, fontSize outside 11-16 → 14, 
  // lineSpacing not in {1.2,1.5,1.8} → 1.5

getHeadingStyle(styleOptions)
  // Returns { fontWeight: 700|400, fontStyle: "normal"|"italic" }
  // headingBold defaults true, headingItalic defaults false

getContentStyle(styleOptions)
  // Returns { fontWeight: 700|400, fontStyle: "normal"|"italic" }
  // contentBold defaults false, contentItalic defaults false

DEFAULT_ORDER
  // ["summary", "experience", "education", "projects", "skills"]

buildSectionOrder(styleOptions, customSections)
  // Returns full ordered array for rendering.
  // Base = styleOptions.sectionOrder (if non-empty) else DEFAULT_ORDER.
  // Appends any keys from DEFAULT_ORDER or customSection IDs not already in base.
```

---

## CSS Architecture

Tailwind v4 with `@theme` tokens in `index.css` — no `tailwind.config.js`.

**Critical font scoping rules** (prevents global font reset from overriding resume):
```css
/* Exclude resume preview from global font reset */
*:not(#resume-preview, #resume-preview *) {
  font-family: var(--font-sans);
}

/* Let the container's inline fontFamily cascade to all children */
#resume-preview * {
  font-family: inherit;
}

/* Exclude resume headings from Poppins display font */
:is(h1, h2, h3, h4, h5):not(#resume-preview *) {
  font-family: var(--font-display);
  color: var(--color-ink);
  letter-spacing: -0.02em;
}
```

`#resume-preview` is the div ID on `ResumePreview`'s inner container.

---

## Auth Flow

```
User submits login →
  POST /api/users/login →
  Server returns { token, user } →
  Redux login(payload) saves to state + localStorage →
  App.jsx useEffect calls GET /api/users/data on every mount →
  Re-validates token, re-hydrates user in store
```

---

## Environment Variables

### Server (`server/.env`)
```
MONGODB_URI=           # MongoDB connection string (without database name — db name appended as /resume-builder)
JWT_SECRET=            # Secret for signing JWTs
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT= # e.g. https://ik.imagekit.io/yourusername
GROQ_API_KEY=          # Groq API key
GROQ_BASE_URL=         # Groq API base URL (e.g. https://api.groq.com/openai/v1)
GROQ_MODEL=            # Model name (e.g. llama3-8b-8192 or mixtral-8x7b-32768)
PORT=3000
```

### Client (`client/.env` / `client/.env.local`)
```
VITE_BASE_URL=         # Full URL of the backend server (e.g. http://localhost:3000)
```

---

## Running Locally

```bash
# Backend
cd server
npm run server        # nodemon server.js on port 3000

# Frontend
cd client
npm run dev           # Vite dev server (default port 5173)
```

---

## Patterns & Conventions to Follow

When adding new features, follow these established patterns:

- **ResumeBuilder owns all state** — pass slices down as props, never lift state from children
- **Templates are pure render components** — props in, JSX out, no useState/useEffect
- **Inline styles only in templates** — never Tailwind utility classes inside template components
- **`em` units in templates** — so the base `fontSize` on the container scales all child text
- **`React.Fragment key={key}`** at `.map()` level when rendering ordered sections — required for React to reorder DOM
- **Add new `style_options` fields** → update: (1) Mongoose schema, (2) ResumeBuilder initial state + load normalization, (3) StylesPanel UI, (4) templateHelpers.js helpers, (5) all 4 templates
- **Add new section type** → update: SectionManager `DEFAULT_SECTION_HEADINGS`, all 4 templates, `buildSectionOrder` if needed
- **`minimize: false`** is set on the Resume schema — always keep it, otherwise MongoDB strips empty `{}` and `[]` which breaks customization defaults
- **Server update controller** uses `findOneAndUpdate(filter, plainObject, { new: true })` — not `$set`. The full payload replaces top-level fields.

---

## Upcoming Feature Backlog

Add planned features here as you build them:

- [ ] ATS resume score / keyword checker
- [ ] Cover letter builder
- [ ] Multiple resume duplication / versioning
- [ ] Template thumbnail previews in selector
- [ ] AI bullet point suggestions for experience entries
- [ ] Server-side PDF export via Puppeteer (more reliable than window.print)
- [ ] Resume view count / analytics on public page
- [ ] Custom accent color themes per template
- [ ] Mobile-responsive builder UI
- [ ] Collaborative editing / share-to-edit link
- [ ] User profile / account settings page
- [ ] Onboarding wizard for first resume
- [ ] LinkedIn import
