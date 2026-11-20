<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Pather Panchali: Facebook of Kolkata — Agent Guidelines & Architecture

## 1. Project Overview & Core Concept
"Pather Panchali: Facebook of Kolkata" is a Next.js (App Router), TypeScript, and Tailwind CSS community platform where visitors and citizens celebrate the living memory of Kolkata.

Visitors upload their own photographs, choose an iconic Kolkata landmark (with exact OpenStreetMap coordinates), select the time of day, span of the year (including Poila Baisakh, Durga Pooja, and Deepavali), and choose a vibe (default: Aesthetic). The uploaded photo is revamping through atmospheric visual transformations and color-analyzed. A poetic plain-text caption with curated hashtags is synthesized. Users can edit all post details before publishing directly to the community feed, where posts feature interactive OpenStreetMap views and extracted color palettes.

---

## 2. Industry-Standard Folder Structure

```
panther-panchali/
├── app/                              # Next.js App Router (Routes, Layouts & Endpoints ONLY)
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts  # NextAuth Auth.js v5 route handler
│   │   └── posts/
│   │       ├── route.ts                 # Feed retrieval (GET) & publishing (POST)
│   │       └── generate/route.ts        # Image revamp & caption synthesis
│   ├── auth/page.tsx                 # Single-purpose Google OAuth screen
│   ├── canvas/page.tsx               # Create Post Studio (Upload, Select, Revamp, Edit, Publish)
│   ├── explore/page.tsx              # Facebook of Kolkata Feed with OpenStreetMap
│   ├── journeys/page.tsx             # My Archive of published Kolkata posts
│   ├── profile/page.tsx              # Minimal Account Profile (avatar, name, email, user ID)
│   ├── globals.css                   # Modern Tailwind CSS v4 theme tokens & base styles
│   ├── layout.tsx                    # Root layout & Google fonts configuration
│   └── page.tsx                      # Minimal hero landing page
│
├── components/                       # Shared & feature UI components (Root level)
│   ├── auth-provider.tsx             # NextAuth SessionProvider wrapper
│   ├── create-post-studio.tsx        # Upload, place selection, revamp, and plain-text editor
│   ├── open-street-map-modal.tsx     # High-visibility interactive OpenStreetMap modal
│   └── navigation-dock.tsx           # State-dependent dual-form navigation dock
│
├── lib/                              # Shared backend utilities, adapters & domain models
│   ├── api/
│   │   └── auth.ts                   # Server-side auth helper (getAuthenticatedUser)
│   ├── constants/
│   │   └── kolkata-places.ts         # Heritage spots, coordinates, vibes, and festival seasons
│   ├── mongodb.ts                    # Native MongoDB client connection
│   ├── models/
│   │   ├── post.ts                   # KolkataPost, KolkataPlace, TimeOfDay, YearSpan, PostVibe
│   │   └── user.ts                   # User domain model
│   └── services/
│       ├── cloudinary.ts             # Color extraction, media storage & atmospheric revamp
│       └── gemini.ts                 # Plain text poetic caption & hashtag synthesizer
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
- **Route Protection**: `middleware.ts` guards all protected routes (`/canvas`, `/explore`, `/journeys`, `/profile`). Unauthenticated users are redirected directly to `/auth`.
- **Public Surfaces**: Only the root landing page (`/`) and the authentication page (`/auth`) are publicly accessible without signing in.
- **Single Database Collection**: All registered user accounts reside strictly under the single `users` collection in database `cloudinary`. Auth.js uses encrypted JWT sessions, so no secondary `accounts`, `sessions`, or `verification_tokens` collections are created.
- **Redirect Policy**: Upon successful authentication, users are redirected strictly to the profile page (`/profile`). Upon logging out, users are redirected strictly to the home page (`/`).

---

## 4. Design & Brand Guidelines: The "Morning Paper" Palette
- **Strict Color Tokens**:
  - Page Background: `#F6F1E6` (`bg-paper-bg`)
  - Card Surface: `#EDE4D3` (`bg-paper-card`)
  - Body Text: `#1B1A17` (`text-paper-text`)
  - Muted Text: `#6B6458` (`text-paper-muted`)
  - Terracotta Accent: `#B5532F` (`text-terracotta`, `bg-terracotta`)
  - Soft Gold Glow: `#E3C27A` (`bg-gold-glow`)
- **Tailwind CSS Utility Classes**:
  - All styling must use standard Tailwind CSS utility classes (`mt-`, `pt-`, `p-`, `flex`, `grid`, etc.).
  - `globals.css` is reserved strictly for `@import "tailwindcss";`, `@theme` definitions, and minimal base rules. No custom vanilla CSS classes.
- **Typography**:
  - `Fraunces` (variable serif, light weight 300, optical size display) for headings and titles.
  - `Newsreader` (editorial serif, italic) for narrative descriptions, reflections, and literary prose.
  - `Instrument Sans` (sans-serif) for small uppercase labels, buttons, and telemetry metrics.

---

## 5. Client-Side Vendor & Tool Name Restraint
- **Zero Technical Tool Names**: Do not place the names of internal databases, APIs, or developer libraries (such as MongoDB, Gemini, Stability AI, Cloudinary, Nodemailer, NextAuth, SMTP) anywhere on client-facing surfaces. Use descriptive domain terms (e.g., "The Living Canvas", "Sensory Co-Creation", "User ID", "Account Profile", "Atmospheric Palette").

---

## 6. State-Dependent Navigation Policy
- The navigation dock is dynamic and state-reactive:
  - **Unauthenticated state**: Displays only public destinations (`Home` and `Sign in`).
  - **Authenticated state**: Displays the full suite (`Home`, `Create Post`, `Kolkata Feed`, `My Archive`, `Profile`, and `Sign out`).
  - **Route tracking**: Automatically marks the current active destination based on `pathname` with terracotta `#B5532F` and an active indicator dot.
  - **Auth Screen Isolation**: Completely hidden on `/auth` to ensure an uncluttered sign-in experience.
  - **Dual-Form Responsive Design**: Floating bottom pill with tooltips on desktop/tablet; foldable sidebar drawer on mobile.
