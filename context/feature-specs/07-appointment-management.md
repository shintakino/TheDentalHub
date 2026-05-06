# 07 - Appointment Management & Lifecycle

## Goal
Design the Appointment Management system to handle the full lifecycle of an appointment. This includes allowing clinic staff to update statuses, add clinical notes, and view daily schedules. Crucially, the system must enforce valid state transitions and ensure every mutation is recorded in an immutable audit log for compliance and operational tracking.

## Domain Context & Boundaries
- **Appointment Statuses**: A strict set of states: `confirmed`, `checked_in`, `in_progress`, `completed`, `cancelled`, `no_show`.
- **Actors & Permissions**:
  - **Receptionist**: Typically handles `checked_in`, `cancelled`, and `no_show`.
  - **Dentist**: Transitions to `in_progress` and `completed`, and adds clinical notes.
- **Audit Logging**: Every single status change must generate a log entry detailing *who* made the change, *when*, and the *previous/new states*.

## Architectural Decisions
1. **State Machine Pattern**: Implement a strict state machine on the backend (e.g., in `lib/appointments/state-machine.ts`) to validate transitions. For example, an appointment cannot go directly from `cancelled` to `completed`.
2. **Transaction Boundaries**: Any update to an appointment's status must be bundled with the creation of its corresponding `audit_logs` entry in a single Drizzle/PostgreSQL transaction. If the log fails, the status update rolls back.
3. **Database Schema Additions**:
   - `audit_logs`: A table referencing the appointment ID, the user ID who performed the action, the action type, and a JSON payload of changes.
   - `clinical_notes`: A table referencing the appointment ID and the dentist's user ID to store immutable or version-controlled notes.
4. **API Design**:
   - `PATCH /api/appointments/:id/status`: Accepts `{ status: new_status }`, validates transition, and executes the transaction.
   - `POST /api/appointments/:id/notes`: Adds a clinical note.
5. **Tenant Isolation**: Just like scheduling, all operations must verify the `tenant_id` of the appointment matches the active Clerk Organization of the staff member.
6. **Strict Typing**: The use of the `any` type is strictly forbidden. All variables, API parameters, error objects, and database interactions must use explicit, actual types (e.g., Zod schemas for validation, Drizzle type inference, or custom interfaces).

## Tasks
- [ ] Task 1: Update the database schema (`lib/db/schema.ts`) to include the `audit_logs` and `clinical_notes` tables, both with strict `tenant_id` columns. → Verify: `npm run db:push` succeeds.
- [ ] Task 2: Create a state machine utility (`lib/appointments/state-machine.ts`) that defines valid status transitions. → Verify: Unit tests pass for both valid and invalid transitions.
- [ ] Task 3: Implement the `PATCH /api/appointments/:id/status` endpoint utilizing Drizzle transactions to update status and insert an audit log simultaneously. → Verify: API successfully updates state and generates a log, or rejects invalid states with a `400 Bad Request`.
- [ ] Task 4: Implement the `POST /api/appointments/:id/notes` endpoint to allow authorized staff (Dentists) to add notes. → Verify: API successfully inserts a clinical note.
- [ ] Task 5: Build a Staff Dashboard UI component (`components/dashboard/DailySchedule.tsx`) that fetches the day's appointments and presents context-aware action buttons (e.g., "Check In" only shows for `confirmed` appointments). → Verify: UI correctly fetches appointments and disables/hides invalid actions based on current status.

## Done When
- [ ] `audit_logs` and `clinical_notes` tables exist and are properly linked to `appointments`.
- [ ] The appointment state machine prevents invalid status transitions.
- [ ] All status changes generate an immutable audit log entry reliably via database transactions.
- [ ] Staff can view a daily schedule and update appointment statuses via the UI.
- [ ] npm run build to ensure no errors
