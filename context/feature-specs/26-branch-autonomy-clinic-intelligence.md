# 26 - Branch Autonomy & Clinic-Wide Intelligence

## Goal
Formalize and enhance the "Local Autonomy vs. Global Intelligence" model. This feature empowers Clinic Owners to manage each branch as an independent operational engine while providing a unified, data-driven "Clinic Overview" that aggregates performance, enables comparative analysis, and suggests network-wide optimizations.

## Domain Context & Boundaries
- **Local Autonomy**: Each branch maintains its own schedule, staff roster, physical capacity (chairs), and operational overrides.
- **Global Intelligence**: The Clinic Dashboard aggregates data across all branches to provide a macro view of the business health.
- **Comparative Analysis**: Identifying high-performing vs. underperforming branches.
- **Optimization**: Using cross-branch data to suggest resource redistribution (e.g., moving staff to high-demand locations).

## Architectural Decisions (/backend-architect)
1. **Granular Analytics API**:
   - Update `getAnalyticsOverview` in `lib/analytics/queries.ts` to accept an optional `branchId`.
   - Implement `getComparativeAnalytics(tenantId)` to return KPI breakdowns per branch.
2. **Network Optimization Engine**:
   - Create `lib/analytics/optimization.ts` to identify utilization imbalances.
   - Logic: `if (branchA.utilization > 0.9 && branchB.utilization < 0.5) -> Suggest staff movement`.
3. **Service-Branch Mapping (Optional/Future)**:
   - For the MVP of this spec, services remain clinic-wide. Future iterations may add a `branch_services` join table for full autonomy.
4. **Strict Typing**: All aggregated and comparative payloads must use Zod schemas and Drizzle-inferred types. No `any` types permitted.

## UI/UX Design (/frontend-developer)
1. **Unified Dashboard Toggle**:
   - A prominent "Branch Filter" in the Dashboard header allowing the owner to switch between "All Branches" (Global) and specific locations (Local).
2. **Comparative Visualizations**:
   - Multi-line charts in `AnalyticsOverview.tsx` showing performance of different branches side-by-side.
   - "Branch Leaderboard" card highlighting top locations by booking volume or patient satisfaction.
3. **Intelligence Alerts**:
   - "System Recommendations" section on the Overview page (e.g., "Branch A is at capacity; consider opening more slots or moving staff from Branch B").
4. **Autonomous Settings**:
   - Ensure the Branch Management UI (`BranchManager.tsx`) feels like a complete "Command Center" for each location.

## Implementation Plan (/plan-writing)

### Phase 1: Analytics Refinement
- **Task 1**: Update `getAnalyticsOverview` to support an optional `branchId` filter. → Verify: Dashboard correctly filters metrics when a branch is selected.
- **Task 2**: Implement `getComparativeAnalytics` to fetch KPIs grouped by `branch_id`. → Verify: API returns a list of branches with their respective booking counts and utilization rates.

### Phase 2: Intelligence & Optimization
- **Task 3**: Create the `OptimizationEngine` to detect network imbalances. → Verify: Engine correctly identifies branches with significant utilization gaps.
- **Task 4**: Implement the "Comparative Analytics" UI with multi-series Recharts. → Verify: Owner can see a visual comparison of branch performance.

### Phase 3: Dashboard Unification
- **Task 5**: Integrate the "Branch Filter" into the main Dashboard layout. → Verify: All overview cards and charts react to the selected branch context.
- **Task 6**: Add the "Intelligence Insights" section to the Overview page. → Verify: Recommendations appear when specific utilization thresholds are met.

## Done When
- [ ] Clinic Owners can toggle between global and branch-specific analytics views.
- [ ] The dashboard provides visual comparisons between different branches.
- [ ] The system provides actionable intelligence based on cross-branch data.
- [ ] All data is strictly tenant-isolated and end-to-end typed.
- [ ] `npm run build` succeeds with zero TypeScript or lint errors.
