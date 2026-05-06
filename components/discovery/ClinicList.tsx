import { MarketplaceResult } from "@/lib/marketplace/types";
import ClinicCard from "./ClinicCard";

interface ClinicListProps {
  branches: MarketplaceResult[];
}

export default function ClinicList({ branches }: ClinicListProps) {
  if (branches.length === 0) {
    return (
      <div className="p-8 text-center space-y-2">
        <p className="text-lg font-medium">No clinics found nearby</p>
        <p className="text-sm text-muted-foreground">Try adjusting your search area or filters.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {branches.length} clinics found
        </h2>
      </div>
      <div className="space-y-4">
        {branches.map((branch) => (
          <ClinicCard key={branch.id} branch={branch} />
        ))}
      </div>
    </div>
  );
}
