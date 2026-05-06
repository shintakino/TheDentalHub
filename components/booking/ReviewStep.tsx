"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function ReviewStep({ 
  tenantSlug, 
  branchId, 
  serviceId, 
  date, 
  time 
}: { 
  tenantSlug: string; 
  branchId: string; 
  serviceId: string;
  date: string;
  time: string;
}) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isBooking, setIsBooking] = useState(false);

  const confirmBooking = async () => {
    if (!user) return;
    setIsBooking(true);

    try {
      // startTime in UTC: combine date and time then adjust if needed, 
      // but for mock purposes we'll just send it as ISO combined.
      const startTime = new Date(`${date}T${time}:00`).toISOString();
      const endTime = new Date(new Date(startTime).getTime() + 30 * 60000).toISOString(); // placeholder duration

      const res = await fetch("/api/appointments/book", {
        method: "POST",
        body: JSON.stringify({
          branchId,
          serviceId,
          startTime,
          endTime,
          patientName: user.fullName || "Patient",
          patientEmail: user.primaryEmailAddress?.emailAddress || "",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to book");

      toast.success("Appointment confirmed!");
      router.push(`/${tenantSlug}/success/${data.appointment.id}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsBooking(false);
    }
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1 flex flex-col">
      <div className="space-y-2">
        <h2 className="text-2xl font-serif font-bold">Review Your Booking</h2>
        <p className="text-muted-foreground">Please confirm your appointment details.</p>
      </div>
      
      <div className="grid gap-6 p-8 rounded-3xl bg-slate-50 border border-slate-100 flex-1">
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Date</p>
            <p className="text-lg font-bold">{date}</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Time</p>
            <p className="text-lg font-bold">{time}</p>
          </div>
        </div>
      </div>

      <div className="pt-8">
        {user ? (
          <button 
            onClick={confirmBooking}
            disabled={isBooking}
            className="w-full py-4 rounded-2xl bg-primary text-white text-lg font-bold shadow-xl shadow-primary/20 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isBooking ? "Confirming..." : "Confirm Appointment"}
          </button>
        ) : (
          <Link
            href={`/${tenantSlug}/sign-in?redirect_url=/${tenantSlug}?step=review&serviceId=${serviceId}&branchId=${branchId}&date=${date}&time=${time}`}
            className="block w-full text-center py-4 rounded-2xl bg-primary text-white text-lg font-bold shadow-xl shadow-primary/20 hover:opacity-90 transition-all active:scale-[0.98]"
          >
            Sign in to Complete Booking
          </Link>
        )}
      </div>
      
      <Link href={`/${tenantSlug}?step=time&serviceId=${serviceId}&branchId=${branchId}`} className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest gap-2">
        ← Back to times
      </Link>
    </div>
  );
}
