import { db } from "@/lib/db";
import { 
  clinics, 
  branches, 
  appointments, 
  auditLogs, 
  patientProfiles, 
  clinicalNotes, 
  loyaltyTransactions,
  communicationsLog,
  services
} from "@/lib/db/schema";
import { count, eq, sql, desc, and, or, ilike } from "drizzle-orm";

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

export async function getPatients(tenantId: string, search?: string, limit = 20, offset = 0) {
  // 1. Aggregate appointment data per patientId for this tenant
  const aptStats = db
    .select({
      patientId: appointments.patientId,
      apt_name: sql<string>`MAX(${appointments.patientName})`.as("apt_name"),
      apt_email: sql<string>`MAX(${appointments.patientEmail})`.as("apt_email"),
      apt_last_visit: sql<Date>`MAX(${appointments.startTime})`.as("apt_last_visit"),
      apt_total_visits: count().as("apt_total_visits"),
    })
    .from(appointments)
    .where(eq(appointments.tenantId, tenantId))
    .groupBy(appointments.patientId)
    .as("apt_stats");

  // 2. Query patientProfiles and join with appointment stats
  const query = db
    .select({
      id: sql<string>`COALESCE(${patientProfiles.userId}, ${patientProfiles.id}::text, ${aptStats.patientId})`,
      name: sql<string>`COALESCE(${patientProfiles.name}, ${aptStats.apt_name})`,
      email: sql<string>`COALESCE(${patientProfiles.email}, ${aptStats.apt_email})`,
      lastVisit: aptStats.apt_last_visit,
      totalAppointments: sql<number>`COALESCE(${aptStats.apt_total_visits}, 0)`.mapWith(Number),
      loyaltyPoints: sql<number>`COALESCE(${patientProfiles.loyaltyPoints}, 0)`.mapWith(Number),
    })
    .from(aptStats)
    .fullJoin(patientProfiles, or(
      eq(patientProfiles.userId, aptStats.patientId),
      eq(sql`${patientProfiles.id}::text`, aptStats.patientId)
    ))
    .where(
      and(
        // Only include patients relevant to this tenant
        or(
          eq(patientProfiles.tenantId, tenantId),
          sql`${aptStats.patientId} IS NOT NULL`
        ),
        // Search filter
        search ? or(
          ilike(sql`COALESCE(${patientProfiles.name}, ${aptStats.apt_name})`, `%${search}%`),
          ilike(sql`COALESCE(${patientProfiles.email}, ${aptStats.apt_email})`, `%${search}%`)
        ) : undefined
      )
    )
    .orderBy(desc(aptStats.apt_last_visit))
    .limit(limit)
    .offset(offset);

  return await query;
}

export async function getPatientDetails(tenantId: string, patientId: string) {
  // Get profile if it exists (by userId or internal UUID)
  const profile = await db.query.patientProfiles.findFirst({
    where: or(
      and(eq(patientProfiles.userId, patientId), or(eq(patientProfiles.tenantId, tenantId), sql`${patientProfiles.tenantId} IS NULL`)),
      and(eq(sql`${patientProfiles.id}::text`, patientId), eq(patientProfiles.tenantId, tenantId))
    ),
  });

  // Get aggregated stats from appointments
  const stats = await db
    .select({
      name: sql<string>`MAX(${appointments.patientName})`,
      email: sql<string>`MAX(${appointments.patientEmail})`,
      totalVisits: count(),
      noShows: sql<number>`count(*) FILTER (WHERE ${appointments.status} = 'no_show')`.mapWith(Number),
      lifetimeValue: sql<number>`sum(${appointments.actualPrice})`.mapWith(Number),
      lastVisit: sql<Date>`max(${appointments.startTime})`,
    })
    .from(appointments)
    .where(
      and(
        eq(appointments.tenantId, tenantId),
        eq(appointments.patientId, patientId)
      )
    )
    .groupBy(appointments.patientId);

  // Get appointment history
  const history = await db
    .select({
      id: appointments.id,
      startTime: appointments.startTime,
      status: appointments.status,
      serviceName: services.name,
      branchName: branches.name,
      actualPrice: appointments.actualPrice,
    })
    .from(appointments)
    .leftJoin(services, eq(appointments.serviceId, services.id))
    .leftJoin(branches, eq(appointments.branchId, branches.id))
    .where(
      and(
        eq(appointments.tenantId, tenantId),
        eq(appointments.patientId, patientId)
      )
    )
    .orderBy(desc(appointments.startTime));

  // Get clinical notes
  const notes = await db
    .select({
      id: clinicalNotes.id,
      content: clinicalNotes.content,
      createdAt: clinicalNotes.createdAt,
      dentistId: clinicalNotes.dentistId,
      appointmentId: clinicalNotes.appointmentId,
    })
    .from(clinicalNotes)
    .innerJoin(appointments, eq(clinicalNotes.appointmentId, appointments.id))
    .where(
      and(
        eq(clinicalNotes.tenantId, tenantId),
        eq(appointments.patientId, patientId)
      )
    )
    .orderBy(desc(clinicalNotes.createdAt));

  // Get communications
  const communications = await db
    .select({
      id: communicationsLog.id,
      type: communicationsLog.type,
      recipient: communicationsLog.recipient,
      subject: communicationsLog.subject,
      status: communicationsLog.status,
      createdAt: communicationsLog.createdAt,
      templateName: communicationsLog.templateName,
    })
    .from(communicationsLog)
    .leftJoin(appointments, eq(communicationsLog.appointmentId, appointments.id))
    .where(
      and(
        eq(communicationsLog.tenantId, tenantId),
        eq(appointments.patientId, patientId)
      )
    )
    .orderBy(desc(communicationsLog.createdAt));

  // Get loyalty transactions
  const loyalty = profile ? await db
    .select()
    .from(loyaltyTransactions)
    .where(eq(loyaltyTransactions.patientId, profile.id))
    .orderBy(desc(loyaltyTransactions.createdAt)) : [];

  return {
    profile,
    stats: stats[0] || {
      name: profile?.name || "Unknown",
      email: profile?.email || "",
      totalVisits: 0,
      noShows: 0,
      lifetimeValue: 0,
      lastVisit: null,
    },
    history,
    notes,
    communications,
    loyalty,
  };
}
