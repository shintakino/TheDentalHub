"use client";

import { Calendar } from "@/components/ui/calendar";
import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";

export function SchedulingStep({ 
  tenantSlug, 
  branchId, 
  serviceId 
}: { 
  tenantSlug: string; 
  branchId: string; 
  serviceId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [slots, setSlots] = useState<{ startTime: string; endTime: string }[]>([]);
  const [suggestions, setSuggestions] = useState<{ branchId: string; branchName: string; distance: string; nextSlot: string }[]>([]);

  useEffect(() => {
    if (date) {
      const dateStr = format(date, "yyyy-MM-dd");
      fetch(`/api/branches/${branchId}/slots?date=${dateStr}&serviceId=${serviceId}`)
        .then(res => res.json())
        .then(data => {
          setSlots(data.slots || []);
          setSuggestions(data.suggestions || []);
        });
    }
  }, [date, branchId, serviceId]);

  const selectTime = (time: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("step", "review");
    params.set("date", format(date!, "yyyy-MM-dd"));
    params.set("time", time);
    router.push(`/${tenantSlug}/book?${params.toString()}`);
  };

  const switchToBranch = (newBranchId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("branchId", newBranchId);
    router.push(`/${tenantSlug}/book?${params.toString()}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-2xl font-serif font-bold">Find a Time</h2>
        <p className="text-muted-foreground">Select a date and available time slot.</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-4">
          <Calendar 
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-2xl border shadow-sm p-4 bg-white"
            disabled={{ before: new Date() }}
          />
        </div>
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Available Slots</h3>
            <div className="grid grid-cols-2 gap-3">
              {slots.map((slot) => {
                const timeStr = format(new Date(slot.startTime), "HH:mm");
                return (
                  <button
                    key={slot.startTime}
                    onClick={() => selectTime(timeStr)}
                    className="p-3 rounded-xl border text-center font-bold text-sm hover:bg-primary hover:text-white hover:border-primary transition-all"
                  >
                    {timeStr}
                  </button>
                );
              })}
              {slots.length === 0 && (
                <div className="col-span-2 space-y-6">
                  <p className="text-sm text-muted-foreground">No available slots for this date.</p>
                  
                  {suggestions.length > 0 && (
                    <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-4 animate-in fade-in zoom-in duration-500">
                      <p className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                        <span className="text-lg">✨</span>
                        Alternative availability nearby
                      </p>
                      <div className="space-y-4">
                        {suggestions.map((s) => (
                          <div key={s.branchId} className="space-y-2">
                            <p className="text-xs text-blue-700 leading-relaxed">
                              <b>{s.branchName}</b> ({s.distance} miles away) has a {format(new Date(s.nextSlot), "p")} available.
                            </p>
                            <button
                              onClick={() => switchToBranch(s.branchId)}
                              className="w-full py-2.5 bg-white border border-blue-200 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                            >
                              Switch to {s.branchName}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Link href={`/${tenantSlug}/book?step=branch&serviceId=${serviceId}`} className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest gap-2">
        ← Back
      </Link>
    </div>
  );
}
