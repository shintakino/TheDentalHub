"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AppointmentStateMachine } from "@/lib/appointments/state-machine";
import { AppointmentStatus } from "@/lib/db/schema";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Appointment {
  id: string;
  patientName: string;
  startTime: string;
  status: AppointmentStatus;
}

export function DailySchedule({ initialAppointments }: { initialAppointments: Appointment[] }) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [activeApptId, setActiveApptId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, newStatus: AppointmentStatus) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/appointments/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update status");
      }

      setAppointments((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
      );
      toast.success(`Status updated to ${newStatus.replace("_", " ")}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update status";
      toast.error(message);
    } finally {
      setLoadingId(null);
    }
  };

  const handleAddNote = async () => {
    if (!activeApptId || !noteContent.trim()) return;
    
    setLoadingId(activeApptId);
    try {
      const res = await fetch(`/api/appointments/${activeApptId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: noteContent }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add note");
      }

      toast.success("Clinical note added successfully");
      setNoteContent("");
      setIsNoteDialogOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add note";
      toast.error(message);
    } finally {
      setLoadingId(null);
    }
  };

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case "confirmed": return "bg-slate-100 text-slate-800";
      case "checked_in": return "bg-amber-100 text-amber-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-emerald-100 text-emerald-800"; // Emerald for success
      case "cancelled":
      case "no_show": return "bg-rose-100 text-rose-800";
      default: return "bg-slate-100";
    }
  };

  return (
    <div className="space-y-6">
      {appointments.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-alabaster">
          <p className="text-slate-500 font-outfit text-lg">No appointments scheduled for today.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {appointments.map((app) => {
            const validNextStates = AppointmentStateMachine.getValidNextStates(app.status);
            
            return (
              <Card key={app.id} className="p-8 border-none shadow-[0_4px_32px_rgba(0,0,0,0.06)] bg-white transition-all hover:shadow-[0_4px_48px_rgba(0,0,0,0.08)]">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-playfair text-2xl font-medium text-obsidian">{app.patientName}</h3>
                      <Badge className={`${getStatusColor(app.status)} font-outfit font-medium border-none px-3 py-1 uppercase tracking-wider text-[10px]`} variant="secondary">
                        {app.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-slate-500 font-outfit tabular-nums text-lg font-light tracking-tight">
                      {new Date(app.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 sm:justify-end">
                    {app.status === "in_progress" && (
                      <Button 
                        size="lg" 
                        variant="outline" 
                        className="text-slate-600 border-slate-200 hover:bg-slate-50 font-outfit font-medium px-8 transition-all active:scale-95"
                        onClick={() => {
                          setActiveApptId(app.id);
                          setIsNoteDialogOpen(true);
                        }}
                      >
                        Add Clinical Note
                      </Button>
                    )}
                    {validNextStates.includes("checked_in") && (
                      <Button size="lg" className="bg-sapphire hover:bg-blue-700 text-white font-outfit font-medium px-8 transition-all active:scale-95" disabled={loadingId === app.id} onClick={() => handleStatusChange(app.id, "checked_in")}>
                        Check In
                      </Button>
                    )}
                    {validNextStates.includes("in_progress") && (
                      <Button size="lg" className="bg-sapphire hover:bg-blue-700 text-white font-outfit font-medium px-8 transition-all active:scale-95" disabled={loadingId === app.id} onClick={() => handleStatusChange(app.id, "in_progress")}>
                        Start Service
                      </Button>
                    )}
                    {validNextStates.includes("completed") && (
                      <Button size="lg" variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 font-outfit font-medium px-8 transition-all active:scale-95" disabled={loadingId === app.id} onClick={() => handleStatusChange(app.id, "completed")}>
                        Mark Completed
                      </Button>
                    )}
                    {validNextStates.includes("cancelled") && (
                      <Button size="lg" variant="ghost" className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-outfit font-medium px-6 transition-all active:scale-95" disabled={loadingId === app.id} onClick={() => handleStatusChange(app.id, "cancelled")}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent className="sm:max-w-[500px] border-none shadow-[0_4px_32px_rgba(0,0,0,0.15)] bg-white font-outfit">
          <DialogHeader>
            <DialogTitle className="font-playfair text-2xl font-semibold text-obsidian">Clinical Note</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter treatment details, observations, or next steps..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="min-h-[150px] border-slate-200 focus:ring-sapphire focus:border-sapphire font-outfit text-base"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsNoteDialogOpen(false)} disabled={loadingId !== null}>Cancel</Button>
            <Button className="bg-sapphire hover:bg-blue-700 text-white" onClick={handleAddNote} disabled={loadingId !== null || !noteContent.trim()}>
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
