import { db } from "@/lib/db";
import { branches } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { cache } from "react";

/**
 * Resolves a branch by its unique slug within a tenant context.
 * Wrapped in React cache to avoid duplicate DB queries within the same request lifecycle.
 */
export const getBranchBySlug = cache(async (tenantId: string, slug: string) => {
  const record = await db
    .select()
    .from(branches)
    .where(and(eq(branches.tenantId, tenantId), eq(branches.slug, slug)))
    .limit(1);

  return record[0] || null;
});
