# Clinic Discovery & Patient Booking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a Clinic Discovery Marketplace (Search + Leaflet Map) and a branded, multi-step booking wizard for patients.

**Architecture:** Split-screen discovery interface (Map + List) at `/`, followed by a tenant-scoped branded booking portal at `/[tenantSlug]/book`.

**Tech Stack:** Next.js 16, Leaflet, Clerk, Drizzle, Tailwind CSS.

---

### Task 1: Update Schema & Mock DB
**Files:**
- Modify: `lib/db/schema.ts` (Add lat/lng to branches)
- Modify: `lib/db/mock-db.ts` (Update branch data and add search logic)

- [ ] **Step 1: Add latitude/longitude to branches schema**
- [ ] **Step 2: Update mock data with coordinates**
- [ ] **Step 3: Implement `mockDb.searchClinics`**

### Task 2: Discovery API & Root Discovery Layout
**Files:**
- Create: `app/api/clinics/search/route.ts`
- Create: `app/(discovery)/layout.tsx`
- Create: `app/(discovery)/page.tsx`

- [ ] **Step 1: Implement search API with lat/lng/query filters**
- [ ] **Step 2: Create root layout with Discovery Header**
- [ ] **Step 3: Build Discovery Page container (Split Screen)**

### Task 3: Map & Listing Components
**Files:**
- Create: `components/discovery/DiscoveryMap.tsx`
- Create: `components/discovery/ClinicList.tsx`
- Create: `components/discovery/ClinicCard.tsx`

- [ ] **Step 1: Install Leaflet dependencies (`leaflet`, `react-leaflet`, `@types/leaflet`)**
- [ ] **Step 2: Build `DiscoveryMap` with custom markers**
- [ ] **Step 3: Build `ClinicList` and `ClinicCard`**

### Task 4: Tenant-Branded Booking Portal
**Files:**
- Modify: `app/(booking)/[tenantSlug]/layout.tsx` (Inject branding)
- Modify: `app/(booking)/[tenantSlug]/page.tsx` (Booking Wizard)

- [ ] **Step 1: Update Layout to handle branding CSS variables correctly**
- [ ] **Step 2: Build `BookingWizard` step container**
- [ ] **Step 3: Implement Steps 1-4 (Service, Branch, Time, Review)**

### Task 5: Branded Authentication & Success
**Files:**
- Create: `app/(booking)/[tenantSlug]/sign-in/page.tsx`
- Create: `app/(booking)/[tenantSlug]/success/[id]/page.tsx`

- [ ] **Step 1: Implement branded sign-in with Clerk theme injection**
- [ ] **Step 2: Create Success page with appointment summary**

### Task 6: Final Verification
- [ ] **Step 1: Run `npm run build` to check for type errors**
- [ ] **Step 2: Verify End-to-End flow from Search -> Map -> Select -> Book -> Confirm**
