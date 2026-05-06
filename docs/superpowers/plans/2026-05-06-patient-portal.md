# Patient Portal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a secure, global dashboard for patients to manage their appointments across all clinics.

**Architecture:**
- **Data Model**: Update `appointments` table with `patient_id`.
- **Routing**: `app/(patient)/dashboard` for the main view.
- **Middleware**: Use Clerk for authentication and route protection.
- **API**: Endpoints for fetching user-specific appointments and cancelling them with 24h validation.

**Tech Stack:** Next.js (App Router), Drizzle ORM, Clerk Auth, shadcn/ui.

---

### Task 1: Update Database Schema

**Files:**
- Modify: `lib/db/schema.ts`

- [ ] **Step 1: Add patient_id to appointments table**

```typescript
// lib/db/schema.ts
// Add patientId to the appointments table definition
export const appointments = pgTable("appointments", {
  // ... existing columns
  patientId: text("patient_id"), // Optional for now to avoid breaking existing data
  // ... existing columns
});
```

- [ ] **Step 2: Generate and run migration**

Run: `npx drizzle-kit generate` and `npx drizzle-kit push` (or equivalent migration command).
Verify: `appointments` table now has `patient_id` column in the database.

- [ ] **Step 3: Commit**

```bash
git add lib/db/schema.ts
git commit -m "db: add patient_id to appointments table"
```

---

### Task 2: Protect Patient Routes & Layout

**Files:**
- Create: `app/(patient)/layout.tsx`
- Create: `app/(patient)/dashboard/page.tsx`
- Modify: `middleware.ts` (if applicable for route protection)

- [ ] **Step 1: Create patient layout with Clerk protection**

```tsx
// app/(patient)/layout.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";

export default async function PatientLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto py-8 px-4">
        {children}
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Create basic dashboard page**

```tsx
// app/(patient)/dashboard/page.tsx
export default function PatientDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Appointments</h1>
      <p className="text-muted-foreground">Manage your upcoming and past dental visits.</p>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/(patient)/layout.tsx app/(patient)/dashboard/page.tsx
git commit -m "feat: setup patient dashboard layout and basic page"
```

---

### Task 3: API - Fetch Patient Appointments

**Files:**
- Create: `app/api/patient/appointments/route.ts`

- [ ] **Step 1: Write the GET endpoint with patient filtering**

```typescript
// app/api/patient/appointments/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { appointments, clinics, branches, services } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await db.query.appointments.findMany({
    where: eq(appointments.patientId, userId),
    with: {
      clinic: true,
      branch: true,
      service: true,
    },
    orderBy: [desc(appointments.startTime)],
  });

  return NextResponse.json(data);
}
```

- [ ] **Step 2: Verify endpoint returns user-specific data**

Test with curl or a tool like Postman while logged in.
Verify: Only appointments where `patient_id === userId` are returned.

- [ ] **Step 3: Commit**

```bash
git add app/api/patient/appointments/route.ts
git commit -m "feat: add API to fetch patient appointments"
```

---

### Task 4: API - Cancel Appointment with 24h Limit

**Files:**
- Create: `app/api/patient/appointments/[id]/cancel/route.ts`
- Modify: `lib/appointments/state-machine.ts` (if needed)

- [ ] **Step 1: Implement cancellation logic with threshold check**

```typescript
// app/api/patient/appointments/[id]/cancel/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { appointments, auditLogs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const appointment = await db.query.appointments.findFirst({
    where: and(eq(appointments.id, params.id), eq(appointments.patientId, userId)),
  });

  if (!appointment) return NextResponse.json({ error: "Appointment not found" }, { status: 404 });

  // 24h threshold check
  const now = new Date();
  const threshold = new Date(appointment.startTime.getTime() - 24 * 60 * 60 * 1000);
  if (now > threshold) {
    return NextResponse.json({ error: "Cannot cancel within 24 hours of appointment" }, { status: 400 });
  }

  if (appointment.status !== "confirmed") {
    return NextResponse.json({ error: "Only confirmed appointments can be cancelled" }, { status: 400 });
  }

  await db.transaction(async (tx) => {
    await tx.update(appointments).set({ status: "cancelled", updatedAt: new Date() }).where(eq(appointments.id, params.id));
    await tx.insert(auditLogs).values({
      tenantId: appointment.tenantId,
      appointmentId: appointment.id,
      userId,
      action: "PATIENT_CANCELLED",
      payload: { reason: "Patient self-serve cancellation" },
    });
  });

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/patient/appointments/[id]/cancel/route.ts
git commit -m "feat: add API for patient appointment cancellation"
```

---

### Task 5: UI - Patient Dashboard

**Files:**
- Create: `components/patient/AppointmentCard.tsx`
- Modify: `app/(patient)/dashboard/page.tsx`

- [ ] **Step 1: Build AppointmentCard component**

Use `Card`, `Badge`, and `Button` from shadcn/ui. Show clinic name, date, time, and "Cancel" button.

- [ ] **Step 2: Fetch and display data in Dashboard**

Group appointments into "Upcoming" and "Past".

- [ ] **Step 3: Commit**

```bash
git add components/patient/AppointmentCard.tsx app/(patient)/dashboard/page.tsx
git commit -m "feat: implement patient dashboard UI"
```

---

### Task 6: Final Verification & Type Check

- [ ] **Step 1: Run build to ensure no type errors**

Run: `npm run build`

- [ ] **Step 2: Manual End-to-End Test**

1. Book an appointment.
2. View in Dashboard.
3. Cancel (if > 24h away).
4. Verify audit log entry.

- [ ] **Step 3: Commit**

```bash
git commit --allow-empty -m "chore: final verification complete"
```
