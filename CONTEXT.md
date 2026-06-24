# AI Resume Builder — Product Context

> This file is the single source of truth for the product. Update it whenever a feature is added, changed, or removed.
> Use it to onboard new contributors and as context when planning upcoming features.

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
├── client/          # React SPA (Vite)
└── server/          # Express REST API (Node.js)
```

The client and server are **separate apps** deployed independently. The client talks to the server via Axios (`client/src/configs/api.js`).

---

## Tech Stack

### Frontend (`client/`)

| Layer | Technology | Version |
|---|---|---|
| Framework | React | 19.1 |
| Build tool | Vite | 7.x |
| Styling | Tailwind CSS v4 | 4.1 |
| State management | Redux Toolkit + React-Redux | 2.x / 9.x |
| Routing | React Router DOM | 7.x |
| HTTP client | Axios | 1.x |
| Drag and drop | @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities | 6.x / 10.x |
| Icons | Lucide React | 0.546 |
| Notifications | React Hot Toast | 2.x |
| PDF parsing | react-pdftotext | 1.x |
| Fonts | Google Fonts (Inter, Poppins, Merriweather, Playfair Display, Lato, Raleway, Source Serif 4, Nunito Sans, EB Garamond, IBM Plex Serif) | — |

### Backend (`server/`)

| Layer | Technology | Version |
|---|---|---|
| Runtime | Node.js (ESM modules) | — |
| Framework | Express | 5.x |
| Database | MongoDB via Mongoose | 8.x |
| Auth | JWT (jsonwebtoken) + bcrypt | 9.x / 6.x |
| File uploads | Multer (multipart/form-data) | 2.x |
| Image hosting | ImageKit.io SDK (`@imagekit/nodejs`) | 7.x |
| AI | OpenAI SDK | 6.x |
| Dev server | Nodemon | 3.x |
| Config | dotenv | 17.x |
| CORS | cors | 2.x |

### Design tokens (Tailwind theme — `index.css`)

- **Brand:** Indigo (`brand-*`)
- **Accent:** Teal (`accent-*`)
- **Neutrals:** Slate (`ink`, `body`, `muted`, `line`, `canvas`, `surface`)
- **Fonts:** `--font-sans` Inter · `--font-display` Poppins · `--font-resume` Inter (overridden per resume)
- **Dark mode:** class-based (`.dark` on `<html>`)

---

## Folder Structure

### Client

```
client/src/
├── App.jsx                        # Root routes
├── index.css                      # Global styles + Tailwind theme tokens
├── main.jsx                       # React entry point
├── app/
│   ├── store.js                   # Redux store
│   └── features/authSlice.js      # Auth state (token, user, loading)
├── configs/
│   └── api.js                     # Axios base instance
├── hooks/
│   └── useTheme.js                # Dark/light theme toggle hook
├── pages/
│   ├── Home.jsx                   # Landing page
│   ├── Layout.jsx                 # App shell (protected routes)
│   ├── Login.jsx                  # Login / register page
│   ├── Dashboard.jsx              # Resume list + create/delete
│   ├── ResumeBuilder.jsx          # Main builder page (owns all resume state)
│   └── Preview.jsx                # Public resume view (/view/:resumeId)
├── components/
│   ├── Navbar.jsx                 # App navbar
│   ├── Logo.jsx
│   ├── Loader.jsx
│   ├── ThemeToggle.jsx
│   ├── TemplateSelector.jsx       # Template switcher (Classic/Modern/Minimal/MinimalImage)
│   ├── ColorPicker.jsx            # Accent color picker
│   ├── ResumePreview.jsx          # Renders the active template; receives styleOptions
│   ├── PersonalInfoForm.jsx       # Personal info section form
│   ├── ProfessionalSummary.jsx    # Summary + AI generation
│   ├── ExperienceForm.jsx
│   ├── EducationForm.jsx
│   ├── ProjectForm.jsx
│   ├── SkillsForm.jsx
│   ├── SectionManager.jsx         # Rename headings + add/remove custom sections
│   ├── StylesPanel.jsx            # Font, size, spacing, bold/italic, section order
│   ├── templates/
│   │   ├── ClassicTemplate.jsx
│   │   ├── ModernTemplate.jsx
│   │   ├── MinimalTemplate.jsx
│   │   └── MinimalImageTemplate.jsx
│   └── Home/
│       ├── Hero.jsx · Banner.jsx · Features.jsx
│       ├── HowItWorks.jsx · CallToAction.jsx
│       ├── Footer.jsx · HomeNavbar.jsx · Title.jsx
└── utils/
    └── templateHelpers.js         # FONT_FAMILY_MAP, getContainerStyle,
                                   # getHeadingStyle, getContentStyle,
                                   # DEFAULT_ORDER, buildSectionOrder
```

### Server

```
server/
├── server.js                      # Express app entry, mounts routes
├── config/
│   ├── db.js                      # Mongoose connection
│   ├── ai.js                      # OpenAI client setup
│   ├── imageKit.js                # ImageKit client setup
│   └── multer.js                  # Multer upload config (temp disk storage)
├── models/
│   ├── User.js                    # User schema (name, email, password hash)
│   └── resume.js                  # Resume schema (see Data Model section)
├── controllers/
│   ├── userController.js          # register, login, getUserData
│   ├── resumeController.js        # createResume, getResumeById, updateResume,
│   │                              # deleteResume, getPublicResumeById
│   └── aiController.js            # AI content generation endpoints
├── middlewares/
│   └── authMiddleware.js          # JWT verification, attaches req.userId
└── routes/
    ├── userRoute.js               # /api/users/*
    ├── resumeRoute.js             # /api/resumes/*
    └── aiRoutes.js                # /api/ai/*
```

---

## Data Model — Resume (`server/models/resume.js`)

```js
{
  userId:               ObjectId (ref: User),
  title:                String (default: "untitled resume"),
  public:               Boolean (default: false),
  template:             String (default: "classic"),  // classic | modern | minimal | minimal-image
  accent_color:         String (default: "#3B82F6"),  // hex with #

  // Content sections
  professional_summary: String,
  skills:               [String],
  personal_info: {
    image, full_name, profession, email, phone, location, linkedin, website
  },
  experience: [{
    company, position, start_date, end_date, description, is_current
  }],
  project: [{
    name, type, description
  }],
  education: [{
    institution, degree, field, graduation_date, gpa
  }],

  // Customization (added in resume-customization feature)
  section_headings:  Mixed  // { summary: "About Me", experience: "Work History", ... }
  custom_sections:   [{
    id: String (required),
    heading: String,
    content: String
  }],
  style_options: {
    fontFamily:    String   // "inter" | "georgia" | "merriweather" | "courier"
                            // | "playfair" | "lato" | "raleway" | "sourceserif"
                            // | "nunitosans" | "garamond" | "ibmplexserif"
    fontSize:      Number   // 11–16 (px, applied as base font size)
    lineSpacing:   Number   // 1.2 | 1.5 | 1.8
    sectionOrder:  [String] // ordered array of section keys + custom section IDs
    headingBold:   Boolean  // default true
    headingItalic: Boolean  // default false
    contentBold:   Boolean  // default false
    contentItalic: Boolean  // default false
  }
}
```

Schema options: `{ timestamps: true, minimize: false }` — `minimize: false` ensures empty objects/arrays are persisted correctly.

---

## API Routes

### Auth — `/api/users`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | No | Create account |
| POST | `/login` | No | Login, returns JWT |
| GET | `/data` | Yes | Get current user info |

### Resumes — `/api/resumes`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/create` | Yes | Create blank resume |
| GET | `/get/:resumeId` | Yes | Get resume by ID (owner only) |
| PUT | `/update` | Yes | Update resume (multipart/form-data: resumeId, resumeData JSON, optional image file, removeBackground flag) |
| DELETE | `/delete/:resumeId` | Yes | Delete resume |
| GET | `/public/:resumeId` | No | Get public resume (for /view/:id page) |

### AI — `/api/ai`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/generate-summary` | Yes | Generate professional summary from job data |
| (others) | — | — | Additional AI generation endpoints (see aiController.js) |

---

## State Management (Client)

### Redux store

```
auth: { user, token, isLoading }
```

Token is also persisted in `localStorage`. On app load, `getUserData()` in `App.jsx` re-validates the token and hydrates the store.

### ResumeBuilder local state

`ResumeBuilder.jsx` owns all resume state as a single `resumeData` object (shape mirrors the MongoDB schema). Child form components receive their slice via props and call `onChange` to update parent state. The full object is sent to `PUT /api/resumes/update` on save.

---

## Implemented Features

### 1. Authentication
- Register / Login with email + password
- Passwords hashed with bcrypt
- JWT-based session (stored in localStorage)
- Protected routes via `authMiddleware.js` on server and Redux auth state on client

### 2. Resume Dashboard
- List all user resumes
- Create new resume (creates blank document in MongoDB)
- Delete resume
- Navigate to builder

### 3. Resume Builder (`/app/builder/:resumeId`)
- 8-section tabbed sidebar: Personal Info, Summary, Experience, Education, Projects, Skills, Sections, Styles
- Progress bar showing active tab position
- Previous / Next navigation between tabs
- Auto-loads existing resume on mount
- Save via `PUT /api/resumes/update`
- Print / Download (window.print with CSS @page rules)
- Public/Private toggle
- Share button (Web Share API)
- Real-time preview on the right panel

### 4. Resume Sections
- **Personal Info:** name, profession, email, phone, location, LinkedIn, website, profile photo upload
- **Professional Summary:** freeform text + AI generation
- **Experience:** multiple entries, company, position, dates, is_current flag, description
- **Education:** institution, degree, field, graduation date, GPA
- **Projects:** name, type, description
- **Skills:** tag list

### 5. Profile Image Upload
- Upload via multipart form
- Hosted on ImageKit.io with face-focused crop transform
- Optional background removal (ImageKit remove-bg extension)

### 6. Template System
Four resume templates, all sharing the same data shape:

| Key | Component | Layout style |
|---|---|---|
| `classic` | ClassicTemplate | Single column, centered header, accent-colored section headings |
| `modern` | ModernTemplate | Single column, colored header band, skill badges, Education+Skills grid |
| `minimal` | MinimalTemplate | Single column, minimal typography, uppercase section labels |
| `minimal-image` | MinimalImageTemplate | Two-column sidebar (Contact/Education/Skills) + main (Summary/Experience/Projects) with profile image in header |

All templates:
- Accept `{ data, accentColor, styleOptions }` props
- Apply `getContainerStyle(styleOptions)` on outermost div for font/size/line-height
- Use `buildSectionOrder(styleOptions, customSections)` to render sections in user-defined order
- Use `getHeadingStyle(styleOptions)` and `getContentStyle(styleOptions)` for bold/italic
- Resolve section headings via `data.section_headings[key] || DEFAULT_SECTION_HEADINGS[key]`
- Render custom sections in order
- Use `React.Fragment key={key}` at the `.map()` level so React can correctly reorder DOM

### 7. Accent Color
- Color picker in builder toolbar
- Stored as hex in `accent_color`
- Applied to headers, borders, section headings across all templates

### 8. Custom Section Headings (`SectionManager`)
- Rename any of the 5 built-in section headings (summary, experience, education, projects, skills)
- Max 100 characters per heading
- Empty/whitespace reverts to default
- Changes reflected in preview in real time

### 9. Custom Sections (`SectionManager`)
- Add up to 10 user-defined sections (e.g. Certifications, Volunteering, Awards)
- Each has a heading and freeform text content
- Newlines in content rendered as visual line breaks (`whitespace-pre-line`)
- Remove individual custom sections
- Blank sections (both heading and content empty) are filtered before save

### 10. Styles Panel (`StylesPanel`)

**Font Family** (11 options, grouped):
- Sans-serif: Inter, Lato, Raleway, Nunito Sans
- Serif: Georgia, Merriweather, Playfair Display, Source Serif 4, EB Garamond, IBM Plex Serif
- Mono: Courier New

**Font Size:** stepper 11–16px, applied as base `fontSize` on resume container

**Line Spacing:** Compact (1.2) / Normal (1.5) / Relaxed (1.8)

**Heading Style:** Bold toggle + Italic toggle for all section headings (live preview in panel)

**Content Style:** Bold toggle + Italic toggle for body/description text (live preview in panel)

**Section Order:** drag-and-drop reordering of all active sections (sections with content + custom sections). Uses @dnd-kit.

### 11. Public Resume View (`/view/:resumeId`)
- Publicly accessible if `resume.public === true`
- Fetches from `GET /api/resumes/public/:resumeId`
- Renders same `ResumePreview` with full `styleOptions` applied

### 12. Dark Mode
- Toggled via `.dark` class on `<html>`
- Persisted in `localStorage`
- Applied before paint to avoid flash (`<script>` in index.html)

### 13. AI Integration
- AI-powered professional summary generation via OpenAI API
- Accessed from the Summary tab in the builder

---

## Key Utilities (`client/src/utils/templateHelpers.js`)

```js
FONT_FAMILY_MAP          // value → CSS font-family string (11 entries)
getContainerStyle(opts)  // → { fontFamily, fontSize, lineHeight }
getHeadingStyle(opts)    // → { fontWeight, fontStyle }
getContentStyle(opts)    // → { fontWeight, fontStyle }
DEFAULT_ORDER            // ["summary","experience","education","projects","skills"]
buildSectionOrder(opts, customSections)
  // Returns full ordered array: stored sectionOrder as base (or DEFAULT_ORDER),
  // appends any keys not already present. Custom section IDs appended after built-ins.
```

---

## CSS Architecture

- Tailwind v4 with `@theme` tokens (no `tailwind.config.js`)
- Global font reset scoped away from resume preview:
  ```css
  *:not(#resume-preview, #resume-preview *) { font-family: var(--font-sans); }
  #resume-preview * { font-family: inherit; }
  :is(h1,h2,h3,h4,h5):not(#resume-preview *) { font-family: var(--font-display); }
  ```
- Resume container uses only inline styles (no Tailwind classes inside templates) so font/size/spacing from `styleOptions` cascade correctly

---

## Known Patterns & Conventions

- **Resume state lives entirely in `ResumeBuilder.jsx`** — all child components are controlled via props
- **Templates are pure render components** — they receive data and styleOptions, render JSX, no local state
- **All inline styles in templates** — avoids Tailwind specificity conflicts with the resume font/size
- **`em` units throughout templates** — so `fontSize` on the container scales all child text proportionally
- **`React.Fragment key={sectionKey}`** at `.map()` level — required for React to correctly reorder sections when `sectionOrder` changes
- **Server `updateResume` controller** uses `findOneAndUpdate(filter, data, { new: true })` — passes plain object, not `$set`. All fields in the payload are merged into the document.
- **`minimize: false`** on Mongoose schema — ensures empty objects/arrays (`{}`, `[]`) are saved to MongoDB and not stripped

---

## Environment Variables

### Server (`server/.env`)
```
MONGODB_URI=
JWT_SECRET=
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=
OPENAI_API_KEY=
PORT=3000
```

### Client (`client/.env` / `client/.env.local`)
```
VITE_API_URL=   # Base URL of the server (e.g. http://localhost:3000)
```

---

## Running Locally

```bash
# Server
cd server
npm run server        # starts nodemon server.js on port 3000

# Client
cd client
npm run dev           # starts Vite dev server (usually port 5173)
```

---

## Upcoming Feature Ideas (Backlog)

Add your planned features here as you build them:

- [ ] Resume score / ATS checker
- [ ] Multiple accent color themes (not just one color)
- [ ] Cover letter builder
- [ ] Resume import from PDF / LinkedIn
- [ ] Multiple resume versions / duplication
- [ ] Template thumbnail previews in selector
- [ ] AI-powered bullet point suggestions for experience
- [ ] Export as PDF (server-side via Puppeteer instead of window.print)
- [ ] Collaborative editing / share-to-edit link
- [ ] Resume analytics (view count on public page)
- [ ] User profile / account settings page
- [ ] Onboarding wizard for first resume
- [ ] Custom color themes per template
- [ ] Mobile-responsive builder UI
