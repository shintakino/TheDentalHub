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
  // Get all unique patient IDs from appointments for this tenant
  const patientIdsFromApts = db
    .select({ patientId: appointments.patientId })
    .from(appointments)
    .where(eq(appointments.tenantId, tenantId))
    .groupBy(appointments.patientId)
    .as("apt_ids");

  // Get patients who have a profile OR have appointments
  const query = db
    .select({
      id: sql<string>`COALESCE(${patientProfiles.userId}, ${patientProfiles.id}::text, ${patientIdsFromApts.patientId})`,
      name: sql<string>`MAX(COALESCE(${patientProfiles.name}, (SELECT patient_name FROM ${appointments} WHERE patient_id = ${patientIdsFromApts.patientId} OR patient_id = ${patientProfiles.userId} LIMIT 1)))`,
      email: sql<string>`MAX(COALESCE(${patientProfiles.email}, (SELECT patient_email FROM ${appointments} WHERE patient_id = ${patientIdsFromApts.patientId} OR patient_id = ${patientProfiles.userId} LIMIT 1)))`,
      lastVisit: sql<Date>`(SELECT max(start_time) FROM ${appointments} WHERE patient_id = COALESCE(${patientProfiles.userId}, ${patientProfiles.id}::text, ${patientIdsFromApts.patientId}))`,
      totalAppointments: sql<number>`(SELECT count(*) FROM ${appointments} WHERE patient_id = COALESCE(${patientProfiles.userId}, ${patientProfiles.id}::text, ${patientIdsFromApts.patientId}))`.mapWith(Number),
      loyaltyPoints: sql<number>`MAX(${patientProfiles.loyaltyPoints})`.mapWith(Number),
    })
    .from(patientProfiles)
    .fullJoin(patientIdsFromApts, or(
      eq(patientProfiles.userId, patientIdsFromApts.patientId),
      eq(sql`${patientProfiles.id}::text`, patientIdsFromApts.patientId)
    ))
    .where(
      search ? or(
        ilike(patientProfiles.name, `%${search}%`),
        ilike(patientProfiles.email, `%${search}%`),
        ilike(sql`(SELECT patient_name FROM ${appointments} WHERE patient_id = COALESCE(${patientProfiles.userId}, ${patientProfiles.id}::text, ${patientIdsFromApts.patientId}) LIMIT 1)`, `%${search}%`)
      ) : undefined
    )
    .groupBy(sql`COALESCE(${patientProfiles.userId}, ${patientProfiles.id}::text, ${patientIdsFromApts.patientId})`)
    .orderBy(desc(sql`(SELECT max(start_time) FROM ${appointments} WHERE patient_id = COALESCE(${patientProfiles.userId}, ${patientProfiles.id}::text, ${patientIdsFromApts.patientId}))`))
    .limit(limit)
    .offset(offset);

  return await query;
}

export async function getPatientDetails(tenantId: string, patientId: string) {
  // Get profile if it exists (by userId or internal UUID)
  const profile = await db.query.patientProfiles.findFirst({
    where: or(
      eq(patientProfiles.userId, patientId),
      eq(sql`${patientProfiles.id}::text`, patientId)
    ),
  });

  // Get aggregated stats from appointments
  const stats = await db
    .select({
      name: appointments.patientName,
      email: appointments.patientEmail,
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
    .groupBy(appointments.patientName, appointments.patientEmail);

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
