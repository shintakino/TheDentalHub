import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClerkClient } from "@clerk/nextjs/server";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { 
  clinics, 
  branches, 
  services, 
  staff, 
  appointments, 
  clinicalNotes, 
  auditLogs, 
  communicationsLog,
  waitlistEntries,
  branchOverrides,
  staffAssignments,
  inventoryItems,
  inventoryStock,
  inventoryLogs,
  patientProfiles,
  loyaltyTransactions,
  reviews,
  notifications,
  campaigns
} from "./schema";
import { eq } from "drizzle-orm";
import { addDays, startOfDay, setHours, setMinutes, subDays, format } from "date-fns";

if (!process.env.CLERK_SECRET_KEY) {
  console.error("CLERK_SECRET_KEY is not set in .env.local");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set in .env.local");
  process.exit(1);
}

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
const client = postgres(process.env.DATABASE_URL!, { prepare: false });
const db = drizzle(client);

const TEST_EMAILS = [
  "superadmin@test.com",
  "owner@test.com",
  "staff@test.com",
  "patient@test.com"
];

async function teardown() {
  console.log("--- Teardown Phase ---");

  // 1. Delete Clerk Users
  console.log("Searching for existing test users...");
  const { data: users } = await clerkClient.users.getUserList({
    emailAddress: TEST_EMAILS,
  });

  for (const user of users) {
    console.log(`Deleting Clerk user: ${user.emailAddresses[0]?.emailAddress} (${user.id})`);
    await clerkClient.users.deleteUser(user.id);
  }

  // 2. Delete Clerk Organizations
  console.log("Searching for existing test organizations...");
  const { data: orgs } = await clerkClient.organizations.getOrganizationList({
    query: "Test Clinic",
  });

  for (const org of orgs) {
    console.log(`Deleting Clerk organization: ${org.name} (${org.id})`);
    await clerkClient.organizations.deleteOrganization(org.id);
  }

  console.log("Teardown complete.");
}

async function verifyUserEmail(user: { emailAddresses: { id: string }[] }) {
  if (user.emailAddresses && user.emailAddresses.length > 0) {
    await clerkClient.emailAddresses.updateEmailAddress(user.emailAddresses[0].id, {
      verified: true,
    });
  }
}

async function main() {
  console.log("Starting database seeding with Clerk synchronization...");

  try {
    await teardown();
  } catch (error) {
    console.warn("Teardown failed (this is normal if it's the first run):", error);
  }

  console.log("--- Provisioning Phase ---");

  // Create Super Admin
  console.log("Creating Super Admin...");
  const superAdmin = await clerkClient.users.createUser({
    emailAddress: ["superadmin@test.com"],
    password: "StrongPass123!@#",
    firstName: "Super",
    lastName: "Admin",
    publicMetadata: { role: "super_admin" },
    skipPasswordChecks: true,
  });
  await verifyUserEmail(superAdmin);

  // Create Owner
  console.log("Creating Owner...");
  const owner = await clerkClient.users.createUser({
    emailAddress: ["owner@test.com"],
    password: "StrongPass123!@#",
    firstName: "Clinic",
    lastName: "Owner",
    skipPasswordChecks: true,
  });
  await verifyUserEmail(owner);

  // Create Staff
  console.log("Creating Staff...");
  const staffUser = await clerkClient.users.createUser({
    emailAddress: ["staff@test.com"],
    password: "StrongPass123!@#",
    firstName: "Dental",
    lastName: "Staff",
    skipPasswordChecks: true,
  });
  await verifyUserEmail(staffUser);

  // Create Patient
  console.log("Creating Patient...");
  const patientUser = await clerkClient.users.createUser({
    emailAddress: ["patient@test.com"],
    password: "StrongPass123!@#",
    firstName: "John",
    lastName: "Patient",
    skipPasswordChecks: true,
  });
  await verifyUserEmail(patientUser);

  // Create Organization
  let tenantId: string;
  const existingOrgId = process.env.SEED_ORG_ID;
  const tenantName = process.env.SEED_TENANT_NAME || "The Dental Hub Premium";
  const subdomain = process.env.SEED_SUBDOMAIN || "test-clinic";

  if (existingOrgId) {
    console.log(`Using existing Organization ID from environment: ${existingOrgId}`);
    tenantId = existingOrgId;
  } else {
    console.log(`Creating Organization '${tenantName}'...`);
    const org = await clerkClient.organizations.createOrganization({
      name: tenantName,
      createdBy: owner.id,
    });
    tenantId = org.id;
  }

  // Add Staff to Organization
  console.log("Adding Staff to Organization...");
  try {
    await clerkClient.organizations.createOrganizationMembership({
      organizationId: tenantId,
      userId: staffUser.id,
      role: "org:member",
    });
  } catch (e) {
    console.warn("Could not add staff to organization (might already be a member):", e);
  }

  console.log("Clerk provisioning complete.");

  // Drizzle Seeding
  console.log("--- Database Seeding Phase ---");
  
  console.log("Clearing database tables for tenant:", tenantId);
  // We only clear data for this specific tenant to avoid destructive behavior in shared DBs
  const tenantFilter = eq(clinics.tenantId, tenantId);
  
  // Clean up any old clinic using the same subdomain to prevent unique constraint failures
  await db.delete(clinics).where(eq(clinics.subdomain, subdomain));
  
  await db.delete(notifications).where(eq(notifications.tenantId, tenantId));
  await db.delete(reviews).where(eq(reviews.tenantId, tenantId));
  const existingPatients = await db.select({ id: patientProfiles.id }).from(patientProfiles).where(eq(patientProfiles.tenantId, tenantId));
  for (const p of existingPatients) {
    await db.delete(loyaltyTransactions).where(eq(loyaltyTransactions.patientId, p.id));
  }
  await db.delete(patientProfiles).where(eq(patientProfiles.tenantId, tenantId));
  await db.delete(inventoryLogs).where(eq(inventoryLogs.performedBy, owner.id)); // Simplified
  await db.delete(inventoryStock); // Needs careful handling if shared, but seed usually assumes fresh
  await db.delete(inventoryItems).where(eq(inventoryItems.tenantId, tenantId));
  await db.delete(communicationsLog).where(eq(communicationsLog.tenantId, tenantId));
  await db.delete(clinicalNotes).where(eq(clinicalNotes.tenantId, tenantId));
  await db.delete(auditLogs).where(eq(auditLogs.tenantId, tenantId));
  await db.delete(waitlistEntries).where(eq(waitlistEntries.tenantId, tenantId));
  await db.delete(appointments).where(eq(appointments.tenantId, tenantId));
  await db.delete(campaigns).where(eq(campaigns.tenantId, tenantId));
  await db.delete(staffAssignments).where(eq(staffAssignments.tenantId, tenantId));
  await db.delete(branchOverrides).where(eq(branchOverrides.tenantId, tenantId));
  await db.delete(staff).where(eq(staff.tenantId, tenantId));
  await db.delete(services).where(eq(services.tenantId, tenantId));
  await db.delete(branches).where(eq(branches.tenantId, tenantId));
  await db.delete(clinics).where(eq(clinics.tenantId, tenantId));

  console.log("Inserting Clinic...");
  await db.insert(clinics).values({
    tenantId,
    name: tenantName,
    subdomain: subdomain,
    primaryColor: "#0f172a",
    bookingApprovalMode: "manual",
  });

  console.log("Inserting 6 Branches with varied statuses...");
  const [branch1, branch2, branch3, branch4, branch5, branch6] = await db.insert(branches).values([
    {
      tenantId,
      name: "Downtown - Metro Center",
      slug: "downtown-metro-center",
      address: "Quezon Boulevard, Kidapawan City, Cotabato",
      timezone: "Asia/Manila",
      operatingHours: [
        { day: 1, open: "09:00", close: "17:00", active: true },
        { day: 2, open: "09:00", close: "17:00", active: true },
        { day: 3, open: "09:00", close: "17:00", active: true },
        { day: 4, open: "09:00", close: "17:00", active: true },
        { day: 5, open: "09:00", close: "17:00", active: true },
        { day: 6, open: "10:00", close: "14:00", active: true },
        { day: 0, open: "00:00", close: "00:00", active: false },
      ],
      latitude: "7.0085000",
      longitude: "125.0140000",
      maxCapacity: 5,
    },
    {
      tenantId,
      name: "Westside - Emergency Hub",
      slug: "westside-emergency-hub",
      address: "Datu Ingkal Street, Kidapawan City, Cotabato",
      timezone: "Asia/Manila",
      operatingHours: [
        { day: 1, open: "08:00", close: "20:00", active: true },
        { day: 2, open: "08:00", close: "20:00", active: true },
        { day: 3, open: "08:00", close: "20:00", active: true },
        { day: 4, open: "08:00", close: "20:00", active: true },
        { day: 5, open: "08:00", close: "20:00", active: true },
        { day: 6, open: "00:00", close: "00:00", active: false },
        { day: 0, open: "00:00", close: "00:00", active: false },
      ],
      latitude: "7.0075000",
      longitude: "125.0125000",
      maxCapacity: 2,
    },
    {
      tenantId,
      name: "Northview - High Capacity",
      slug: "northview-high-capacity",
      address: "Paco, Kidapawan City, Cotabato",
      timezone: "Asia/Manila",
      operatingHours: [
        { day: 1, open: "09:00", close: "18:00", active: true },
        { day: 2, open: "09:00", close: "18:00", active: true },
        { day: 3, open: "09:00", close: "18:00", active: true },
        { day: 4, open: "09:00", close: "18:00", active: true },
        { day: 5, open: "09:00", close: "18:00", active: true },
        { day: 6, open: "09:00", close: "18:00", active: true },
        { day: 0, open: "00:00", close: "00:00", active: false },
      ],
      latitude: "7.0150000",
      longitude: "125.0200000",
      maxCapacity: 1, // Easy to hit capacity
    },
    {
      tenantId,
      name: "Eastgate - Supply Depot",
      slug: "eastgate-supply-depot",
      address: "Sudapin, Kidapawan City, Cotabato",
      timezone: "Asia/Manila",
      operatingHours: [
        { day: 1, open: "09:00", close: "17:00", active: true },
        { day: 2, open: "09:00", close: "17:00", active: true },
        { day: 3, open: "09:00", close: "17:00", active: true },
        { day: 4, open: "09:00", close: "17:00", active: true },
        { day: 5, open: "09:00", close: "17:00", active: true },
        { day: 6, open: "00:00", close: "00:00", active: false },
        { day: 0, open: "00:00", close: "00:00", active: false },
      ],
      latitude: "7.0090000",
      longitude: "125.0250000",
      maxCapacity: 4,
    },
    {
      tenantId,
      name: "Southpoint - Wellness",
      slug: "southpoint-wellness",
      address: "Manongol, Kidapawan City, Cotabato",
      timezone: "Asia/Manila",
      operatingHours: [
        { day: 1, open: "09:00", close: "17:00", active: true },
        { day: 2, open: "09:00", close: "17:00", active: true },
        { day: 3, open: "09:00", close: "17:00", active: true },
        { day: 4, open: "09:00", close: "17:00", active: true },
        { day: 5, open: "09:00", close: "17:00", active: true },
        { day: 6, open: "00:00", close: "00:00", active: false },
        { day: 0, open: "00:00", close: "00:00", active: false },
      ],
      latitude: "7.0000000",
      longitude: "125.0100000",
      maxCapacity: 3,
    },
    {
      tenantId,
      name: "Apo View - Premium",
      slug: "apo-view-premium",
      address: "Ilomavis, Kidapawan City, Cotabato",
      timezone: "Asia/Manila",
      operatingHours: [
        { day: 1, open: "10:00", close: "16:00", active: true },
        { day: 2, open: "10:00", close: "16:00", active: true },
        { day: 3, open: "10:00", close: "16:00", active: true },
        { day: 4, open: "10:00", close: "16:00", active: true },
        { day: 5, open: "10:00", close: "16:00", active: true },
        { day: 6, open: "00:00", close: "00:00", active: false },
        { day: 0, open: "00:00", close: "00:00", active: false },
      ],
      latitude: "7.0500000",
      longitude: "125.1000000",
      maxCapacity: 2,
    }
  ]).returning();

  console.log("Inserting Services...");
  const [consultation, cleaning, xray] = await db.insert(services).values([
    { tenantId, name: "General Consultation", duration: 30, price: "50.00" },
    { tenantId, name: "Professional Cleaning", duration: 45, price: "120.00" },
    { tenantId, name: "Dental X-Ray", duration: 15, price: "75.00" },
  ]).returning();

  console.log("Inserting Staff records...");
  const [drOwner, janeStaff] = await db.insert(staff).values([
    { tenantId, userId: owner.id, name: "Dr. Owner", role: "admin" },
    { tenantId, userId: staffUser.id, name: "Jane Staff", role: "staff" },
  ]).returning();

  console.log("Inserting Staff Assignments...");
  await db.insert(staffAssignments).values([
    // Branch 1
    { tenantId, staffId: janeStaff.id, branchId: branch1.id, dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
    { tenantId, staffId: janeStaff.id, branchId: branch1.id, dayOfWeek: 2, startTime: "09:00", endTime: "17:00" },
    { tenantId, staffId: janeStaff.id, branchId: branch1.id, dayOfWeek: 3, startTime: "09:00", endTime: "17:00" },
    { tenantId, staffId: janeStaff.id, branchId: branch1.id, dayOfWeek: 4, startTime: "09:00", endTime: "17:00" },
    { tenantId, staffId: janeStaff.id, branchId: branch1.id, dayOfWeek: 5, startTime: "09:00", endTime: "17:00" },
    // Branch 2
    { tenantId, staffId: drOwner.id, branchId: branch2.id, dayOfWeek: 1, startTime: "08:00", endTime: "16:00" },
    { tenantId, staffId: drOwner.id, branchId: branch2.id, dayOfWeek: 2, startTime: "08:00", endTime: "16:00" },
    // Branch 3
    { tenantId, staffId: drOwner.id, branchId: branch3.id, dayOfWeek: 3, startTime: "09:00", endTime: "18:00" },
    // Branch 4
    { tenantId, staffId: janeStaff.id, branchId: branch4.id, dayOfWeek: 6, startTime: "09:00", endTime: "17:00" },
    // Branch 5
    { tenantId, staffId: drOwner.id, branchId: branch5.id, dayOfWeek: 4, startTime: "09:00", endTime: "17:00" },
    // Branch 6
    { tenantId, staffId: janeStaff.id, branchId: branch6.id, dayOfWeek: 5, startTime: "10:00", endTime: "16:00" },
  ]);

  console.log("Inserting Branch Overrides (Emergency)...");
  await db.insert(branchOverrides).values({
    tenantId,
    branchId: branch2.id,
    startDate: subDays(new Date(), 1),
    endDate: addDays(new Date(), 1),
    reason: "Plumbing Emergency",
    isClosed: true,
  });

  console.log("Inserting Inventory Items...");
  const [gloves, anesthetic, composite] = await db.insert(inventoryItems).values([
    { tenantId, name: "Nitrile Gloves (Large)", category: "Consumables", unit: "Box" },
    { tenantId, name: "Lidocaine Anesthetic", category: "Medication", unit: "Vial" },
    { tenantId, name: "Hybrid Composite Resin", category: "Consumables", unit: "Syringe" },
  ]).returning();

  console.log("Inserting Inventory Stock (with Low Stock at Branch 4)...");
  await db.insert(inventoryStock).values([
    { itemId: gloves.id, branchId: branch1.id, quantity: "25.00", lowStockThreshold: "10.00" },
    { itemId: gloves.id, branchId: branch4.id, quantity: "2.00", lowStockThreshold: "10.00" }, // LOW STOCK
    { itemId: anesthetic.id, branchId: branch4.id, quantity: "1.00", lowStockThreshold: "5.00" }, // LOW STOCK
    { itemId: anesthetic.id, branchId: branch1.id, quantity: "50.00", lowStockThreshold: "20.00" },
    { itemId: composite.id, branchId: branch1.id, quantity: "15.00", lowStockThreshold: "5.00" },
  ]);

  console.log("Inserting Patient Profiles...");
  const [patientProfile] = await db.insert(patientProfiles).values({
    tenantId,
    userId: patientUser.id,
    name: "John Patient",
    email: "patient@test.com",
    loyaltyPoints: 150,
    preferences: { email_marketing: true, sms_reminders: true },
  }).returning();

  const today = startOfDay(new Date());

  console.log("Inserting Campaigns...");
  const [promoSpring, promoSummer, promoWinter] = await db.insert(campaigns).values([
    {
      tenantId,
      name: "Spring Smile Promo",
      description: "15% off all cleanings and consultations for the spring season.",
      startDate: subDays(today, 60),
      endDate: subDays(today, 15),
      status: "completed",
      discountType: "percentage",
      discountValue: "15.00",
      serviceId: cleaning.id,
      trackingCode: "SPRING15",
    },
    {
      tenantId,
      name: "Summer Refresh",
      description: "$20 off professional cleaning.",
      startDate: subDays(today, 10),
      endDate: addDays(today, 20),
      status: "active",
      discountType: "fixed_amount",
      discountValue: "20.00",
      serviceId: cleaning.id,
      trackingCode: "SUMMER20",
    },
    {
      tenantId,
      name: "Winter Checkup Blast",
      description: "Get a consultation at half price.",
      startDate: addDays(today, 120),
      endDate: addDays(today, 150),
      status: "draft",
      discountType: "percentage",
      discountValue: "50.00",
      serviceId: consultation.id,
      trackingCode: "WINTER50",
    }
  ]).returning();

  console.log("Generating 200 Patient Profiles...");
  const firstNames = ["Liam", "Olivia", "Noah", "Emma", "Oliver", "Ava", "Elijah", "Charlotte", "William", "Sophia", "James", "Amelia", "Benjamin", "Isabella", "Lucas", "Mia", "Henry", "Evelyn", "Alexander", "Harper"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Garcia", "Rodriguez", "Wilson", "Martinez", "Anderson", "Taylor", "Thomas", "Hernandez", "Moore", "Martin", "Jackson", "Thompson", "White"];
  
  const patientsToInsert = [];
  
  // Custom seedable deterministic LCG helper
  let state = 12345;
  const rand = () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };

  for (let i = 1; i < 200; i++) {
    const fName = firstNames[Math.floor(rand() * firstNames.length)];
    const lName = lastNames[Math.floor(rand() * lastNames.length)];
    const name = `${fName} ${lName}`;
    const email = `${fName.toLowerCase()}.${lName.toLowerCase()}.${i}@example.com`;
    const points = Math.floor(rand() * 450);
    patientsToInsert.push({
      tenantId,
      userId: `mock-user-${i}`,
      name,
      email,
      loyaltyPoints: points,
      preferences: { email_marketing: rand() > 0.3, sms_reminders: rand() > 0.2 },
    });
  }

  const seededPatients = await db.insert(patientProfiles).values(patientsToInsert).returning();
  // Ensure John Patient is at the front of patient profiles list for mapping
  const allPatients = [patientProfile, ...seededPatients];

  console.log("Generating 90-day time-series historical appointments...");
  const appointmentsToInsert = [];
  
  // Services pool
  const servicesList = [consultation, cleaning, xray];
  // Branches pool
  const branchesList = [branch1, branch2, branch3, branch4, branch5, branch6];

  // Let's generate day-by-day: -90 to +7 days
  for (let dayOffset = -90; dayOffset <= 7; dayOffset++) {
    const currentDate = addDays(today, dayOffset);
    const dayOfWeek = currentDate.getDay(); // 0 is Sunday, 6 is Saturday

    for (const branch of branchesList) {
      // Check operating hours for the branch
      const opHours = branch.operatingHours as { day: number; open: string; close: string; active: boolean }[];
      const todayOp = opHours.find(o => o.day === dayOfWeek);
      if (!todayOp || !todayOp.active) continue;

      // Determine daily volume based on branch type
      let dailyCount = 0;
      if (branch.id === branch1.id) {
        dailyCount = Math.floor(rand() * 4) + 6; // Downtown: 6-9 appts
      } else if (branch.id === branch2.id) {
        dailyCount = Math.floor(rand() * 2) + 1; // Emergency: 1-2 appts
      } else if (branch.id === branch3.id) {
        dailyCount = Math.floor(rand() * 3) + 4; // High Capacity: 4-6 appts (often hits capacity)
      } else if (branch.id === branch4.id) {
        dailyCount = Math.floor(rand() * 2) + 2; // Eastgate: 2-3 appts
      } else if (branch.id === branch5.id) {
        dailyCount = Math.floor(rand() * 3) + 3; // Southpoint Wellness: 3-5 appts
      } else if (branch.id === branch6.id) {
        dailyCount = rand() > 0.4 ? 1 : 0; // Apo Premium: 0-1 appts
      }

      // Generate daily appointments
      for (let k = 0; k < dailyCount; k++) {
        // Peak hours bell curve (9 to 17)
        const r1 = rand();
        const r2 = rand();
        const hourFraction = (r1 + r2) / 2; // centered around 0.5
        const hour = Math.floor(9 + hourFraction * 8); // 9:00 to 17:00, peak around 13:00
        const minutes = rand() > 0.5 ? 30 : 0;

        const startTime = setMinutes(setHours(currentDate, hour), minutes);
        const service = servicesList[Math.floor(rand() * servicesList.length)];
        const endTime = new Date(startTime.getTime() + service.duration * 60000);

        // Select a patient
        const patient = allPatients[Math.floor(rand() * allPatients.length)];

        // Status determinations
        let status: "confirmed" | "completed" | "cancelled" | "checked_in" | "pending_approval" = "confirmed";
        if (dayOffset < 0) {
          // Historical
          const statusRand = rand();
          if (statusRand < 0.82) {
            status = "completed";
          } else if (statusRand < 0.92) {
            status = "cancelled";
          } else {
            status = "confirmed";
          }
        } else if (dayOffset === 0) {
          // Today
          const currentHour = new Date().getHours();
          if (hour < currentHour - 1) {
            status = "completed";
          } else if (hour <= currentHour + 1) {
            status = "checked_in";
          } else {
            status = rand() > 0.8 ? "pending_approval" : "confirmed";
          }
        } else {
          // Future
          status = rand() > 0.85 ? "pending_approval" : "confirmed";
        }

        // Apply emergency override to Branch 2 (Westside) for subDays(today, 1) to addDays(today, 1)
        if (branch.id === branch2.id && dayOffset >= -1 && dayOffset <= 1) {
          status = "cancelled";
        }

        // Campaign link logic (around 12% of appointments, especially for cleanings)
        let campaignId: string | null = null;
        let finalPrice = service.price;

        if (service.id === cleaning.id && rand() < 0.4) {
          if (dayOffset <= -15 && dayOffset >= -60) {
            campaignId = promoSpring.id;
            finalPrice = (Number(service.price) * 0.85).toFixed(2); // 15% off
          } else if (dayOffset >= -10 && dayOffset <= 20) {
            campaignId = promoSummer.id;
            finalPrice = (Number(service.price) - 20).toFixed(2); // $20 off
          }
        }

        // Risk score (high risk for no-shows)
        const riskRand = rand();
        const riskScore = riskRand > 0.88 ? (0.70 + rand() * 0.25).toFixed(2) : (0.02 + rand() * 0.3).toFixed(2);

        appointmentsToInsert.push({
          tenantId,
          branchId: branch.id,
          serviceId: service.id,
          patientName: patient.name || "Unknown Patient",
          patientEmail: patient.email,
          patientId: patient.userId,
          startTime,
          endTime,
          status,
          riskScore,
          actualPrice: status === "completed" ? finalPrice : null,
          campaignId,
          isWalkIn: rand() > 0.9,
        });
      }
    }
  }

  console.log(`Inserting ${appointmentsToInsert.length} Appointments...`);
  // Insert appointments in chunks to avoid driver overflow if extremely large
  const chunkSize = 200;
  const insertedAppts = [];
  for (let i = 0; i < appointmentsToInsert.length; i += chunkSize) {
    const chunk = appointmentsToInsert.slice(i, i + chunkSize);
    const res = await db.insert(appointments).values(chunk).returning();
    insertedAppts.push(...res);
  }

  console.log("Generating dependent clinical records (notes, reviews, loyalty, audits)...");
  
  // Custom seedable deterministic LCG helper 2
  let state2 = 54321;
  const rand2 = () => {
    state2 = (state2 * 1664525 + 1013904223) % 4294967296;
    return state2 / 4294967296;
  };

  const auditLogsToInsert = [];
  const loyaltyTransactionsToInsert = [];
  const notesToInsert = [];
  const reviewsToInsert = [];

  for (const appt of insertedAppts) {
    // Audit logs
    auditLogsToInsert.push({
      tenantId,
      appointmentId: appt.id,
      userId: owner.id,
      action: "appointment_created",
      payload: { source: "mega_tenant_seeder" },
    });

    if (appt.status === "completed") {
      // Audit status change
      auditLogsToInsert.push({
        tenantId,
        appointmentId: appt.id,
        userId: owner.id,
        action: "status_changed",
        payload: { from: "confirmed", to: "completed" },
      });

      // Loyalty Points Transaction
      const points = Math.floor(Number(appt.actualPrice || 50));
      // Find patient profile ID matching this patient
      const patient = allPatients.find(p => p.userId === appt.patientId);
      if (patient) {
        loyaltyTransactionsToInsert.push({
          patientId: patient.id,
          appointmentId: appt.id,
          amount: points,
          reason: `Points earned for ${appt.isWalkIn ? 'Walk-in' : 'Booked'} Service`,
        });
      }

      // Clinical Note & Review for ~20% of completed
      if (rand2() < 0.20) {
        notesToInsert.push({
          tenantId,
          appointmentId: appt.id,
          dentistId: drOwner.id,
          content: `Patient reported satisfying progress. Performed routine checkup. Recommended next slot in 3 to 6 months. No immediate caries observed.`,
        });

        const rating = rand2() > 0.4 ? 5 : (rand2() > 0.5 ? 4 : 3);
        const comments = [
          "Outstanding care! Clean facilities and exceptionally professional team.",
          "Very happy with my cleaning. Fast and pain-free.",
          "Good experience, a bit of a wait but the dentist was very thorough.",
          "High end clinic, superb treatment and modern equipment.",
          "Friendly staff, clean environment. Recommended!"
        ];
        reviewsToInsert.push({
          tenantId,
          appointmentId: appt.id,
          rating,
          comment: comments[Math.floor(rand2() * comments.length)],
        });
      }
    }
  }

  console.log(`Inserting ${auditLogsToInsert.length} Audit Logs...`);
  for (let i = 0; i < auditLogsToInsert.length; i += chunkSize) {
    await db.insert(auditLogs).values(auditLogsToInsert.slice(i, i + chunkSize));
  }

  console.log(`Inserting ${loyaltyTransactionsToInsert.length} Loyalty Transactions...`);
  for (let i = 0; i < loyaltyTransactionsToInsert.length; i += chunkSize) {
    await db.insert(loyaltyTransactions).values(loyaltyTransactionsToInsert.slice(i, i + chunkSize));
  }

  console.log(`Inserting ${notesToInsert.length} Clinical Notes...`);
  for (let i = 0; i < notesToInsert.length; i += chunkSize) {
    await db.insert(clinicalNotes).values(notesToInsert.slice(i, i + chunkSize));
  }

  console.log(`Inserting ${reviewsToInsert.length} Reviews...`);
  for (let i = 0; i < reviewsToInsert.length; i += chunkSize) {
    await db.insert(reviews).values(reviewsToInsert.slice(i, i + chunkSize));
  }

  console.log("Inserting Notifications...");
  await db.insert(notifications).values([
    {
      userId: owner.id,
      tenantId,
      title: "New Booking Request",
      message: "You have a new booking request for Downtown Branch.",
      importance: "medium",
    },
    {
      userId: owner.id,
      tenantId,
      title: "Low Stock Alert",
      message: "Nitrile Gloves are low in stock at Downtown Branch.",
      importance: "high",
    }
  ]);

  console.log("Generating 25 Waitlist Entries...");
  const waitlistToInsert = [];
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  for (let i = 1; i <= 25; i++) {
    const branch = branchesList[Math.floor(rand2() * branchesList.length)];
    const service = servicesList[Math.floor(rand2() * servicesList.length)];
    const statusVal: "waiting" | "notified" | "booked" = rand2() > 0.7 ? "notified" : (rand2() > 0.5 ? "booked" : "waiting");
    waitlistToInsert.push({
      tenantId,
      branchId: branch.id,
      serviceId: service.id,
      patientName: `Waitlist Patient ${i}`,
      patientPhone: `+639${Math.floor(100000000 + rand2() * 900000000)}`,
      patientEmail: `waitlist${i}@example.com`,
      preferredDays: [daysOfWeek[Math.floor(rand2() * daysOfWeek.length)], daysOfWeek[Math.floor(rand2() * daysOfWeek.length)]],
      status: statusVal,
    });
  }
  await db.insert(waitlistEntries).values(waitlistToInsert);

  console.log("\nDatabase seeded with Mega-Tenant (6 branches, 90-day history) successfully!");
  console.log("--------------------------------------------------");
  console.log("TEST ACCOUNTS (Password: StrongPass123!@#)");
  console.log("- Super Admin: superadmin@test.com");
  console.log("- Clinic Owner: owner@test.com");
  console.log("- Staff: staff@test.com");
  console.log("- Patient: patient@test.com");
  console.log("--------------------------------------------------");
  console.log("Organization ID (Tenant ID):", tenantId);
  
  process.exit(0);
}

main().catch((err) => {
  console.error("Error seeding database:", err);
  process.exit(1);
});
