import { MarketplaceResult } from "@/lib/marketplace/types";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";

interface ClinicCardProps {
  branch: MarketplaceResult;
}

export default function ClinicCard({ branch }: ClinicCardProps) {
  const nextAvailable = branch.nextSlots[0];
  const distance = Math.round(branch.distance * 10) / 10;

  return (
    <div className="group p-6 rounded-2xl border bg-card shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="flex gap-4">
        <div 
          className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-serif text-2xl font-bold shrink-0"
          style={{ backgroundColor: branch.primaryColor }}
        >
          {branch.clinicLogoUrl ? (
            <img src={branch.clinicLogoUrl} alt={branch.clinicName} className="w-full h-full object-cover rounded-xl" />
          ) : (
            branch.clinicName.charAt(0)
          )}
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link href={`/${branch.subdomain}`}>
                <h3 className="font-serif text-xl font-bold leading-tight hover:text-primary transition-colors">
                  {branch.clinicName}
                </h3>
              </Link>
              <p className="text-xs font-medium text-primary mb-1">{branch.branchName}</p>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {branch.address}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1 text-amber-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                <span className="text-sm font-bold">{branch.rating || "4.5"}</span>
              </div>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">{distance} km away</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 pt-1">
            <Badge variant="secondary" className="bg-primary/5 text-primary border-none text-[10px] uppercase font-bold tracking-widest">
              {nextAvailable ? "Available Soon" : "By Appointment"}
            </Badge>
          </div>
          
          <div className="pt-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Next Available</p>
              <p className="text-sm font-semibold">
                {nextAvailable ? format(parseISO(nextAvailable), "EEE, h:mm a") : "Check availability"}
              </p>
            </div>
            <Link 
              href={`/${branch.subdomain}/book?branchId=${branch.id}`}
              className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity"
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
