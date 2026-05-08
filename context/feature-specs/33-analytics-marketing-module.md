# 33 - Analytics Marketing & Intelligence Module

## Goal
Enhance the Clinic Owner's analytics capabilities by introducing a "Marketing Campaigns" module to drive patient acquisition and fixing intelligence visualization issues. This feature allows owners to create, track, and analyze the performance of bespoke marketing campaigns (e.g., "Summer Whitening Special") while ensuring the intelligence heatmap provides clear, human-readable insights.

## Domain Context & Boundaries
- **Marketing Campaigns**: Time-bound initiatives offering specific services or discounts. 
- **Tracking**: Appointments can be linked to a campaign via a unique tracking code or manual selection by staff.
- **Intelligence Fix**: The current heatmap displays cryptic branch IDs; this must be corrected to show the human-readable branch name.
- **Tenant Isolation**: Campaigns and their analytics are strictly scoped to the `tenant_id`.

## Architectural Decisions (/backend-architect)
1. **Schema Enhancements**:
   - `campaigns`:
     - `id`: UUID (Primary Key)
     - `tenant_id`: References `clinics.tenant_id`
     - `name`: Text
     - `description`: Text
     - `start_date`: Timestamp
     - `end_date`: Timestamp
     - `status`: Enum (`draft`, `active`, `completed`, `cancelled`)
     - `discount_type`: Enum (`percentage`, `fixed_amount`, `none`)
     - `discount_value`: Decimal
     - `service_id`: References `services.id` (Optional target)
     - `tracking_code`: Text (Unique per tenant, used in booking URLs)
   - `appointments`: Add `campaign_id` (References `campaigns.id`) to track conversion.
2. **Heatmap Query Optimization**:
   - Update `getNetworkHeatmap` in `lib/analytics/queries.ts` to include `branches.name` in the selection and ensure the frontend component (`NetworkHeatmap.tsx`) consumes it.
3. **Campaign Performance API**:
   - `GET /api/clinics/:id/campaigns/:campaignId/stats`: Aggregates:
     - Total bookings via campaign.
     - Revenue generated (using `appointments.actual_price`).
     - Conversion rate (if we track clicks/views in `campaign_logs`).
4. **Strict Typing**: No `any` types. All campaign payloads and aggregated stats must be strictly typed using Zod and Drizzle.

## UI/UX Design (/frontend-developer)
1. **Marketing Campaign Manager**:
   - **Visuals**: A new "Marketing" tab or page in the dashboard (`app/manage/[tenantSlug]/marketing`).
   - **Campaign Cards**: High-End Clinical cards showing campaign status, target service, and a "Copy Booking Link" button.
   - **Creation Wizard**: A pristine multi-step dialog to define campaign name, dates, target service, and discount.
2. **Heatmap Fix**:
   - Replace "Branch [ID]" labels in `NetworkHeatmap.tsx` with the actual `branch.name`.
   - Ensure the tooltip also reflects the full branch name and utilization stats.
3. **Campaign Integration in Overview**:
   - Add a "Campaign Performance" widget to the main Analytics Overview showing top-performing active campaigns.
4. **Aesthetics**:
   - Maintain the "Alabaster" and "Pure White" theme.
   - Use `Surgical Sapphire` for "Active" status and `Slate` for "Completed".

## Implementation Plan (/plan-writing)

### Phase 1: Data Layer & Heatmap Fix
- **Task 1**: Update `lib/db/schema.ts` with the `campaigns` table and `campaign_id` foreign key on `appointments`. → Verify: `npm run db:push` succeeds.
- **Task 2**: Modify `getNetworkHeatmap` query in `lib/analytics/queries.ts` to select `branches.name`. → Verify: API returns branch names.
- **Task 3**: Update `NetworkHeatmap.tsx` to display branch names instead of IDs. → Verify: Dashboard shows human-readable labels.

### Phase 2: Campaign Management API
- **Task 4**: Implement CRUD API endpoints for Campaigns with strict Zod validation. → Verify: Owner can create a campaign via API.
- **Task 5**: Implement the Campaign Stats query to aggregate bookings and revenue. → Verify: Stats accurately reflect appointments linked to the campaign.

### Phase 3: Marketing Dashboard UI
- **Task 6**: Build the `CampaignManager` UI in `app/manage/[tenantSlug]/marketing/page.tsx`. → Verify: Campaigns are listed with their status and key metrics.
- **Task 7**: Implement the "Create Campaign" Dialog with service selection and date range picker. → Verify: Form correctly saves new campaigns.

### Phase 4: Tracking & Conversion
- **Task 8**: Update the Patient Booking Flow (Feature 11) to accept a `campaign` query parameter and link the appointment to the campaign. → Verify: Booking with `?c=PROMO123` correctly sets the `campaign_id` in the database.
- **Task 9**: Add campaign-specific KPIs (e.g., "Revenue from Campaigns") to the Financial Overview. → Verify: Financials correctly attribute revenue to marketing efforts.

## Done When
- [ ] Clinic Owners can create and manage marketing campaigns for specific services.
- [ ] The Network Heatmap correctly displays branch names instead of IDs.
- [ ] Appointments booked via campaign links are correctly tracked and analyzed.
- [ ] The "High-End Clinical" aesthetic is applied to all marketing management components.
- [ ] `npm run build` succeeds with zero TypeScript or lint errors.
