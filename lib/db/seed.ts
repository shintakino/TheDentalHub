import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { clinics, branches, services, staff, appointments } from "./schema";
import { eq } from "drizzle-orm";

const client = postgres(process.env.DATABASE_URL!, { prepare: false });
const db = drizzle(client);

async function main() {
  console.log("Starting database seeding...");

  // We use these test identities for clerk local testing
  const testTenantId = "org_2testtenantid"; // Replace with your actual test org id if needed
  const testUserId = "user_2testuserid";    // Replace with your actual test user id if needed

  console.log("Clearing existing data for test tenant...");
  await db.delete(appointments).where(eq(appointments.tenantId, testTenantId));
  await db.delete(staff).where(eq(staff.tenantId, testTenantId));
  await db.delete(services).where(eq(services.tenantId, testTenantId));
  await db.delete(branches).where(eq(branches.tenantId, testTenantId));
  await db.delete(clinics).where(eq(clinics.tenantId, testTenantId));

  console.log("Inserting test clinic...");
  const [clinic] = await db.insert(clinics).values({
    tenantId: testTenantId,
    name: "The Dental Hub Premium Clinic",
  }).returning();

  console.log("Inserting test branch...");
  const [branch] = await db.insert(branches).values({
    tenantId: testTenantId,
    name: "Downtown Main Branch",
    address: "123 Premium Dental Way, Suite 100",
    operatingHours: [
      { day: 1, open: "09:00", close: "17:00", active: true },
      { day: 2, open: "09:00", close: "17:00", active: true },
      { day: 3, open: "09:00", close: "17:00", active: true },
      { day: 4, open: "09:00", close: "17:00", active: true },
      { day: 5, open: "09:00", close: "17:00", active: true },
      { day: 6, open: "09:00", close: "13:00", active: false },
      { day: 0, open: "09:00", close: "13:00", active: false },
    ],
  }).returning();

  console.log("Inserting test services...");
  const [consultation, cleaning] = await db.insert(services).values([
    {
      tenantId: testTenantId,
      name: "Initial Consultation",
      duration: 30,
    },
    {
      tenantId: testTenantId,
      name: "Deep Cleaning & Whitening",
      duration: 60,
    }
  ]).returning();

  console.log("Inserting test staff...");
  await db.insert(staff).values({
    tenantId: testTenantId,
    userId: testUserId,
    name: "Dr. Admin User",
    role: "admin",
  });

  console.log("Database seeded successfully!");
  console.log("Test Tenant ID:", testTenantId);
  console.log("Test User ID:", testUserId);
  
  process.exit(0);
}

main().catch((err) => {
  console.error("Error seeding database:", err);
  process.exit(1);
});
