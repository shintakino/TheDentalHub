# Analytics Dashboard (MVP) Design Spec

## Goal
Implement a data-driven Analytics Dashboard for Clinic Owners to monitor operational efficiency and booking trends.

## Data Model Updates
We will extend the existing schema to support precise metrics:

### `branches` Table
- `operatingHoursStart`: `text` (e.g., "09:00")
- `operatingHoursEnd`: `text` (e.g., "17:00")
- `timezone`: `text` (default: "UTC")

### `staff` Table
- `targetDailyHours`: `integer` (default: 8)

## Core Metrics & Query Logic
All queries will strictly filter by `tenant_id` and the provided date range.

1.  **Daily Bookings**:
    - Query: `COUNT` appointments grouped by day.
    - Scope: All statuses except `cancelled`.
2.  **Peak Operating Hours**:
    - Query: `COUNT` appointments grouped by `EXTRACT(HOUR FROM start_time)`.
    - Filter: Only hours within `operatingHoursStart` and `operatingHoursEnd`.
3.  **No-Show Rate**:
    - Query: `(Count of status='no_show') / (Total Appointments)`.
4.  **Staff Utilization**:
    - Numerator: Sum of durations (end - start) for `confirmed` and `completed` appointments.
    - Denominator: `Count of Staff * targetDailyHours * 60` (minutes).

## API Endpoint
`GET /api/analytics/overview`
- **Auth**: Clerk `org:admin` only.
- **Parameters**: `startDate`, `endDate` (YYYY-MM-DD).
- **Validation**: Zod schema for params and response.
- **Caching**: 5-minute revalidation interval.

## UI Components
- **Dashboard Layout**: Grid of 4 KPI cards followed by larger chart sections.
- **Charts**:
    - `LineChart`: Booking trends over time.
    - `BarChart`: Volume by hour of day.
- **Controls**: Date range picker (Default: 30 days).

## Success Criteria
- [ ] No `any` types in the analytics module.
- [ ] Queries are optimized and tenant-isolated.
- [ ] UI is responsive and follows the Playfair Display / Outfit typography system.
- [ ] `npm run build` passes.
