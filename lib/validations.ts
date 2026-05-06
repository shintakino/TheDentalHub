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
});

export const analyticsResponseSchema = z.object({
  summary: z.object({
    totalBookings: z.number(),
    noShowRate: z.number(),
    avgUtilization: z.number(),
    peakHour: z.string(),
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

export const branchSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().optional(),
  timezone: z.string().min(1, "Timezone is required"),
  operatingHours: z.array(z.object({
    day: z.number().min(0).max(6),
    open: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    close: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    active: z.boolean()
  }))
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

export type ClinicOnboardingPayload = z.infer<typeof clinicOnboardingSchema>;

export type GetSlotsQuery = z.infer<typeof getSlotsQuerySchema>;
export type BookAppointmentPayload = z.infer<typeof bookAppointmentSchema>;
export type UpdateBrandingPayload = z.infer<typeof updateBrandingSchema>;
export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
export type AnalyticsResponse = z.infer<typeof analyticsResponseSchema>;
export type BranchPayload = z.infer<typeof branchSchema>;
export type ServicePayload = z.infer<typeof serviceSchema>;
export type InviteStaffPayload = z.infer<typeof inviteStaffSchema>;
