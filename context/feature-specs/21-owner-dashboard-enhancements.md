# 21 - Clinic Owner Dashboard (Command Center)

## Goal
Transform the existing dashboard into a high-performance "Command Center" for Clinic Owners. This involves finalizing the missing navigation modules (Patients, Advanced Schedule), refining the Sidebar routing logic to ensure seamless multi-tenant navigation, and enhancing the Overview page with operational KPIs and real-time activity tracking.

## Domain Context & Boundaries
- **Actors**: Primarily `org:admin` (Clinic Owner). Some views (Schedule, Patients) are also accessible to `org:dentist` and `org:receptionist`.
- **Tenant Context**: All data must be strictly isolated by `tenant_id` (Clerk Organization ID), matching the `[tenantSlug]` in the URL.
- **Functionality**: The dashboard acts as the operational hub for daily clinic activity, staff coordination, and patient relationship management.

## Architectural Decisions (/backend-architect)
1. **Routing Strategy**: 
   - Standardize all owner routes under `app/(dashboard)/[tenantSlug]/`.
   - Ensure the Sidebar uses the `tenantSlug` from the URL to maintain persistent context, falling back to Clerk's `orgId` if necessary.
2. **Data Aggregation**:
   - **KPIs**: Efficiently aggregate daily stats (Total Bookings, Checked-In, No-Shows) from the `appointments` table.
   - **Patient List**: Implement a query that returns unique patients who have at least one appointment with the tenant, including their "Last Visit" and "Total Appointments" counts.
3. **Advanced Scheduling**: 
   - Support day, week, and month views.
   - Leverage the existing slot-generation logic but optimized for a broader time range.
4. **Strict Typing**: The `any` type is strictly forbidden. All new dashboard data fetches must use explicit Zod schemas or Drizzle-inferred types.

## UI/UX Design (/frontend-developer)
1. **Command Center Aesthetics**:
   - **Hero Section**: Refine the "Welcome Back" header with a more editorial layout (`Playfair Display` header with `Outfit` sub-text).
   - **KPI Cards**: Use minimal, borderless cards with soft shadows.
   - **Activity Feed**: A vertical timeline showing recent `audit_logs` (e.g., "New booking by Jane Doe", "Appointment checked in").
   - **Quick Actions Bar**: A prominent "Operations Bar" featuring shortcuts: `+ Add Branch`, `+ Add Service`, `+ Invite Staff`, and `✨ Update Branding`.
2. **Management Section Unification**:
   - **Standardized Layouts**: Ensure `Settings` and `Branding` pages use the same typography (`Playfair Display` for page titles) and custom-styled `Tabs` (borderless, typography-driven active states).
   - **Deep Linking**: Support `?tab=` parameters in the URL to allow Quick Actions to open the correct settings tab directly.
3. **Sidebar Enhancements**:
   - Fix the active state logic to handle nested routes (e.g., `/settings` should highlight the "Settings" sidebar item).
   - Ensure a smooth transition between "Patient" view and "Staff/Owner" view if a user has dual roles.
4. **Patient Directory**:
   - A clean, searchable table using shadcn/ui `Table` with pagination.
   - Quick-action buttons for "Book Appointment" or "View Records".
4. **Interactive Schedule**:
   - A responsive calendar component (building on shadcn/ui `Calendar` or a custom CSS Grid implementation) that allows staff to quickly see the week's load.

## Implementation Plan (/plan-writing)

### Phase 1: Sidebar & Routing Fixes
- **Task 1**: Update `components/layout/Sidebar.tsx` to correctly handle `tenantSlug` from the URL and fix the active state logic for sub-routes. → Verify: Sidebar correctly highlights current section across all dashboard sub-pages.
- **Task 2**: Implement a redirect from `app/(dashboard)/[tenantSlug]/page.tsx` to `overview` or merge them to ensure a consistent entry point. → Verify: Navigating to `/[tenantSlug]` lands on the Overview.

### Phase 2: Missing Modules (Patients & Schedule)
- **Task 3**: Create the Patient Directory (`app/(dashboard)/[tenantSlug]/patients/page.tsx`). Implement the backend query to aggregate unique patients for the tenant. → Verify: Table displays all patients who have booked with the clinic.
- **Task 4**: Create the Advanced Schedule view (`app/(dashboard)/[tenantSlug]/schedule/page.tsx`). Implement a multi-day calendar interface. → Verify: Staff can view appointments for the entire week.

### Phase 3: Command Center Enhancements
- **Task 5**: Build the KPI Snapshot and Activity Feed on the Overview page. → Verify: Dashboard displays real-time stats and recent audit logs.
- **Task 6**: Integrate "Quick Actions" (e.g., "New Walk-in", "Add Service") into the Overview for faster operations. → Verify: Actions trigger correct dialogs/flows.

## Done When
- [ ] The Sidebar is fully functional, correctly highlighted, and multi-tenant aware.
- [ ] The "Command Center" (Overview) provides a clear operational summary (KPIs + Activity).
- [ ] The Patient Directory and Advanced Schedule modules are fully implemented.
- [ ] All data is strictly tenant-isolated and end-to-end typed without using `any`.
- [ ] `npm run build` succeeds with zero TypeScript or lint errors.
