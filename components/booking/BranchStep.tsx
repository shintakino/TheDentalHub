"use client";

import { BranchConfig } from "@/lib/db/mock-db";
import Link from "next/link";

export function BranchStep({ 
  tenantSlug, 
  branches, 
  serviceId 
}: { 
  tenantSlug: string; 
  branches: BranchConfig[]; 
  serviceId: string;
}) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-2xl font-serif font-bold">Choose a Location</h2>
        <p className="text-muted-foreground">Select the branch most convenient for you.</p>
      </div>
      <div className="grid gap-4">
        {branches.map((branch) => (
          <Link
            key={branch.id}
            href={`/${tenantSlug}/book?step=time&serviceId=${serviceId}&branchId=${branch.id}`}
            className="group p-6 rounded-2xl border bg-card hover:border-primary hover:shadow-lg transition-all flex items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{branch.name}</h3>
              <p className="text-sm text-muted-foreground">{branch.address}</p>
            </div>
          </Link>
        ))}
      </div>
      <Link href={`/${tenantSlug}/book?step=service`} className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest gap-2">
        ← Back to services
      </Link>
    </div>
  );
}
