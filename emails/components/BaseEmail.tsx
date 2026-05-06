import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface BaseEmailProps {
  previewText: string;
  clinicName: string;
  clinicLogoUrl?: string | null;
  primaryColor: string;
  children: React.ReactNode;
}

export const BaseEmail = ({
  previewText,
  clinicName,
  clinicLogoUrl,
  primaryColor,
  children,
}: BaseEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            {clinicLogoUrl ? (
              <Img
                src={clinicLogoUrl}
                width="150"
                height="auto"
                alt={clinicName}
                style={logo}
              />
            ) : (
              <Heading style={{ ...title, color: primaryColor }}>{clinicName}</Heading>
            )}
          </Section>
          <Section style={content}>
            {children}
          </Section>
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              &copy; {new Date().getFullYear()} {clinicName}. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const header = {
  padding: "32px",
  textAlign: "center" as const,
};

const logo = {
  margin: "0 auto",
};

const title = {
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0",
};

const content = {
  padding: "0 32px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const footer = {
  padding: "0 32px",
};

const footerText = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  textAlign: "center" as const,
};
