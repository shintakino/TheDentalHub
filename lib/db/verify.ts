import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dotenv from "dotenv";
import { clinics, patientProfiles, appointments } from "./schema";
import { eq } from "drizzle-orm";

dotenv.config({ path: ".env.local" });

async function verify() {
  const client = postgres(process.env.DATABASE_URL!, { prepare: false });
  const db = drizzle(client);

  console.log("--- Verification Report ---");

  const clinicList = await db.select().from(clinics);
  console.log("Clinics:", clinicList.length);
  clinicList.forEach(c => console.log(`- ${c.name} (Tenant: ${c.tenantId})`));

  if (clinicList.length > 0) {
    const tenantId = clinicList[0].tenantId;
    
    const profiles = await db.select().from(patientProfiles).where(eq(patientProfiles.tenantId, tenantId));
    console.log(`Profiles for ${tenantId}:`, profiles.length);
    profiles.forEach(p => console.log(`- ${p.name} (${p.email})`));

    const appts = await db.select().from(appointments).where(eq(appointments.tenantId, tenantId));
    console.log(`Appointments for ${tenantId}:`, appts.length);
    appts.forEach(a => console.log(`- ${a.patientName} (${a.startTime})`));
  }

  process.exit(0);
}

verify().catch(console.error);
