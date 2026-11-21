<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Panther Panchali: The Living Canvas — Bengal Place Guide Guidelines & Architecture

## 1. Project Overview & Core Concept
"Panther Panchali: The Living Canvas" is a Next.js (App Router), TypeScript, and Tailwind CSS architectural and cultural guide application where users identify unknown places across the 23 districts of West Bengal from a single uploaded photograph.

When a user uploads a photo, Gemini 2.5 Flash detects whether the location is within West Bengal.
If located in West Bengal:
- Identifies the exact landmark/place name (English and Bengali), district, state, detailed address, and exact coordinates.
- Triggers an interactive OpenStreetMap multi-stage fly-to animation that smoothly zooms from India down to West Bengal and into the pinpointed site.
- Alongside the map: displays a strictly plain-text overview summary of approximately 300 words generated through a constrained AI prompt natively outputting zero Markdown characters.
- Dedicated sections for Scenic Beauty and Historical Significance (rendered via `react-markdown` and `remark-gfm`).
- Predicted travel mood detailing sensory expectations, ideal mindset, and recommended season/time to visit.
- 5-color atmospheric palette extracted by Cloudinary.

If located outside West Bengal:
- Courteous notice identifying where the photo actually is, explaining that Panther Panchali is dedicated to the 23 districts of West Bengal, and inviting the user to explore a West Bengal place.

---

## 2. Industry-Standard Folder Structure

```
panther-panchali/
├── app/                              # Next.js App Router (Routes, Layouts & Endpoints ONLY)
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts  # NextAuth Auth.js v5 route handler
│   │   └── guide/
│   │       └── analyze/route.ts         # Multimodal place identification & guide analysis
│   ├── auth/page.tsx                 # Single-purpose Google OAuth screen
│   ├── guide/page.tsx                # Bengal Place Guide (Upload, Map Radar, 300-word Memoir, Heritage)
│   ├── profile/page.tsx              # Minimal Account Profile (avatar, name, email, user ID)
│   ├── globals.css                   # Modern Tailwind CSS v4 theme tokens & base styles
│   ├── layout.tsx                    # Root layout & Google fonts configuration
│   └── page.tsx                      # Minimal hero landing page
│
├── components/                       # Shared & feature UI components (Root level)
│   ├── auth-provider.tsx             # NextAuth SessionProvider wrapper
│   ├── bengal-guide.tsx              # Bengal place discovery and guide interface
│   ├── bengal-map-flyto.tsx          # Dynamic SSR Leaflet wrapper
│   ├── bengal-map-flyto-client.tsx   # Leaflet multi-stage fly-to radar animation
│   ├── open-street-map-modal.tsx     # High-visibility interactive OpenStreetMap modal
│   └── navigation-dock.tsx           # State-dependent dual-form navigation dock
│
├── lib/                              # Shared backend utilities, adapters & domain models
│   ├── api/
│   │   └── auth.ts                   # Server-side auth helper (getAuthenticatedUser)
│   ├── mongodb.ts                    # Native MongoDB client connection
│   ├── models/
│   │   ├── guide.ts                  # BengalPlaceGuide, PredictedMood
│   │   └── user.ts                   # User domain model
│   └── services/
│       ├── cloudinary.ts             # Media storage & dominant color palette extraction
│       └── gemini.ts                 # Multimodal place identification & zero-markdown synthesizer
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
- **Route Protection**: `middleware.ts` guards all protected routes (`/guide`, `/profile`). Unauthenticated users are redirected directly to `/auth`.
- **Public Surfaces**: Only the root landing page (`/`) and the authentication page (`/auth`) are publicly accessible without signing in.
- **Single Database Collection**: All registered user accounts reside strictly under the single `users` collection.
- **Redirect Policy**: Upon successful authentication, users are redirected strictly to the guide page (`/guide`). Upon logging out, users are redirected strictly to the home page (`/`).

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
  - All styling must use standard Tailwind CSS utility classes (`bg-paper-bg`, `bg-paper-card`, `text-paper-text`, `text-paper-muted`, `bg-terracotta`, `text-terracotta`, `bg-gold-glow`).
  - `globals.css` is reserved strictly for `@import "tailwindcss";`, `@theme` definitions, and minimal base rules.
- **Typography**:
  - `Fraunces` (variable serif, light weight 300, optical size display) with `fontVariationSettings: '"opsz" 72, "SOFT" 85, "WONK" 1'` for headings and titles.
  - `Newsreader` (editorial serif, italic) for narrative descriptions, reflections, and literary prose.
  - `Instrument Sans` (sans-serif) for small uppercase labels, buttons, and telemetry metrics.
- **Icons**:
  - Strictly `react-icons/fa6` (Font Awesome 6).

---

## 5. Client-Side Vendor & Tool Name Restraint
- **Zero Technical Tool Names**: Do not place the names of internal databases, APIs, or developer libraries (such as MongoDB, Gemini, Stability AI, Cloudinary, Nodemailer, NextAuth, SMTP) anywhere on client-facing surfaces. Use descriptive domain terms (e.g., "The Living Canvas", "Bengal Place Guide", "User ID", "Account Profile", "Atmospheric Palette").

---

## 6. State-Dependent Navigation Policy
- The navigation dock is dynamic and state-reactive:
  - **Unauthenticated state**: Displays public destinations (`Home`, `Bengal Guide`, and `Sign in`).
  - **Authenticated state**: Displays the full suite (`Home`, `Bengal Guide`, `Profile`, and `Sign out`).
  - **Route tracking**: Automatically marks the current active destination based on `pathname` with soft gold glow `bg-gold-glow`, dark text `text-paper-text`, ring `ring-terracotta/30`, and terracotta active indicator dot.
  - **Auth Screen Isolation**: Completely hidden on `/auth` to ensure an uncluttered sign-in experience.
  - **Dual-Form Responsive Design**: Floating bottom pill with tooltips on desktop/tablet; foldable sidebar drawer on mobile.
