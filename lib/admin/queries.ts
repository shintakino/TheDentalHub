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
import { count, eq, sql, desc, and, or, ilike, isNotNull, isNull } from "drizzle-orm";

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
      FROM appointments 
      WHERE appointments.branch_id = branches.id 
      AND appointments.status IN ('checked_in', 'in_progress')
    )`.mapWith(Number),
    inChairCount: sql<number>`(
      SELECT count(*) 
      FROM appointments 
      WHERE appointments.branch_id = branches.id 
      AND appointments.status = 'in_progress'
    )`.mapWith(Number),
    waitingCount: sql<number>`(
      SELECT count(*) 
      FROM appointments 
      WHERE appointments.branch_id = branches.id 
      AND appointments.status = 'checked_in'
    )`.mapWith(Number),
  })
  .from(branches)
  .where(eq(branches.tenantId, tenantId));
}

export async function getPatients(tenantId: string, search?: string, limit = 20, offset = 0, branchId?: string) {
  // 1. Get registered profiles
  const profiles = await db.select({
    id: patientProfiles.id,
    userId: patientProfiles.userId,
    name: patientProfiles.name,
    email: patientProfiles.email,
    loyaltyPoints: patientProfiles.loyaltyPoints,
  })
  .from(patientProfiles)
  .where(
    and(
      eq(patientProfiles.tenantId, tenantId),
      search ? or(
        ilike(patientProfiles.name, `%${search}%`),
        ilike(patientProfiles.email, `%${search}%`)
      ) : undefined
    )
  );

  // 2. Get appointment stats (for both registered and guest)
  const aptStats = await db.select({
    patientId: appointments.patientId,
    patientName: appointments.patientName,
    patientEmail: appointments.patientEmail,
    lastVisit: sql<Date>`MAX(${appointments.startTime})`,
    totalAppointments: count(),
  })
  .from(appointments)
  .where(
    and(
      eq(appointments.tenantId, tenantId),
      branchId ? eq(appointments.branchId, branchId) : undefined
    )
  )
  .groupBy(appointments.patientId, appointments.patientName, appointments.patientEmail);

  // 3. Merge results
  const patientMap = new Map<string, any>();

  const activePatientKeysInBranch = new Set<string>();
  if (branchId) {
    aptStats.forEach(stat => {
      const key = stat.patientId || `${stat.patientName}-${stat.patientEmail || 'guest'}`;
      activePatientKeysInBranch.add(key);
    });
  }

  // Add profiles first
  profiles.forEach(p => {
    const key = p.userId || p.id;
    if (branchId && !activePatientKeysInBranch.has(key)) {
      return; // Skip profiles that have no appointments in this branch
    }
    patientMap.set(key, {
      id: key,
      name: p.name || "Unknown",
      email: p.email,
      loyaltyPoints: p.loyaltyPoints,
      lastVisit: null,
      totalAppointments: 0,
    });
  });

  // Merge appointment stats
  aptStats.forEach(stat => {
    const key = stat.patientId || `${stat.patientName}-${stat.patientEmail || 'guest'}`;
    
    if (patientMap.has(key)) {
      const existing = patientMap.get(key);
      existing.lastVisit = stat.lastVisit;
      existing.totalAppointments = Number(stat.totalAppointments);
    } else if (!branchId) {
      // Guest patient or profile not found
      patientMap.set(key, {
        id: key,
        name: stat.patientName,
        email: stat.patientEmail,
        loyaltyPoints: 0,
        lastVisit: stat.lastVisit,
        totalAppointments: Number(stat.totalAppointments),
      });
    } else {
      // If branchId is active, guest patients in this branch should be included
      patientMap.set(key, {
        id: key,
        name: stat.patientName,
        email: stat.patientEmail,
        loyaltyPoints: 0,
        lastVisit: stat.lastVisit,
        totalAppointments: Number(stat.totalAppointments),
      });
    }
  });

  let allPatients = Array.from(patientMap.values());

  // Apply search filter to guest patients too (profiles were already filtered)
  if (search) {
    const searchLower = search.toLowerCase();
    allPatients = allPatients.filter(p => 
      p.name.toLowerCase().includes(searchLower) || 
      (p.email && p.email.toLowerCase().includes(searchLower))
    );
  }

  // Sort by last visit descending
  allPatients.sort((a, b) => {
    if (!a.lastVisit) return 1;
    if (!b.lastVisit) return -1;
    return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
  });

  return {
    patients: allPatients.slice(offset, offset + limit),
    totalCount: allPatients.length
  };
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
