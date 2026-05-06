# 14 - Patient Portal

## Goal
Provide a secure, user-friendly dashboard for authenticated patients. This portal empowers patients to view their upcoming and past appointments, review clinic details, and manage their schedule (e.g., cancelling an appointment) without needing to call the clinic receptionist.

## Domain Context & Boundaries
- **Patient Authentication**: Access requires a valid Clerk session with the user acting in a "Patient" capacity (as opposed to Staff/Admin).
- **Data Privacy**: The portal must strictly fetch only the appointments where the `patient_id` matches the authenticated Clerk user ID. 
- **State Machine Integration**: If a patient cancels an appointment via the portal, it must interface with the Appointment State Machine (Feature 07), and the `audit_log` must record the patient as the actor.

## Architectural Decisions
1. **Routing**: Create a dedicated routing group (e.g., `app/(patient)/dashboard`) protected by Clerk middleware ensuring the user is logged in.
2. **Data Aggregation**: The dashboard will fetch the user's `appointments` and `JOIN` the `branches` and `clinics` tables to display where and when the appointment is taking place.
3. **Action Limitations**: Patients can only cancel appointments that are in the `confirmed` state and are scheduled sufficiently far in the future (e.g., > 24 hours). They cannot edit clinical notes or force state changes.
4. **Strict Typing**: The `any` type is forbidden. The API responses for the patient's schedule must use explicit Drizzle inferred types and Zod schemas for any mutation payloads.

## Tasks
- [ ] Task 1: Create the patient-protected layout and middleware rules ensuring unauthorized users or staff acting out-of-context are redirected. → Verify: Only authenticated patients can access the portal.
- [ ] Task 2: Implement the `GET /api/patient/appointments` endpoint to fetch upcoming and past appointments strictly filtered by the user's Clerk ID. → Verify: Endpoint returns correct payload shape with zero cross-patient data leakage.
- [ ] Task 3: Build the Patient Dashboard UI featuring an "Upcoming Appointments" card and a "Past Visits" history list. → Verify: UI renders correctly using shadcn/ui components.
- [ ] Task 4: Implement the "Cancel Appointment" action in the UI, tying it to the existing `PATCH /api/appointments/:id/status` endpoint (ensuring the backend logic permits the patient to cancel their own appointment). → Verify: Patient can successfully cancel an upcoming appointment.
- [ ] Task 5: Run a full type check. → Verify: `npm run build` completes successfully with zero instances of `any`.

## Done When
- [ ] Patients can log in and view a dashboard of their appointments.
- [ ] Appointments are clearly separated into "Upcoming" and "Past".
- [ ] Patients can self-serve cancellations for upcoming appointments within the permitted timeframe.
- [ ] The audit log accurately reflects that the patient (not clinic staff) performed the cancellation.
- [ ] End-to-end strict typing is implemented without using `any`.
- [ ] `npm run build` for verification completes without errors.
