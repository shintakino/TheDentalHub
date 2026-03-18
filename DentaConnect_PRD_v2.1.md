🦷

**DentaConnect**

Multirole Dental Clinic Management & Booking Platform

Product Requirements Document

Version 2.1 \| 2026 \| Product Team

---

**Document Status** Final Draft

**Prepared By** Product Team

**Stakeholders** Engineering, Design, Business

**Last Updated** 2026

**Version** 2.1

---

> **1. Executive Summary**

DentaConnect is a multi-tenant dental clinic management and discovery
platform that bridges the gap between patients seeking dental care and
clinics looking to grow their patient base. The platform combines
location-based clinic discovery with a comprehensive operational
management suite --- enabling patients to find, evaluate, and book
appointments at nearby dental clinics, while giving clinic owners the
tools to manage branches, staff, services, scheduling, and finances.

The platform is designed mobile-first for the Philippine market,
acknowledging local user behaviors such as preference for walk-ins,
GCash payments, and proximity-driven decision making.

+-----------------------------------------------------------------------+
| **Strategic Transformation** |
| |
| This platform evolves the standard dental booking system into a full |
| clinic discovery marketplace --- patients discover clinics first, |
| then book. This positions DentaConnect as both an operational tool |
| and a patient acquisition channel for dental clinics. |
+-----------------------------------------------------------------------+

**1.1 Core Value Propositions**

---

**Stakeholder** **Pain Point Solved** **Key Benefit**

---

**Patient** Difficulty finding trusted Discover, compare, and book
nearby dental clinics in minutes

**Clinic Owner** Fragmented operations and Centralized management +
low online visibility marketplace presence

**Staff** Manual scheduling and Digital workflows with
appointment tracking real-time updates

**Super Admin** No oversight of System-wide monitoring and
multi-clinic operations compliance tools

---

> **2. Objectives & Success Metrics**

**2.1 Primary Goals**

- Enable location-based clinic discovery across the Philippines

- Simplify multi-branch appointment booking for patients

- Centralize clinic operations across branches, staff, and services

- Provide secure, flexible payment options including local PH methods

- Establish a scalable multi-tenant architecture for clinic growth

**2.2 Key Performance Indicators (KPIs)**

---

**Metric** **Target** **Notes**

---

Discovery Usage Rate ≥ 70% Users who use discovery
before booking

Booking Conversion Rate ≥ 25% Discovery views that
result in bookings

API Response Time \< 300ms 95th percentile for all
endpoints

Double-Booking Rate 0% Zero tolerance for
scheduling conflicts

System Uptime ≥ 99.9% Monthly measured
availability

Map Load Time \< 2 seconds Initial Leaflet map
render with markers

Mobile Usage ≥ 60% PH-market mobile-first
target

---

> **3. User Roles & Permissions**

The platform is built around four primary user roles, each with distinct
access levels, capabilities, and data visibility rules. Role enforcement
is handled at both the API middleware layer and the Supabase Row-Level
Security (RLS) layer.

**3.1 Super Admin**

+-----------------------------------------------------------------------+
| **Role Overview** |
| |
| Platform-wide administrator. Full access to all tenants, clinics, |
| users, and system data. Responsible for compliance, dispute |
| resolution, and system health monitoring. |
+-----------------------------------------------------------------------+

- Manage clinic owner accounts (create, suspend, reinstate)

- Monitor system-wide usage, performance logs, and audit trails

- Handle disputes between patients and clinics

- Enforce platform compliance policies

- Access cross-tenant analytics and reporting

- Manage platform-level configurations and feature flags

**3.2 Clinic Owner**

+-----------------------------------------------------------------------+
| **Role Overview** |
| |
| Tenant administrator for one or more clinic branches. Full access |
| within their tenant scope. Cannot access data from other tenants. |
+-----------------------------------------------------------------------+

- Create, configure, and manage clinic branches (including location
  data)

- Define services, pricing, and duration per branch

- Invite and manage staff accounts (dentists, receptionists)

- Configure staff schedules and working hours

- View all bookings across their branches

- Access financial reports and revenue summaries

- Manage branch-level settings and notifications

**3.3 Staff (Dentist / Receptionist)**

+-----------------------------------------------------------------------+
| **Role Overview** |
| |
| Operational staff assigned to one or more branches. Access is |
| restricted to their assigned branch(es) only. Cannot access financial |
| data or owner-level configurations. |
+-----------------------------------------------------------------------+

- View personal schedule and upcoming appointments

- Confirm, reschedule, or cancel appointments

- Record post-treatment notes per appointment

- Manage walk-in queue entries (post-MVP)

- Access patient information for assigned appointments only

- View branch-level daily appointment counts

**3.4 Patient**

+-----------------------------------------------------------------------+
| **Role Overview** |
| |
| End consumers of the platform. Can discover clinics, book |
| appointments, and manage their healthcare journey. Data access is |
| limited to their own records. |
+-----------------------------------------------------------------------+

- Register and authenticate (email/social login)

- Search for clinics by GPS location or manual address input

- Filter clinics by distance, service type, and availability

- View clinic profiles, services, and available time slots

- Book, reschedule, and cancel appointments

- Make payments via Stripe, Apple Pay, Google Pay (MVP); GCash (v2)

- View full appointment history and statuses

- Receive email notifications for bookings, reminders, and
  cancellations

> **4. System Architecture**

**4.1 Multi-Tenant Design**

Each clinic operates as an isolated tenant. All database tables include
a tenant_id column. Data access is enforced through two complementary
mechanisms:

- Backend middleware injects tenant context from JWT claims on every
  request

- Supabase Row-Level Security (RLS) policies enforce data isolation at
  the database level

- No cross-tenant data queries are permitted at the API layer

**4.2 Tech Stack**

---

**Layer** **Technology** **Purpose**

---

**Frontend** Next.js + React framework with design
TailwindCSS + system
shadcn/ui

**Map** Leaflet.js + Clinic discovery map with
react-leaflet OpenStreetMap tiles

**Backend API** Next.js API Routes + Type-safe RPC procedures
oRPC

**ORM** Drizzle ORM Type-safe SQL queries against
Postgres

**Authentication** Better Auth Session management, role-based
access

**Database** Supabase (Postgres) Multi-tenant data with RLS
policies

**Payments** Stripe Card, Apple Pay, Google Pay
(GCash in v2)

**Security** Arcjet Rate limiting, bot protection,
input validation

**Validation** Zod Schema validation at API
boundaries

**Deployment** Vercel + Frontend CDN + containerized
Railway/Fly.io backend

---

**4.3 Core Data Model**

Primary database tables and key columns:

---

**Table** **Key Columns**

---

**tenants** id, name, plan, created_at

**branches** id, tenant_id, name, address, latitude, longitude,
created_at

**staff** id, tenant_id, branch_id, user_id, role,
schedule_config

**services** id, tenant_id, branch_id, name, duration_min, price

**patients** id, user_id, full_name, contact_number,
medical_history_id

**appointments** id, tenant_id, branch_id, patient_id, staff_id,
service_id, status, scheduled_at

**payments** id, appointment_id, amount, currency, status,
stripe_intent_id

**audit_logs** id, tenant_id, user_id, action, entity_type,
entity_id, meta, created_at

---

> **5. Core Modules --- Detailed Specifications**

**5.1 Clinic Discovery & Location-Based Search**

+-----------------------------------------------------------------------+
| **Module Priority** |
| |
| CORE MVP --- This is the primary differentiator of the platform. |
| Patients must be able to find clinics before booking. All other |
| modules depend on this being functional first. |
+-----------------------------------------------------------------------+

**Overview**

The Discovery module allows patients to find dental clinics near their
current or specified location. The system uses the device GPS API for
automatic location detection, with manual address input as a fallback.
Clinics are displayed both on an interactive map and in a sortable list
view, synchronized in real-time.

**Map Integration**

- Library: Leaflet.js with react-leaflet React bindings

- Map tiles: OpenStreetMap (free, no API key required for MVP)

- User location: Browser Geolocation API with fallback to IP-based
  detection

- Default radius: 5 km, adjustable up to 50 km via slider

**Map Capabilities**

- Display clinic markers with custom dental icons

- Show user\'s current location as a distinct marker

- Click any marker → show clinic preview popup with name, distance,
  rating (v3), and Book button

- Sync map viewport with list view (hovering a list item highlights
  its marker)

- Handle duplicate coordinates by applying small lat/lng offset to
  avoid marker overlap

**List View Features**

Each clinic card in the list view displays:

- Clinic name and branch address

- Distance from user (e.g., 1.2 km) calculated via Haversine formula
  (PostGIS in v2)

- Available services (top 3 shown, with expand option)

- Availability indicator (e.g., \'Available Today\', \'Next slot:
  Tomorrow\')

- CTA buttons: View Profile / Book Now

**Filters (MVP)**

- Distance radius: 1 km, 3 km, 5 km, 10 km, 25 km, 50 km

- Service type: dropdown filtered by available service categories

- Availability: Today / This Week / Any

**Search API**

Endpoint: patient.searchNearbyClinics({ lat, lng, radius, serviceId? })

Returns per clinic: branchId, name, address, latitude, longitude,
distance, availableToday, serviceCount

Distance calculation uses the Haversine formula at MVP, to be replaced
by PostGIS ST_DWithin in production.

**Edge Cases**

- User denies GPS: Show manual address input with autocomplete

- No clinics found: Suggest increasing radius with one-click options
  (+5 km, +10 km)

- GPS timeout: Fall back to last known location or manual entry

- Overlapping markers: Apply coordinate jitter algorithm for
  readability

**5.2 Scheduling Engine**

**Entity Relationships**

- Branch: physical location where appointments occur

- Staff: dentist or receptionist assigned to branch(es)

- Service: specific dental procedure with defined duration

- Time Slot: generated availability window based on staff schedule

**Scheduling Rules (MVP)**

- Time slots generated from staff weekly schedule configurations

- Fixed slot intervals (e.g., 30-minute or 60-minute blocks, per
  service)

- Conflict detection prevents double-booking for same staff + same
  time

- Slot becomes unavailable immediately upon successful booking
  confirmation

- Cancellations within defined windows release slots back to
  availability

**MVP Constraints**

- No room/chair allocation logic

- No buffer time between appointments

- No overlapping staff assignments across branches at same time

**Future Enhancements (v2+)**

- Room/chair resource allocation per appointment

- Configurable buffer times between appointments

- Complex recurring schedule patterns

- Staff leave management and schedule overrides

**5.3 Appointment System**

**Appointment Status Flow**

---

**Status** **Description & Trigger**

---

**draft** Initial state when patient selects slot but hasn\'t
completed payment

**pending_payment** Stripe payment intent created, awaiting patient
payment confirmation

**confirmed** Payment successful (webhook received); slot is
locked; email sent to patient

**in_progress** Staff marks appointment as started on day of
appointment

**completed** Staff marks treatment as finished; notes can be
added

**cancelled** Patient or staff cancelled; payment refund initiated
if applicable

---

**Appointment Features**

- patient.createAppointment --- selects clinic, service, staff
  (optional), and time slot

- patient.cancelAppointment --- triggers refund flow; slot released
  after cancellation window

- patient.rescheduleAppointment --- cancels existing and creates new
  draft in one transaction

- staff.addAppointmentNote --- records post-treatment observations per
  appointment

- staff.updateAppointmentStatus --- moves appointment through status
  flow

**5.4 Payment System**

**MVP Payment Methods**

- Stripe: Debit/credit cards (Visa, Mastercard)

- Apple Pay via Stripe

- Google Pay via Stripe

**Payment Status Flow**

pending → paid → failed → refunded → partially_refunded

- pending: Stripe PaymentIntent created, awaiting customer action

- paid: Stripe webhook confirms successful charge; appointment moves
  to confirmed

- failed: Payment declined or expired; appointment remains
  pending_payment or drops to draft

- refunded: Full refund issued upon cancellation (within policy
  window)

- partially_refunded: Partial refund issued for late cancellations per
  clinic policy

**Critical Implementation Notes**

- Payment intent must be created before slot is hard-locked to avoid
  ghost reservations

- Webhook endpoint must be idempotent --- duplicate events must not
  cause double confirmations

- Draft appointments with no payment for 15 minutes are automatically
  released

- Refund eligibility is configurable per clinic (e.g., 24-hour
  cancellation window)

**Future Payment Methods (v2+)**

- GCash via Xendit or PayMongo

- Maya (formerly PayMaya)

- Pay-at-clinic option (no online payment required)

**5.5 Notification System**

**MVP --- Email Notifications**

---

**Trigger Event** **Recipient** **Template**

---

Appointment confirmed Patient booking_confirmation

Appointment reminder Patient appointment_reminder (24h
before)

Appointment cancelled Patient + Staff cancellation_notice

Appointment Patient reschedule_confirmation
rescheduled

New booking received Staff/Owner new_booking_alert

---

**Future Notification Channels (v2+)**

- SMS notifications via Semaphore or Vonage (PH SMS providers)

- In-app push notifications

- WhatsApp notifications

**5.6 Reporting & Analytics**

**Owner Dashboard (MVP)**

- Total bookings: daily, weekly, monthly counts with trend arrows

- Revenue summary: gross collections by date range

- Daily appointment count by branch and by service type

- Cancellation count and cancellation rate

**Future Analytics (v3+)**

- Staff performance metrics (appointments completed, notes written)

- No-show rate by patient segment

- Revenue forecasting and trend analysis

- Clinic comparison across branches

- Service popularity and conversion rates

**5.7 Audit Logs**

The audit log module tracks all significant platform actions for
compliance, debugging, and dispute resolution.

- User authentication events (login, logout, failed attempts)

- Appointment state changes (with before/after values, user ID,
  timestamp)

- Payment transactions and status changes

- Staff schedule modifications

- Branch and service configuration changes

- Admin actions on tenant accounts

Logs are append-only and cannot be deleted by any user role. Super Admin
has read access to all logs. Clinic Owners can access logs within their
tenant scope only.

> **6. MVP Release Strategy**

The platform is delivered in three milestone releases, each building on
the previous. This approach allows early user feedback to shape
subsequent versions while ensuring the core booking experience is stable
before advanced features are introduced.

**6.1 MVP v1 --- Foundation & Discovery (Weeks 1--6)**

+-----------------------------------------------------------------------+
| **Sprint Goal** |
| |
| Deliver the core patient journey end-to-end: discover a clinic, book |
| an appointment, and pay --- all from a mobile browser. |
+-----------------------------------------------------------------------+

**Feature Scope**

---

**Feature Area** **Deliverables** **Status**

---

**Authentication** Patient + Owner **MVP v1**
registration/login, JWT session,  
 role assignment

**Clinic Owner creates branches with name, **MVP v1**
Management** address, lat/lng coordinates

**Service Owner adds services with name, **MVP v1**
Management** duration, price per branch

**Clinic Discovery** GPS-based search, Haversine **MVP v1**
distance, radius filter, list +  
 map view

**Map (Leaflet)** Clinic markers on OpenStreetMap, **MVP v1**
user location, popup preview

**Appointment Fixed time slots, book/cancel, **MVP v1**
Booking** status tracking

**Payments** Stripe integration, card/Apple **MVP v1**
Pay/Google Pay, webhook  
 confirmation

**Owner Dashboard** Total bookings, basic revenue **MVP v1**
summary, appointment list

**Email Booking confirmation, reminder, **MVP v1**
Notifications** cancellation

**Audit Logs** Login events, appointment changes, **MVP v1**
payment actions

---

**Explicitly Excluded from MVP v1**

---

**Excluded Feature** **Planned Version**

---

Ratings & reviews system MVP v3

GCash / Maya payment methods MVP v2

Queue & walk-in management MVP v3

Patient medical records MVP v3

Advanced staff scheduling rules MVP v2

Map marker clustering MVP v2

SMS notifications MVP v2

PostGIS geo-queries MVP v2

---

**6.2 MVP v2 --- Staff, Payments & Notifications (Weeks 7--10)**

+-----------------------------------------------------------------------+
| **Sprint Goal** |
| |
| Expand the platform with staff role management, Philippine payment |
| methods, enhanced filtering, and SMS/in-app notification channels. |
+-----------------------------------------------------------------------+

- **Staff role system: separate dentist and receptionist access
  levels**

- Staff-specific scheduling views and appointment workflows

- GCash integration via Xendit or PayMongo

- Maya (formerly PayMaya) payment support

- Pay-at-clinic option (no online payment required)

- SMS notification support via Philippine SMS gateway
  (Semaphore/Vonage)

- Map marker clustering for high-density areas

- Advanced filtering: multi-service filter, exact availability time
  ranges

- PostGIS migration for production-grade geo-queries

- Improved owner analytics with weekly/monthly trend charts

**6.3 MVP v3 --- Community, Records & Queue (Weeks 11--16)**

+-----------------------------------------------------------------------+
| **Sprint Goal** |
| |
| Build social proof, manage patient health data, and handle walk-in |
| clinic scenarios with a queue management system. |
+-----------------------------------------------------------------------+

- **Ratings & reviews: patients rate completed appointments; clinic
  scores displayed on discovery**

- Review moderation tools for clinic owners and super admin

- Patient medical records: structured health history, allergies,
  conditions

- Treatment records: per-appointment dental chart and procedure notes

- Document attachments: X-rays, consent forms, treatment plans

- Queue management: walk-in registration, numbered queue, estimated
  wait time

- Queue display dashboard for clinic waiting room screens

- Advanced analytics: no-show rates, staff performance, revenue
  forecasting

- Patient retention tools: recall reminders, follow-up scheduling

> **7. API Design**

The API is built using oRPC (type-safe RPC over HTTP), ensuring
end-to-end type safety between the Next.js frontend and backend. All
endpoints require authentication unless explicitly marked public.

**7.1 Authentication**

---

**Endpoint** **Input** **Output**

---

auth.register name, email, password, userId, token
role

auth.login email, password token, user profile

auth.logout --- (session token) success

auth.refreshToken refreshToken new access token

---

**7.2 Clinic Discovery**

---

**Endpoint** **Description**

---

patient.searchNearbyClinics lat, lng, radius (km), serviceId? → returns
ranked clinic list with distance

patient.getClinicProfile branchId → returns full clinic details,
services, staff, hours

patient.getAvailability branchId, serviceId, date → returns
available time slots

---

**7.3 Appointments**

---

**Endpoint** **Description**

---

patient.createAppointment branchId, serviceId, staffId?, slotId,
patientNotes? → creates draft

patient.cancelAppointment appointmentId, reason? → cancels and
initiates refund if applicable

patient.rescheduleAppointment appointmentId, newSlotId → atomic cancel +
rebook

patient.getAppointmentHistory --- → paginated list of patient\'s
appointments

staff.updateAppointmentStatus appointmentId, status → advances appointment
status flow

staff.addAppointmentNote appointmentId, noteText → records treatment
note

---

**7.4 Payments**

---

**Endpoint** **Description**

---

payments.createIntent appointmentId → creates Stripe
PaymentIntent, returns client_secret

payments.webhookHandler Stripe event payload → confirms/fails
appointment based on event type

payments.requestRefund appointmentId → initiates refund per clinic
policy

---

**7.5 Owner & Admin**

---

**Endpoint** **Description**

---

owner.createBranch name, address, lat, lng, services\[\] →
creates new branch

owner.inviteStaff email, role, branchIds\[\] → sends invite to
staff member

owner.getDashboard dateRange → returns bookings, revenue,
appointment stats

admin.listTenants --- → returns all clinic tenants with usage
stats

admin.suspendTenant tenantId, reason → suspends clinic access

---

> **8. UX & Frontend Specifications**

**8.1 Discovery Page Layout**

The main discovery page is split into two synchronized panels:

+-----------------------------------+-----------------------------------+
| **Map Panel (Left/Full on | **List Panel (Right/Bottom on |
| Mobile)** | Mobile)** |
+===================================+===================================+
| - OpenStreetMap tiles via | - Sorted by distance (nearest |
| Leaflet | first) |
| | |
| - Clinic markers with click | - Clinic cards with distance, |
| popup | services, CTA |
| | |
| - User location indicator | - Click card → navigate to |
| | clinic profile |
| - Hover list item → highlight | |
| marker | - Infinite scroll or paginated |
| | results |
+-----------------------------------+-----------------------------------+

**8.2 Responsive Behavior**

- Desktop (≥1024px): Map left (60%), list right (40%)

- Tablet (768--1023px): Map top (50%), list bottom (50%) with
  scrollable cards

- Mobile (\<768px): Tab switcher between Map view and List view

- All booking flows optimized for mobile touch targets (≥44px)

**8.3 Booking Flow UX**

1.  Patient discovers clinic on map or list

2.  Views clinic profile: services, hours, photos (v2), available slots

3.  Selects service → selects date → selects time slot

4.  Reviews booking summary (service, dentist, location, price)

5.  Enters payment details via Stripe Elements

6.  Receives email confirmation and calendar invite

> **9. Non-Functional Requirements**

**9.1 Performance**

---

**Requirement** **Target**

---

API response time (95th \< 300ms
percentile)

Map initial load time \< 2 seconds
(markers + tiles)

Nearby clinics search \< 500ms (Haversine MVP), \< 200ms (PostGIS
query v2)

Payment intent creation \< 1 second

Page load (Largest \< 2.5 seconds on 4G mobile
Contentful Paint)

---

**9.2 Availability & Scalability**

- Target uptime: 99.9% monthly (max \~44 minutes downtime/month)

- Stateless backend design enables horizontal scaling on
  Vercel/Railway

- Database connection pooling via Supabase for high concurrency

- CDN edge caching for static assets and map tile requests

**9.3 Security**

---

**Control** **Implementation**

---

Transport Security HTTPS enforced across all endpoints and assets

Authentication JWT with short expiry + refresh token rotation
(Better Auth)

Authorization Role-based middleware + Supabase RLS policies
per table

Input Validation Zod schemas validate all API inputs before
processing

Rate Limiting Arcjet rate limiting on auth, booking, and
payment endpoints

Payment Security Stripe PCI-compliant; card data never touches
DentaConnect servers

Tenant Isolation All queries scoped to tenant_id; no cross-tenant
access possible

---

**9.4 Edge Case Handling**

- User denies GPS location: Fallback to manual address input with
  search autocomplete

- No clinics found in radius: Suggest radius increase options
  (1-click: +5km, +10km, +25km)

- Duplicate clinic coordinates: Apply coordinate jitter algorithm to
  offset overlapping markers

- Payment success but delayed webhook: Polling mechanism with 5-minute
  timeout before manual review flag

- Concurrent booking of same slot: Optimistic locking at database
  level; last request receives conflict error

- GPS timeout on mobile: Graceful fallback with user prompt after
  8-second timeout

> **10. Release Roadmap Summary**

---

**Version** **Timeline** **Key Deliverables**

---

**MVP v1** Weeks 1--6 Authentication, Branch/Service Setup,
Clinic Discovery (Map + List), Fixed-Slot
Booking, Stripe Payments, Owner Dashboard,
Email Notifications, Audit Logs

**MVP v2** Weeks 7--10 Staff Roles, GCash/Maya Payments,
Pay-at-Clinic, SMS Notifications, Map
Clustering, PostGIS Migration, Advanced
Filtering, Improved Analytics

**MVP v3** Weeks 11--16 Ratings & Reviews, Patient Medical Records,
Treatment Documentation, Queue & Walk-in
System, Advanced Analytics, Patient
Retention Tools

---

**10.1 Strategic Principles**

- Start simple: ship list view with basic markers before complex map
  features

- Mobile-first: every screen must be fully functional on a 375px
  viewport

- PH-market focus: prioritize GCash (v2) and walk-in support (v3)
  given local behavior

- Upgrade paths: Haversine → PostGIS, Stripe → multi-payment,
  single-tenant MVP → multi-tenant ready

- Zero double-bookings: this is a hard constraint from day one, not a
  nice-to-have

**DentaConnect --- PRD v2.1**

Product Team \| Confidential \| 2026
