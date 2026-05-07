# Design Spec: Marketing Landing Page (Feature 17)

## Goal
Implement a high-converting, "High-End Clinical" marketing landing page at the root route (`/`). The page serves two distinct audiences (Patients and Clinic Owners) and prioritizes performance, SEO, and minimalist luxury aesthetics.

## Aesthetic: Editorial Luxury
- **Foundation:** Alabaster (`#FAFAFA`) background with subtle SVG noise texture.
- **Typography:** `Playfair Display` for bold, editorial headings; `Outfit` for clean UI controls and subtext.
- **Surfaces:** Pure White (`#FFFFFF`) floating panes with diffuse shadows (`rgba(0,0,0,0.08)`), no borders.
- **Accent:** Surgical Sapphire (`#0047FF`) for high-intent actions.

## Routing & Structure
1. **Move Marketplace:** Relocate `app/(discovery)/page.tsx` to `app/search/page.tsx`.
2. **Root Page:** Create a new `app/page.tsx` for the Marketing Landing Page.
3. **Public Access:** Ensure the landing page is fully public and doesn't require authentication.

## Components

### 1. HeroSection
- **Layout:** Center-aligned, enormous vertical padding.
- **Heading:** "The Standard of Care, Elevated." (Serif).
- **Subtext:** "Precision care for patients. Professional scale for clinics." (Sans).
- **Search Bar:** A floating white pill with a shadow. Input for location/service and a "Search" button that pushes to `/search?query=...`.

### 2. Funnel Cards (The Dual Path)
- Two large, side-by-side white panes.
- **Patient Card:** "Find Elite Care." Lists popular categories (General, Cosmetic, Orthodontics) linking to `/search?query=...`.
- **Provider Card:** "The Operating System for Elite Clinics." CTA: "List Your Clinic" linking to `/sign-up?redirect_url=/onboarding/clinic`.

### 3. Value Props (Minimalist Grid)
- Three column grid highlighting:
  - **Instant Booking:** Zero-friction patient experience.
  - **Zero Double-Bookings:** Real-time scheduling engine.
  - **Premium Presence:** Branded clinical landing pages.

### 4. SEO & Metadata
- Next.js Metadata API in `app/page.tsx`.
- JSON-LD `MedicalOrganization` and `WebSite` schema.
- Robust OpenGraph and Twitter card tags.

## Technical Requirements
- **Strict Typing:** No `any`.
- **Zero DB Queries:** Static-first or client-side navigation only to maximize TTFB.
- **Performance:** 95+ Lighthouse score for Performance and SEO.

## Verification Plan
1. **Routing:** `/` shows marketing site, `/search` shows marketplace map.
2. **Search:** Hero search bar correctly redirects with query parameters.
3. **Responsive:** Mobile-first layout with clean stacking.
4. **Build:** `npm run build` completes without errors.
