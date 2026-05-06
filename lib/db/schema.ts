import { pgTable, text, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";

export const clinics = pgTable("clinics", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: text("tenant_id").notNull().unique(), // Corresponds to Clerk organization ID
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const branches = pgTable("branches", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: text("tenant_id").notNull().references(() => clinics.tenantId, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const services = pgTable("services", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: text("tenant_id").notNull().references(() => clinics.tenantId, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  duration: text("duration").notNull(), // Interval or minutes, storing as text for simplicity
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const staff = pgTable("staff", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: text("tenant_id").notNull().references(() => clinics.tenantId, { onDelete: 'cascade' }),
  userId: text("user_id").notNull(), // Clerk user ID
  name: text("name").notNull(),
  role: text("role").notNull(), // 'admin', 'dentist', 'receptionist', etc.
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

// Scheduling specifics mentioned in previous spec
export const appointments = pgTable("appointments", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: text("tenant_id").notNull().references(() => clinics.tenantId, { onDelete: 'cascade' }),
  branchId: uuid("branch_id").notNull().references(() => branches.id, { onDelete: 'cascade' }),
  serviceId: uuid("service_id").notNull().references(() => services.id, { onDelete: 'cascade' }),
  patientName: text("patient_name").notNull(),
  patientEmail: text("patient_email"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: text("status", { enum: appointmentStatusEnum }).default("confirmed").notNull(),
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
