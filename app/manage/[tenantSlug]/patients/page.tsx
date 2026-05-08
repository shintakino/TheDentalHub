import { PatientDirectory } from "@/components/dashboard/PatientDirectory";

export default async function PatientsPage() {
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-4xl font-playfair font-semibold text-obsidian">Patient Directory</h1>
        <p className="text-slate-500 font-outfit text-lg">
          Manage and view your clinic&apos;s patient base.
        </p>
      </div>

      <PatientDirectory />
    </div>
  );
}
