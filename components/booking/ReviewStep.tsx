"use client";

import { useUser, useOrganization } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function ReviewStep({ 
  tenantSlug, 
  branchId, 
  branchName,
  branchAddress,
  serviceId, 
  serviceName,
  serviceDuration,
  date, 
  time 
}: { 
  tenantSlug: string; 
  branchId: string; 
  branchName: string;
  branchAddress: string;
  serviceId: string;
  serviceName: string;
  serviceDuration: number;
  date: string;
  time: string;
}) {
  const { user, isLoaded: userLoaded } = useUser();
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const router = useRouter();
  const [isBooking, setIsBooking] = useState(false);

  const isManagement = organization?.id === tenantSlug;

  const confirmBooking = async () => {
    if (!user) return;
    if (isManagement) {
      toast.error("Management accounts cannot book appointments at their own clinic.");
      return;
    }
    setIsBooking(true);

    try {
      const startTime = new Date(`${date}T${time}:00`).toISOString();
      const endTime = new Date(new Date(startTime).getTime() + serviceDuration * 60000).toISOString();

      const res = await fetch("/api/appointments/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to book";
      toast.error(message);
    } finally {
      setIsBooking(false);
    }
  };

  if (!userLoaded || !orgLoaded) return <div className="flex items-center justify-center py-20">Loading...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1 flex flex-col">
      {isManagement && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-amber-800 text-sm font-outfit">
          <strong>Preview Mode:</strong> You are viewing your own clinic. Booking is disabled for management accounts.
        </div>
      )}
      <div className="space-y-2">
        <h2 className="text-2xl font-serif font-bold">Review Your Booking</h2>
        <p className="text-muted-foreground">Please confirm your appointment details.</p>
      </div>
      
      <div className="grid gap-6 p-8 rounded-3xl bg-slate-50 border border-slate-100 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Service</p>
            <p className="text-lg font-bold">{serviceName}</p>
            <Badge variant="secondary" className="bg-primary/5 text-primary border-none font-bold uppercase tracking-widest text-[10px]">
              {serviceDuration} min
            </Badge>
          </div>
          <div className="space-y-1 md:text-right">
            <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Location</p>
            <p className="text-lg font-bold">{branchName}</p>
            <p className="text-sm text-muted-foreground">{branchAddress}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Date</p>
            <p className="text-lg font-bold">{date}</p>
          </div>
          <div className="space-y-1 md:text-right">
            <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Time</p>
            <p className="text-lg font-bold">{time}</p>
          </div>
        </div>
      </div>

      <div className="pt-8">
        {user ? (
          <button 
            onClick={confirmBooking}
            disabled={isBooking || isManagement}
            className="w-full py-4 rounded-2xl bg-primary text-white text-lg font-bold shadow-xl shadow-primary/20 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isBooking ? "Confirming..." : isManagement ? "Booking Unavailable" : "Confirm Appointment"}
          </button>
        ) : (
          <Link
            href={`/${tenantSlug}/sign-in?redirect_url=/${tenantSlug}/book?step=review&serviceId=${serviceId}&branchId=${branchId}&date=${date}&time=${time}`}
            className="block w-full text-center py-4 rounded-2xl bg-primary text-white text-lg font-bold shadow-xl shadow-primary/20 hover:opacity-90 transition-all active:scale-[0.98]"
          >
            Sign in to Complete Booking
          </Link>
        )}
        <p className="mt-4 text-center text-xs text-muted-foreground">
          By confirming, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
      
      <Link href={`/${tenantSlug}/book?step=time&serviceId=${serviceId}&branchId=${branchId}`} className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest gap-2">
        ← Back to times
      </Link>
    </div>
  );
}
