<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Pather Panchali: The Living Canvas — Agent Guidelines & Architecture

## 1. Project Overview & Core Concept
"Pather Panchali: The Living Canvas" is a Next.js (App Router), TypeScript, and Tailwind CSS community platform where visitors and citizens celebrate the living memory of Kolkata.

Users choose an iconic Kolkata landmark (with exact OpenStreetMap coordinates), select the time of day, span of the year (including Poila Baisakh, Durga Pooja, and Deepavali), choose an atmospheric vibe (default: Aesthetic), and optionally provide personal memory details. Stability AI generates an authentic 1:1 square photograph from scratch using its base model (SD 3.5 Medium) with Core fallback. Cloudinary extracts dominant colors into a 5-color palette, and Gemini synthesizes an evocative plain-text poetic caption with curated hashtags. Users review and edit details before publishing directly to the community feed, where posts feature interactive OpenStreetMap views, like toggle, comment discussions, and share capabilities.

---

## 2. Industry-Standard Folder Structure

```
panther-panchali/
├── app/                              # Next.js App Router (Routes, Layouts & Endpoints ONLY)
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts  # NextAuth Auth.js v5 route handler
│   │   └── posts/
│   │       ├── route.ts                 # Feed retrieval (GET) & publishing (POST)
│   │       ├── generate/route.ts        # Stability AI image synthesis & Gemini prose
│   │       └── [id]/
│   │           ├── route.ts             # Single post retrieval (GET)
│   │           ├── like/route.ts        # Like toggle (POST)
│   │           ├── comments/route.ts    # Comments retrieval (GET) & addition (POST)
│   │           └── share/route.ts       # Share counter increment (POST)
│   ├── auth/page.tsx                 # Single-purpose Google OAuth screen
│   ├── canvas/page.tsx               # Create Post Studio (Landmark, Light, Season, Vibe, Review, Publish)
│   ├── explore/page.tsx              # Pather Panchali Feed with OpenStreetMap
│   ├── journeys/page.tsx             # My Archive of published Kolkata posts
│   ├── posts/[id]/page.tsx           # Dedicated single post & share target view
│   ├── profile/page.tsx              # Minimal Account Profile (avatar, name, email, user ID)
│   ├── globals.css                   # Modern Tailwind CSS v4 theme tokens & base styles
│   ├── layout.tsx                    # Root layout & Google fonts configuration
│   └── page.tsx                      # Minimal hero landing page
│
├── components/                       # Shared & feature UI components (Root level)
│   ├── auth-provider.tsx             # NextAuth SessionProvider wrapper
│   ├── create-post-studio.tsx        # Post synthesis studio & review editor
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
│       ├── cloudinary.ts             # Media storage & dominant color palette extraction
│       ├── gemini.ts                 # Plain text poetic caption & hashtag synthesizer
│       ├── mailer.ts                 # Post publication email dispatch service
│       └── stability.ts              # Stability AI base model (SD 3.5 Medium) image synthesis
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
- **Route Protection**: `middleware.ts` guards all protected routes (`/canvas`, `/explore`, `/journeys`, `/profile`, `/posts`). Unauthenticated users are redirected directly to `/auth`.
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
  - All styling must use standard Tailwind CSS utility classes (`bg-paper-bg`, `bg-paper-card`, `text-paper-text`, `text-paper-muted`, `bg-terracotta`, `text-terracotta`, `bg-gold-glow`).
  - `globals.css` is reserved strictly for `@import "tailwindcss";`, `@theme` definitions, and minimal base rules. No custom vanilla CSS classes.
- **Typography**:
  - `Fraunces` (variable serif, light weight 300, optical size display) with `fontVariationSettings: '"opsz" 72, "SOFT" 85, "WONK" 1'` for headings and titles.
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
  - **Route tracking**: Automatically marks the current active destination based on `pathname` with soft gold glow `bg-gold-glow`, dark text `text-paper-text`, ring `ring-terracotta/30`, and terracotta active indicator dot.
  - **Auth Screen Isolation**: Completely hidden on `/auth` to ensure an uncluttered sign-in experience.
  - **Dual-Form Responsive Design**: Floating bottom pill with tooltips on desktop/tablet; foldable sidebar drawer on mobile.
