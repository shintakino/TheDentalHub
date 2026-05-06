import { mockDb } from "@/lib/db/mock-db";
import { notFound } from "next/navigation";
import { ServiceStep } from "@/components/booking/ServiceStep";
import { BranchStep } from "@/components/booking/BranchStep";
import { SchedulingStep } from "@/components/booking/SchedulingStep";
import { ReviewStep } from "@/components/booking/ReviewStep";

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ 
    step?: string; 
    serviceId?: string; 
    branchId?: string; 
    date?: string; 
    time?: string;
  }>;
}) {
  const { tenantSlug } = await params;
  const { step = "service", serviceId, branchId, date, time } = await searchParams;

  const clinic = await mockDb.getClinicBySubdomain(tenantSlug);
  if (!clinic) notFound();

  const branches = await mockDb.getBranches(clinic.tenantId);
  const services = await mockDb.getServices(clinic.tenantId);

  // Dynamic Branch Selection Logic
  const hasSingleBranch = branches.length === 1;
  const effectiveBranchId = hasSingleBranch ? branches[0].id : branchId;

  const steps = [
    { id: "service", n: 1, name: "Service" },
    { id: "branch", n: 2, name: "Branch" },
    { id: "time", n: 3, name: "Time" },
    { id: "review", n: 4, name: "Review" },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === step);
  const currentStepNum = currentStepIndex !== -1 ? currentStepIndex + 1 : 1;

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Wizard Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-[#0A1120]">
          Schedule Your Visit
        </h1>
        <p className="text-lg text-muted-foreground max-w-lg mx-auto">
          Experience world-class dental care. Select your service and find a time that works for you.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
        {steps.map((s, i) => {
          if (s.id === "branch" && hasSingleBranch) return null;
          
          return (
            <div key={s.id} className="flex items-center gap-4 flex-1 last:flex-none">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-500
                ${step === s.id ? 'border-primary bg-primary text-white scale-110 shadow-lg' : 
                  currentStepNum > i + 1 ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 text-slate-400'}
              `}>
                {currentStepNum > i + 1 ? '✓' : s.n}
              </div>
              {i < steps.length - 1 && (
                <div className={`h-0.5 flex-1 rounded-full ${currentStepNum > i + 1 ? 'bg-primary' : 'bg-slate-200'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl shadow-slate-200/50 min-h-[500px] flex flex-col">
        {step === "service" && (
          <ServiceStep tenantSlug={tenantSlug} services={services} skipBranch={hasSingleBranch} />
        )}
        {step === "branch" && !hasSingleBranch && (
          <BranchStep tenantSlug={tenantSlug} branches={branches} serviceId={serviceId!} />
        )}
        {step === "time" && effectiveBranchId && serviceId && (
          <SchedulingStep 
            tenantSlug={tenantSlug} 
            branchId={effectiveBranchId} 
            serviceId={serviceId} 
          />
        )}
        {step === "review" && effectiveBranchId && serviceId && date && time && (
          <ReviewStep 
            tenantSlug={tenantSlug}
            branchId={effectiveBranchId}
            serviceId={serviceId}
            date={date}
            time={time}
          />
        )}
      </div>
    </div>
  );
}
