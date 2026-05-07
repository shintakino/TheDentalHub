import { pgTable, text, timestamp, uuid, jsonb, integer, decimal, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const clinics = pgTable("clinics", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: text("tenant_id").notNull().unique(), // Corresponds to Clerk organization ID
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").default("#0047FF"),
  secondaryColor: text("secondary_color"),
  subdomain: text("subdomain").unique(),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const branches = pgTable("branches", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: text("tenant_id").notNull().references(() => clinics.tenantId, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  address: text("address"),
  timezone: text("timezone").default("UTC").notNull(),
  operatingHours: jsonb("operating_hours").$type<{ day: number; open: string; close: string; active: boolean }[]>().default([]).notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  nextSlots: jsonb("next_slots").$type<string[]>().default([]).notNull(),
  availabilityUpdatedAt: timestamp("availability_updated_at"),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("4.5"),
  maxCapacity: integer("max_capacity").default(1).notNull(), // Number of chairs
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const services = pgTable("services", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: text("tenant_id").notNull().references(() => clinics.tenantId, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  duration: integer("duration").notNull(), // Duration in minutes
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const staff = pgTable("staff", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: text("tenant_id").notNull().references(() => clinics.tenantId, { onDelete: 'cascade' }),
  userId: text("user_id").notNull(), // Clerk user ID
  name: text("name").notNull(),
  role: text("role").notNull(), // 'admin', 'dentist', 'receptionist', etc.
  targetDailyHours: integer("target_daily_hours").default(8).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const staffAssignments = pgTable("staff_assignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: text("tenant_id").notNull().references(() => clinics.tenantId, { onDelete: 'cascade' }),
  staffId: uuid("staff_id").notNull().references(() => staff.id, { onDelete: 'cascade' }),
  branchId: uuid("branch_id").notNull().references(() => branches.id, { onDelete: 'cascade' }),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6
  startTime: text("start_time").notNull(), // Format: "HH:mm"
  endTime: text("end_time").notNull(), // Format: "HH:mm"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define the valid statuses
export const appointmentStatusEnum = [
  "confirmed",
  "checked_in",
  "in_progress",
  "completed",
  "cancelled",
  "no_show"
] as const;

export type AppointmentStatus = typeof appointmentStatusEnum[number];

export const waitlistStatusEnum = [
  "waiting",
  "notified",
  "booked",
  "cancelled",
  "expired",
] as const;

export type WaitlistStatus = typeof waitlistStatusEnum[number];

// Scheduling specifics mentioned in previous spec
export const appointments = pgTable("appointments", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: text("tenant_id").notNull().references(() => clinics.tenantId, { onDelete: 'cascade' }),
  branchId: uuid("branch_id").notNull().references(() => branches.id, { onDelete: 'cascade' }),
  serviceId: uuid("service_id").notNull().references(() => services.id, { onDelete: 'cascade' }),
  patientName: text("patient_name").notNull(),
  patientEmail: text("patient_email"),
  patientId: text("patient_id"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: text("status", { enum: appointmentStatusEnum }).default("confirmed").notNull(),
  isWalkIn: boolean("is_walk_in").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const waitlistEntries = pgTable("waitlist_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: text("tenant_id").notNull().references(() => clinics.tenantId, { onDelete: 'cascade' }),
  branchId: uuid("branch_id").notNull().references(() => branches.id, { onDelete: 'cascade' }),
  patientId: text("patient_id"),
  patientName: text("patient_name").notNull(),
  patientPhone: text("patient_phone").notNull(),
  patientEmail: text("patient_email"),
  serviceId: uuid("service_id").notNull().references(() => services.id, { onDelete: 'cascade' }),
  preferredDays: jsonb("preferred_days").$type<string[]>().default([]).notNull(),
  status: text("status", { enum: waitlistStatusEnum }).default("waiting").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: text("tenant_id").notNull().references(() => clinics.tenantId, { onDelete: 'cascade' }),
  appointmentId: uuid("appointment_id").notNull().references(() => appointments.id, { onDelete: 'cascade' }),
  userId: text("user_id").notNull(), // Clerk User ID
  action: text("action").notNull(),
  payload: jsonb("payload"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const clinicalNotes = pgTable("clinical_notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: text("tenant_id").notNull().references(() => clinics.tenantId, { onDelete: 'cascade' }),
  appointmentId: uuid("appointment_id").notNull().references(() => appointments.id, { onDelete: 'cascade' }),
  dentistId: text("dentist_id").notNull(), // Clerk User ID
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const communicationTypeEnum = ["email", "sms"] as const;
export type CommunicationType = typeof communicationTypeEnum[number];

export const communicationsLog = pgTable("communications_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: text("tenant_id").notNull().references(() => clinics.tenantId, { onDelete: 'cascade' }),
  appointmentId: uuid("appointment_id").references(() => appointments.id, { onDelete: 'cascade' }),
  type: text("type", { enum: communicationTypeEnum }).notNull(),
  recipient: text("recipient").notNull(),
  subject: text("subject"),
  templateName: text("template_name").notNull(),
  providerId: text("provider_id"), // ID from Resend/Twilio
  status: text("status").notNull(), // 'sent', 'failed', etc.
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const branchOverrides = pgTable("branch_overrides", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: text("tenant_id").notNull().references(() => clinics.tenantId, { onDelete: 'cascade' }),
  branchId: uuid("branch_id").notNull().references(() => branches.id, { onDelete: 'cascade' }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  reason: text("reason").notNull(),
  isClosed: boolean("is_closed").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const clinicsRelations = relations(clinics, ({ many }) => ({
  branches: many(branches),
  appointments: many(appointments),
  waitlistEntries: many(waitlistEntries),
  overrides: many(branchOverrides),
}));

export const branchesRelations = relations(branches, ({ one, many }) => ({
  clinic: one(clinics, {
    fields: [branches.tenantId],
    references: [clinics.tenantId],
  }),
  appointments: many(appointments),
  waitlistEntries: many(waitlistEntries),
  overrides: many(branchOverrides),
}));

export const servicesRelations = relations(services, ({ many }) => ({
  appointments: many(appointments),
  waitlistEntries: many(waitlistEntries),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  clinic: one(clinics, {
    fields: [appointments.tenantId],
    references: [clinics.tenantId],
  }),
  branch: one(branches, {
    fields: [appointments.branchId],
    references: [branches.id],
  }),
  service: one(services, {
    fields: [appointments.serviceId],
    references: [services.id],
  }),
}));

export const waitlistEntriesRelations = relations(waitlistEntries, ({ one }) => ({
  clinic: one(clinics, {
    fields: [waitlistEntries.tenantId],
    references: [clinics.tenantId],
  }),
  branch: one(branches, {
    fields: [waitlistEntries.branchId],
    references: [branches.id],
  }),
  service: one(services, {
    fields: [waitlistEntries.serviceId],
    references: [services.id],
  }),
}));

export const staffRelations = relations(staff, ({ many }) => ({
  assignments: many(staffAssignments),
}));

export const staffAssignmentsRelations = relations(staffAssignments, ({ one }) => ({
  staff: one(staff, {
    fields: [staffAssignments.staffId],
    references: [staff.id],
  }),
  branch: one(branches, {
    fields: [staffAssignments.branchId],
    references: [branches.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  appointment: one(appointments, {
    fields: [auditLogs.appointmentId],
    references: [appointments.id],
  }),
}));

export const clinicalNotesRelations = relations(clinicalNotes, ({ one }) => ({
  appointment: one(appointments, {
    fields: [clinicalNotes.appointmentId],
    references: [appointments.id],
  }),
}));

export const communicationsLogRelations = relations(communicationsLog, ({ one }) => ({
  appointment: one(appointments, {
    fields: [communicationsLog.appointmentId],
    references: [appointments.id],
  }),
}));

export const branchOverridesRelations = relations(branchOverrides, ({ one }) => ({
  clinic: one(clinics, {
    fields: [branchOverrides.tenantId],
    references: [clinics.tenantId],
  }),
  branch: one(branches, {
    fields: [branchOverrides.branchId],
    references: [branches.id],
  }),
}));
