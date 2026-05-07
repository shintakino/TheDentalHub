import * as React from "react";
import {
  Heading,
  Section,
  Text,
  Link,
} from "@react-email/components";
import { BaseEmail } from "./components/BaseEmail";

interface WaitlistOfferEmailProps {
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

export const WaitlistOfferEmail = ({
  patientName,
  clinicName,
  clinicLogoUrl,
  primaryColor,
  appointmentDate,
  appointmentTime,
  branchName,
  branchAddress,
  serviceName,
}: WaitlistOfferEmailProps) => (
  <BaseEmail
    previewText={`A slot has opened up at ${clinicName}`}
    clinicName={clinicName}
    clinicLogoUrl={clinicLogoUrl}
    primaryColor={primaryColor}
  >
    <Heading style={{ color: "#1E293B", fontSize: "24px", fontWeight: "600", marginBottom: "24px", fontFamily: "Playfair Display, serif" }}>
      Waitlist Opportunity
    </Heading>
    <Text style={{ color: "#475569", fontSize: "16px", lineHeight: "24px" }}>
      Hello {patientName},
    </Text>
    <Text style={{ color: "#475569", fontSize: "16px", lineHeight: "24px" }}>
      Great news! A slot for <strong>{serviceName}</strong> has just become available at <strong>{clinicName}</strong> on your preferred day.
    </Text>
    
    <Section style={{ backgroundColor: "#F8FAFC", padding: "24px", borderRadius: "12px", margin: "32px 0" }}>
      <Text style={{ margin: "0 0 8px 0", color: "#64748B", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>Available Slot</Text>
      <Text style={{ margin: "0", color: "#1E293B", fontSize: "18px", fontWeight: "600" }}>{appointmentDate}</Text>
      <Text style={{ margin: "4px 0 16px 0", color: "#1E293B", fontSize: "18px", fontWeight: "600" }}>at {appointmentTime}</Text>
      
      <Text style={{ margin: "0 0 4px 0", color: "#64748B", fontSize: "12px" }}>Location</Text>
      <Text style={{ margin: "0", color: "#1E293B", fontSize: "14px" }}>{branchName}</Text>
      <Text style={{ margin: "0", color: "#475569", fontSize: "14px" }}>{branchAddress}</Text>
    </Section>

    <Text style={{ color: "#475569", fontSize: "16px", lineHeight: "24px" }}>
      If you would like to take this slot, please contact us immediately or visit our patient portal to confirm.
    </Text>
    
    <Section style={{ marginTop: "32px" }}>
      <Link
        href="#"
        style={{
          backgroundColor: primaryColor,
          color: "#fff",
          padding: "12px 24px",
          borderRadius: "8px",
          textDecoration: "none",
          fontWeight: "600",
          display: "inline-block",
        }}
      >
        View Appointment
      </Link>
    </Section>
  </BaseEmail>
);

export default WaitlistOfferEmail;
