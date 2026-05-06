# DentalHub

## Overview
DentalHub is a multi-tenant dental clinic booking and discovery platform. It serves two primary audiences:
1. **Patients**: A marketplace to discover local dental clinics via an interactive map, search by service, and book appointments instantly.
2. **Clinics**: A management suite for clinic owners and staff to handle operations, branding, and scheduling across multiple branches.

## Goals
1. **Discovery**: Enable patients to find the right clinic using a map-based search and filters.
2. **Frictionless Booking**: Provide an instant, account-based appointment booking experience.
3. **Multi-Tenant Operations**: Ensure strict data isolation between clinics while allowing global discovery.
4. **Atomic Scheduling**: Guarantee zero double-bookings using transactional slot locking.
5. **Brand Identity**: Allow clinics to maintain their own visual identity throughout the booking flow.

## Core User Flow
1. **Patient (Discovery)**: Lands on Home -> Searches by location/service -> Views results on Map/List -> Selects Clinic.
2. **Patient (Booking)**: Selects Branch & Service -> Picks Slot (Clinic Local Time) -> Logins/Registers -> Instant Confirmation.
3. **Clinic Owner**: Registers Clinic -> Sets up Branches (with geocoding) & Hours -> Configures Services -> Monitors Dashboard.
4. **Staff (Dentist/Receptionist)**: Logins -> Views Schedule -> Manages Appointment Lifecycle -> Adds Clinical Notes.
5. **Super Admin**: Manages all tenants -> Monitors system-wide logs -> Overrides appointments.

## Features

### Clinic Discovery (Marketplace)
- Map-based search (Leaflet) for finding clinics near a patient.
- Search filters for services, clinic names, and location.
- "Next Available" slot preview on search results.

### Multi-Tenant Architecture
- Every clinic is a separate tenant identified by `tenant_id`.
- Global search index for discovery, but strict isolation for clinical data.

### Scheduling Engine
- Slot generation based on branch operating hours.
- Atomic locking to prevent double-booking.
- Timezone-aware display (Clinic Local Time).

### Appointment Management
- Full lifecycle tracking: `confirmed` to `completed`/`cancelled`.
- Audit logs for every status change.

### Clinic Branding System
- Customizable logo, colors, and clinic name for the booking flow.

## Scope

### In Scope
- Clinic Marketplace (Search & Map Discovery).
- Multi-tenant clinic management.
- Branch-level scheduling and slot generation.
- Role-based access control (Patient, Staff, Owner, Super Admin).
- Instant booking and appointment lifecycle management.
- Clinic branding and customization.

### Out Of Scope
- Payments and insurance processing.
- Prescription management.
- Financial reporting.

## Success Criteria
1. Discovery-to-Booking conversion rate > 10%.
2. Zero double-booking incidents.
3. Accurate map-based results (Leaflet integration).
4. Successful data isolation between clinic tenants.
