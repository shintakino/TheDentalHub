# 36 - Realistic Owner Persona Seeding (The "Mega-Tenant" Dataset)

## Goal
Provide a comprehensive, high-fidelity seeding strategy that creates a "Mega-Tenant" environment for Clinic Owners. This dataset is designed to showcase the full operational complexity of The Dental Hub, including multi-branch friction, deep historical analytics, inventory management stress-tests, and realistic patient engagement patterns. This allows for rigorous testing of the "Command Center" (Feature 34) and "Intelligence" (Feature 26) modules.

## Domain Context & Boundaries
- **Persona**: The "Mega-Tenant" Owner who manages 6+ branches with high volume.
- **Data Fidelity**: Moving beyond simple mock records to data that has logical consistency (e.g., historical revenue correlates with service prices).
- **Stress-Testing**: Intentionally creating data scenarios that trigger alerts (Low Stock, Over-Capacity, No-Show High Risk).

## Architectural Decisions (/backend-architect)
1. **Time-Series Data Generation**:
   - Implement a loop in `lib/db/seed.ts` to generate 90 days of historical `appointments` and `revenue`.
   - Ensure a "Bell Curve" distribution for appointment density to simulate peak vs. off-peak hours correctly for the Heatmap.
2. **Scenario-Based Branch Provisioning**:
   - **Branch 1 (The Hub)**: High volume, perfect stock, full staff.
   - **Branch 2 (The Crisis)**: Active emergency override, cancelled appointments, zero inventory.
   - **Branch 3 (The Bottleneck)**: Near capacity, long waitlist, low staff-to-chair ratio.
   - **Branch 4 (The Growth)**: Active marketing campaign, high new patient ratio.
3. **Relational Consistency**:
   - Every `completed` appointment must have a corresponding `audit_log`, `loyalty_transaction`, and `revenue` entry.
   - 20% of completed appointments should have `clinical_notes` and `reviews`.
4. **Deterministic Randomness**:
   - Use a seedable random number generator or fixed logic to ensure the seed is predictable across different development environments.

## UI/UX Design (/frontend-developer)
1. **Dashboard Populated States**:
   - **Overview**: KPIs show realistic month-over-month growth (e.g., +12% Revenue).
   - **Analytics**: Charts show clear patterns (busy Mondays, quiet Fridays).
   - **Inventory**: The "Low Stock" widget shows active, prioritized alerts.
2. **Command Palette Integration**:
   - Ensure enough data exists (15+ staff, 6 branches, 10+ services) to make the Command Palette (Feature 34) useful and searchable.
3. **Intelligence Feed**:
   - Populate enough "Utilisation Gaps" to trigger the `OptimizationEngine` recommendations (e.g., "Move Staff from Branch B to Branch A").

## Implementation Plan (/plan-writing)

### Phase 1: Historical Data Engine
- **Task 1**: Refactor `lib/db/seed.ts` to include a historical data generator that iterates back 90 days. → Verify: Database contains ~1000+ historical appointments with consistent prices.
- **Task 2**: Implement a logic-gate to ensure appointments are correctly transitioned through the state machine (e.g., `confirmed` -> `checked_in` -> `completed`).

### Phase 2: Scenario Implementation
- **Task 3**: Provision 6 distinct branches with the "Mega-Tenant" profiles (Hub, Crisis, Bottleneck, Growth, etc.). → Verify: Dashboard shows diverse statuses (Green, Red, Amber) across branches.
- **Task 4**: Seed the **Marketing Module** with at least 3 campaigns (Active, Draft, Completed) and link them to 50+ appointments to show conversion analytics.

### Phase 3: Engagement & Operations
- **Task 5**: Generate a diverse **Patient Directory** (200+ profiles) with varying loyalty tiers and "High-Risk" no-show flags. → Verify: Predictive AI module (Feature 29) shows risk badges in the schedule.
- **Task 6**: Seed the **Waitlist** with 20+ entries across all branches to test the matching engine (Feature 20).

### Phase 4: Verification
- **Task 7**: Run a full build and performance test. → Verify: The populated dashboard loads in < 2 seconds.
- **Task 8**: Manually verify that "Quick Actions" and "Command Palette" return relevant results from the seeded data.

## Done When
- [ ] A single command `npm run db:seed` provisions a "Mega-Tenant" with 6+ branches and 90 days of history.
- [ ] Analytics charts show realistic, diverse operational patterns.
- [ ] Every functional module (Inventory, Marketing, Loyalty, Waitlist) is populated with "Actionable" data.
- [ ] Data maintains strict relational integrity and tenant isolation.
- [ ] `npm run build` succeeds with zero TypeScript or lint errors.
