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
  notifications
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
  console.log("Creating Organization 'Test Clinic'...");
  const org = await clerkClient.organizations.createOrganization({
    name: "Test Clinic",
    createdBy: owner.id,
  });

  const tenantId = org.id;

  // Add Staff to Organization
  console.log("Adding Staff to Organization...");
  await clerkClient.organizations.createOrganizationMembership({
    organizationId: tenantId,
    userId: staffUser.id,
    role: "org:member",
  });

  console.log("Clerk provisioning complete.");

  // Drizzle Seeding
  console.log("--- Database Seeding Phase ---");
  
  console.log("Clearing database tables...");
  await db.delete(notifications);
  await db.delete(reviews);
  await db.delete(loyaltyTransactions);
  await db.delete(patientProfiles);
  await db.delete(inventoryLogs);
  await db.delete(inventoryStock);
  await db.delete(inventoryItems);
  await db.delete(communicationsLog);
  await db.delete(clinicalNotes);
  await db.delete(auditLogs);
  await db.delete(waitlistEntries);
  await db.delete(appointments);
  await db.delete(staffAssignments);
  await db.delete(branchOverrides);
  await db.delete(staff);
  await db.delete(services);
  await db.delete(branches);
  await db.delete(clinics);

  console.log("Inserting Clinic...");
  await db.insert(clinics).values({
    tenantId,
    name: "The Dental Hub Premium",
    subdomain: "test-clinic",
    primaryColor: "#0f172a",
    bookingApprovalMode: "manual",
  });

  console.log("Inserting Branches...");
  const [branch1, branch2] = await db.insert(branches).values([
    {
      tenantId,
      name: "Downtown Branch",
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
      maxCapacity: 3,
    },
    {
      tenantId,
      name: "Westside Branch",
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
    { tenantId, staffId: janeStaff.id, branchId: branch1.id, dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
    { tenantId, staffId: janeStaff.id, branchId: branch1.id, dayOfWeek: 2, startTime: "09:00", endTime: "17:00" },
    { tenantId, staffId: janeStaff.id, branchId: branch1.id, dayOfWeek: 3, startTime: "09:00", endTime: "17:00" },
    { tenantId, staffId: janeStaff.id, branchId: branch1.id, dayOfWeek: 4, startTime: "09:00", endTime: "17:00" },
    { tenantId, staffId: janeStaff.id, branchId: branch1.id, dayOfWeek: 5, startTime: "09:00", endTime: "17:00" },
    { tenantId, staffId: drOwner.id, branchId: branch2.id, dayOfWeek: 1, startTime: "08:00", endTime: "16:00" },
    { tenantId, staffId: drOwner.id, branchId: branch2.id, dayOfWeek: 2, startTime: "08:00", endTime: "16:00" },
  ]);

  console.log("Inserting Inventory Items...");
  const [gloves, anesthetic, composite] = await db.insert(inventoryItems).values([
    { tenantId, name: "Nitrile Gloves (Large)", category: "Consumables", unit: "Box" },
    { tenantId, name: "Lidocaine Anesthetic", category: "Medication", unit: "Vial" },
    { tenantId, name: "Hybrid Composite Resin", category: "Consumables", unit: "Syringe" },
  ]).returning();

  console.log("Inserting Inventory Stock...");
  await db.insert(inventoryStock).values([
    { itemId: gloves.id, branchId: branch1.id, quantity: "5.00", lowStockThreshold: "10.00" }, // Low stock
    { itemId: gloves.id, branchId: branch2.id, quantity: "20.00", lowStockThreshold: "10.00" },
    { itemId: anesthetic.id, branchId: branch1.id, quantity: "50.00", lowStockThreshold: "20.00" },
    { itemId: composite.id, branchId: branch1.id, quantity: "15.00", lowStockThreshold: "5.00" },
  ]);

  console.log("Inserting Patient Profiles...");
  const [patientProfile] = await db.insert(patientProfiles).values({
    userId: patientUser.id,
    loyaltyPoints: 150,
    preferences: { email_marketing: true, sms_reminders: true },
  }).returning();

  console.log("Inserting Mock Appointments...");
  const today = startOfDay(new Date());

  const [pastAppt] = await db.insert(appointments).values([
    {
      tenantId,
      branchId: branch1.id,
      serviceId: consultation.id,
      patientName: "John Patient",
      patientEmail: "patient@test.com",
      patientId: patientUser.id,
      startTime: setMinutes(setHours(subDays(today, 1), 10), 0),
      endTime: setMinutes(setHours(subDays(today, 1), 10), 30),
      status: "completed",
      actualPrice: "50.00",
    },
  ]).returning();

  console.log("Inserting Loyalty Transactions...");
  await db.insert(loyaltyTransactions).values({
    patientId: patientProfile.id,
    appointmentId: pastAppt.id,
    amount: 50,
    reason: "Completed Consultation",
  });

  console.log("Inserting Clinical Notes...");
  await db.insert(clinicalNotes).values({
    tenantId,
    appointmentId: pastAppt.id,
    dentistId: owner.id,
    content: "Patient has good oral hygiene. Recommended regular cleaning every 6 months.",
  });

  console.log("Inserting Reviews...");
  await db.insert(reviews).values({
    tenantId,
    appointmentId: pastAppt.id,
    rating: 5,
    comment: "Excellent service! Very professional and pain-free.",
  });

  const futureAppts = await db.insert(appointments).values([
    // --- BRANCH 1 (DOWNTOWN) ---
    {
      tenantId,
      branchId: branch1.id,
      serviceId: consultation.id,
      patientName: "Alice Smith",
      patientEmail: "alice@example.com",
      startTime: setMinutes(setHours(today, 9), 0),
      endTime: setMinutes(setHours(today, 9), 30),
      status: "confirmed",
    },
    {
      tenantId,
      branchId: branch1.id,
      serviceId: cleaning.id,
      patientName: "Bob Johnson",
      patientEmail: "bob@example.com",
      startTime: setMinutes(setHours(today, 13), 0),
      endTime: setMinutes(setHours(today, 13), 45),
      status: "checked_in",
    },
    {
      tenantId,
      branchId: branch1.id,
      serviceId: cleaning.id,
      patientName: "John Patient",
      patientEmail: "patient@test.com",
      patientId: patientUser.id,
      startTime: setMinutes(setHours(addDays(today, 1), 11), 0),
      endTime: setMinutes(setHours(addDays(today, 1), 11), 45),
      status: "confirmed",
    },
    {
      tenantId,
      branchId: branch1.id,
      serviceId: consultation.id,
      patientName: "Charlie Brown",
      patientEmail: "charlie@example.com",
      startTime: setMinutes(setHours(addDays(today, 1), 15), 0),
      endTime: setMinutes(setHours(addDays(today, 1), 15), 30),
      status: "pending_approval",
    },
    {
      tenantId,
      branchId: branch1.id,
      serviceId: xray.id,
      patientName: "Grace Hopper",
      patientEmail: "grace@example.com",
      startTime: setMinutes(setHours(addDays(today, 4), 10), 0),
      endTime: setMinutes(setHours(addDays(today, 4), 10), 15),
      status: "confirmed",
    },

    // --- BRANCH 2 (WESTSIDE) ---
    {
      tenantId,
      branchId: branch2.id,
      serviceId: xray.id,
      patientName: "David Miller",
      patientEmail: "david@example.com",
      startTime: setMinutes(setHours(today, 10), 30),
      endTime: setMinutes(setHours(today, 10), 45),
      status: "in_progress",
      riskScore: "3.5",
    },
    {
      tenantId,
      branchId: branch2.id,
      serviceId: consultation.id,
      patientName: "Eve Adams",
      patientEmail: "eve@example.com",
      startTime: setMinutes(setHours(today, 14), 30),
      endTime: setMinutes(setHours(today, 14), 45),
      status: "pending_approval",
    },
    {
      tenantId,
      branchId: branch2.id,
      serviceId: xray.id,
      patientName: "John Patient",
      patientEmail: "patient@test.com",
      patientId: patientUser.id,
      startTime: setMinutes(setHours(addDays(today, 2), 14), 30),
      endTime: setMinutes(setHours(addDays(today, 2), 14), 45),
      status: "confirmed",
    },
    {
      tenantId,
      branchId: branch2.id,
      serviceId: cleaning.id,
      patientName: "Frank Wright",
      patientEmail: "frank@example.com",
      startTime: setMinutes(setHours(addDays(today, 3), 9), 30),
      endTime: setMinutes(setHours(addDays(today, 3), 10), 15),
      status: "confirmed",
    },
    {
      tenantId,
      branchId: branch2.id,
      serviceId: consultation.id,
      patientName: "Heidi Klum",
      patientEmail: "heidi@example.com",
      startTime: setMinutes(setHours(addDays(today, 5), 16), 0),
      endTime: setMinutes(setHours(addDays(today, 5), 16), 30),
      status: "confirmed",
    }
  ]).returning();

  console.log("Inserting Audit Logs...");
  await db.insert(auditLogs).values(
    futureAppts.map(appt => ({
      tenantId,
      appointmentId: appt.id,
      userId: owner.id,
      action: "appointment_created",
      payload: { source: "seed_script" },
    }))
  );

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

  console.log("Inserting Waitlist Entries...");
  await db.insert(waitlistEntries).values([
    {
      tenantId,
      branchId: branch1.id,
      serviceId: cleaning.id,
      patientName: "Waitlist Patient 1",
      patientPhone: "+639123456789",
      patientEmail: "waitlist1@test.com",
      preferredDays: ["Monday", "Wednesday"],
      status: "waiting",
    },
    {
      tenantId,
      branchId: branch1.id,
      serviceId: consultation.id,
      patientName: "Waitlist Patient 2",
      patientPhone: "+639987654321",
      status: "notified",
    }
  ]);

  console.log("\nDatabase seeded successfully!");
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
