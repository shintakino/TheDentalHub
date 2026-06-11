# 39 - Dedicated Branch Workspaces (Path-Based Context)

## Goal
Transition the clinic operating system's branch management from a fragile query-parameter filtering system (`?branchId=...`) to a robust, path-based routing architecture (`/manage/[tenantSlug]/[branchSlug]/...`). This empowers owners to enter a fully isolated, dedicated workspace for a specific physical location, rather than applying superficial filters to a global dashboard.

## In-Depth Review: Why the Current System "Doesn't Do Anything"
Currently, the branch switcher utilizes `router.push("?branchId=xyz")`. While this works theoretically, it fails in practice due to several architectural friction points:
1. **State Persistence Failures (Context Loss)**: If a user selects a branch, then clicks a notification or a hardcoded link that doesn't explicitly forward the `searchParams`, the branch context is instantly lost.
2. **Shallow Rendering Glitches**: Client-side components relying on `useSearchParams()` sometimes fail to trigger deep data refetches via SWR if the Next.js cache intercepts the shallow navigation, leaving the UI visually unchanged.
3. **Mental Model Misalignment**: A clinic owner views a branch as a physical entity. Using a query parameter implies a temporary filter (like sorting a table), whereas a URL path implies a concrete destination (e.g., "I am now inside the Downtown Clinic").

## Architectural Decisions (/backend-architect)
1. **Path-Based Routing**:
   - **HQ View (Network Level)**: `/manage/[tenantSlug]/overview` (Global metrics, network analytics).
   - **Branch View (Local Level)**: `/manage/[tenantSlug]/branch/[branchSlug]/overview` (Isolated metrics, local schedule, local inventory).
2. **Database Enhancement**:
   - The `branches` table requires a new `slug` column (e.g., `downtown-seattle`) to enable clean URLs instead of relying on UUIDs in the path.
3. **Centralized Context Validation**:
   - A dedicated layout (`app/manage/[tenantSlug]/branch/[branchSlug]/layout.tsx`) will validate the branch, fetch its internal UUID, and inject it into a server context or React Context. This eliminates the need for every individual page to parse and validate `branchId` from the URL.

## UI/UX Design (/frontend-developer)
1. **Workspace Context Switching**:
   - The `BranchSwitcher.tsx` will be refactored to perform true navigation to the branch's base URL. 
   - A distinct visual difference between "HQ View" (Network) and "Branch View" (Local). For example, the Sidebar header might change from "The Dental Hub (Network)" to "The Dental Hub - Downtown".
2. **Simplified Navigation**:
   - `Sidebar.tsx` will no longer need complex, error-prone logic to manually append `&branchId=...` to every link. It will natively inherit the current path segment.

## Implementation Plan (/plan-writing)

### Phase 1: Database & Seed Updates
- **Task 1**: Update `lib/db/schema.ts` to add a `slug` column to the `branches` table (unique per tenant).
- **Task 2**: Generate and push the Drizzle migration.
- **Task 3**: Update `lib/db/seed.ts` to generate URL-safe slugs for all seeded branches.

### Phase 2: Route Restructuring
- **Task 4**: Create the new nested route group: `app/manage/[tenantSlug]/branch/[branchSlug]/`.
- **Task 5**: Move branch-specific modules (e.g., `schedule`, `inventory`) into the new branch routing group.
- **Task 6**: Create a dedicated `layout.tsx` for the branch route that validates the slug and fetches the internal `branchId`.

### Phase 3: Component Refactoring
- **Task 7**: Update `BranchSwitcher.tsx` to construct path-based URLs (e.g., `/manage/acme/branch/downtown/overview`) instead of updating `searchParams`.
- **Task 8**: Refactor `PatientDirectory`, `InventoryManager`, and `WaitlistManager` to accept `branchId` directly via props (passed down from the layout/page) rather than reading it from the query string.

### Phase 4: Cleanup
- **Task 9**: Remove the legacy `?branchId=` propagation logic from `components/layout/Sidebar.tsx`.
- **Task 10**: Verify global fallback redirects (e.g., if a user tries to access a branch they don't have permission for, redirect to HQ overview).

## Done When
- [ ] Branches are accessed via clean URLs (`/[tenantSlug]/branch/[branchSlug]`).
- [ ] Switching branches guarantees a complete UI context update with zero data bleeding.
- [ ] `searchParams` are no longer used for core branch context management.
- [ ] The `branches` database table successfully uses unique slugs.
