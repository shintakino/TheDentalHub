# Patient Booking Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a frictionless, multi-step appointment booking experience with dynamic branding, automatic branch-skip logic, and atomic booking confirmation.

**Architecture:** A URL-driven wizard managed via search parameters in Next.js. Logic is split between a server component for routing/data-fetching and client components for interactivity.

**Tech Stack:** Next.js (App Router), TypeScript, Zod, Clerk (Auth), Drizzle (ORM), Lucide React (Icons).

---

### Task 1: API Endpoint - Fetch Available Slots

**Files:**
- Create: `app/api/branches/[branchId]/slots/route.ts`
- Test: `app/api/branches/[branchId]/slots/route.test.ts`

- [ ] **Step 1: Write the API route to fetch slots for a branch/date**
Using the existing `generateSlots` utility.

```typescript
// app/api/branches/[branchId]/slots/route.ts
import { NextResponse } from "next/server";
import { mockDb } from "@/lib/db/mock-db";
import { generateSlots } from "@/lib/scheduling/slot-generator";
import { z } from "zod";

const querySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  serviceId: z.string().uuid(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ branchId: string }> }
) {
  const { branchId } = await params;
  const { searchParams } = new URL(req.url);
  const validated = querySchema.safeParse({
    date: searchParams.get("date"),
    serviceId: searchParams.get("serviceId"),
  });

  if (!validated.success) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  const { date, serviceId } = validated.data;
  const branch = await mockDb.getBranchById(branchId);
  if (!branch) return NextResponse.json({ error: "Branch not found" }, { status: 404 });

  const service = await mockDb.getServiceById(serviceId);
  if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

  // Get booked appointments for this branch/date
  const booked = await mockDb.getAppointmentsByBranchAndDate(branchId, date);

  // Find operating hours for the specific day of week
  const dayOfWeek = new Date(date).getDay();
  const hours = branch.operatingHours.find(h => h.day === dayOfWeek);

  if (!hours || !hours.active) {
    return NextResponse.json({ slots: [] });
  }

  const slots = generateSlots({
    date,
    timezone: branch.timezone,
    operatingHours: { start: hours.open, end: hours.close },
    serviceDuration: service.duration,
    bufferTime: 15, // Default buffer
    bookedAppointments: booked.map(b => ({
      startTime: b.startTime.toISOString(),
      endTime: b.endTime.toISOString(),
    })),
  });

  return NextResponse.json({ slots });
}
```

- [ ] **Step 2: Commit**
```bash
git add app/api/branches/[branchId]/slots/route.ts
git commit -m "feat: add API endpoint for branch slot generation"
```

---

### Task 2: Refactor Booking Page - Wizard Routing

**Files:**
- Modify: `app/(booking)/[tenantSlug]/page.tsx`

- [ ] **Step 1: Implement Server-Side Step Logic with Branch Skipping**

```typescript
// app/(booking)/[tenantSlug]/page.tsx refactor
import { mockDb } from "@/lib/db/mock-db";
import { notFound, redirect } from "next/navigation";
import { ServiceStep } from "@/components/booking/ServiceStep";
import { BranchStep } from "@/components/booking/BranchStep";
import { SchedulingStep } from "@/components/booking/SchedulingStep";
import { ReviewStep } from "@/components/booking/ReviewStep";

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ 
    step?: string; 
    serviceId?: string; 
    branchId?: string; 
    date?: string; 
    time?: string;
  }>;
}) {
  const { tenantSlug } = await params;
  const { step = "service", serviceId, branchId, date, time } = await searchParams;

  const clinic = await mockDb.getClinicBySubdomain(tenantSlug);
  if (!clinic) notFound();

  const branches = await mockDb.getBranches(clinic.tenantId);
  const services = await mockDb.getServices(clinic.tenantId);

  // Dynamic Branch Selection Logic
  const hasSingleBranch = branches.length === 1;
  const effectiveBranchId = hasSingleBranch ? branches[0].id : branchId;

  // Render correct step
  return (
    <div className="max-w-4xl mx-auto space-y-12">
       {/* Step Indicator logic moved here or to a shared component */}
       {step === "service" && (
         <ServiceStep tenantSlug={tenantSlug} services={services} skipBranch={hasSingleBranch} />
       )}
       {step === "branch" && !hasSingleBranch && (
         <BranchStep tenantSlug={tenantSlug} branches={branches} serviceId={serviceId!} />
       )}
       {step === "time" && (
         <SchedulingStep 
           tenantSlug={tenantSlug} 
           branchId={effectiveBranchId!} 
           serviceId={serviceId!} 
         />
       )}
       {step === "review" && (
         <ReviewStep 
            tenantSlug={tenantSlug}
            branchId={effectiveBranchId!}
            serviceId={serviceId!}
            date={date!}
            time={time!}
         />
       )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**
```bash
git add app/(booking)/[tenantSlug]/page.tsx
git commit -m "refactor: implement server-side wizard routing and branch skip logic"
```

---

### Task 3: Booking API - Atomic Confirmation

**Files:**
- Create: `app/api/appointments/book/route.ts`

- [ ] **Step 1: Implement POST /api/appointments/book with Transactional Safety**

```typescript
// app/api/appointments/book/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { mockDb } from "@/lib/db/mock-db";
import { z } from "zod";

const bookingSchema = z.object({
  serviceId: z.string().uuid(),
  branchId: z.string().uuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  patientName: z.string(),
  patientEmail: z.string().email(),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const validated = bookingSchema.safeParse(body);

  if (!validated.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const { serviceId, branchId, startTime, endTime, patientName, patientEmail } = validated.data;

  // Check for availability again (Atomic check)
  const isAvailable = await mockDb.isSlotAvailable(branchId, startTime, endTime);
  if (!isAvailable) {
    return NextResponse.json({ error: "Slot already booked" }, { status: 409 });
  }

  const appointment = await mockDb.createAppointment({
    tenantId: "tenant_placeholder", // Extract from branch/service context
    branchId,
    serviceId,
    patientName,
    patientEmail,
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    status: "confirmed",
  });

  return NextResponse.json({ appointment });
}
```

- [ ] **Step 2: Commit**
```bash
git add app/api/appointments/book/route.ts
git commit -m "feat: implement atomic booking API endpoint"
```

---

### Task 4: Client Components - Interactive Wizard Steps

**Files:**
- Create: `components/booking/ServiceStep.tsx`
- Create: `components/booking/BranchStep.tsx`
- Create: `components/booking/SchedulingStep.tsx`
- Create: `components/booking/ReviewStep.tsx`

- [ ] **Step 1: Build Service Selection**
- [ ] **Step 2: Build Branch Selection (Only if >1 branch)**
- [ ] **Step 3: Build Scheduling (Calendar + Slot Grid)**
- [ ] **Step 4: Build Review + Final Confirmation (Triggers API)**

- [ ] **Step 5: Commit**
```bash
git add components/booking/*.tsx
git commit -m "feat: implement interactive booking wizard components"
```

---

### Task 5: Success Page & Final Polish

**Files:**
- Create: `app/(booking)/[tenantSlug]/success/[id]/page.tsx`

- [ ] **Step 1: Implement Appointment Success Page**
Displays appointment details and "Add to Calendar" (optional).

- [ ] **Step 2: Run build and type check**
Run: `npm run build`
Verify: Zero errors.

- [ ] **Step 3: Final Commit**
```bash
git add .
git commit -m "feat: finalize patient booking flow and success page"
```
