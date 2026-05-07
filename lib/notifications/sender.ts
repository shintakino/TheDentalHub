import { Resend } from "resend";
import twilio, { Twilio } from "twilio";
import { db } from "@/lib/db";
import { communicationsLog } from "@/lib/db/schema";
import { SendEmailOptions, SendSMSOptions } from "./types";

let resendClient: Resend | null = null;
let twilioClient: Twilio | null = null;

const getResend = () => {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY || "re_dummy");
  }
  return resendClient;
};

const getTwilio = () => {
  if (!twilioClient) {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID || "AC_dummy",
      process.env.TWILIO_AUTH_TOKEN || "token_dummy"
    );
  }
  return twilioClient;
};

export const notificationSender = {
  async sendEmail({ to, subject, template, templateName, appointmentId, tenantId }: SendEmailOptions) {
    const resend = getResend();
    try {
      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || "The Dental Hub <notifications@dentahub.com>",
        to,
        subject,
        react: template,
      });

      if (error) {
        await this.logCommunication({
          tenantId,
          appointmentId,
          type: "email",
          recipient: to,
          subject,
          templateName,
          status: "failed",
          error: error.message,
        });
        throw error;
      }

      await this.logCommunication({
        tenantId,
        appointmentId,
        type: "email",
        recipient: to,
        subject,
        templateName,
        providerId: data?.id,
        status: "sent",
      });

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Failed to send email:", error);
      await this.logCommunication({
        tenantId,
        appointmentId,
        type: "email",
        recipient: to,
        subject,
        templateName,
        status: "failed",
        error: errorMessage,
      });
      throw error;
    }
  },

  async sendSMS({ to, message, appointmentId, tenantId }: SendSMSOptions) {
    const twilio = getTwilio();
    try {
      const response = await twilio.messages.create({
        body: message,
        to,
        from: process.env.TWILIO_PHONE_NUMBER,
      });

      await this.logCommunication({
        tenantId,
        appointmentId,
        type: "sms",
        recipient: to,
        templateName: "sms_direct",
        providerId: response.sid,
        status: "sent",
      });

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Failed to send SMS:", error);
      await this.logCommunication({
        tenantId,
        appointmentId,
        type: "sms",
        recipient: to,
        templateName: "sms_direct",
        status: "failed",
        error: errorMessage,
      });
      throw error;
    }
  },

  async logCommunication(log: {
    tenantId: string;
    appointmentId?: string;
    type: "email" | "sms";
    recipient: string;
    subject?: string;
    templateName: string;
    providerId?: string;
    status: string;
    error?: string;
  }) {
    try {
      await db.insert(communicationsLog).values({
        tenantId: log.tenantId,
        appointmentId: log.appointmentId ?? null,
        type: log.type,
        recipient: log.recipient,
        subject: log.subject,
        templateName: log.templateName,
        providerId: log.providerId,
        status: log.status,
        error: log.error,
      });
    } catch (error) {
      console.error("Failed to log communication:", error);
    }
  },
};
