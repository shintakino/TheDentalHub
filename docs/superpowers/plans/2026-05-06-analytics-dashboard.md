# Analytics Dashboard (MVP) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement an Analytics Dashboard for Clinic Owners to monitor operational efficiency, booking trends, no-show rates, and staff utilization.

**Architecture:** Optimized Drizzle ORM aggregation queries executed server-side, wrapped in React `cache()` for performance. Metrics are exposed via a strictly typed API and visualized using Recharts.

**Tech Stack:** Next.js (App Router), Drizzle ORM, Zod, Recharts, Clerk (RBAC), shadcn/ui.

---

### Task 1: Schema Update (Branches & Staff)

**Files:**
- Modify: `lib/db/schema.ts`

- [ ] **Step 1: Add operating hours and timezone to `branches` and target hours to `staff`**

```typescript
// lib/db/schema.ts

// ... in branches table
  timezone: text("timezone").default("UTC").notNull(),
  operatingHoursStart: text("operating_hours_start").default("09:00").notNull(),
  operatingHoursEnd: text("operating_hours_end").default("17:00").notNull(),

// ... in staff table
  targetDailyHours: integer("target_daily_hours").default(8).notNull(),
```

- [ ] **Step 2: Commit schema changes**

```bash
git add lib/db/schema.ts
git commit -m "schema: add analytics-related columns to branches and staff"
```

---

### Task 2: Analytics Validation Schemas

**Files:**
- Modify: `lib/validations.ts`

- [ ] **Step 1: Add Zod schemas for analytics query params and response**

```typescript
// lib/validations.ts

export const analyticsQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const analyticsResponseSchema = z.object({
  summary: z.object({
    totalBookings: z.number(),
    noShowRate: z.number(),
    avgUtilization: z.number(),
    peakHour: z.string(),
  }),
  timeSeries: z.array(z.object({
    date: z.string(),
    bookings: z.number(),
    utilization: z.number(),
  })),
  peakHours: z.array(z.object({
    hour: z.string(),
    count: z.number(),
  })),
});

export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
export type AnalyticsResponse = z.infer<typeof analyticsResponseSchema>;
```

- [ ] **Step 2: Commit validations**

```bash
git add lib/validations.ts
git commit -m "feat: add analytics validation schemas"
```

---

### Task 3: Analytics Query Layer

**Files:**
- Create: `lib/analytics/queries.ts`

- [ ] **Step 1: Implement the core analytics query functions**
Note: Use `sql` helper from `drizzle-orm` for aggregations.

```typescript
// lib/analytics/queries.ts
import { db } from "@/lib/db";
import { appointments, staff, branches } from "@/lib/db/schema";
import { and, eq, gte, lte, sql, ne } from "drizzle-orm";
import { cache } from "react";

export const getAnalyticsOverview = cache(async (tenantId: string, startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  // 1. Total Bookings (excluding cancelled)
  const [bookingsCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(appointments)
    .where(
      and(
        eq(appointments.tenantId, tenantId),
        gte(appointments.startTime, start),
        lte(appointments.startTime, end),
        ne(appointments.status, "cancelled")
      )
    );

  // 2. No-Show Rate
  const [noShowStats] = await db
    .select({
      total: sql<number>`count(*)`,
      noShows: sql<number>`count(*) filter (where status = 'no_show')`
    })
    .from(appointments)
    .where(
      and(
        eq(appointments.tenantId, tenantId),
        gte(appointments.startTime, start),
        lte(appointments.startTime, end)
      )
    );

  const noShowRate = noShowStats.total > 0 ? noShowStats.noShows / noShowStats.total : 0;

  // 3. Peak Hours
  const peakHours = await db
    .select({
      hour: sql<string>`to_char(start_time, 'HH24:00')`,
      count: sql<number>`count(*)`
    })
    .from(appointments)
    .where(
      and(
        eq(appointments.tenantId, tenantId),
        gte(appointments.startTime, start),
        lte(appointments.startTime, end)
      )
    )
    .groupBy(sql`to_char(start_time, 'HH24:00')`)
    .orderBy(sql`count(*) desc`);

  // 4. Staff Utilization
  const [totalBookedMinutes] = await db
    .select({
      minutes: sql<number>`sum(extract(epoch from (end_time - start_time)) / 60)`
    })
    .from(appointments)
    .where(
      and(
        eq(appointments.tenantId, tenantId),
        gte(appointments.startTime, start),
        lte(appointments.startTime, end),
        sql`status in ('confirmed', 'completed', 'in_progress', 'checked_in')`
      )
    );

  const staffList = await db.select().from(staff).where(eq(staff.tenantId, tenantId));
  const totalStaffTargetMinutes = staffList.reduce((acc, s) => acc + (s.targetDailyHours * 60), 0);
  
  // Calculate days in range
  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
  const denominator = (totalStaffTargetMinutes * daysDiff) || 1;
  const avgUtilization = (totalBookedMinutes.minutes || 0) / denominator;

  // 5. Time Series (Daily)
  const timeSeries = await db
    .select({
      date: sql<string>`to_char(start_time, 'YYYY-MM-DD')`,
      bookings: sql<number>`count(*)`
    })
    .from(appointments)
    .where(
      and(
        eq(appointments.tenantId, tenantId),
        gte(appointments.startTime, start),
        lte(appointments.startTime, end),
        ne(appointments.status, "cancelled")
      )
    )
    .groupBy(sql`to_char(start_time, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(start_time, 'YYYY-MM-DD')`);

  return {
    summary: {
      totalBookings: Number(bookingsCount.count),
      noShowRate,
      avgUtilization: Math.min(avgUtilization, 1), // Cap at 100%
      peakHour: peakHours[0]?.hour || "N/A",
    },
    timeSeries: timeSeries.map(t => ({
      date: t.date,
      bookings: Number(t.bookings),
      utilization: avgUtilization // Simplified for MVP: same avg across days
    })),
    peakHours: peakHours.map(p => ({
      hour: p.hour,
      count: Number(p.count)
    }))
  };
});
```

- [ ] **Step 2: Commit query layer**

```bash
git add lib/analytics/queries.ts
git commit -m "feat: implement analytics query layer with drizzle"
```

---

### Task 4: Analytics API Route

**Files:**
- Create: `app/api/analytics/overview/route.ts`

- [ ] **Step 1: Implement the GET endpoint with RBAC**

```typescript
// app/api/analytics/overview/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getTenantId } from "@/lib/db/tenant";
import { getAnalyticsOverview } from "@/lib/analytics/queries";
import { analyticsQuerySchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const { sessionClaims } = await auth();
    const tenantId = await getTenantId();

    // RBAC: Check for admin role in Clerk Org
    const role = sessionClaims?.metadata?.role;
    if (role !== "admin" && sessionClaims?.org_role !== "org:admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const validation = analyticsQuerySchema.safeParse({ startDate, endDate });
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const data = await getAnalyticsOverview(
      tenantId,
      validation.data.startDate,
      validation.data.endDate
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("Analytics API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit API route**

```bash
git add app/api/analytics/overview/route.ts
git commit -m "feat: add analytics overview API endpoint with RBAC"
```

---

### Task 5: Analytics Dashboard UI Components

**Files:**
- Create: `components/dashboard/AnalyticsOverview.tsx`

- [ ] **Step 1: Implement the UI with Recharts**

```tsx
// components/dashboard/AnalyticsOverview.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";
import { AnalyticsResponse } from "@/lib/validations";
import { Users, Calendar, Clock, AlertCircle } from "lucide-react";

export function AnalyticsOverview({ data }: { data: AnalyticsResponse }) {
  const stats = [
    { title: "Total Bookings", value: data.summary.totalBookings, icon: Calendar, color: "text-blue-600" },
    { title: "No-Show Rate", value: `${(data.summary.noShowRate * 100).toFixed(1)}%`, icon: AlertCircle, color: "text-rose-600" },
    { title: "Avg Utilization", value: `${(data.summary.avgUtilization * 100).toFixed(0)}%`, icon: Users, color: "text-emerald-600" },
    { title: "Peak Hour", value: data.summary.peakHour, icon: Clock, color: "text-amber-600" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-[0_4px_24px_rgba(0,0,0,0.04)] bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium font-outfit text-slate-500 uppercase tracking-wider">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-playfair font-semibold text-obsidian">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="p-6 border-none shadow-[0_4px_32px_rgba(0,0,0,0.06)] bg-white">
          <CardHeader>
            <CardTitle className="font-playfair text-xl text-obsidian">Booking Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.timeSeries}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="bookings" stroke="#0047FF" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="p-6 border-none shadow-[0_4px_32px_rgba(0,0,0,0.06)] bg-white">
          <CardHeader>
            <CardTitle className="font-playfair text-xl text-obsidian">Volume by Hour</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.peakHours}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#0047FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit UI component**

```bash
git add components/dashboard/AnalyticsOverview.tsx
git commit -m "feat: implement analytics dashboard overview components with charts"
```

---

### Task 6: Analytics Page

**Files:**
- Create: `app/(dashboard)/analytics/page.tsx`

- [ ] **Step 1: Implement the Page component with server-side fetching**

```tsx
// app/(dashboard)/analytics/page.tsx
import { getAnalyticsOverview } from "@/lib/analytics/queries";
import { getTenantId } from "@/lib/db/tenant";
import { AnalyticsOverview } from "@/components/dashboard/AnalyticsOverview";
import { format, subDays } from "date-fns";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ startDate?: string; endDate?: string }>;
}) {
  const tenantId = await getTenantId();
  const resolvedParams = await searchParams;
  
  const endDate = resolvedParams.endDate || format(new Date(), "yyyy-MM-dd");
  const startDate = resolvedParams.startDate || format(subDays(new Date(), 30), "yyyy-MM-dd");

  const data = await getAnalyticsOverview(tenantId, startDate, endDate);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-4xl font-playfair font-semibold text-obsidian">Analytics</h1>
        <p className="text-slate-500 font-outfit text-lg">Performance insights for your clinic</p>
      </div>
      
      <AnalyticsOverview data={data} />
    </div>
  );
}
```

- [ ] **Step 2: Commit Analytics page**

```bash
git add app/(dashboard)/analytics/page.tsx
git commit -m "feat: add analytics dashboard page"
```

---

### Task 7: Final Verification

- [ ] **Step 1: Run build to check for type errors**

Run: `npm run build`
Expected: Success with no errors.

- [ ] **Step 2: Manual Check (Optional if possible)**
Verify the dashboard is accessible at `/analytics`.

- [ ] **Step 3: Update Progress Tracker**
Mark Feature 09 as completed.
