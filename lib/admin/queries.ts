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

export async function getBranchesByTenantId(tenantId: string) {
  return await db.select()
    .from(branches)
    .where(eq(branches.tenantId, tenantId))
    .orderBy(branches.name);
}

export async function getBranchOccupancy(tenantId: string) {
  return await db.select({
    branchId: branches.id,
    branchName: branches.name,
    maxCapacity: branches.maxCapacity,
    currentOccupancy: sql<number>`(
      SELECT count(*) 
      FROM ${appointments} 
      WHERE ${appointments.branchId} = ${branches.id} 
      AND ${appointments.status} IN ('checked_in', 'in_progress')
    )`.mapWith(Number),
  })
  .from(branches)
  .where(eq(branches.tenantId, tenantId));
}
