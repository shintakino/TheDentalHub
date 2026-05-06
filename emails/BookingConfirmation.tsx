import { Section, Text, Heading, Button, Link } from "@react-email/components";
import * as React from "react";
import { BaseEmail } from "./components/BaseEmail";

interface BookingConfirmationEmailProps {
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

export const BookingConfirmationEmail = ({
  patientName,
  clinicName,
  clinicLogoUrl,
  primaryColor,
  appointmentDate,
  appointmentTime,
  branchName,
  branchAddress,
  serviceName,
}: BookingConfirmationEmailProps) => {
  return (
    <BaseEmail
      previewText={`Your appointment at ${clinicName} is confirmed!`}
      clinicName={clinicName}
      clinicLogoUrl={clinicLogoUrl}
      primaryColor={primaryColor}
    >
      <Heading style={h1}>Appointment Confirmed</Heading>
      <Text style={text}>Hi {patientName},</Text>
      <Text style={text}>
        Your appointment for <strong>{serviceName}</strong> has been successfully booked at <strong>{clinicName}</strong>.
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

      <Text style={text}>
        Please arrive 10 minutes early to complete any necessary paperwork. We look forward to seeing you!
      </Text>

      <Section style={buttonContainer}>
        <Button
          style={{ ...button, backgroundColor: primaryColor }}
          href={`https://${clinicName.toLowerCase().replace(/\s+/g, '-')}.dentahub.com/appointments`}
        >
          Manage Appointment
        </Button>
      </Section>

      <Text style={text}>
        If you need to reschedule or cancel, please let us know at least 24 hours in advance.
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

export default BookingConfirmationEmail;
