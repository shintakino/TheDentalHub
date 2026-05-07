import { z } from "zod";

export const getSlotsQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be a valid date in YYYY-MM-DD format"),
  serviceId: z.string().min(1, "Service ID is required"),
});

export const bookAppointmentSchema = z.object({
  branchId: z.string().min(1, "Branch ID is required"),
  serviceId: z.string().min(1, "Service ID is required"),
  patientId: z.string().min(1, "Patient ID is required"),
  startTime: z.string().datetime({ message: "Start time must be a valid ISO 8601 UTC string" }),
  endTime: z.string().datetime({ message: "End time must be a valid ISO 8601 UTC string" }),
});

export const updateBrandingSchema = z.object({
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
  secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional().nullable(),
  subdomain: z.string().min(3).max(32).regex(/^[a-z0-9-]+$/).optional().nullable(),
  seoTitle: z.string().max(60).optional().nullable(),
  seoDescription: z.string().max(160).optional().nullable(),
});

export const analyticsQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  branchId: z.string().uuid().optional(),
});

export const analyticsResponseSchema = z.object({
  summary: z.object({
    totalBookings: z.number(),
    noShowRate: z.number(),
    avgUtilization: z.number(),
    peakHour: z.string(),
    waitlistEntries: z.number().optional(),
    waitlistConversionRate: z.number().optional(),
  }),
  timeSeries: z.array(z.object({
    date: z.string(),
    bookings: z.number(),
    utilization: z.number(),
  })),
  peakHours: z.array(z.object({
    hour: z.string(),
    count: z.number(),
  })),
});

export const comparativeMetricSchema = z.object({
  branchId: z.string(),
  branchName: z.string(),
  bookingCount: z.number(),
  utilization: z.number(),
  maxCapacity: z.number(),
});

export const recommendationSchema = z.object({
  type: z.enum(["staff_movement", "capacity_expansion", "marketing_push"]),
  priority: z.enum(["high", "medium", "low"]),
  title: z.string(),
  description: z.string(),
  action: z.string().optional(),
});

export type ComparativeMetric = z.infer<typeof comparativeMetricSchema>;
export type Recommendation = z.infer<typeof recommendationSchema>;

export const branchSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().optional(),
  timezone: z.string().min(1, "Timezone is required"),
  operatingHours: z.array(z.object({
    day: z.number().min(0).max(6),
    open: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    close: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    active: z.boolean()
  })),
  maxCapacity: z.number().int().min(1, "Capacity must be at least 1"),
  isActive: z.boolean()
});

export const staffAssignmentSchema = z.object({
  staffId: z.string().uuid("Invalid staff ID"),
  branchId: z.string().uuid("Invalid branch ID"),
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
});

export const serviceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  duration: z.number().positive("Duration must be positive")
});

export const inviteStaffSchema = z.object({
  email: z.string().email("Invalid email"),
  role: z.enum(["admin", "dentist", "receptionist"]),
  name: z.string().min(1, "Name is required")
});

export const clinicOnboardingSchema = z.object({
  clinicName: z.string().min(2, {
    message: "Clinic name must be at least 2 characters.",
  }),
});

export const waitlistEntrySchema = z.object({
  branchId: z.string().uuid("Invalid branch ID"),
  serviceId: z.string().uuid("Invalid service ID"),
  patientName: z.string().min(1, "Patient name is required"),
  patientPhone: z.string().min(5, "Valid phone number is required"),
  patientEmail: z.string().email("Invalid email").optional().nullable(),
  patientId: z.string().optional().nullable(),
  preferredDays: z.array(z.string()).default([]),
  status: z.enum(["waiting", "notified", "booked", "cancelled", "expired"]).optional().default("waiting")
});

export const branchOverrideSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  reason: z.string().min(1, "Reason is required"),
  isClosed: z.boolean().default(true)
});

export const suggestionSchema = z.object({
  branchId: z.string().uuid(),
  branchName: z.string(),
  distance: z.string(),
  nextSlot: z.string().datetime(),
});

export const occupancySchema = z.object({
  branchId: z.string().uuid(),
  branchName: z.string(),
  maxCapacity: z.number(),
  currentOccupancy: z.number(),
});

export type BranchOverridePayload = z.infer<typeof branchOverrideSchema>;
export type Suggestion = z.infer<typeof suggestionSchema>;
export type Occupancy = z.infer<typeof occupancySchema>;

export type ClinicOnboardingPayload = z.infer<typeof clinicOnboardingSchema>;
export type WaitlistEntryPayload = z.infer<typeof waitlistEntrySchema>;

export type GetSlotsQuery = z.infer<typeof getSlotsQuerySchema>;
export type BookAppointmentPayload = z.infer<typeof bookAppointmentSchema>;
export type UpdateBrandingPayload = z.infer<typeof updateBrandingSchema>;
export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
export type AnalyticsResponse = z.infer<typeof analyticsResponseSchema>;
export type BranchPayload = z.infer<typeof branchSchema>;
export type ServicePayload = z.infer<typeof serviceSchema>;
export type InviteStaffPayload = z.infer<typeof inviteStaffSchema>;
export type StaffAssignmentPayload = z.infer<typeof staffAssignmentSchema>;
