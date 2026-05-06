# 17 - Marketing Landing Page

## Goal
Design and implement a high-converting, highly-performant marketing landing page that serves as the primary entry point for DentalHub. This page must cater to two distinct audiences (Patients and Clinic Owners), perfectly reflect the "High-End Clinical" aesthetic, and be heavily optimized for SEO and Core Web Vitals.

## Domain Context & Boundaries
- **Dual Funnel**: The page must clearly separate the calls-to-action (CTAs). 
  - Patients should be driven toward the Marketplace Search (Feature 15).
  - Clinic Owners should be driven toward the B2B Onboarding flow (Feature 16).
- **Public Accessibility**: This page is completely public. It does not require authentication and must not make heavy database queries that slow down Time to First Byte (TTFB).

## Architectural Decisions
1. **Routing Update**: The Marketing Landing Page will take over the root route (`app/page.tsx`). The interactive map from the Clinic Discovery Marketplace (Feature 15) should be moved to a dedicated search route (e.g., `app/search/page.tsx`).
2. **SEO Optimization**: Use Next.js Metadata API to inject robust Open Graph tags, Twitter cards, and structured JSON-LD schema (e.g., `MedicalOrganization` or `WebSite`) to ensure high visibility in search engines.
3. **Component Architecture**: 
   - **Hero Section**: A pristine, text-forward hero using the `Playfair Display` font. It should feature a location/service search bar that simply redirects the user to `/search?query=...`.
   - **Value Props**: Minimalist grid highlighting benefits for patients (Instant Booking) and clinics (Zero Double-Bookings).
   - **Provider CTA**: A dedicated footer/banner specifically for clinic owners linking to `/sign-up?redirect_url=/onboarding/clinic`.
4. **Strict Typing**: The `any` type remains forbidden. Any static content structures or search form inputs must be typed.

## Tasks
- [ ] Task 1: Update routing so `app/page.tsx` is the Marketing Landing Page, and move the Marketplace Map (if it was on the root) to `app/search/page.tsx`. → Verify: Navigating to `/` shows the marketing site, `/search` shows the map.
- [ ] Task 2: Implement the Next.js `generateMetadata` function in `layout.tsx` or `page.tsx` with dynamic, strict-typed SEO tags. → Verify: Meta tags render correctly in the document head.
- [ ] Task 3: Build the Hero section and search bar component. The search bar should not execute DB queries; it should act as a router push with URL parameters to the `/search` page. → Verify: Typing "London" and hitting enter pushes to `/search?location=London`.
- [ ] Task 4: Build the Provider CTA section ensuring the URL parameters securely route to the B2B onboarding flow. → Verify: Clicking "List your Clinic" navigates to the correct signup route.
- [ ] Task 5: Run a full type check. → Verify: `npm run build` completes successfully with zero instances of `any`.

## Done When
- [ ] The root URL serves a fast, SEO-optimized marketing page.
- [ ] The "High-End Clinical" design system is strictly adhered to.
- [ ] Patients can initiate a search that drops them into the Marketplace.
- [ ] Clinic Owners have a clear path to the Onboarding flow.
- [ ] End-to-end strict typing is implemented without using `any`.
- [ ] `npm run build` for verification completes without errors.
