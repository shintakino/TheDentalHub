import { Section, Text, Heading, Button } from "@react-email/components";
import * as React from "react";
import { BaseEmail } from "./components/BaseEmail";

interface CancellationNoticeEmailProps {
  patientName: string;
  clinicName: string;
  clinicLogoUrl?: string | null;
  primaryColor: string;
  appointmentDate: string;
  appointmentTime: string;
  serviceName: string;
}

export const CancellationNoticeEmail = ({
  patientName,
  clinicName,
  clinicLogoUrl,
  primaryColor,
  appointmentDate,
  appointmentTime,
  serviceName,
}: CancellationNoticeEmailProps) => {
  return (
    <BaseEmail
      previewText={`Your appointment at ${clinicName} has been cancelled`}
      clinicName={clinicName}
      clinicLogoUrl={clinicLogoUrl}
      primaryColor={primaryColor}
    >
      <Heading style={h1}>Appointment Cancelled</Heading>
      <Text style={text}>Hi {patientName},</Text>
      <Text style={text}>
        This email confirms that your appointment for <strong>{serviceName}</strong> at <strong>{clinicName}</strong> on <strong>{appointmentDate}</strong> at <strong>{appointmentTime}</strong> has been cancelled.
      </Text>
      
      <Text style={text}>
        If this was a mistake or you'd like to book a new appointment, you can do so by clicking the button below.
      </Text>

      <Section style={buttonContainer}>
        <Button
          style={{ ...button, backgroundColor: primaryColor }}
          href={`https://${clinicName.toLowerCase().replace(/\s+/g, '-')}.dentahub.com/book`}
        >
          Book New Appointment
        </Button>
      </Section>

      <Text style={text}>
        We hope to see you again soon!
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

export default CancellationNoticeEmail;
