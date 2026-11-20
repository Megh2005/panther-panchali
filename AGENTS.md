<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Pather Panchali: The Living Canvas — Agent Guidelines & Architecture

## 1. Project Overview & Core Concept
"Pather Panchali: The Living Canvas" is a Next.js (App Router), TypeScript, and Tailwind CSS web application where visitors explore and co-create the sensory soul of Kolkata through interactive storytelling.

The experience begins with the Mood & Curiosity Compass, where visitors select an emotion, time of day, and cultural curiosity. Narrative and atmospheric media are synthesized and presented as interactive living chapters. All journey threads are persisted in the database, forkable, exportable as storybook PDFs, and dispatchable to inbox.

---

## 2. Industry-Standard Folder Structure

```
panther-panchali/
├── app/                              # Next.js App Router (Routes, Layouts & Endpoints ONLY)
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts  # NextAuth Auth.js v5 route handler
│   │   ├── canvas/transform/route.ts   # In-scene atmospheric transformations
│   │   ├── export/email/route.ts       # Story email dispatch
│   │   ├── story/generate/route.ts     # Narrative synthesis pipeline
│   │   └── threads/route.ts            # Journey threads persistence & forking
│   ├── auth/page.tsx                 # Single-purpose Google OAuth screen
│   ├── canvas/page.tsx               # The Living Canvas step-by-step experience
│   ├── explore/page.tsx              # Cultural Cartography landmark exploration
│   ├── journeys/page.tsx             # Journey Threads browser
│   ├── profile/page.tsx              # Minimal Account Profile (avatar, name, email, user ID)
│   ├── story/page.tsx                # Narrative synthesis view
│   ├── thread/[id]/export/page.tsx   # Archival storybook PDF view (Suspense-wrapped)
│   ├── globals.css                   # Modern Tailwind CSS v4 theme tokens & base styles
│   ├── layout.tsx                    # Root layout & Google fonts configuration
│   └── page.tsx                      # Minimal hero landing page
│
├── components/                       # Shared & feature UI components (Root level)
│   ├── auth-provider.tsx             # NextAuth SessionProvider wrapper
│   ├── living-canvas.tsx             # Step-by-step Compass, Canvas & transformation controls
│   ├── navigation-dock.tsx           # State-dependent dual-form navigation dock
│   └── product-tour.tsx              # Accessible guided tour modal
│
├── lib/                              # Shared backend utilities, adapters & domain models
│   ├── api/
│   │   └── auth.ts                   # Server-side auth helper (getAuthenticatedUser)
│   ├── mongodb.ts                    # Native MongoDB client connection
│   ├── validation.ts                 # Type guards and request validators
│   ├── models/
│   │   ├── journey.ts                # TypeScript domain models (Thread, Chapter, Branch)
│   │   └── user.ts                   # User domain model
│   └── services/
│       ├── cloudinary.ts             # Media ingestion & transformations
│       ├── gemini.ts                 # Literary prose generator (v1beta structured JSON)
│       ├── mailer.ts                 # Story dispatch email service
│       └── stability.ts              # Atmospheric imagery generator
│
├── auth.config.ts                    # Edge-compatible Auth.js v5 route protection config
├── auth.ts                           # NextAuth Auth.js v5 handlers, session and Google OAuth config
├── middleware.ts                     # Next.js standard middleware route protection (Edge-safe)
├── package.json                      # Dependencies and scripts
├── tsconfig.json                     # Path alias mapping ("@/*" -> "./*")
└── AGENTS.md                         # Architecture and operational guidelines
```

---

## 3. Authentication & Security Rules
- **Google OAuth Only**: Only Google OAuth 2.0 is permitted. Do NOT implement or allow guest connections, mock credentials, or secondary passkeys.
- **Route Protection**: `middleware.ts` guards all protected routes (`/canvas`, `/story`, `/journeys`, `/explore`, `/profile`, `/thread/:path*`). Unauthenticated users are redirected directly to `/auth`.
- **Public Surfaces**: Only the root landing page (`/`) and the authentication page (`/auth`) are publicly accessible without signing in.
- **Single Database Collection**: All registered user accounts reside strictly under the single `users` collection in database `cloudinary`. Auth.js uses encrypted JWT sessions, so no secondary `accounts`, `sessions`, or `verification_tokens` collections are created.
- **Redirect Policy**: Upon successful authentication, users are redirected strictly to the profile page (`/profile`). Upon logging out, users are redirected strictly to the home page (`/`).

---

## 4. Design & Brand Guidelines: The "Morning Paper" Palette
- **Strict Color Tokens**:
  - Page Background: `#F6F1E6`
  - Card Surface: `#EDE4D3`
  - Body Text: `#1B1A17`
  - Muted Text: `#6B6458`
  - Terracotta Accent: `#B5532F`
  - Soft Gold Glow: `#E3C27A`
- **Tailwind CSS Utility Classes**:
  - All styling must use standard Tailwind CSS utility classes (`mt-`, `pt-`, `p-`, `flex`, `grid`, etc.).
  - `globals.css` is reserved strictly for `@import "tailwindcss";`, `@theme` definitions, and minimal base rules. No custom vanilla CSS classes.
- **Typography**:
  - `Fraunces` (variable serif, light weight 300, optical size display) for headings and titles.
  - `Newsreader` (editorial serif, italic) for narrative descriptions, reflections, and literary prose.
  - `Instrument Sans` (sans-serif) for small uppercase labels, buttons, and telemetry metrics.
- **Letter-Spacing Standard**:
  - Never use negative or tight letter-spacing (`no tracking-tight`, `no tracking-tighter`).
  - Headings use `tracking-normal`.
  - Small uppercase labels use generous wide tracking (`tracking-[0.2em]`).

---

## 5. Client-Side Vendor & Tool Name Restraint
- **Zero Technical Tool Names**: Do not place the names of internal databases, APIs, or developer libraries (such as MongoDB, Gemini, Stability AI, Cloudinary, Nodemailer, NextAuth, SMTP) anywhere on client-facing surfaces. Use descriptive domain terms (e.g., "The Living Canvas", "Sensory Co-Creation", "User ID", "Account Profile").

---

## 6. State-Dependent Navigation Policy
- The navigation dock is dynamic and state-reactive:
  - **Unauthenticated state**: Displays only public destinations (`Home` and `Sign in`).
  - **Authenticated state**: Displays the full suite (`Home`, `The Canvas`, `Begin a story`, `My journeys`, `Explore`, `Profile`, and `Sign out`).
  - **Route tracking**: Automatically marks the current active destination based on `pathname` with terracotta `#B5532F` and an active indicator dot.
  - **Auth Screen Isolation**: Completely hidden on `/auth` to ensure an uncluttered sign-in experience.
  - **Dual-Form Responsive Design**: Floating bottom pill with tooltips on desktop/tablet; foldable sidebar drawer on mobile.
