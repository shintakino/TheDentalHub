import React from "react";
import { db } from "@/lib/db";
import { appointments, clinics, branches, services } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { format } from "date-fns";
import { notificationSender } from "./sender";
import BookingConfirmationEmail from "@/emails/BookingConfirmation";
import AppointmentReminderEmail from "@/emails/AppointmentReminder";
import CancellationNoticeEmail from "@/emails/CancellationNotice";

export const notificationTriggers = {
  async triggerBookingConfirmation(appointmentId: string) {
    const data = await this.getAppointmentNotificationData(appointmentId);
    if (!data || !data.appointment.patientEmail) return;

    const { appointment, clinic, branch, service } = data;
    const to = appointment.patientEmail!;

    await notificationSender.sendEmail({
      to,
      subject: `Confirmation: Your appointment at ${clinic.name}`,
      template: React.createElement(BookingConfirmationEmail, {
        patientName: appointment.patientName,
        clinicName: clinic.name,
        clinicLogoUrl: clinic.logoUrl,
        primaryColor: clinic.primaryColor || "#0047FF",
        appointmentDate: format(new Date(appointment.startTime), "EEEE, MMMM do, yyyy"),
        appointmentTime: format(new Date(appointment.startTime), "h:mm a"),
        branchName: branch.name,
        branchAddress: branch.address || "",
        serviceName: service.name,
      }),
      templateName: "BookingConfirmation",
      appointmentId,
      tenantId: appointment.tenantId,
    });
  },

  async triggerCancellationNotice(appointmentId: string) {
    const data = await this.getAppointmentNotificationData(appointmentId);
    if (!data || !data.appointment.patientEmail) return;

    const { appointment, clinic, service } = data;
    const to = appointment.patientEmail!;

    await notificationSender.sendEmail({
      to,
      subject: `Cancelled: Your appointment at ${clinic.name}`,
      template: React.createElement(CancellationNoticeEmail, {
        patientName: appointment.patientName,
        clinicName: clinic.name,
        clinicLogoUrl: clinic.logoUrl,
        primaryColor: clinic.primaryColor || "#0047FF",
        appointmentDate: format(new Date(appointment.startTime), "EEEE, MMMM do, yyyy"),
        appointmentTime: format(new Date(appointment.startTime), "h:mm a"),
        serviceName: service.name,
      }),
      templateName: "CancellationNotice",
      appointmentId,
      tenantId: appointment.tenantId,
    });
  },

  async triggerAppointmentReminder(appointmentId: string) {
    const data = await this.getAppointmentNotificationData(appointmentId);
    if (!data || !data.appointment.patientEmail) return;

    const { appointment, clinic, branch, service } = data;
    const to = appointment.patientEmail!;

    await notificationSender.sendEmail({
      to,
      subject: `Reminder: Your appointment at ${clinic.name} is tomorrow`,
      template: React.createElement(AppointmentReminderEmail, {
        patientName: appointment.patientName,
        clinicName: clinic.name,
        clinicLogoUrl: clinic.logoUrl,
        primaryColor: clinic.primaryColor || "#0047FF",
        appointmentDate: format(new Date(appointment.startTime), "EEEE, MMMM do, yyyy"),
        appointmentTime: format(new Date(appointment.startTime), "h:mm a"),
        branchName: branch.name,
        branchAddress: branch.address || "",
        serviceName: service.name,
      }),
      templateName: "AppointmentReminder",
      appointmentId,
      tenantId: appointment.tenantId,
    });
  },

  async getAppointmentNotificationData(appointmentId: string) {
    const appointment = await db.query.appointments.findFirst({
      where: eq(appointments.id, appointmentId),
    });

    if (!appointment) return null;

    const [clinic, branch, service] = await Promise.all([
      db.query.clinics.findFirst({ where: eq(clinics.tenantId, appointment.tenantId) }),
      db.query.branches.findFirst({ where: eq(branches.id, appointment.branchId) }),
      db.query.services.findFirst({ where: eq(services.id, appointment.serviceId) }),
    ]);

    if (!clinic || !branch || !service) return null;

    return { appointment, clinic, branch, service };
  },
};
