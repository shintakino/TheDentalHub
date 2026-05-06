# Super Admin Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a centralized Super Admin Dashboard for cross-tenant management, health monitoring, and emergency appointment overrides.

**Architecture:** Dedicated route group `app/(super-admin)` with server-side role validation, a privileged query layer in `lib/admin/queries.ts`, and a bypass API for appointment state overrides.

**Tech Stack:** Next.js 16 (App Router), Clerk (RBAC), Drizzle ORM, Tailwind CSS, Shadcn UI.

---

### Task 1: Privileged Query Layer

**Files:**
- Create: `lib/admin/queries.ts`
- Test: `lib/admin/queries.test.ts` (Mocked DB test)

- [ ] **Step 1: Create the privileged query functions**

```typescript
import { db } from "@/lib/db";
import { clinics, branches, appointments, auditLogs } from "@/lib/db/schema";
import { count, eq, sql } from "drizzle-orm";

export async function getAllTenants() {
  return await db.select({
    id: clinics.id,
    tenantId: clinics.tenantId,
    name: clinics.name,
    logoUrl: clinics.logoUrl,
    branchCount: sql<number>`(SELECT count(*) FROM ${branches} WHERE ${branches.tenantId} = ${clinics.tenantId})`.mapWith(Number),
    appointmentCount: sql<number>`(SELECT count(*) FROM ${appointments} WHERE ${appointments.tenantId} = ${clinics.tenantId})`.mapWith(Number),
    appointmentsToday: sql<number>`(SELECT count(*) FROM ${appointments} WHERE ${appointments.tenantId} = ${clinics.tenantId} AND ${appointments.startTime}::date = CURRENT_DATE)`.mapWith(Number),
  }).from(clinics);
}

export async function getGlobalAuditLogs() {
  return await db.select()
    .from(auditLogs)
    .orderBy(sql`${auditLogs.createdAt} DESC`)
    .limit(100);
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/admin/queries.ts
git commit -m "feat(admin): add privileged query layer for cross-tenant data"
```

### Task 2: Secure Layout & Routing

**Files:**
- Create: `app/(super-admin)/layout.tsx`
- Create: `app/(super-admin)/admin/page.tsx`

- [ ] **Step 1: Implement the secure layout with role check**

```tsx
import { isSuperAdmin } from "@/lib/auth/roles";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdmin = await isSuperAdmin();

  if (!isAdmin) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 bg-slate-50">
        {children}
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Implement the admin index redirect**

```tsx
import { redirect } from "next/navigation";

export default function AdminPage() {
  redirect("/admin/tenants");
}
```

- [ ] **Step 3: Commit**

```bash
git add app/(super-admin)/layout.tsx app/(super-admin)/admin/page.tsx
git commit -m "feat(admin): setup secure routing and layout for super admin"
```

### Task 3: Tenants Overview Page

**Files:**
- Create: `app/(super-admin)/admin/tenants/page.tsx`

- [ ] **Step 1: Implement the Tenants Overview table**

```tsx
import { getAllTenants } from "@/lib/admin/queries";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function TenantsPage() {
  const tenants = await getAllTenants();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tenants Overview</h1>
        <p className="text-muted-foreground">Monitor all clinic tenants on the platform.</p>
      </div>

      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Clinic</TableHead>
              <TableHead>Tenant ID</TableHead>
              <TableHead>Branches</TableHead>
              <TableHead>Total Appts</TableHead>
              <TableHead>Appts Today</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.map((tenant) => (
              <TableRow key={tenant.id}>
                <TableCell className="font-medium">{tenant.name}</TableCell>
                <TableCell className="font-mono text-xs">{tenant.tenantId}</TableCell>
                <TableCell>{tenant.branchCount}</TableCell>
                <TableCell>{tenant.appointmentCount}</TableCell>
                <TableCell>{tenant.appointmentsToday}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Active
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/(super-admin)/admin/tenants/page.tsx
git commit -m "feat(admin): implement tenants overview page"
```

### Task 4: Global Audit Logs Page

**Files:**
- Create: `app/(super-admin)/admin/logs/page.tsx`

- [ ] **Step 1: Implement the Audit Logs feed**

```tsx
import { getGlobalAuditLogs } from "@/lib/admin/queries";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

export default async function AuditLogsPage() {
  const logs = await getGlobalAuditLogs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Global Audit Logs</h1>
        <p className="text-muted-foreground">Real-time stream of all system activity.</p>
      </div>

      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Tenant</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-xs">
                  {format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss")}
                </TableCell>
                <TableCell className="font-mono text-xs">{log.tenantId}</TableCell>
                <TableCell>
                  <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">
                    {log.action}
                  </code>
                </TableCell>
                <TableCell className="text-xs">{log.userId}</TableCell>
                <TableCell className="text-xs max-w-xs truncate">
                  {JSON.stringify(log.payload)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/(super-admin)/admin/logs/page.tsx
git commit -m "feat(admin): implement global audit logs page"
```

### Task 5: Emergency Override API

**Files:**
- Create: `app/api/admin/appointments/[id]/override/route.ts`

- [ ] **Step 1: Implement the override endpoint**

```typescript
import { NextResponse } from "next/server";
import { isSuperAdmin } from "@/lib/auth/roles";
import { db } from "@/lib/db";
import { appointments, auditLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const isAdmin = await isSuperAdmin();
  if (!isAdmin) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const { userId } = await auth();
  const { newStatus, reason } = await req.json();

  if (!newStatus || !reason) {
    return new NextResponse("Missing required fields", { status: 400 });
  }

  const appointmentId = params.id;

  try {
    await db.transaction(async (tx) => {
      // 1. Get current state for audit
      const [current] = await tx
        .select()
        .from(appointments)
        .where(eq(appointments.id, appointmentId))
        .limit(1);

      if (!current) {
        throw new Error("Appointment not found");
      }

      // 2. Perform override
      await tx
        .update(appointments)
        .set({ status: newStatus, updatedAt: new Date() })
        .where(eq(appointments.id, appointmentId));

      // 3. Log override
      await tx.insert(auditLogs).values({
        tenantId: current.tenantId,
        appointmentId: appointmentId,
        userId: userId!,
        action: "ADMIN_OVERRIDE",
        payload: {
          oldStatus: current.status,
          newStatus,
          reason,
          isSystemOverride: true,
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN_OVERRIDE_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/admin/appointments/[id]/override/route.ts
git commit -m "feat(admin): implement emergency appointment override API"
```

### Task 6: Final Verification

- [ ] **Step 1: Run type check**

Run: `npm run build`
Expected: Success with no errors.

- [ ] **Step 2: Commit**

```bash
git commit --allow-empty -m "chore: verify super admin dashboard implementation"
```
