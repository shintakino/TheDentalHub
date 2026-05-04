# DentalHub

## Overview
DentalHub is a multi-tenant dental clinic booking and management platform. It allows patients to book appointments instantly across different clinic branches, while providing clinic owners and staff with tools to manage operations, schedules, and patient flow without the complexity of payment processing.

## Goals
1. Provide a frictionless, instant appointment booking experience for patients.
2. Enable multi-tenant operations with strict data isolation between clinics.
3. Ensure conflict-free scheduling using atomic slot locking.
4. Support scalable clinic management including branches and staff roles.
5. Provide clinic owners with a branding system to customize their patient-facing identity.

## Core User Flow
1. **Patient**: Registers/Logins -> Browses Clinics -> Selects Branch & Service -> Picks Slot (Clinic Local Time) -> Instant Confirmation.
2. **Clinic Owner**: Registers Clinic -> Sets up Branches & Operating Hours -> Configures Services -> Manages Staff -> Monitors Dashboard.
3. **Staff (Dentist/Receptionist)**: Logins -> Views Assigned/Branch Schedule -> Manages Appointment Lifecycle (Check-in, Complete, etc.) -> Adds Clinical Notes.
4. **Super Admin**: Manages all tenants -> Monitors system-wide logs -> Overrides appointments if necessary.

## Features

### Multi-Tenant Architecture
- Every clinic is a separate tenant identified by `tenant_id`.
- Strict data isolation: patients and staff only see data relevant to their clinic.

### Scheduling Engine
- Slot generation based on branch operating hours.
- Atomic locking to prevent double-booking.
- Buffer time management between appointments.
- Timezone-aware display (Clinic Local Time for patients).

### Appointment Management
- Full lifecycle tracking: `confirmed`, `checked_in`, `in_progress`, `completed`, `cancelled`, `no_show`.
- Audit logs for every status change.

### Clinic Branding System
- Customizable logo, colors, and clinic name.
- Branded booking pages and communication templates (emails/SMS).

### Analytics
- MVP-level insights: daily bookings, peak hours, no-show rates, and staff utilization.

## Scope

### In Scope
- Multi-tenant clinic management.
- Branch-level scheduling and slot generation.
- Role-based access control (Patient, Staff, Owner, Super Admin).
- Instant booking and appointment lifecycle management.
- Clinic branding and customization.
- Audit logging for all mutations.
- Basic analytics dashboard.

### Out Of Scope
- Payments and billing systems.
- Insurance claims processing.
- Prescription management (Future phase).
- Financial reporting.

## Success Criteria
1. Booking completion rate > 95%.
2. Zero double-booking incidents.
3. Response time for booking < 300ms.
4. Successful data isolation between clinic tenants.
