# 13 - Communications & Notifications

## Goal
Implement a reliable, automated notification system to send transactional communications (Emails and SMS) to patients. This system will handle appointment confirmations, upcoming reminders, and cancellations, ensuring that all communications dynamically adopt the specific clinic's custom branding (logo, colors, and name).

## Domain Context & Boundaries
- **Triggers**: Notifications are triggered by state changes in the Appointment Lifecycle (e.g., `confirmed`, `cancelled`) or by scheduled background jobs (e.g., 24-hour reminders).
- **Branding**: Every outgoing message must pull the `logo_url`, `primary_color`, and clinic name from the `clinics` table to maintain a whitelabeled experience.
- **Delivery Services**: Utilize external providers (e.g., Resend for Email, Twilio for SMS) abstracted behind a strictly typed internal service interface.

## Architectural Decisions
1. **Event-Driven Architecture**: Instead of blocking the main API response, appointment status changes (Feature 07) should trigger notifications asynchronously. For the MVP, this can be handled via Next.js `after()` or a lightweight queue/webhook mechanism.
2. **Template Engine**: Use `react-email` to build strongly-typed, responsive HTML email templates that accept the clinic's branding configuration as props.
3. **Strict Typing**: The `any` type is strictly forbidden. Define explicit Zod schemas for the notification payloads (e.g., `NotificationPayloadSchema` containing `patientName`, `appointmentDate`, `clinicBranding`).
4. **Audit Logging**: Any notification sent to a patient must be recorded in the database (either in `audit_logs` or a dedicated `communications_log` table) to maintain a verifiable history of contact.

## Tasks
- [x] Task 1: Create the `react-email` templates for `BookingConfirmation`, `AppointmentReminder`, and `CancellationNotice`, designing them to accept dynamic CSS color variables and logo URLs. → Verify: Templates render correctly in the local `react-email` preview server.
- [x] Task 2: Build the `lib/notifications/sender.ts` utility with strict typing to handle the API calls to the email/SMS providers. → Verify: Unit tests confirm the payload structure matches provider requirements.
- [x] Task 3: Hook the notification sender into the `POST /api/appointments/book` and `PATCH /api/appointments/:id/status` endpoints to trigger confirmations and cancellations. → Verify: Changing an appointment status successfully dispatches a test email.
- [x] Task 4: Setup a chron job or background task (e.g., using Vercel Cron or Inngest) to query for appointments occurring in the next 24 hours and trigger reminders. → Verify: Script correctly identifies eligible appointments without duplicates.
- [x] Task 5: Run a full type check. → Verify: `npm run build` completes successfully with zero instances of `any`.

## Done When
- [x] Patients receive immediate email/SMS confirmation upon booking.
- [x] Patients receive notifications upon cancellation.
- [x] All communications are dynamically branded with the clinic's specific logo and colors.
- [x] Notification events are securely logged.
- [x] End-to-end strict typing is implemented without using `any`.
- [x] `npm run build` for verification completes without errors.
