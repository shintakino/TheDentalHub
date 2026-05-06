import { Section, Text, Heading, Button } from "@react-email/components";
import * as React from "react";
import { BaseEmail } from "./components/BaseEmail";

interface AppointmentReminderEmailProps {
  patientName: string;
  clinicName: string;
  clinicLogoUrl?: string | null;
  primaryColor: string;
  appointmentDate: string;
  appointmentTime: string;
  branchName: string;
  branchAddress: string;
  serviceName: string;
}

export const AppointmentReminderEmail = ({
  patientName,
  clinicName,
  clinicLogoUrl,
  primaryColor,
  appointmentDate,
  appointmentTime,
  branchName,
  branchAddress,
  serviceName,
}: AppointmentReminderEmailProps) => {
  return (
    <BaseEmail
      previewText={`Reminder: Your appointment at ${clinicName} is tomorrow!`}
      clinicName={clinicName}
      clinicLogoUrl={clinicLogoUrl}
      primaryColor={primaryColor}
    >
      <Heading style={h1}>Appointment Reminder</Heading>
      <Text style={text}>Hi {patientName},</Text>
      <Text style={text}>
        This is a friendly reminder of your upcoming appointment for <strong>{serviceName}</strong> at <strong>{clinicName}</strong>.
      </Text>
      
      <Section style={detailsContainer}>
        <Text style={detailItem}>
          <strong>When:</strong> {appointmentDate} at {appointmentTime}
        </Text>
        <Text style={detailItem}>
          <strong>Where:</strong> {branchName}
        </Text>
        <Text style={detailItem}>
          {branchAddress}
        </Text>
      </Section>

      <Section style={buttonContainer}>
        <Button
          style={{ ...button, backgroundColor: primaryColor }}
          href={`https://${clinicName.toLowerCase().replace(/\s+/g, '-')}.dentahub.com/appointments`}
        >
          Confirm Attendance
        </Button>
      </Section>

      <Text style={text}>
        If you can't make it, please contact us as soon as possible to reschedule.
      </Text>
    </BaseEmail>
  );
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "30px 0",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
};

const detailsContainer = {
  backgroundColor: "#f9f9f9",
  borderRadius: "8px",
  padding: "24px",
  margin: "20px 0",
};

const detailItem = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "30px 0",
};

const button = {
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

export default AppointmentReminderEmail;
