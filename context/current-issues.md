# Current Issues & Bug Tracker

## Issue 1: Unreachable Clinic Discovery Map (Marketplace)
**Status:** Resolved
**Severity:** High (Blocks Patient Booking Flow)

### Description
When users (especially Patients) log into the platform, `proxy.ts` automatically redirects them to their respective dashboards (e.g., `/patient/dashboard`). However, once they are inside the dashboard, there is no UI mechanism (navigation link or CTA) to reach the Clinic Discovery Map located at `/search`. This means patients are trapped in their dashboard and cannot easily initiate a new booking.

### What We Missed in the Specs
- **Navigation Update:** In `15-clinic-discovery-marketplace.md`, we built the `/search` route but we did not explicitly specify updating `Sidebar.tsx` or `Navbar.tsx` to include a global "Find a Clinic" or "Marketplace" link.
- **Patient Dashboard CTAs:** We did not add an "Explore Clinics" button on the empty state of the Patient Dashboard.

### Required Fixes
1. **Update `components/layout/Sidebar.tsx` (Conditional Rendering):** 
   Add a new navigation item for the Marketplace that points to `/search`. 
   *For Patients (no orgId):* It should be a primary navigation item ("Find a Clinic").
   *For Clinic Staff/Owners (has orgId):* It can either be omitted to keep the dashboard focused on B2B operations, or added as a secondary "View Marketplace" link at the bottom so they can see their public listing.
2. **Update Patient Dashboard:** 
   Ensure the main dashboard for patients has a clear "Book New Appointment" button that routes to `/search`.
3. **Verify Proxy Access:** 
   Ensure `proxy.ts` allows authenticated users to access `/search` without being redirected away. (Currently `/api/marketplace/search` is public, but we need to ensure the page `/search` is accessible to everyone).

## Issue 2: Booking Failure due to Mock Data Inconsistency
**Status:** Resolved
**Severity:** Critical (Blocks Patient Booking Flow)

### Description
The Patient Booking Flow (`app/(booking)/[tenantSlug]`) and the Slots API (`app/api/branches/[branchId]/slots`) were using `mockDb` with hardcoded string IDs (e.g., 'branch-1', 's1'). However, the actual booking endpoint (`app/api/appointments/book`) used the real database (`db`) and expected valid UUIDs. This mismatch caused Zod validation errors and "Branch not found" errors when attempting to finalize a booking.

### Root Cause
Incomplete migration from `mockDb` to the real Drizzle-managed database after Feature 06 (Supabase Setup & Seeding) was implemented.

### Required Fixes
1. [x] **Migrate Booking Layout & Page:** Updated `app/(booking)/[tenantSlug]/layout.tsx` and `page.tsx` to fetch clinic, branch, and service data from the real database.
2. [x] **Migrate Slots API:** Updated `app/api/branches/[branchId]/slots/route.ts` to use `db` and Drizzle queries.
3. [x] **Migrate Success Page:** Updated `app/(booking)/[tenantSlug]/success/[id]/page.tsx` to use `db`.
4. [x] **Update Search API:** Updated `app/api/clinics/search/route.ts` to use the real database.
5. [x] **Migrate Sign-in Page:** Updated `app/(booking)/[tenantSlug]/sign-in/page.tsx` to use the real database.
