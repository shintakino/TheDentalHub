# 🦷 DentalHub PRD v3.0 (Production Ready)

## 1. Overview
DentalHub is a multi-tenant dental clinic booking and management platform designed for patients, clinic staff, and administrators. It enables real-time appointment booking, clinic operations management, and structured scheduling without payment dependencies.

---

## 2. Goals
- Provide instant appointment booking with zero payment friction
- Enable multi-clinic (tenant-based) operations
- Ensure conflict-free scheduling system
- Support scalable clinic operations (branches + staff)
- Maintain strict data isolation between clinics

---

## 3. Out of Scope
- Payments / billing / refunds
- Insurance claims
- Financial reporting
- Prescription management (future scope)

---

## 4. Tech Stack
- Frontend: Next.js 16 (App Router)
- Auth: Clerk
- ORM: Drizzle ORM
- Database: PostgreSQL
- Storage: Supabase Storage
- Queue: Redis

---

## 5. Multi-Tenant Architecture

### Core Concept
Each clinic = a tenant.
All data is scoped by `tenant_id`.

### Isolation Rules
- Patients can only interact with assigned or selected clinics
- Staff belongs only to one clinic branch
- Super Admin has cross-tenant access

---

## 6. Core Modules

### 6.1 Scheduling Engine (Core System)
- Slot generation based on **Branch operating hours** (Primary driver for availability)
- Service-based duration handling
- Buffer time between appointments
- Prevent double-booking (atomic locking)
- **Timezone Display**: Patients see slots in **Clinic Local Time** with a clear timezone indicator to ensure clarity for physical appointments.
- Staff availability is pooled at the branch level for slot generation.

### 6.2 Appointment Lifecycle

States:
- `confirmed`
- `checked_in`
- `in_progress`
- `completed`
- `cancelled`
- `no_show`

Rules:
- Instant confirm booking
- Cancel releases slot immediately
- Status transitions are role-restricted

---

### 6.3 Notification System
- Booking confirmation
- Reminder notifications (24h, 2h)
- Cancellation alerts
- Reschedule updates

Channels:
- Email (Clerk)
- In-app notifications
- SMS (optional future)

---

### 6.4 Audit & Logging
- Track all appointment changes
- Store actor (patient/staff/admin)
- Timestamped event history
- Required for all status updates

---

## 6.5 Clinic Branding System

Each clinic (tenant) can customize its identity and patient-facing experience.

### Branding Features
- Clinic logo upload
- Primary & secondary brand colors
- Clinic display name customization
- Custom clinic description & profile page

### Patient-Facing Customization
- Branded booking page per clinic
- Optional custom subdomain (e.g. clinicname.dentalhub.com)
- SEO metadata per clinic page
- Open Graph image customization for sharing links

### Communication Branding
- Email template branding (logo, colors, footer)
- SMS message signature customization (clinic name)
- Notification tone configuration (formal / friendly)

### Operational Branding
- Printable appointment receipts with clinic branding
- Staff dashboard theme alignment per clinic (light branding layer)

---

## 7. Roles & Permissions

### 7.1 Patient
- Register/Login (Clerk)
- Browse clinics
- Book appointment (instant confirm)
- Cancel / reschedule
- View appointment history
- Manage profile

---

### 7.2 Clinic Owner
- Manage branches
- Configure services (duration, price optional metadata)
- Manage staff
- View bookings
- Cancel/reschedule appointments
- View analytics dashboard

---

### 7.3 Staff
- View assigned schedule
- Update appointment status
- Add clinical notes
- Handle walk-in queue
- Cancel/reschedule appointments (permission-based)

Staff types:
- Dentist
- Assistant
- Receptionist

---

### 7.4 Super Admin
- Manage all tenants (clinics)
- View system logs
- Override appointments
- Manage global configuration
- Suspend/activate clinics

---

## 8. Booking System Rules

### Core Rules
- Booking is instant confirmation
- Slot locking must be atomic
- No payment validation required
- Slot is released immediately on cancellation

### Edge Case Handling
- Late arrival policy (configurable per clinic)
- No-show auto-mark after threshold
- Staff removal does not delete existing appointments
- Clinic hour changes do not break existing bookings

---

## 9. Analytics (MVP Level)

Clinic-level insights:
- Daily bookings
- Peak hours
- No-show rate
- Cancellation rate
- Staff utilization
- Service popularity

---

## 10. Data Models (High-Level)

### Tenant (Clinic)
- id
- name
- location
- timezone

### Branch
- id
- tenant_id
- name
- address
- operating_hours

### User
- id
- role
- tenant_id (nullable for patients)

### Staff
- id
- user_id
- branch_id
- role_type

### Appointment
- id
- patient_id
- branch_id
- staff_id
- service_id
- start_time
- end_time
- status

### Service
- id
- branch_id
- name
- duration

### AuditLog
- id
- entity_type
- entity_id
- action
- actor_id
- timestamp

---

## 11. API Structure (Next.js 16)

### Auth
- /api/auth/* (Clerk)

### Clinics
- GET /api/clinics
- POST /api/clinics (admin)

### Appointments
- POST /api/appointments (book)
- PATCH /api/appointments/:id
- DELETE /api/appointments/:id
- GET /api/appointments

### Staff
- GET /api/staff/schedule
- PATCH /api/staff/appointments

---

## 12. Security Model
- RBAC (Role-Based Access Control)
- Tenant-based access middleware
- Appointment ownership validation
- Rate limiting on booking endpoints
- Audit log enforcement for all mutations

---

## 13. Performance Considerations
- Indexing on (branch_id, start_time)
- Optimistic locking for booking
- Query caching for schedules
- Lazy-loading analytics

---

## 14. Future Enhancements
- AI scheduling assistant
- SMS integration
- Tele-dentistry module
- Insurance integration
- Patient dental records system

---

## 15. Success Metrics
- Booking completion rate > 95%
- No double booking incidents
- < 300ms booking response time
- < 2% no-show rate improvement via reminders

---

## 16. Key Principle
> “A booking system is not a CRUD app — it is a concurrency system.”

---

## End of PRD v3.0

