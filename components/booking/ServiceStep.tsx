"use client";

import { ServiceConfig } from "@/lib/db/mock-db";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export function ServiceStep({ 
  tenantSlug, 
  services, 
  skipBranch 
}: { 
  tenantSlug: string; 
  services: ServiceConfig[]; 
  skipBranch: boolean;
}) {
  const nextStep = skipBranch ? "time" : "branch";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-2xl font-serif font-bold">Select a Service</h2>
        <p className="text-muted-foreground">What can we help you with today?</p>
      </div>
      <div className="grid gap-4">
        {services.map((service) => (
          <Link
            key={service.id}
            href={`/${tenantSlug}?step=${nextStep}&serviceId=${service.id}`}
            className="group p-6 rounded-2xl border bg-card hover:border-primary hover:shadow-lg transition-all flex items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{service.name}</h3>
            </div>
            <div className="text-right shrink-0">
              <Badge variant="secondary" className="bg-primary/5 text-primary border-none font-bold uppercase tracking-widest text-[10px]">
                {service.duration} min
              </Badge>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
