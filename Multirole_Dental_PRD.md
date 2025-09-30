# Product Requirements Document (PRD)

**Product Name:** Multirole Dental Clinic Management & Booking Platform\
**Prepared by:** \[Your Name / Team\]\
**Date:** \[Insert Date\]\
**Version:** 1.0

## 1. Overview

A multi-branch, multi-role dental clinic booking platform that allows:

- Patients to book dental services at their preferred branch.\
- Clinic owners to manage branches, staff, schedules, services, and
  payments.\
- Staff (dentists, receptionists) to manage daily appointments and
  patient flow.\
- Super Admin to oversee system operations, security, and compliance.

The system supports multiple branches, role-based access control,
real-time availability, and integrated payment options (Stripe for
cards, GCash via Xendit/PayMongo).

## 2. Objectives & Goals

- Simplify branch-based appointment booking for patients.\
- Provide owners with a centralized dashboard to manage branches,
  staff, and finances.\
- Ensure secure payments with multiple payment methods (international
  cards + local e-wallets).\
- Enhance security with Better Auth, Arcjet protection, and role-based
  access.\
- Deliver a scalable, type-safe system with modern stack choices.

## 3. User Roles & Permissions

### 3.1 Super Admin

- Manage owners and system settings.\
- Monitor system usage, security logs, and payments.\
- Handle escalations (disputes, compliance issues).

### 3.2 Clinic Owner

- Create/manage branches.\
- Add/remove staff (dentists, receptionists).\
- Configure services, pricing, cancellation policy.\
- Monitor bookings, payments, and reports.

### 3.3 Staff (Dentist / Receptionist)

- View/manage schedules.\
- Confirm, reschedule, or cancel appointments.\
- Record patient notes and treatment outcomes.\
- Access branch-limited data only.

### 3.4 Patient

- Register/login.\
- Search branches and services.\
- Book/reschedule/cancel appointments.\
- Make payments via Stripe (cards) or GCash.\
- View appointment history.

## 4. Functional Requirements

### 4.1 Authentication & Security

- Better Auth for authentication, with:
  - Email/password login\
  - OAuth (optional)\
  - MFA (optional per clinic owner)\
- RBAC (Role-Based Access Control) enforced at backend API level.\
- Arcjet integration: rate limiting, bot detection, fraud prevention.

### 4.2 Branch & Service Management

- Owners can add/edit/delete branches.\
- Branch data: name, address, contact, geo-location, timezone.\
- Services: name, duration, price, description.\
- Per-branch service configurations.

### 4.3 Staff Management

- Owners invite staff via email.\
- Assign staff to specific branch(es).\
- Define staff role (dentist, receptionist).\
- Define schedules (recurring weekly) and exceptions (days off,
  overtime).

### 4.4 Appointment Booking

- Patients browse available slots per branch/service.\
- Timeslots auto-generated from staff schedules and service
  durations.\
- Prevent double bookings using transactional locking (Drizzle +
  Postgres).\
- Status workflow: pending → confirmed → completed/cancelled.\
- Cancellations follow branch policy (min_cancel_hours).

### 4.5 Payments

- Stripe integration: cards, Apple Pay, Google Pay.\
- GCash via Xendit/PayMongo API integration.\
- Payment flow:
  - Create payment intent (Stripe) or charge (Xendit/PayMongo).\
  - Redirect patient to payment page or GCash app deep-link.\
  - Backend webhook updates appointment/payment status.\
- Owners can view payment reports by branch.

### 4.6 Notifications

- Email confirmation for bookings, cancellations, reminders.\
- SMS optional via Twilio (phase 2).\
- In-app notifications for staff (daily schedules, last-minute
  changes).

### 4.7 Reporting & Analytics

Branch-level dashboards for owners:\

- Appointments by day/week/month.\
- Revenue reports (Stripe + GCash consolidated).\
- Staff performance (appointments handled, revenue generated).

## 5. Non-Functional Requirements

### 5.1 Performance

- API response time: \< 300ms avg.\
- Appointment booking concurrency: safe under high load with
  row-locking.

### 5.2 Security

- Enforce HTTPS, strong password policies.\
- Input validation with Zod.\
- DB encryption at rest (Supabase).\
- PCI-DSS compliance via Stripe/Xendit/PayMongo (no sensitive card
  data stored locally).

### 5.3 Scalability

- Multi-branch and multi-owner supported.\
- Backend separated from frontend for scaling independently.\
- Stateless API to allow horizontal scaling.

### 5.4 Availability

- 99.9% uptime target.\
- Auto backups daily for Supabase DB.

## 6. Tech Stack

- **Frontend:** Next.js (App Router), TailwindCSS, shadcn/ui, oRPC
  client, Zod.\
- **Backend:** Next.js (App Router), oRPC server, Drizzle ORM, Zod,
  Better Auth, Arcjet, Stripe, GCash (via Xendit/PayMongo).\
- **Database:** Supabase Postgres (Drizzle migrations).\
- **Deployment:** Vercel (frontend), Fly.io/Railway (backend),
  Supabase hosting for DB.\
- **CI/CD:** GitHub Actions (lint, type-check, tests, deploy).

## 7. User Journeys

### 7.1 Patient booking flow

1.  Patient logs in → searches branch → selects service → picks
    timeslot.\
2.  Confirms booking → proceeds to payment → completes payment.\
3.  Receives confirmation email + appointment in dashboard.

### 7.2 Owner onboarding flow

1.  Super Admin creates Owner account.\
2.  Owner logs in → adds branch details → adds services.\
3.  Invites staff → sets schedules → branch ready to accept bookings.

### 7.3 Staff daily flow

1.  Staff logs in → sees daily appointments dashboard.\
2.  Confirms/cancels/reschedules appointments.\
3.  Marks completed with notes after treatment.

## 8. API Endpoints (oRPC Procedures)

**Auth**\

- auth.registerPatient\
- auth.login\
- auth.refreshToken

**Branch Management**\

- owner.createBranch\
- owner.getBranches\
- owner.updateBranch

**Services**\

- owner.createService\
- owner.getServices(branchId)

**Staff**\

- owner.inviteStaff\
- staff.getSchedule\
- staff.updateSchedule

**Appointments**\

- patient.getAvailability(branchId, serviceId, date)\
- patient.createAppointment\
- patient.cancelAppointment\
- staff.updateAppointmentStatus

**Payments**\

- payments.createIntent (Stripe/Xendit/PayMongo)\
- payments.webhookHandler

## 9. Milestones

**Phase 1 --- Core MVP (6-8 weeks)**\

- Backend setup: auth, branches, services, appointments.\
- Frontend: booking flow for patients.\
- Stripe integration for card payments.

**Phase 2 --- Multi-role features (6 weeks)**\

- Owner dashboards, staff schedules, branch management.\
- GCash integration via Xendit/PayMongo.\
- Arcjet + Better Auth full rollout.

**Phase 3 --- Notifications & Reporting (4 weeks)**\

- Email reminders, in-app staff notifications.\
- Revenue & staff performance dashboards.

**Phase 4 --- Polish & Scale (ongoing)**\

- Testing, optimization, CI/CD automation.\
- Multi-language support.
