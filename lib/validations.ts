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

export type GetSlotsQuery = z.infer<typeof getSlotsQuerySchema>;
export type BookAppointmentPayload = z.infer<typeof bookAppointmentSchema>;
export type UpdateBrandingPayload = z.infer<typeof updateBrandingSchema>;
