# 31 - Advanced Schedule Management & Approval Workflow

## Goal
Enhance the Clinic Owner's schedule module by introducing an approval workflow for new bookings, making appointment cards interactive for deeper insights, and improving multi-branch clarity to resolve confusion when viewing aggregated schedules.

## Domain Context & Boundaries
- **Approval Workflow**: A new transitional state where an appointment is booked but not yet `confirmed`. Owners or Receptionists must manually approve or reject it.
- **Interactive Schedule**: Appointment cards in the `DailySchedule` should serve as previews, with full details accessible via an interactive sidebar (Sheet).
- **Multi-Branch Visibility**: When an owner views the "Command Center" without a specific branch filter, appointments from all branches are aggregated. The UI must explicitly label which branch each appointment belongs to, explaining the "both branches at once" behavior.

## Architectural Decisions (/backend-architect)
1. **Schema Enhancements**:
   - Update `appointmentStatusEnum` in `lib/db/schema.ts` to include a new state: `pending_approval`.
2. **State Machine Updates**:
   - Modify `lib/appointments/state-machine.ts` to support `pending_approval`.
   - Valid transitions: `pending_approval` -> `confirmed`, `pending_approval` -> `cancelled`.
3. **Data Seeding**:
   - Update `lib/db/seed.ts` to generate mock data utilizing the `pending_approval` status.
   - Ensure the mock data explicitly demonstrates appointments occurring at different branches on the same day.
4. **Strict Typing**: All schema and status updates must enforce strict TypeScript types without using `any`.

## UI/UX Design (/frontend-developer)
1. **Clickable Appointment Cards**:
   - Wrap the appointment cards in `components/dashboard/DailySchedule.tsx` with a clickable trigger.
   - Clicking a card opens a `Sheet` (shadcn/ui) displaying the `AppointmentDetails`.
2. **Appointment Details Sheet**:
   - **Header**: Patient Name, Status Badge, Risk Score.
   - **Details**: Service requested, exact time, and explicitly the **Branch Name**.
   - **Actions**: "Approve", "Reject", "Add Note", "Check In", etc. (conditional based on the State Machine).
3. **Branch Labels**:
   - Add a subtle, elegant `Badge` or text label to the minimized appointment card in the `DailySchedule` view, explicitly stating the branch name. This immediately clarifies why multiple branches appear on the dashboard.
4. **Approval Workflow Actions**:
   - Prominent "Approve" (Surgical Sapphire) and "Reject" (Rose outline) buttons visible directly on the card or in the details sheet for `pending_approval` items.

## Implementation Plan (/plan-writing)

### Phase 1: Backend & State Machine
- **Task 1**: Update `appointmentStatusEnum` in `lib/db/schema.ts` to include `pending_approval`. Run database migrations if necessary (or update Drizzle schema logic).
- **Task 2**: Update `AppointmentStateMachine` in `lib/appointments/state-machine.ts` with the new allowed transitions.
- **Task 3**: Update the seed script (`lib/db/seed.ts`) to create at least one `pending_approval` appointment to facilitate testing.

### Phase 2: Frontend Schedule Enhancements
- **Task 4**: Modify the backend query in `app/manage/[tenantSlug]/overview/page.tsx` (or wherever `DailySchedule` is hydrated) to ensure it joins/includes the `branch` relation so the branch name is available.
- **Task 5**: Update `components/dashboard/DailySchedule.tsx` to display the branch name on each appointment card.
- **Task 6**: Implement the interactive `Sheet` in `DailySchedule.tsx` to display comprehensive appointment details when a card is clicked.

### Phase 3: Approval Actions
- **Task 7**: Add "Approve" (transitions to `confirmed`) and "Reject" (transitions to `cancelled`) buttons to the UI for appointments in the `pending_approval` state.
- **Task 8**: Connect these actions to the existing `PATCH /api/appointments/:id/status` endpoint.

## Done When
- [ ] New bookings can exist in a `pending_approval` state.
- [ ] Owners can approve or reject these pending bookings.
- [ ] Appointment cards in the schedule are clickable and reveal full details in a side panel.
- [ ] Branch names are clearly visible on appointments, resolving multi-branch confusion.
- [ ] `npm run build` succeeds with zero TypeScript or lint errors.
