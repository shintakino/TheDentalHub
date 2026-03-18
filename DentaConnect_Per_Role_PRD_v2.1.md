🧑‍⚕️

**Patient**

Role PRD & MVP Feature Breakdown

────────────────────────────────────────────────────────────

_Everything the patient sees, does, and experiences on DentaConnect._

> **Patient Role --- Overview**

+-----------------------------------------------------------------------+
| **Who is the Patient?** |
| |
| A person seeking dental care who discovers clinics, books |
| appointments, makes payments, and manages their health journey |
| through DentaConnect. The patient is the primary end-user and the |
| core driver of platform growth. |
+-----------------------------------------------------------------------+

**Goals & Motivations**

- Find a trustworthy, nearby dental clinic quickly

- Book appointments at a convenient time without calling

- Know what services are available and how much they cost upfront

- Receive reminders and confirmations so nothing is missed

- Review personal appointment history

**Pain Points Addressed**

- No centralized way to discover dental clinics by proximity

- Booking by phone is slow, error-prone, and limited to clinic hours

- No visibility into real-time slot availability

- No consolidated appointment history or records

**Access & Permissions**

The Patient role has the narrowest data access of all roles. Enforced by
Supabase RLS and API middleware.

---

**Permission Area** **Patient Access**

---

Clinic data Read-only: public profile, services,
availability

Own appointments Full CRUD: create, view, reschedule, cancel

Other patients\' data No access

Payment records Own records only: view status, request refund

Staff / owner data No access

Medical records (v3) Own records only: view and download

---

> **Patient --- User Stories by MVP**

**MVP v1 --- Core Patient Journey**

+-----------------------------------------------------------------------+
| **Sprint Goal** |
| |
| Patient can register, find a nearby clinic on map and list, book an |
| appointment, and pay --- end to end. |
+-----------------------------------------------------------------------+

---

**ID** **User Story** **Acceptance Criteria** **MVP**

---

**PAT-01** As a patient, I want _Email verified; duplicate **v1**
to register with my emails rejected; JWT issued on  
 email and password so success._  
 that I can access the  
 platform.

**PAT-02** As a patient, I want _Failed attempts rate-limited **v1**
to log in securely so after 5 tries; session expires  
 that my data is in 24h._  
 protected.

**PAT-03** As a patient, I want _Geolocation API triggered on **v1**
the app to detect my discovery page load; fallback  
 GPS location so that prompt shown if denied._  
 nearby clinics appear  
 automatically.

**PAT-04** As a patient, I want _Default 5 km radius; slider **v1**
to search for clinics adjusts 1--50 km; results  
 within a radius so update on change._  
 that I only see  
 relevant options.

**PAT-05** As a patient, I want _Leaflet map loads in \< 2s; **v1**
to see clinics on a each clinic has a marker; user  
 map so that I location shown._  
 understand their  
 physical location.

**PAT-06** As a patient, I want _List sorted ascending by **v1**
to see a list of Haversine distance; distance  
 clinics sorted by shown in km per card._  
 distance so that I  
 find the nearest one  
 first.

**PAT-07** As a patient, I want _Popup shows: name, distance, **v1**
to click a map marker top 3 services, \'View\' and  
 and see a clinic \'Book\' buttons._  
 preview so that I can  
 decide to book.

**PAT-08** As a patient, I want _Profile shows: branch name, **v1**
to view a clinic address, hours, service list  
 profile so that I with prices and durations._  
 know what services  
 are available.

**PAT-09** As a patient, I want _Dropdown filter by service **v1**
to filter clinics by category; list and map update  
 service type so that in real-time._  
 I find the right  
 provider.

**PAT-10** As a patient, I want _Slots shown as a date picker **v1**
to see available time then time grid; unavailable  
 slots for a service slots are disabled._  
 so that I can pick a  
 convenient time.

**PAT-11** As a patient, I want _Booking creates \'draft\' **v1**
to book an status; moves to  
 appointment so that \'pending_payment\' on  
 my slot is reserved. confirm._

**PAT-12** As a patient, I want _Stripe Elements rendered; **v1**
to pay online with my successful charge moves  
 card so that my appointment to \'confirmed\'._  
 appointment is  
 confirmed.

**PAT-13** As a patient, I want _Email sent within 60s of **v1**
to receive a booking confirmation; includes date,  
 confirmation email so clinic, service, address._  
 that I have a record.

**PAT-14** As a patient, I want _Email sent 24h before **v1**
a reminder email scheduled time; includes clinic
before my appointment address and cancellation link._
so that I don\'t  
 forget.

**PAT-15** As a patient, I want _Cancel button available up to **v1**
to cancel my cancellation window; refund  
 appointment so that initiated automatically._  
 the slot is freed for  
 others.

**PAT-16** As a patient, I want _Paginated list showing: **v1**
to view my clinic, service, date, status,  
 appointment history amount paid._  
 so that I can track  
 past visits.

---

**MVP v2 --- Enhanced Payments & Notifications**

+-----------------------------------------------------------------------+
| **Sprint Goal** |
| |
| Add Philippine-local payment methods and SMS notifications to improve |
| conversion for PH market patients. |
+-----------------------------------------------------------------------+

---

**ID** **User Story** **Acceptance Criteria** **MVP**

---

**PAT-17** As a patient, I want _GCash option visible at **v2**
to pay via GCash so checkout; redirects to GCash  
 that I can use my flow; returns confirmed on  
 preferred PH payment success._  
 method.

**PAT-18** As a patient, I want _Maya option available; payment **v2**
to pay via Maya so flow completes within 3  
 that I have more minutes._  
 local payment  
 choices.

**PAT-19** As a patient, I want _\'Pay at clinic\' option **v2**
the option to pay at available; appointment  
 the clinic so that I confirmed immediately without  
 can book without payment._  
 paying online.

**PAT-20** As a patient, I want _SMS sent 24h before **v2**
to receive an SMS appointment via PH SMS gateway;
reminder so that I\'m opt-in during registration._  
 notified even without  
 email.

**PAT-21** As a patient, I want _Reschedule atomic: old slot **v2**
to reschedule my released, new slot locked in  
 appointment so that I one transaction._  
 can change to a  
 better time.

**PAT-22** As a patient, I want _\'Available Today\' filter **v2**
to filter by today\'s returns only clinics with open  
 availability so that slots on current date._  
 I can find an urgent  
 slot.

---

**MVP v3 --- Records, Reviews & Community**

+-----------------------------------------------------------------------+
| **Sprint Goal** |
| |
| Give patients ownership of their dental health data and the ability |
| to rate and review their clinic experiences. |
+-----------------------------------------------------------------------+

---

**ID** **User Story** **Acceptance Criteria** **MVP**

---

**PAT-23** As a patient, I want _Rating prompt appears after **v3**
to rate my completed status = \'completed\'; 1--5  
 appointment so that star + optional text._  
 others can choose  
 well.

**PAT-24** As a patient, I want _Records page shows treatment **v3**
to view my dental history, notes, and uploaded  
 records so that I attachments per visit._  
 have a personal  
 health history.

**PAT-25** As a patient, I want _Download as PDF; includes **v3**
to download my dental patient info, treatment  
 records so that I can history, and dentist notes._  
 share with other  
 dentists.

**PAT-26** As a patient, I want _Rating average and count shown **v3**
to see clinic ratings on clinic cards and map  
 on the discovery popups._  
 screen so that I can  
 compare quality.

---

**Patient Feature Summary by MVP Phase**

---

**MVP** **Key Features** **Story IDs**

---

v1 Register/Login, GPS Discovery, Map + List PAT-01 to
View, Radius Filter, Clinic Profile, Time PAT-16
Slot Selection, Booking, Stripe Payment,  
 Email Notifications, Cancel, History

v2 GCash + Maya Payments, Pay-at-Clinic, SMS PAT-17 to
Reminders, Reschedule, Today Filter PAT-22

v3 Ratings & Reviews, View/Download Medical PAT-23 to
Records, Rating on Discovery Cards PAT-26

---

🏢

**Clinic Owner**

Role PRD & MVP Feature Breakdown

────────────────────────────────────────────────────────────

_Everything a clinic owner needs to set up, manage, and grow their
dental practice._

> **Clinic Owner Role --- Overview**

+-----------------------------------------------------------------------+
| **Who is the Clinic Owner?** |
| |
| A dental clinic administrator or practice manager who sets up and |
| manages one or more branches on DentaConnect. They configure |
| services, manage staff, monitor bookings, and view financial |
| performance --- all within their tenant scope. |
+-----------------------------------------------------------------------+

**Goals & Motivations**

- Attract new patients through platform discovery

- Manage all branch operations from a single dashboard

- Configure services and pricing without developer help

- Onboard and manage staff with appropriate access controls

- Monitor revenue and booking trends in real time

**Pain Points Addressed**

- Fragmented tools: separate booking, scheduling, and accounting
  systems

- No online discoverability for new patients outside word-of-mouth

- Manual scheduling leads to double-bookings and gaps

- No financial overview without complex spreadsheets

**Access & Permissions**

---

**Permission Area** **Clinic Owner Access**

---

Branch data Full CRUD within own tenant

Services & pricing Full CRUD within own branches

Staff accounts Invite, assign branches, deactivate

Appointment data Read all; can reschedule or cancel

Financial data Own tenant revenue, payments, refunds

Other tenants\' data No access --- enforced by RLS

Super admin tools No access

---

> **Clinic Owner --- User Stories by MVP**

**MVP v1 --- Setup & Core Operations**

+-----------------------------------------------------------------------+
| **Sprint Goal** |
| |
| Owner can register, create branches with location data, add services, |
| view bookings, and access a basic revenue dashboard. |
+-----------------------------------------------------------------------+

---

**ID** **User Story** **Acceptance Criteria** **MVP**

---

**OWN-01** As an owner, I want _Owner account created; **v1**
to register my clinic tenant_id assigned; onboarding  
 on DentaConnect so checklist shown._  
 that I can start  
 receiving bookings.

**OWN-02** As an owner, I want _Branch saved with lat/lng; **v1**
to create a branch immediately visible in patient  
 with name, address, discovery search._  
 and coordinates so  
 that patients can  
 discover it.

**OWN-03** As an owner, I want _Services saved and shown on **v1**
to add services to a clinic profile; minimum 1  
 branch with name, service required to activate  
 price, and duration branch._  
 so that patients know  
 what\'s available.

**OWN-04** As an owner, I want _Hours grid per day of week; **v1**
to configure slots generated only within  
 operating hours per configured hours._  
 branch so that  
 availability is  
 accurate.

**OWN-05** As an owner, I want _Dashboard table with: date, **v1**
to view all upcoming patient name, service, branch,  
 appointments across status; filterable by branch  
 my branches so that I and date._  
 have full visibility.

**OWN-06** As an owner, I want _Dashboard shows: total **v1**
to see total bookings bookings, confirmed count,  
 and revenue so that I gross revenue --- for current  
 understand my month and all time._  
 business performance.

**OWN-07** As an owner, I want _Cancel triggers patient **v1**
to cancel a notification and refund  
 patient\'s initiation; audit log entry  
 appointment so that I created._  
 can handle  
 emergencies.

**OWN-08** As an owner, I want _Log shows: user, action, **v1**
to view audit logs entity, timestamp; filterable  
 for my branches so by date and action type._  
 that I can  
 investigate issues.

---

**MVP v2 --- Staff Management & Advanced Config**

+-----------------------------------------------------------------------+
| **Sprint Goal** |
| |
| Owner gains full staff management capabilities, configurable |
| cancellation policies, and enhanced financial reporting. |
+-----------------------------------------------------------------------+

---

**ID** **User Story** **Acceptance Criteria** **MVP**

---

**OWN-09** As an owner, I want _Invite email sent; staff **v2**
to invite staff completes registration;  
 members by email so assigned to branch with chosen  
 that they can access role._  
 their assigned  
 branch.

**OWN-10** As an owner, I want _Staff can be assigned to 1+ **v2**
to assign staff to branches; access restricted to  
 specific branches so assigned branches only._  
 that access is  
 properly scoped.

**OWN-11** As an owner, I want _Deactivated account cannot log **v2**
to deactivate a staff in; existing appointments  
 account so that reassigned or flagged._  
 former employees lose  
 access.

**OWN-12** As an owner, I want _Owner sets cancellation window **v2**
to configure a (e.g., 24h); system enforces  
 cancellation policy full/partial refund based on  
 so that refunds policy._  
 follow my clinic\'s  
 rules.

**OWN-13** As an owner, I want _Line/bar chart of bookings and **v2**
weekly and monthly revenue by week and month;  
 revenue charts so exportable as CSV._  
 that I see growth  
 trends.

**OWN-14** As an owner, I want _Branch switcher in nav; all **v2**
to manage multiple branches under single  
 branches from one tenant_id; consolidated  
 account so that I dashboard view._  
 don\'t need separate  
 logins.

---

**MVP v3 --- Reviews, Records & Analytics**

+-----------------------------------------------------------------------+
| **Sprint Goal** |
| |
| Owner gains tools to manage patient reviews, access deep analytics, |
| and oversee patient health records. |
+-----------------------------------------------------------------------+

---

**ID** **User Story** **Acceptance Criteria** **MVP**

---

**OWN-15** As an owner, I want _Reviews list with rating, **v3**
to see patient text, date, patient alias;  
 reviews for my sorted by newest first._  
 clinics so that I can  
 manage reputation.

**OWN-16** As an owner, I want _Flag button on review; flagged **v3**
to flag inappropriate review sent to super admin  
 reviews for queue; hidden from public  
 moderation so that my during review._  
 clinic is protected.

**OWN-17** As an owner, I want _Per-staff report: appointments **v3**
to see staff completed, cancellations, avg  
 performance metrics rating from patients._  
 so that I can manage  
 the team.

**OWN-18** As an owner, I want _No-show rate shown per branch; **v3**
to track no-show patients who missed 3+  
 rates so that I can appointments flagged._  
 implement reminder  
 strategies.

---

**Clinic Owner Feature Summary by MVP Phase**

---

**MVP** **Key Features** **Story IDs**

---

v1 Register, Branch + Service Setup, Operating OWN-01 to
Hours, Bookings Dashboard, Revenue Summary, OWN-08
Cancel Appointments, Audit Logs

v2 Staff Invite + Role Assignment, Branch OWN-09 to
Deactivation, Cancellation Policy, Revenue OWN-14
Charts, Multi-Branch Management

v3 Review Management, Flagging, Staff OWN-15 to
Performance, No-Show Analytics OWN-18

---

🦷

**Staff**

Role PRD & MVP Feature Breakdown

────────────────────────────────────────────────────────────

_Dentists and receptionists who manage the day-to-day appointment
workflow._

> **Staff Role --- Overview**

+-----------------------------------------------------------------------+
| **Who is the Staff?** |
| |
| Dental professionals (dentists, hygienists) and front-desk staff |
| (receptionists) assigned to one or more clinic branches. Staff manage |
| appointment workflows, record treatment notes, and coordinate the |
| daily patient schedule --- with access strictly limited to their |
| assigned branches. |
+-----------------------------------------------------------------------+

**Sub-Roles**

---

**Sub-Role** **Responsibilities**

---

Dentist Manages own schedule, records treatment notes,
updates appointment status during care

Receptionist Manages front-desk bookings, handles walk-ins (v3),
confirms and reschedules appointments

---

**Goals & Motivations**

- Have a clear view of today\'s and upcoming appointments

- Quickly update appointment status as patients arrive and are treated

- Record treatment notes digitally without paper forms

- Manage schedule changes without involving the clinic owner

**Access & Permissions**

---

**Permission Area** **Staff Access**

---

Appointments Read + update status for assigned branch(es)
only

Treatment notes Create and edit notes on own appointments

Own schedule View own assigned slots and hours

Patient contact info Read-only for booked patients on assigned slots

Financial / revenue No access
data

Other branches\' data No access

Service configuration No access --- owner only

---

> **Staff --- User Stories by MVP**

**MVP v2 --- Core Staff Workflow**

+-----------------------------------------------------------------------+
| **Sprint Goal** |
| |
| Staff can log in, view their schedule, manage appointment statuses, |
| and record treatment notes for their assigned branch. |
+-----------------------------------------------------------------------+

Note: Staff accounts are not available in MVP v1 --- all branch
operations are managed by the Clinic Owner. Staff roles are introduced
in MVP v2.

---

**ID** **User Story** **Acceptance Criteria** **MVP**

---

**STF-01** As a staff member, I _Login scoped to assigned **v2**
want to log in with branch(es); no access to other  
 my assigned tenants or branches._  
 credentials so that I  
 can access my branch.

**STF-02** As a dentist, I want _Calendar view with appointment **v2**
to view my schedule cards: patient name, service,  
 for today and the time, status._  
 upcoming week so that  
 I can prepare.

**STF-03** As a receptionist, I _Branch-level daily list sorted **v2**
want to view all by time; shows patient name,  
 appointments for the service, assigned dentist,  
 branch today so that status._  
 I can manage  
 check-ins.

**STF-04** As a staff member, I _Status update from **v2**
want to confirm a \'confirmed\' to  
 patient\'s arrival so \'in_progress\'; triggers  
 that the appointment in-app indicator update._  
 moves to in-progress.

**STF-05** As a dentist, I want _Status moves to \'completed\'; **v2**
to mark an note entry prompt appears; slot
appointment as cleared from schedule._  
 completed so that the  
 treatment is  
 recorded.

**STF-06** As a dentist, I want _Note saved with dentist ID, **v2**
to write a treatment timestamp, and appointment  
 note for a completed reference; visible in patient  
 appointment so that records (v3)._  
 there\'s a clinical  
 record.

**STF-07** As a receptionist, I _Reschedule atomic transaction; **v2**
want to reschedule an patient receives email  
 appointment on behalf notification of new time._  
 of a patient so that  
 I can assist them.

**STF-08** As a receptionist, I _Cancel with reason; patient **v2**
want to cancel an email/SMS sent; refund  
 appointment so that initiated per cancellation  
 the slot is freed and policy._  
 patient is notified.

---

**MVP v3 --- Queue, Walk-ins & Records**

+-----------------------------------------------------------------------+
| **Sprint Goal** |
| |
| Staff gains tools to manage walk-in patients with queue numbers and |
| access structured patient health records. |
+-----------------------------------------------------------------------+

---

**ID** **User Story** **Acceptance Criteria** **MVP**

---

**STF-09** As a receptionist, I _Walk-in form captures: name, **v3**
want to register a contact, requested service;  
 walk-in patient so queue number assigned  
 that they are added automatically._  
 to the queue.

**STF-10** As a receptionist, I _Queue dashboard shows: number, **v3**
want to view the live name, service, wait time  
 queue so that I know estimate, status;  
 who is next. auto-refreshes every 30s._

**STF-11** As a receptionist, I _\'Call next\' button updates **v3**
want to call the next patient status to  
 patient from the \'in_progress\'; queue number  
 queue so that flow is displayed on waiting room  
 managed. screen._

**STF-12** As a dentist, I want _Patient profile shows: past **v3**
to view a patient\'s treatments, notes, allergies,  
 dental history before conditions --- for patients who
their appointment so have consented._  
 that I can provide  
 better care.

**STF-13** As a dentist, I want _Tooth-chart diagram with **v3**
to add structured condition tagging per tooth;  
 dental chart notes so notes saved to patient record._
that treatment is  
 properly documented.

---

**Staff Feature Summary by MVP Phase**

---

**MVP** **Key Features** **Story IDs**

---

v1 Not available --- Owner manages all ---
operations

v2 Login, Schedule View, Branch Appointment STF-01 to
List, Status Updates (confirm/complete), STF-08
Treatment Notes, Reschedule, Cancel on  
 Behalf

v3 Walk-in Queue, Queue Dashboard, Call Next, STF-09 to
Patient History Access, Dental Chart Notes STF-13

---

🛡️

**Super Admin**

Role PRD & MVP Feature Breakdown

────────────────────────────────────────────────────────────

_Platform administrator with full visibility across all tenants and
system operations._

> **Super Admin Role --- Overview**

+-----------------------------------------------------------------------+
| **Who is the Super Admin?** |
| |
| A platform operator employed by the DentaConnect team. The Super |
| Admin has full cross-tenant access to monitor system health, manage |
| clinic accounts, resolve disputes, enforce compliance, and maintain |
| platform integrity. This role cannot be self-registered --- accounts |
| are provisioned internally. |
+-----------------------------------------------------------------------+

**Goals & Motivations**

- Ensure the platform is operating reliably and without abuse

- Onboard new clinic owners and manage tenant lifecycle

- Investigate and resolve patient-clinic disputes

- Monitor suspicious activity and enforce platform policies

- Maintain system compliance and audit trail integrity

**Access & Permissions**

---

**Permission Area** **Super Admin Access**

---

All tenants Full read access; can suspend or reinstate

All appointments Read-only cross-tenant for dispute resolution

All payments Read-only; can flag for manual review

All audit logs Full read access across all tenants

User accounts Can deactivate any user; can reset passwords

Reviews (v3) Moderate flagged reviews; approve or remove

Platform config Feature flags, rate limits, system settings

---

> **Super Admin --- User Stories by MVP**

**MVP v1 --- Monitoring & Tenant Management**

+-----------------------------------------------------------------------+
| **Sprint Goal** |
| |
| Super Admin can monitor the platform, manage clinic owner accounts, |
| and access cross-tenant audit logs from day one. |
+-----------------------------------------------------------------------+

---

**ID** **User Story** **Acceptance Criteria** **MVP**

---

**ADM-01** As a super admin, I _Tenant list with: name, owner **v1**
want to view all email, branch count, booking  
 registered clinic count, registration date,  
 tenants so that I status._  
 have a complete  
 platform overview.

**ADM-02** As a super admin, I _Suspended tenant\'s branches **v1**
want to suspend a hidden from discovery; owner  
 clinic tenant so that notified by email; reason  
 I can enforce logged._  
 compliance.

**ADM-03** As a super admin, I _Reinstatement restores **v1**
want to reinstate a discovery visibility; owner  
 suspended tenant so notified; audit log entry  
 that compliant created._  
 clinics can resume.

**ADM-04** As a super admin, I _Filterable log by tenant, **v1**
want to view user, action type, date range;  
 cross-tenant audit export to CSV._  
 logs so that I can  
 investigate  
 incidents.

**ADM-05** As a super admin, I _Dashboard shows: total **v1**
want to view bookings, active tenants, total
system-wide booking payments processed, error  
 and payment rates._  
 statistics so that I  
 can monitor platform  
 health.

**ADM-06** As a super admin, I _Deactivated user cannot log **v1**
want to deactivate in; their data is retained;  
 any user account so reason and admin ID logged._  
 that I can remove  
 abusive users.

---

**MVP v2 --- Disputes & Policy Management**

+-----------------------------------------------------------------------+
| **Sprint Goal** |
| |
| Super Admin gains dispute resolution tools and the ability to |
| configure platform-wide policies. |
+-----------------------------------------------------------------------+

---

**ID** **User Story** **Acceptance Criteria** **MVP**

---

**ADM-07** As a super admin, I _Dispute queue with: patient, **v2**
want to view clinic, appointment,  
 patient-submitted description, submitted date;  
 disputes so that I status tracking._  
 can resolve them  
 fairly.

**ADM-08** As a super admin, I _Admin can trigger Stripe **v2**
want to force-issue a refund for any payment; action  
 refund for a disputed logged with admin ID and  
 payment so that reason._  
 patients are  
 protected.

**ADM-09** As a super admin, I _Rate limit config per endpoint **v2**
want to configure category; changes take effect  
 platform-level rate within 60s; previous config  
 limits so that abuse preserved._  
 is prevented.

**ADM-10** As a super admin, I _Webhook log with: event type, **v2**
want to view failed status, timestamp, retry count;
webhook events so manual retry button available._
that payment issues  
 are identified  
 quickly.

---

**MVP v3 --- Content Moderation & Advanced Analytics**

+-----------------------------------------------------------------------+
| **Sprint Goal** |
| |
| Super Admin gains content moderation tools for the reviews system and |
| access to platform-wide trend analytics. |
+-----------------------------------------------------------------------+

---

**ID** **User Story** **Acceptance Criteria** **MVP**

---

**ADM-11** As a super admin, I _Flagged review queue; approve **v3**
want to review (restore) or reject (remove);  
 flagged clinic decision logged with reason._  
 reviews so that  
 inappropriate content  
 is removed.

**ADM-12** As a super admin, I _Charts: weekly active users, **v3**
want platform-wide new bookings, tenant growth,  
 trend analytics so top services by volume._  
 that I can identify  
 growth opportunities.

**ADM-13** As a super admin, I _Feature flag dashboard; toggle **v3**
want to manage per tenant or globally; changes
feature flags so that logged._  
 I can roll out  
 features  
 progressively.

---

**Super Admin Feature Summary by MVP Phase**

---

**MVP** **Key Features** **Story IDs**

---

v1 Tenant List, Suspend/Reinstate, ADM-01 to
Cross-Tenant Audit Logs, System Dashboard, ADM-06
Deactivate User

v2 Dispute Queue, Force Refund, Rate Limit ADM-07 to
Config, Webhook Log ADM-10

v3 Review Moderation, Platform Analytics, ADM-11 to
Feature Flags ADM-13

---

**🦷 DentaConnect**

Cross-Role MVP Feature Matrix

────────────────────────────────────────────────────────────

**Complete Feature Matrix Across All Roles & MVP Phases**

---

**Feature** **Patient** **Owner** **Staff** **Super
Admin**

---

**Register / **v1\*\* **v1** **v2** **Internal**
Login\*\*

**GPS Clinic **v1** --- --- ---
Discovery**

**Map View **v1** --- --- ---
(Leaflet)**

**List View (by **v1** --- --- ---
distance)**

**Clinic Profile **v1\*\* **v1 (own)** --- **v1 (all)**
View\*\*

**Manage --- **v1** --- **v1 (read)**
Branches**

**Manage --- **v1** --- ---
Services**

**Book **v1** --- --- ---
Appointment**

**Cancel **v1\*\* **v1** **v2** **v1 (force)**
Appointment\*\*

**Reschedule** **v2** --- **v2** ---

**Stripe **v1** --- --- ---
Payment**

**GCash / Maya **v2** --- --- ---
Payment**

**Email **v1\*\* **v1** **v2** ---
Notifications\*\*

**SMS **v2** --- **v2** ---
Notifications**

**Appointment --- --- **v2** ---
Status Updates**

**Treatment --- --- **v2** ---
Notes**

**Staff Invite & --- **v2** --- ---
Management**

**Owner Revenue --- **v1** --- **v1 (all)**
Dashboard**

**Audit Logs** --- **v1 (own)** --- **v1 (all)**

**Dispute --- --- --- **v2**
Resolution**

**Webhook --- --- --- **v2**
Monitoring**

**Force Refund** --- --- --- **v2**

**Walk-in Queue** --- --- **v3** ---

**Patient Medical **v3 (own)** --- **v3 (view)** ---
Records**

**Ratings & **v3\*\* **v3 (view)** --- **v3
Reviews** (moderate)\*\*

**Platform --- **v2 (own)** --- **v3 (all)**
Analytics**

**Feature Flags** --- --- --- **v3**

---

────────────────────────────────────────────────────────────

DentaConnect --- Per-Role PRD v2.1 \| Product Team \| Confidential \|
2026
