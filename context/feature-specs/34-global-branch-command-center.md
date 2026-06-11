# 34 - Branch Command Center & Global Navigation Optimization

## Goal
Solve "Navigation Fatigue" and "Context Fragmentation" for Clinic Owners managing multiple physical locations. As clinics scale to 5+ branches, a standard dropdown selector becomes insufficient. This module introduces a high-performance **Global Command Center (Cmd+K)** and an enhanced **Unified Branch Navigator** that provides instant switching, real-time health indicators, and persistent branch context across all dashboard modules.

## Domain Context & Boundaries
- **Navigation Fatigue**: The cognitive load and time required to switch between branch contexts using traditional UI menus.
- **Context Fragmentation**: Losing the "active branch" when navigating between different functional modules (e.g., from Schedule to Inventory).
- **Global Search**: The ability to search for branches, staff, or specific pages from any context.

## Architectural Decisions (/backend-architect)
1. **Search Indexing**:
   - Implement a lightweight, server-side search utility `lib/admin/search.ts` that aggregates:
     - Branch names and addresses.
     - Key Management pages (e.g., "Branch A Settings", "Global Analytics").
     - Staff names linked to specific branches.
2. **Context Persistence Engine**:
   - Update the `BranchFilter` and `Sidebar` logic to utilize a "Sticky Branch Context" stored in a client-side state or synchronized with URL parameters across ALL navigation links.
3. **Branch Health API**:
   - Create `GET /api/clinics/:id/branches/status`: A high-performance endpoint returning a summary status for all branches (e.g., `active_appointments`, `emergency_overrides`, `low_stock_alerts`).
4. **Strict Typing**: All search results and health statuses must use Zod schemas. No `any` types.

## UI/UX Design (/frontend-developer)
1. **Global Command Palette (Cmd+K)**:
   - **Visuals**: A pristine, floating overlay (`Dialog`) with a blurred background. 
   - **Aesthetics**: High-End Clinical. Large `Outfit` typography, `Surgical Sapphire` highlight states, and minimal icons.
   - **Functionality**: Instantly jump to any branch or module. "Branch A Schedule", "Branch B Inventory", "Staff Roster".
2. **Enhanced Unified Navigator**:
   - Replace the simple `BranchFilter` Select with a more comprehensive **Branch Switcher**.
   - **Visuals**: Clicking the branch name in the Navbar opens a list of branches with "Status Badges" (e.g., 🟢 Open, 🔴 Emergency, 🟠 Near Capacity).
   - **Quick Actions**: Hovering over a branch in the switcher shows quick-links: `Schedule`, `Settings`, `Staff`.
3. **Persistent Context Indicator**:
   - Add a subtle, elegant "Active Context" indicator at the bottom of the Sidebar or in the Navbar that explicitly states: "Currently managing: **Branch Name**".
4. **Motion Philosophy**:
   - Palette appearance should be instantaneous (<100ms).
   - Results should filter as the user types with zero perceived lag.

## Implementation Plan (/plan-writing)

### Phase 1: Search & Health Backend
- **Task 1**: Implement the `lib/admin/search.ts` utility to provide a unified search interface for branches and modules. → Verify: Search returns correct, typed results for a tenant.
- **Task 2**: Create the `GET /api/clinics/:id/branches/status` endpoint to aggregate real-time alerts and activity across branches. → Verify: API returns health flags (emergencies, capacity) for all locations.

### Phase 2: Command Palette UI
- **Task 3**: Build the `CommandPalette` component using `cmdk` or shadcn/ui `Command`. → Verify: Overlay opens with Cmd+K and displays branches.
- **Task 4**: Integrate the "Jump to" logic, ensuring navigation preserves the `branchId` search parameter where appropriate. → Verify: Searching "Branch A Schedule" takes the user to `/[tenantSlug]/schedule?branchId=A`.

### Phase 3: Global Navigation Refinement
- **Task 5**: Update the `Navbar` to include the enhanced **Branch Switcher** with health indicators. → Verify: Switcher displays real-time branch status (Open/Emergency).
- **Task 6**: Implement "Sticky Branch Context" in `components/layout/Sidebar.tsx` ensuring all sidebar links include the current `branchId` if selected. → Verify: Navigating from Schedule to Inventory maintains the active branch filter.

### Phase 4: Validation & Polish
- **Task 7**: Run a full type check. → Verify: `npm run build` succeeds with zero instances of `any`.
- **Task 8**: Conduct a "Navigation Stress Test" with 10+ mock branches. → Verify: Switching remains fast and the owner does not lose context.

## Done When
- [ ] The Command Palette (Cmd+K) allows instant navigation across all branches and modules.
- [ ] The Branch Switcher provides real-time health/status indicators for every location.
- [ ] Navigation context (the active branch) is preserved seamlessly across different pages.
- [ ] The "High-End Clinical" aesthetic is maintained with high-performance interactions.
- [ ] End-to-end strict typing is implemented without using `any`.
- [ ] `npm run build` for verification completes without errors.
