# 22 - Multi-Branch Management

## Goal
Centralize the management of all physical branch locations under a single, unified interface for Clinic Owners. Instead of navigating between isolated branch settings, this feature provides a "Command Center" view for branches, allowing owners to monitor operational status, update operating hours, and manage geolocation data for all locations from one place.

## Domain Context & Boundaries
- **Multi-Tenancy**: Operations are strictly scoped to the `tenant_id`. An owner only sees branches belonging to their clinic.
- **Operational Data**: Each branch maintains its own `operating_hours`, `timezone`, and `geolocation` (latitude/longitude), which are critical for the Scheduling Engine (Feature 05) and Marketplace Discovery (Feature 15).
- **Consolidation**: The goal is to reduce cognitive load by presenting branches as a unified list with inline editing or quick-action modals, rather than deep-nested pages.

## Architectural Decisions (/backend-architect)
1. **API Optimization**: 
   - `GET /api/clinics/:id/branches`: Optimized to return all branches for a tenant with their core settings in a single round-trip.
   - `PATCH /api/branches/:branchId`: Granular updates for specific branch fields (e.g., toggling a branch as "Active/Inactive").
2. **Geocoding Service**: Reuse or refine the geocoding logic (from Feature 10) to ensure every branch has valid coordinates for the marketplace map.
3. **Strict Typing**: The `any` type is strictly forbidden. All branch-related payloads and responses must use Zod schemas and Drizzle-inferred types.
4. **Data Integrity**: Ensure that changes to branch settings (especially operating hours or timezones) do not orphan existing appointments or cause timezone shifts in historical data.

## UI/UX Design (/frontend-developer)
1. **Unified Branch Overview**:
   - **Visuals**: A clean, borderless `Table` or a `Grid` of `Card` components representing each branch.
   - **Aesthetics**: High-End Clinical style. Use `Playfair Display` for branch names and `Outfit` for addresses and metadata.
   - **Status Indicators**: Use `Badge` components (e.g., "Open Now", "Closed", "Inactive") to show real-time operational status.
2. **Inline & Modal Management**:
   - **Quick Edit**: Use a `Sheet` or `Dialog` for updating a branch's operating hours without leaving the main list.
   - **Map Preview**: Integrate a mini Leaflet map in the branch creation/edit flow to visually confirm the geocoded location.
3. **Operational Shortcuts**:
   - "Copy Hours from Branch": A utility to quickly sync operating hours across multiple locations.
   - "View Schedule": A direct link from the branch card to that specific branch's view in the Advanced Schedule (Feature 21).

## Implementation Plan (/plan-writing)

### Phase 1: Enhanced Branch API & Queries
- **Task 1**: Refine `lib/admin/queries.ts` to include optimized branch fetching and aggregation logic. → Verify: Query returns all branches for the tenant with full metadata.
- **Task 2**: Implement the `PATCH /api/branches/:branchId` endpoint with strict validation and RBAC (`org:admin` only). → Verify: Only owners can update branch details.

### Phase 2: Multi-Branch Management UI
- **Task 3**: Build the `BranchManagement` component (`components/dashboard/BranchManager.tsx`) using shadcn/ui `Table` and `Card`. → Verify: UI renders all branches correctly.
- **Task 4**: Create the "Branch Settings" Dialog/Sheet for editing operating hours and location details. → Verify: Updates are saved correctly to the database and reflected in the UI.
- **Task 5**: Integrate the "Copy Hours" utility for rapid branch configuration. → Verify: Hours can be synced between branches.

### Phase 3: Integration & Validation
- **Task 6**: Add a "Branches" tab to the Clinic Settings page or a dedicated "Manage Branches" link in the Quick Actions bar (Feature 21). → Verify: Navigation is seamless and intuitive.
- **Task 7**: Run a full type check. → Verify: `npm run build` completes successfully with zero instances of `any`.

## Done When
- [ ] Clinic Owners can view and manage all branches from a single, unified interface.
- [ ] Operating hours, timezones, and geolocation can be updated with instant validation.
- [ ] The "High-End Clinical" aesthetic is maintained across all branch management components.
- [ ] All operations are strictly tenant-isolated and end-to-end typed.
- [ ] `npm run build` for verification completes without errors.
