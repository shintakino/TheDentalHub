import { db } from "@/lib/db";
import { clinics, branches, services } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";

/**
 * Cache clinic details by subdomain.
 * Revalidated when clinic branding or details are mutated.
 */
export const getCachedClinicBySubdomain = (subdomain: string) => {
  return unstable_cache(
    async () => {
      console.log(`[Cache Miss] fetching clinic by subdomain: ${subdomain}`);
      return await db.query.clinics.findFirst({
        where: eq(clinics.subdomain, subdomain),
      });
    },
    [`clinic-subdomain-${subdomain}`],
    {
      tags: [`clinic-subdomain-${subdomain}`, "clinics"],
      revalidate: 3600, // 1 hour TTL fallback
    }
  )();
};

/**
 * Cache clinic details by tenant ID.
 * Revalidated when clinic branding or details are mutated.
 */
export const getCachedClinicByTenantId = (tenantId: string) => {
  return unstable_cache(
    async () => {
      console.log(`[Cache Miss] fetching clinic by tenantId: ${tenantId}`);
      return await db.query.clinics.findFirst({
        where: eq(clinics.tenantId, tenantId),
      });
    },
    [`clinic-tenant-${tenantId}`],
    {
      tags: [`clinic-tenant-${tenantId}`, "clinics"],
      revalidate: 3600, // 1 hour TTL fallback
    }
  )();
};

/**
 * Cache services catalog for a tenant.
 * Revalidated when treatments/services are added/edited/deleted.
 */
export const getCachedServices = (tenantId: string) => {
  return unstable_cache(
    async () => {
      console.log(`[Cache Miss] fetching services for tenant: ${tenantId}`);
      return await db.query.services.findMany({
        where: eq(services.tenantId, tenantId),
        orderBy: (services, { asc }) => [asc(services.name)],
      });
    },
    [`services-${tenantId}`],
    {
      tags: [`services-${tenantId}`, "services"],
      revalidate: 3600, // 1 hour TTL fallback
    }
  )();
};

/**
 * Cache branches list for a tenant.
 * Revalidated when branches are mutated.
 */
export const getCachedBranches = (tenantId: string) => {
  return unstable_cache(
    async () => {
      console.log(`[Cache Miss] fetching branches for tenant: ${tenantId}`);
      return await db.query.branches.findMany({
        where: eq(branches.tenantId, tenantId),
        orderBy: (branches, { asc }) => [asc(branches.name)],
      });
    },
    [`branches-${tenantId}`],
    {
      tags: [`branches-${tenantId}`, "branches"],
      revalidate: 3600, // 1 hour TTL fallback
    }
  )();
};
