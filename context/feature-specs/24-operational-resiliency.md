# 24 - Operational Resiliency & Monitoring

## Goal
Provide Clinic Owners with the tools to handle real-world disruptions (maintenance, emergencies, holidays) and monitor physical clinic activity in real-time across all locations.

## Domain Context & Boundaries
- **Overrides**: Temporary departures from standard operating hours.
- **Monitoring**: Live data on physical occupancy (patients currently in the building).
- **Scope**: Applied at the Branch level to allow granular control.

## Architectural Decisions (/backend-architect)
1. **Schema Enhancements**:
   - `branch_overrides`:
     - `id`: UUID
     - `branch_id`: References `branches.id`
     - `start_date`: Timestamp
     - `end_date`: Timestamp
     - `reason`: Text (e.g., "Public Holiday", "Plumbing Emergency")
     - `is_closed`: Boolean
2. **Real-time Occupancy API**:
   - Create a lightweight view/query that aggregates `appointments` where `status` is `checked_in` or `in_progress`.
3. **Event Integration**: Overrides must automatically trigger the Cancellation/Rescheduling flow (Feature 13) for impacted appointments.

## UI/UX Design (/frontend-developer)
1. **Live Pulse Dashboard**:
   - High-End Clinical cards for each branch showing: `[Patients In]` / `[Capacity]`.
   - Subtle "Heartbeat" animation for active clinics.
2. **Override Calendar**:
   - A simple calendar view where owners can click and drag to "Blackout" time for a specific branch.
   - Elegant "Emergency Close" button for instant blackouts.

## Implementation Plan (/plan-writing)
- **Task 1**: Implement the `branch_overrides` table and CRUD API.
- **Task 2**: Update the Scheduling Engine to subtract override periods from available slots.
- **Task 3**: Create the "Live Pulse" monitoring component with SWR real-time polling.
- **Task 4**: Build the "Blackout" management UI in the Branch Command Center.

## Done When
- [ ] Owners can close a branch for specific dates without changing the global schedule.
- [ ] Existing appointments in an override period are flagged for rescheduling.
- [ ] The dashboard shows real-time physical occupancy for all branches.
- [ ] `npm run build` succeeds with zero type errors.
