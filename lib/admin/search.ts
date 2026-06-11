import { z } from "zod";
import { db } from "@/lib/db";
import { branches, staff } from "@/lib/db/schema";
import { eq, ilike, or, and } from "drizzle-orm";

export const searchResultSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  type: z.enum(["branch", "page", "staff"]),
  href: z.string(),
  branchId: z.string().optional(),
});

export type SearchResult = z.infer<typeof searchResultSchema>;

export async function globalSearch(tenantId: string, query: string): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  const queryLower = query.toLowerCase();

  // 1. Static Pages/Modules
  const modules = [
    { title: "Dashboard", href: "/manage/[tenantSlug]/dashboard", type: "page" as const },
    { title: "Schedule", href: "/manage/[tenantSlug]/schedule", type: "page" as const },
    { title: "Patients", href: "/manage/[tenantSlug]/patients", type: "page" as const },
    { title: "Staff Roster", href: "/manage/[tenantSlug]/staff", type: "page" as const },
    { title: "Inventory", href: "/manage/[tenantSlug]/inventory", type: "page" as const },
    { title: "Analytics", href: "/manage/[tenantSlug]/analytics", type: "page" as const },
    { title: "Settings", href: "/manage/[tenantSlug]/settings", type: "page" as const },
  ];

  modules.forEach((mod) => {
    if (mod.title.toLowerCase().includes(queryLower)) {
      results.push({
        id: `page-${mod.title}`,
        title: mod.title,
        type: "page",
        href: mod.href,
      });
    }
  });

  // 2. Search Branches
  if (query.length > 0) {
    const dbBranches = await db
      .select()
      .from(branches)
      .where(
        and(
          eq(branches.tenantId, tenantId),
          or(
            ilike(branches.name, `%${query}%`),
            ilike(branches.address, `%${query}%`)
          )
        )
      )
      .limit(5);

    dbBranches.forEach((b) => {
      results.push({
        id: `branch-${b.id}`,
        title: b.name,
        subtitle: b.address || undefined,
        type: "branch",
        href: `/manage/[tenantSlug]/dashboard?branchId=${b.id}`,
        branchId: b.id,
      });

      // Add deep links for branch-specific pages if query matches branch
      if (b.name.toLowerCase().includes(queryLower)) {
        results.push({
          id: `branch-${b.id}-schedule`,
          title: `${b.name} Schedule`,
          type: "page",
          href: `/manage/[tenantSlug]/schedule?branchId=${b.id}`,
          branchId: b.id,
        });
        results.push({
          id: `branch-${b.id}-inventory`,
          title: `${b.name} Inventory`,
          type: "page",
          href: `/manage/[tenantSlug]/inventory?branchId=${b.id}`,
          branchId: b.id,
        });
      }
    });

    // 3. Search Staff
    const dbStaff = await db
      .select()
      .from(staff)
      .where(
        and(
          eq(staff.tenantId, tenantId),
          ilike(staff.name, `%${query}%`)
        )
      )
      .limit(5);

    dbStaff.forEach((s) => {
      results.push({
        id: `staff-${s.id}`,
        title: s.name,
        subtitle: s.role,
        type: "staff",
        href: `/manage/[tenantSlug]/staff/${s.id}`,
      });
    });
  }

  return results;
}
