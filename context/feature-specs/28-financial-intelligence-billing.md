# 28 - Financial Intelligence & Billing (MVP)

## Goal
Provide Clinic Owners with a clear view of their revenue streams without building a full accounting suite. This includes service-based pricing, revenue reporting by branch, and a "Pending vs. Realized" income dashboard.

## Domain Context & Boundaries
- **Pricing**: Each `service` has a `base_price`.
- **Billing State**: For the MVP, we track "Expected Revenue" (Total value of booked appointments) vs. "Realized Revenue" (Total value of `completed` appointments).
- **Multi-Branch**: Revenue must be aggregatable at the clinic level and filterable by branch.

## Architectural Decisions (/backend-architect)
1. **Schema Enhancements**:
   - `services`: Add `price` (decimal).
   - `appointments`: Add `actual_price` (decimal, to allow for discounts or overrides at time of service).
2. **Financial Aggregators**:
   - Update `lib/analytics/queries.ts` to include `getRevenueAnalytics(tenantId, branchId, dateRange)`.
3. **Strict Typing**: Use `decimal` for currency (precision: 10, scale: 2). Ensure all Zod schemas enforce numeric types.

## UI/UX Design (/frontend-developer)
1. **Revenue Snapshot**:
   - Financial KPI cards on the Overview page: `Total Revenue`, `Avg. Revenue Per Appointment`, `Projected Income`.
   - Use subtle currency formatting with `Intl.NumberFormat`.
2. **Service Profitability Chart**:
   - A bar chart showing which services (e.g., Cleaning vs. Implants) generate the most revenue.

## Implementation Plan (/plan-writing)
- **Task 1**: Update `services` and `appointments` tables with pricing fields.
- **Task 2**: Implement the revenue aggregation queries in the analytics module.
- **Task 3**: Build the "Financials" tab in the Clinic Owner Dashboard.
- **Task 4**: Ensure all existing appointment completion flows allow for price adjustment.

## Done When
- [ ] Owners can set prices for services.
- [ ] The dashboard displays real-time and projected revenue.
- [ ] Revenue can be compared across branches.
- [ ] `npm run build` succeeds with zero type errors.
