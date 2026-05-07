import React from "react";
import { db } from "@/lib/db";
import { appointments, clinics, branches, services, waitlistEntries } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { format } from "date-fns";
import { notificationSender } from "./sender";
import { inAppNotifications } from "./in-app";
import BookingConfirmationEmail from "@/emails/BookingConfirmation";
import AppointmentReminderEmail from "@/emails/AppointmentReminder";
import CancellationNoticeEmail from "@/emails/CancellationNotice";
import WaitlistOfferEmail from "@/emails/WaitlistOffer";
import FeedbackRequestEmail from "@/emails/FeedbackRequest";

export const notificationTriggers = {
  async triggerWaitlistOffer(entryId: string, appointmentDate: Date) {
    const entry = await db.query.waitlistEntries.findFirst({
      where: eq(waitlistEntries.id, entryId),
      with: {
        branch: true,
        service: true,
      }
    });

    if (!entry) return;

    const clinic = await db.query.clinics.findFirst({ 
      where: eq(clinics.tenantId, entry.tenantId) 
    });

    if (!clinic) return;

    // 1. Always send In-App Notification if patient is registered
    if (entry.patientId) {
      await inAppNotifications.create({
        userId: entry.patientId,
        tenantId: entry.tenantId,
        title: "New Opening Available",
        message: `A slot for ${entry.service.name} at ${clinic.name} (${entry.branch.name}) is now available on ${format(appointmentDate, "MMM do")}.`,
        importance: "high",
      });
    }

    // 2. Send Email for crucial notifications
    if (entry.patientEmail) {
      await notificationSender.sendEmail({
        to: entry.patientEmail,
        subject: `New opening at ${clinic.name}`,
        template: React.createElement(WaitlistOfferEmail, {
          patientName: entry.patientName,
          clinicName: clinic.name,
          clinicLogoUrl: clinic.logoUrl,
          primaryColor: clinic.primaryColor || "#0047FF",
          appointmentDate: format(appointmentDate, "EEEE, MMMM do, yyyy"),
          appointmentTime: format(appointmentDate, "h:mm a"),
          branchName: entry.branch.name,
          branchAddress: entry.branch.address || "",
          serviceName: entry.service.name,
        }),
        templateName: "WaitlistOffer",
        tenantId: entry.tenantId,
      });
    }
  },

  async triggerBookingConfirmation(appointmentId: string) {
    const data = await this.getAppointmentNotificationData(appointmentId);
    if (!data) return;

    const { appointment, clinic, branch, service } = data;

    // 1. Always send In-App Notification
    if (appointment.patientId) {
      await inAppNotifications.create({
        userId: appointment.patientId,
        tenantId: appointment.tenantId,
        title: "Booking Confirmed",
        message: `Your appointment for ${service.name} at ${clinic.name} is confirmed for ${format(new Date(appointment.startTime), "MMM do 'at' h:mm a")}.`,
        importance: "high",
      });
    }

    // 2. Send Email for crucial notifications
    if (appointment.patientEmail) {
      await notificationSender.sendEmail({
        to: appointment.patientEmail,
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
    }
  },

  async triggerCancellationNotice(appointmentId: string) {
    const data = await this.getAppointmentNotificationData(appointmentId);
    if (!data) return;

    const { appointment, clinic, service } = data;

    // 1. Always send In-App Notification
    if (appointment.patientId) {
      await inAppNotifications.create({
        userId: appointment.patientId,
        tenantId: appointment.tenantId,
        title: "Appointment Cancelled",
        message: `Your appointment for ${service.name} at ${clinic.name} has been cancelled.`,
        importance: "high",
      });
    }

    // 2. Send Email for crucial notifications
    if (appointment.patientEmail) {
      await notificationSender.sendEmail({
        to: appointment.patientEmail,
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
    }
  },

  async triggerAppointmentReminder(appointmentId: string) {
    const data = await this.getAppointmentNotificationData(appointmentId);
    if (!data) return;

    const { appointment, clinic, branch, service } = data;

    // 1. Always send In-App Notification
    if (appointment.patientId) {
      await inAppNotifications.create({
        userId: appointment.patientId,
        tenantId: appointment.tenantId,
        title: "Upcoming Appointment Reminder",
        message: `Don't forget! You have an appointment for ${service.name} tomorrow at ${format(new Date(appointment.startTime), "h:mm a")}.`,
        importance: "medium",
      });
    }

    // 2. Send Email for crucial notifications
    if (appointment.patientEmail) {
      await notificationSender.sendEmail({
        to: appointment.patientEmail,
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
    }
  },

  async triggerFeedbackRequest(appointmentId: string) {
    const data = await this.getAppointmentNotificationData(appointmentId);
    if (!data) return;

    const { appointment, clinic } = data;

    // 1. Always send In-App Notification
    if (appointment.patientId) {
      await inAppNotifications.create({
        userId: appointment.patientId,
        tenantId: appointment.tenantId,
        title: "How was your visit?",
        message: `We'd love to hear your feedback on your recent visit to ${clinic.name}.`,
        importance: "low",
      });
    }

    // 2. Feedback is considered "less important" (for now), so we might NOT send email 
    // unless the patient opted in. For this implementation, we follow the user's rule:
    // "notification is in-app and email notif in-app for not very important ones"
    // So we'll SKIP email here to demonstrate the routing.
    
    /* 
    if (appointment.patientEmail) {
      const to = appointment.patientEmail!;
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      await notificationSender.sendEmail({
        to,
        subject: `How was your visit to ${clinic.name}?`,
        template: React.createElement(FeedbackRequestEmail, { ... }),
        templateName: "FeedbackRequest",
        appointmentId,
        tenantId: appointment.tenantId,
      });
    }
    */
  },

  async triggerHighRiskReminder(appointmentId: string) {
    const data = await this.getAppointmentNotificationData(appointmentId);
    if (!data) return;

    const { appointment, clinic, branch, service } = data;

    // 1. Always send In-App Notification
    if (appointment.patientId) {
      await inAppNotifications.create({
        userId: appointment.patientId,
        tenantId: appointment.tenantId,
        title: "Priority: Appointment Confirmation Needed",
        message: `Please confirm your attendance for your appointment at ${clinic.name} (${branch.name}) tomorrow.`,
        importance: "high",
      });
    }

    // 2. High Risk is CRUCIAL -> Send Email (or SMS if integrated)
    if (appointment.patientEmail) {
      await notificationSender.sendEmail({
        to: appointment.patientEmail,
        subject: `IMPORTANT: Please confirm your visit to ${clinic.name}`,
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
        templateName: "HighRiskReminder",
        appointmentId,
        tenantId: appointment.tenantId,
      });
    }
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

