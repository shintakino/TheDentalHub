import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { BaseEmail } from "./components/BaseEmail";

interface FeedbackRequestEmailProps {
  patientName: string;
  clinicName: string;
  appointmentId: string;
  baseUrl: string;
}

export const FeedbackRequestEmail = ({
  patientName,
  clinicName,
  appointmentId,
  baseUrl,
}: FeedbackRequestEmailProps) => {
  const previewText = `How was your visit to ${clinicName}?`;

  return (
    <BaseEmail previewText={previewText}>
      <Section className="my-8">
        <Heading className="text-2xl font-bold font-heading text-slate-900">
          How did we do?
        </Heading>
        <Text className="text-slate-600 mt-4">
          Hi {patientName},
        </Text>
        <Text className="text-slate-600 mt-2">
          Thank you for visiting <strong>{clinicName}</strong> yesterday. We hope you had a comfortable experience.
        </Text>
        <Text className="text-slate-600 mt-2">
          Your feedback helps us maintain our high standards of clinical care. Could you take a moment to rate your visit?
        </Text>
      </Section>

      <Section className="text-center my-8">
        <div className="flex justify-center gap-4">
          {[1, 2, 3, 4, 5].map((rating) => (
            <Link
              key={rating}
              href={`${baseUrl}/review/${appointmentId}?rating=${rating}`}
              className="inline-block w-12 h-12 leading-[48px] bg-slate-50 border border-slate-200 rounded-lg text-xl text-slate-900 hover:bg-indigo-50 hover:border-indigo-200 no-underline"
            >
              {rating === 5 ? "⭐⭐⭐⭐⭐" : rating}
            </Link>
          ))}
        </div>
        <Text className="text-[10px] text-slate-400 mt-4 uppercase tracking-widest">
          Click a number to rate
        </Text>
      </Section>

      <Section className="my-8">
        <Text className="text-slate-600">
          Prefer not to say? No problem. We're just glad to have you as a patient.
        </Text>
      </Section>
    </BaseEmail>
  );
};

export default FeedbackRequestEmail;
