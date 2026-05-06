import { ClinicConfig, BranchConfig } from "@/lib/db/mock-db";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface ClinicCardProps {
  clinic: ClinicConfig & { branches: BranchConfig[] };
}

export default function ClinicCard({ clinic }: ClinicCardProps) {
  const mainBranch = clinic.branches[0];

  return (
    <div className="group p-6 rounded-2xl border bg-card shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="flex gap-4">
        <div 
          className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-serif text-2xl font-bold shrink-0"
          style={{ backgroundColor: clinic.primaryColor }}
        >
          {clinic.logoUrl ? (
            <img src={clinic.logoUrl} alt={clinic.name} className="w-full h-full object-cover rounded-xl" />
          ) : (
            clinic.name.charAt(0)
          )}
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-serif text-xl font-bold leading-tight group-hover:text-primary transition-colors">
                {clinic.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {mainBranch?.address}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1 text-amber-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                <span className="text-sm font-bold">4.9</span>
              </div>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">120+ reviews</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 pt-1">
            <Badge variant="secondary" className="bg-primary/5 text-primary border-none text-[10px] uppercase font-bold tracking-widest">
              Available Today
            </Badge>
            <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest opacity-60">
              General
            </Badge>
            <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest opacity-60">
              Cosmetic
            </Badge>
          </div>
          
          <div className="pt-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Next Available</p>
              <p className="text-sm font-semibold">Today, 2:30 PM</p>
            </div>
            <Link 
              href={`/${clinic.subdomain}/book`}
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
