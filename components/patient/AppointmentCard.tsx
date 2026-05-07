"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, MoreVertical, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { AppointmentStatus } from "@/lib/db/schema";

interface AppointmentCardProps {
  appointment: {
    id: string;
    startTime: string | Date;
    endTime: string | Date;
    status: AppointmentStatus;
    clinic: {
      name: string;
      logoUrl: string | null;
    } | null;
    branch: {
      name: string;
      address: string | null;
    } | null;
    service: {
      name: string;
    } | null;
  };
  isUpcoming?: boolean;
}

export function AppointmentCard({ appointment, isUpcoming }: AppointmentCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/patient/appointments/${appointment.id}/cancel`, {
        method: "PATCH",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to cancel appointment");
      }

      toast.success("Appointment cancelled successfully");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to cancel";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const statusColors: Record<AppointmentStatus, string> = {
    confirmed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    completed: "bg-blue-100 text-blue-800",
    no_show: "bg-gray-100 text-gray-800",
    checked_in: "bg-emerald-100 text-emerald-800",
    in_progress: "bg-indigo-100 text-indigo-800",
  };

  const canCancel = isUpcoming && appointment.status === "confirmed" && 
    new Date(appointment.startTime).getTime() - new Date().getTime() > 24 * 60 * 60 * 1000;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-slate-50 py-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg">{appointment.clinic?.name || "Dental Clinic"}</CardTitle>
            <Badge variant="outline" className={statusColors[appointment.status]}>
              {appointment.status.replace("_", " ").toUpperCase()}
            </Badge>
          </div>
          {appointment.clinic?.logoUrl && (
            <img src={appointment.clinic.logoUrl} alt="Logo" className="h-8 w-auto" />
          )}
        </div>
      </CardHeader>
      <CardContent className="py-4 space-y-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="mr-2 h-4 w-4" />
          {format(new Date(appointment.startTime), "EEEE, MMMM do, yyyy")}
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="mr-2 h-4 w-4" />
          {format(new Date(appointment.startTime), "h:mm a")} - {format(new Date(appointment.endTime), "h:mm a")}
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="mr-2 h-4 w-4" />
          {appointment.branch?.name}, {appointment.branch?.address}
        </div>
        <div className="pt-2 border-t text-sm font-medium">
          Service: {appointment.service?.name}
        </div>
      </CardContent>
      {canCancel && (
        <CardFooter className="bg-slate-50 py-3 flex justify-end">
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleCancel}
            disabled={isLoading}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Cancel Appointment
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
