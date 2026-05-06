# 11 - Patient Booking Flow

## Goal
Deliver a frictionless, instant appointment booking experience for patients. This flow must dynamically consume the clinic's custom branding, guide the patient through selecting a branch, service, and time slot, and instantly confirm the appointment using atomic locking to prevent double-booking.

## Domain Context & Boundaries
- **Tenant Context**: The booking flow is accessed via a tenant-specific route (e.g., `/[tenantId]/book`). All data fetched (branches, services, slots) must be strictly scoped to that `tenant_id`.
- **Branding**: The UI must dynamically apply the clinic's configured `primary_color` and `logo_url` (from Feature 08).
- **Authentication**: Patients must be authenticated to finalize a booking. Clerk is used to manage patient accounts, ensuring their user ID is linked to the created appointment.
- **Scheduling**: Relies on the Scheduling Engine (Feature 05) to fetch available slots based on the clinic's local timezone.

## Architectural Decisions
1. **Routing**: Implement a step-by-step wizard in Next.js App Router using URL search parameters (e.g., `?branch=xyz&service=123&date=YYYY-MM-DD`) to maintain state and allow link sharing.
2. **Atomic Booking**: The final `POST /api/appointments/book` endpoint must use a database transaction to verify slot availability and insert the appointment. If the slot was taken milliseconds prior, it must gracefully reject and prompt the patient to select another time.
3. **Strict Typing**: The `any` type is strictly forbidden. The booking payload must be validated using Zod (`BookingSchema`), ensuring `branchId`, `serviceId`, `startTime`, and `patientId` are correctly typed and present.
4. **Timezone Handling**: Display all available times to the patient in the **Clinic's Local Time**, explicitly noting the timezone in the UI to prevent confusion for out-of-town patients.

## Tasks
- [ ] Task 1: Create the patient-facing layout (`app/(booking)/[tenantId]/layout.tsx`) that fetches the clinic's branding and injects CSS variables to theme the booking flow. → Verify: The page renders with the correct custom colors and logo.
- [ ] Task 2: Build the step-by-step UI components: Branch Selection, Service Selection, and Date/Time Picker. → Verify: Forms update URL search parameters and fetch corresponding data strictly typed.
- [ ] Task 3: Implement the `POST /api/appointments/book` endpoint. This must validate the payload via Zod, confirm the user is a logged-in patient, perform a transactional check for slot availability, and insert the appointment. → Verify: API returns 200 OK on success, or 409 Conflict if the slot is double-booked.
- [ ] Task 4: Build the "Booking Confirmed" success page, providing the patient with details of their upcoming appointment. → Verify: Patient can view their confirmed appointment details.
- [ ] Task 5: Run a full type check. → Verify: `npm run build` completes successfully with zero instances of `any`.

## Done When
- [ ] Patients can successfully navigate the booking wizard and book an appointment.
- [ ] The booking flow accurately reflects the specific clinic's branding.
- [ ] The system gracefully handles race conditions (double-booking attempts) using database transactions.
- [ ] Timezones are correctly handled and displayed based on the clinic's location.
- [ ] End-to-end strict typing is implemented without using `any`.
- [ ] `npm run build` for verification completes without errors.
