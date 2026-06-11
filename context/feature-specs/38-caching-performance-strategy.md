# Feature 38: Caching & Performance Strategy

## 1. Overview
As the platform scales to support larger clinics with multiple branches and a high volume of transactions, optimizing database load and response times is critical. Caching static or semi-static data (like clinic branding, services catalogs, and analytics summaries) will reduce latency and database CPU usage.

This specification outlines our caching strategy utilizing Next.js `unstable_cache` (Data Cache) and React `cache` (Request Memoization), including cache invalidation triggers.

## 2. Objectives
- **Latency Reduction**: Reduce page load times by caching frequently read, slow-changing database queries.
- **Database Relief**: Offload repeat reads (e.g., branding settings, active services) from PostgreSQL.
- **Cache Invalidation**: Implement dynamic cache invalidation (tag-based revalidation) so updates are reflected immediately.

## 3. Caching Design & Candidates

### Candidate 1: Clinic Branding & Identity Settings
- **Query**: Loading clinic details, logo, colors, accent theme.
- **Pattern**: `unstable_cache` scoped by `tenantId`.
- **Cache Key**: `branding-[tenantId]`
- **Invalidation**: Purge cache using `revalidateTag("branding-[tenantId]")` when clinic branding settings are saved.

### Candidate 2: Services & Treatments Catalog
- **Query**: Fetching list of services for scheduling and booking flows.
- **Pattern**: `unstable_cache` scoped by `tenantId`.
- **Cache Key**: `services-[tenantId]`
- **Invalidation**: Purge cache when services are added, deleted, or edited.

### Candidate 3: Branch Locations & Details
- **Query**: Fetching clinic branches.
- **Pattern**: `unstable_cache` scoped by `tenantId`.
- **Cache Key**: `branches-[tenantId]`
- **Invalidation**: Purge cache when branch details or capacity overrides change.

### Candidate 4: Analytics Summaries (Read-Heavy Aggregations)
- **Query**: Fetching dashboard KPIs and history graphs.
- **Pattern**: `unstable_cache` with a short time-to-live (TTL) of 5 minutes (300 seconds).
- **Cache Key**: `analytics-[tenantId]-[branchId]-[timeRange]`
- **Invalidation**: Time-based revalidation (no explicit tag invalidation needed).

## 4. Technical Implementation Pattern

### Example: Clinic Branding Cache Wrap
```typescript
import { unstable_cache } from "next/cache";

export const getCachedClinicBranding = (tenantId: string) => {
  return unstable_cache(
    async () => {
      return await db.query.clinics.findFirst({
        where: eq(clinics.tenantId, tenantId),
      });
    },
    [`branding-${tenantId}`],
    {
      tags: [`branding-${tenantId}`],
      revalidate: 3600, // Fallback TTL of 1 hour
    }
  )();
};
```

### Example: Cache Invalidation on Mutation
```typescript
import { revalidateTag } from "next/cache";

export async function updateBranding(tenantId: string, data: any) {
  await db.update(clinics).set(data).where(eq(clinics.tenantId, tenantId));
  revalidateTag(`branding-${tenantId}`);
}
```

## 5. Execution Steps
1. **Define Cache Queries**: Create cached wrappers in `lib/db/cache.ts` or `lib/admin/queries.ts` for branding, services, and branches.
2. **Integrate Caching**: Update layout routes and page components to use cached queries.
3. **Invalidation Hooks**: Add `revalidateTag` calls in mutation endpoints (Branding save, Service edits, Branch edits).
4. **Analytics Cache**: Cache analytics metrics API responses for 5 minutes.
5. **Validation**: Verify cache hit performance and immediate invalidation upon editing settings.
