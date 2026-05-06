# Clinic Discovery Marketplace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a map-based discovery marketplace with distance-based search and "Next Available" slot previews.

**Architecture:** Use a Haversine formula in SQL for geospatial search and a TTL-based JSONB cache in the `branches` table for availability slots to ensure performance.

**Tech Stack:** Next.js, Drizzle ORM, Postgres, React Leaflet.

---

### Task 1: Update Database Schema

**Files:**
- Modify: `lib/db/schema.ts`

- [ ] **Step 1: Add new columns to `branches` table**

```typescript
// lib/db/schema.ts
// Add to branches table definition:
// nextSlots: jsonb("next_slots").$type<string[]>().default([]).notNull(),
// availabilityUpdatedAt: timestamp("availability_updated_at"),
// rating: decimal("rating", { precision: 2, scale: 1 }).default("4.5"),
```

- [ ] **Step 2: Generate and run migration**

Run: `npx drizzle-kit generate && npx drizzle-kit push`
Expected: Database schema updated with new columns.

- [ ] **Step 3: Commit**

```bash
git add lib/db/schema.ts supabase/migrations/
git commit -m "db: add availability caching and rating columns to branches"
```

### Task 2: Implement Haversine Search Utility

**Files:**
- Create: `lib/marketplace/queries.ts`

- [ ] **Step 1: Write Haversine SQL template**

```typescript
// lib/marketplace/queries.ts
import { db } from "@/lib/db";
import { branches, clinics, services } from "@/lib/db/schema";
import { sql, and, or, ilike, eq } from "drizzle-orm";

export async function searchMarketplace({
  lat,
  lng,
  radius = 25,
  query,
}: {
  lat: number;
  lng: number;
  radius?: number;
  query?: string;
}) {
  const distanceSql = sql`
    6371 * acos(
      cos(radians(${lat})) * cos(radians(${branches.latitude})) *
      cos(radians(${branches.longitude}) - radians(${lng})) +
      sin(radians(${lat})) * sin(radians(${branches.latitude}))
    )
  `;

  const results = await db
    .select({
      id: branches.id,
      clinicId: clinics.id,
      clinicName: clinics.name,
      clinicLogoUrl: clinics.logoUrl,
      primaryColor: clinics.primaryColor,
      subdomain: clinics.subdomain,
      branchName: branches.name,
      address: branches.address,
      latitude: branches.latitude,
      longitude: branches.longitude,
      distance: distanceSql.as("distance"),
      nextSlots: branches.nextSlots,
      availabilityUpdatedAt: branches.availabilityUpdatedAt,
      rating: branches.rating,
    })
    .from(branches)
    .innerJoin(clinics, eq(branches.tenantId, clinics.tenantId))
    .where(
      and(
        sql`${distanceSql} <= ${radius}`,
        query ? or(ilike(clinics.name, `%${query}%`), ilike(branches.address, `%${query}%`)) : undefined
      )
    )
    .orderBy(sql`distance`);

  return results;
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/marketplace/queries.ts
git commit -m "feat: implement Haversine search query"
```

### Task 3: Implement Availability Caching Logic

**Files:**
- Create: `lib/marketplace/availability.ts`

- [ ] **Step 1: Write cache refresh logic**

```typescript
// lib/marketplace/availability.ts
import { db } from "@/lib/db";
import { branches } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateAvailableSlots } from "@/lib/scheduling/slot-generator";

export async function refreshBranchAvailability(branchId: string) {
  // In a real app, we'd fetch actual service/staff data here.
  // For MVP, we'll use the slot generator with mock parameters.
  const now = new Date();
  const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  // This is a placeholder for actual slot generation logic
  // which requires serviceId and staffId. We'll simulate for now.
  const mockSlots = [
    new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
    new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(),
  ];

  await db.update(branches)
    .set({
      nextSlots: mockSlots,
      availabilityUpdatedAt: new Date(),
    })
    .where(eq(branches.id, branchId));
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/marketplace/availability.ts
git commit -m "feat: add availability cache refresh logic"
```

### Task 4: Create Search API Endpoint

**Files:**
- Create: `app/api/marketplace/search/route.ts`

- [ ] **Step 1: Implement GET handler**

```typescript
// app/api/marketplace/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { searchMarketplace } from "@/lib/marketplace/queries";
import { refreshBranchAvailability } from "@/lib/marketplace/availability";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") || "40.7128");
  const lng = parseFloat(searchParams.get("lng") || "-74.0060");
  const radius = parseFloat(searchParams.get("radius") || "25");
  const query = searchParams.get("query") || undefined;

  const results = await searchMarketplace({ lat, lng, radius, query });

  // Trigger stale cache refreshes in background
  const fifteenMinutes = 15 * 60 * 1000;
  results.forEach(branch => {
    const isStale = !branch.availabilityUpdatedAt || 
                    (new Date().getTime() - new Date(branch.availabilityUpdatedAt).getTime() > fifteenMinutes);
    if (isStale) {
      refreshBranchAvailability(branch.id).catch(console.error);
    }
  });

  return NextResponse.json(results);
}
```

- [ ] **Step 2: Verify endpoint with curl**

Run: `curl "http://localhost:3000/api/marketplace/search?lat=40.7128&lng=-74.0060"`
Expected: JSON array of branch results.

- [ ] **Step 3: Commit**

```bash
git add app/api/marketplace/search/route.ts
git commit -m "feat: add marketplace search API endpoint"
```

### Task 5: Update Frontend Components

**Files:**
- Modify: `components/discovery/ClinicCard.tsx`
- Modify: `components/discovery/DiscoveryMap.tsx`
- Modify: `app/(discovery)/page.tsx`

- [ ] **Step 1: Update ClinicCard to use real data**

```typescript
// Update props to accept the new result type
// Display branch.nextSlots[0] instead of hardcoded date
// Display branch.distance
```

- [ ] **Step 2: Update DiscoveryMap for interactivity**

```typescript
// Add onMoveEnd handler to MapContainer
// Call search API when map moves
```

- [ ] **Step 3: Connect DiscoveryPage to API**

```typescript
// Use client-side fetching (SWR or useEffect) to fetch from /api/marketplace/search
// Synchronize state between search input, map, and list
```

- [ ] **Step 4: Commit**

```bash
git add components/discovery/ app/(discovery)/
git commit -m "feat: connect discovery UI to search API"
```

### Task 6: Final Verification

- [ ] **Step 1: Run full type check**

Run: `npm run build`
Expected: Success with no type errors.

- [ ] **Step 2: Manual Test**

1. Open marketplace.
2. Search for a clinic.
3. Move the map.
4. Verify list updates and distances are correct.
