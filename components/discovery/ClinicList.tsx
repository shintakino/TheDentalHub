import { ClinicConfig, BranchConfig } from "@/lib/db/mock-db";
import ClinicCard from "./ClinicCard";

interface ClinicListProps {
  clinics: (ClinicConfig & { branches: BranchConfig[] })[];
}

export default function ClinicList({ clinics }: ClinicListProps) {
  if (clinics.length === 0) {
    return (
      <div className="p-8 text-center space-y-2">
        <p className="text-lg font-medium">No clinics found</p>
        <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {clinics.length} clinics nearby
        </h2>
      </div>
      <div className="space-y-4">
        {clinics.map((clinic) => (
          <ClinicCard key={clinic.id} clinic={clinic} />
        ))}
      </div>
    </div>
  );
}
