# 09 - Analytics Dashboard (MVP)

## Goal
Implement an MVP-level Analytics Dashboard for Clinic Owners and branch managers. The dashboard will provide actionable insights into daily bookings, peak operating hours, no-show rates, and staff utilization, enabling data-driven operational decisions.

## Domain Context & Boundaries
- **Metrics Required**:
  1. **Daily Bookings**: Total number of appointments scheduled per day.
  2. **Peak Hours**: Identification of the busiest time slots based on historical booking data.
  3. **No-Show Rates**: Percentage of appointments transitioned to the `no_show` status.
  4. **Staff Utilization**: Ratio of booked time versus available hours for Dentists.
- **Tenant Isolation**: All analytical queries must strictly filter by `tenant_id` ensuring owners only see their clinic's aggregated data.
- **Data Sources**: The metrics will be derived directly from the `appointments`, `staff`, and `audit_logs` tables.

## Architectural Decisions
1. **Query Strategy**: For the MVP, rely on optimized PostgreSQL aggregation queries (e.g., `COUNT()`, `GROUP BY`, `AVG()`) executed via Drizzle ORM rather than deploying a separate OLAP database or complex ETL pipelines.
2. **Strict Typing**: The use of the `any` type is strictly forbidden. The exact shape of the analytics data must be defined via Zod schemas and Drizzle's inferred query types to ensure end-to-end type safety from the database to the UI charts.
3. **Caching & Performance**: To prevent heavy aggregation queries from degrading transactional database performance, wrap the server-side data fetching functions in React's `cache()` or use standard Next.js route caching (`revalidate` intervals) for the analytics endpoint.
4. **API Design**:
   - `GET /api/analytics/overview?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`: Returns a strictly typed JSON payload containing the aggregated KPIs and time-series data for the requested date range.
5. **UI Visualization**: Utilize `recharts` (standard with many shadcn/ui dashboard templates) to render accessible and responsive charts for the analytics data.

## Tasks
- [ ] Task 1: Implement the core analytics query functions in `lib/analytics/queries.ts` using Drizzle ORM to calculate bookings, no-shows, peak hours, and utilization. → Verify: Queries correctly filter by `tenant_id` and return expected shapes.
- [ ] Task 2: Create strict Zod schemas for the analytics API responses to define the exact shape of the returned metrics. → Verify: Schemas exist in `types/api.ts` or `lib/validations.ts`.
- [ ] Task 3: Develop the `GET /api/analytics/overview` endpoint with RBAC protection (ensure only `org:admin` can access the full clinic overview) and caching strategies. → Verify: Endpoint returns 200 OK with valid data and 401/403 for unauthorized users.
- [ ] Task 4: Build the Analytics Dashboard UI (`app/(dashboard)/[tenantId]/analytics/page.tsx` and `components/dashboard/AnalyticsOverview.tsx`) featuring KPI metric cards and Recharts visualizations. → Verify: The UI accurately reflects the database state.
- [ ] Task 5: Run a full type check. → Verify: `npm run build` succeeds with zero type errors and no instances of `any` in the analytics module.

## Done When
- [ ] The backend accurately aggregates and returns the four core MVP metrics.
- [ ] Clinic owners can view their analytics dashboard with visual charts.
- [ ] Tenant data isolation is strictly maintained across all complex queries.
- [ ] End-to-end strict typing is implemented without using `any`.
- [ ] `npm run build` completes successfully.
