# 05 - Scheduling Engine & API Architecture

## Goal
Design and implement the core Scheduling Engine APIs to enable instant, conflict-free appointment booking. The system must support timezone-aware slot generation, enforce atomic locking to prevent double-booking, and ensure strict tenant data isolation.

## Domain Context & Boundaries
- **Slot Generation**: Dynamic calculation of available time slots based on branch operating hours, service duration, staff availability, and existing appointments.
- **Booking Flow**: Patient selects branch -> selects service -> views available slots -> selects slot -> confirms booking.
- **Atomic Locking**: Ensure that if two users attempt to book the exact same slot concurrently, only one transaction succeeds.
- **Timezones**: All backend timestamps must be stored in UTC. Branch configurations define the local timezone for accurate daily slot generation and frontend display.

## Architectural Decisions
1. **API Design (RESTful)**:
   - `GET /api/branches/:branchId/slots?date=YYYY-MM-DD&serviceId=:id`: Generates and returns available slots.
   - `POST /api/appointments/book`: Creates a new appointment utilizing an atomic lock.
2. **Atomic Locking Strategy**: Utilize PostgreSQL transactions with row-level locks (`SELECT ... FOR UPDATE`) or a Redis-based distributed lock during the booking mutation to guarantee consistency and prevent double-booking.
3. **Timezone Handling**: The API accepts and returns ISO 8601 UTC strings. Slot generation logic must interpret the requested `date` parameter in the context of the branch's local timezone before querying UTC ranges from the database.
4. **Tenant Isolation**: All endpoints must extract `tenant_id` from the context (Clerk Organization ID for staff, or route context for patients) and apply it to every database query.
5. **Observability & Logging**: Implement structured logging for the booking flow to trace errors, measure slot generation latency, and record booking status transitions in an `audit_logs` table.

## Tasks
- [ ] Task 1: Define API contracts (Zod request/response schemas) for slot generation and appointment booking. → Verify: Schemas defined in `types/api.ts` or `lib/validations.ts`.
- [ ] Task 2: Implement the slot generation utility function that calculates available intervals based on branch hours, removing overlapping booked appointments and applying buffer times. → Verify: Unit tests pass for slot generation including edge cases (end of day, overlaps, timezone shifts).
- [ ] Task 3: Develop the `GET /api/branches/:branchId/slots` endpoint utilizing the slot generation utility and strict `tenant_id` filtering. → Verify: Endpoint returns correct available UTC slots for a given date.
- [ ] Task 4: Implement the `POST /api/appointments/book` endpoint with atomic locking (e.g., Drizzle ORM transaction with Postgres lock). → Verify: Concurrent booking tests for the same slot result in only one success and one `409 Conflict` error.
- [ ] Task 5: Add structured audit logging within the booking transaction to record the initial `confirmed` state creation. → Verify: Audit log table accurately captures the booking event with the correct `tenant_id`.

## Done When
- [ ] The scheduling API accurately generates available time slots based on branch operating hours and existing appointments.
- [ ] Atomic locking successfully prevents double-booking scenarios under concurrent load.
- [ ] Timezone conversions are handled correctly across the backend boundary (stored in UTC, slot calculation respects local branch timezone).
- [ ] All scheduling endpoints enforce strict `tenant_id` isolation.
- [ ] Run npm run build to verify no error if it has fix it.
