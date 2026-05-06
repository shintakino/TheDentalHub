import { auth } from "@clerk/nextjs/server";

export async function getTenantId(): Promise<string> {
  const { orgId } = await auth();
  
  if (!orgId) {
    throw new Error(
      "No active organization found. User is not operating within a tenant context. " +
      "All staff database queries must be filtered by tenant_id mapped from the active Clerk Org ID."
    );
  }
  
  return orgId;
}

/**
 * TENANT CONTEXT PATTERN FOR DATABASE QUERIES
 * 
 * Strict Data Isolation:
 * All database entities that belong to a clinic (e.g. Appointments, Patients, Staff, Services)
 * MUST include a `tenant_id` column.
 * 
 * When querying or mutating data as a staff member (Clinic Owner, Dentist, Receptionist),
 * you MUST always filter by `tenant_id` to ensure data isolation between clinics.
 * 
 * Example Usage:
 * 
 * import { getTenantId } from "@/lib/db/tenant";
 * 
 * export async function getClinicAppointments() {
 *   // 1. Get the current active tenant ID from Clerk Organization
 *   const tenantId = await getTenantId();
 *   
 *   // 2. Pass tenantId to your database query
 *   return db.appointments.findMany({
 *     where: { 
 *       tenant_id: tenantId 
 *     }
 *   });
 * }
 */
