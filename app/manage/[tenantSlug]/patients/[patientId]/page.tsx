import { PatientProfile } from "@/components/dashboard/PatientProfile";

export default async function PatientPage({
  params,
}: {
  params: Promise<{ tenantSlug: string; patientId: string }>;
}) {
  const { patientId } = await params;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <PatientProfile patientId={patientId} />
    </div>
  );
}
