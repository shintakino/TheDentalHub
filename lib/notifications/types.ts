import { z } from "zod";

export const NotificationPayloadSchema = z.object({
  patientName: z.string(),
  patientEmail: z.string().email().optional(),
  patientPhone: z.string().optional(),
  clinicName: z.string(),
  clinicLogoUrl: z.string().nullable().optional(),
  primaryColor: z.string(),
  appointmentDate: z.string(),
  appointmentTime: z.string(),
  branchName: z.string().optional(),
  branchAddress: z.string().optional(),
  serviceName: z.string(),
  appointmentId: z.string().uuid(),
  tenantId: z.string(),
});

export type NotificationPayload = z.infer<typeof NotificationPayloadSchema>;

export interface SendEmailOptions {
  to: string;
  subject: string;
  template: React.ReactElement;
  templateName: string;
  appointmentId: string;
  tenantId: string;
}

export interface SendSMSOptions {
  to: string;
  message: string;
  appointmentId: string;
  tenantId: string;
}
