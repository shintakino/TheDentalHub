"use client";

import { useState, useEffect } from "react";
import { format, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Clock, Calendar, Info, MapPin, User, Check, X, Send } from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle 
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppointmentStatus } from "@/lib/db/schema";
import { AppointmentStateMachine } from "@/lib/appointments/state-machine";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string | null;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  riskScore: string;
  branchName: string;
  serviceName: string;
  duration: number;
}

interface WeeklyScheduleViewProps {
  days: Date[];
  initialAppointments: Appointment[];
}

export function WeeklyScheduleView({ days, initialAppointments }: WeeklyScheduleViewProps) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);

  useEffect(() => {
    setAppointments(initialAppointments);
  }, [initialAppointments]);

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [activeApptId, setActiveApptId] = useState<string | null>(null);
  const [isCompletionDialogOpen, setIsCompletionDialogOpen] = useState(false);
  const [actualPrice, setActualPrice] = useState("");
  const [confirmAction, setConfirmAction] = useState<{ id: string; status: AppointmentStatus; label: string } | null>(null);

  const handleStatusChange = async (id: string, newStatus: AppointmentStatus, price?: string) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/appointments/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: newStatus,
          actualPrice: price
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update status");
      }

      setAppointments((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
      );
      
      if (selectedAppointment?.id === id) {
        setSelectedAppointment(prev => prev ? { ...prev, status: newStatus } : null);
      }

      toast.success(`Status updated to ${newStatus.replace("_", " ")}`);
      setConfirmAction(null);
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
      case "pending_approval": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "confirmed": return "bg-slate-100 text-slate-800 border-slate-200";
      case "checked_in": return "bg-amber-100 text-amber-800 border-amber-200";
      case "in_progress": return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "cancelled":
      case "no_show": return "bg-rose-100 text-rose-800 border-rose-200";
      default: return "bg-slate-100";
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {days.map((day) => {
          const dayAppointments = appointments.filter((app) => isSameDay(new Date(app.startTime), day));
          const isToday = isSameDay(day, new Date());

          return (
            <div key={day.toString()} className="flex flex-col gap-4">
              <div className={cn(
                "flex flex-col items-center py-4 rounded-2xl transition-all",
                isToday ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white text-slate-400 border border-slate-100"
              )}>
                <span className="text-xs font-outfit uppercase tracking-wider font-bold mb-1">
                  {format(day, "EEE")}
                </span>
                <span className="text-2xl font-serif font-bold">
                  {format(day, "d")}
                </span>
              </div>

              <div className="space-y-3">
                {dayAppointments.length === 0 ? (
                  <div className="h-32 rounded-2xl border-2 border-dashed border-slate-100 flex items-center justify-center text-slate-300 text-xs font-outfit text-center p-4">
                    No appointments
                  </div>
                ) : (
                  dayAppointments.map((app) => (
                    <div 
                      key={app.id} 
                      onClick={() => setSelectedAppointment(app)}
                      className="bg-white p-4 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 hover:shadow-md transition-shadow group cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-3 h-3 text-primary" />
                        <span className="text-[11px] font-bold font-outfit text-primary uppercase">
                          {format(new Date(app.startTime), "h:mm a")}
                        </span>
                      </div>
                      <div className="font-outfit font-semibold text-obsidian text-sm truncate group-hover:text-primary transition-colors">
                        {app.patientName}
                      </div>
                      <div className="mt-2">
                        <span className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tight",
                          app.status === 'confirmed' && "bg-emerald-50 text-emerald-600",
                          app.status === 'checked_in' && "bg-blue-50 text-blue-600",
                          app.status === 'in_progress' && "bg-purple-50 text-purple-600",
                          app.status === 'completed' && "bg-slate-50 text-slate-600",
                          app.status === 'cancelled' && "bg-red-50 text-red-600",
                          app.status === 'no_show' && "bg-amber-50 text-amber-600",
                          app.status === 'pending_approval' && "bg-indigo-50 text-indigo-600",
                        )}>
                          {app.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Appointment Detail Sheet */}
      <Sheet open={!!selectedAppointment} onOpenChange={(open) => !open && setSelectedAppointment(null)}>
        <SheetContent className="sm:max-w-md w-full p-0 border-l-0 shadow-[-10px_0_40px_rgba(0,0,0,0.08)] bg-white font-outfit overflow-y-auto">
          {selectedAppointment && (
            <div className="flex flex-col h-full">
              <div className="p-8 space-y-6">
                <SheetHeader className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge className={`${getStatusColor(selectedAppointment.status)} font-outfit font-medium border px-3 py-1 uppercase tracking-wider text-[10px]`} variant="outline">
                      {selectedAppointment.status.replace("_", " ")}
                    </Badge>
                    {parseFloat(selectedAppointment.riskScore) >= 3 && (
                      <Badge className="bg-rose-500 text-white font-outfit font-medium border-none px-3 py-1 uppercase tracking-wider text-[10px]">
                        High Risk
                      </Badge>
                    )}
                  </div>
                  <SheetTitle className="font-playfair text-4xl text-obsidian font-bold text-left">
                    {selectedAppointment.patientName}
                  </SheetTitle>
                  <SheetDescription className="text-slate-500 text-lg font-light text-left">
                    Booking details and clinical management.
                  </SheetDescription>
                </SheetHeader>

                <div className="grid gap-6 py-8">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-slate-50 text-slate-400">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-outfit">Date & Time</p>
                      <p className="text-lg text-slate-700 font-medium font-outfit">
                        {format(new Date(selectedAppointment.startTime), 'EEEE, MMMM d')}
                      </p>
                      <p className="text-slate-500 font-medium tabular-nums">
                        {format(new Date(selectedAppointment.startTime), 'h:mm a')} - {format(new Date(selectedAppointment.endTime), 'h:mm a')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-slate-50 text-slate-400">
                      <Info className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-outfit">Service</p>
                      <p className="text-lg text-slate-700 font-medium font-outfit">{selectedAppointment.serviceName}</p>
                      <p className="text-slate-500 font-medium">{selectedAppointment.duration} minutes</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-slate-50 text-slate-400">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-outfit">Branch Location</p>
                      <p className="text-lg text-slate-700 font-medium font-outfit">{selectedAppointment.branchName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-slate-50 text-slate-400">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-outfit">Contact Information</p>
                      <p className="text-lg text-slate-700 font-medium font-outfit">{selectedAppointment.patientEmail || "No email provided"}</p>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-100 w-full" />

                <div className="space-y-4">
                  <h4 className="font-playfair text-xl font-semibold text-obsidian">Actions</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedAppointment.status === "pending_approval" && (
                      <>
                        <Button 
                          className="bg-indigo-600 hover:bg-indigo-700 text-white w-full h-12"
                          disabled={loadingId === selectedAppointment.id}
                          onClick={() => setConfirmAction({ id: selectedAppointment.id, status: "confirmed", label: "Approve" })}
                        >
                          Approve
                        </Button>
                        <Button 
                          variant="outline" 
                          className="text-rose-600 border-rose-200 hover:bg-rose-50 w-full h-12"
                          disabled={loadingId === selectedAppointment.id}
                          onClick={() => setConfirmAction({ id: selectedAppointment.id, status: "cancelled", label: "Reject" })}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    
                    {AppointmentStateMachine.getValidNextStates(selectedAppointment.status).includes("checked_in") && (
                      <Button 
                        className="bg-sapphire hover:bg-blue-700 text-white w-full h-12" 
                        disabled={loadingId === selectedAppointment.id} 
                        onClick={() => setConfirmAction({ id: selectedAppointment.id, status: "checked_in", label: "Check In" })}
                      >
                        Check In
                      </Button>
                    )}

                    {AppointmentStateMachine.getValidNextStates(selectedAppointment.status).includes("in_progress") && (
                      <Button 
                        className="bg-sapphire hover:bg-blue-700 text-white w-full h-12" 
                        disabled={loadingId === selectedAppointment.id} 
                        onClick={() => setConfirmAction({ id: selectedAppointment.id, status: "in_progress", label: "Start Service" })}
                      >
                        Start Service
                      </Button>
                    )}

                    {(selectedAppointment.status === "in_progress" || selectedAppointment.status === "completed") && (
                      <Button 
                        variant="outline" 
                        className="text-slate-600 border-slate-200 h-12"
                        onClick={() => {
                          setActiveApptId(selectedAppointment.id);
                          setIsNoteDialogOpen(true);
                        }}
                      >
                        Add Clinical Note
                      </Button>
                    )}

                    {AppointmentStateMachine.getValidNextStates(selectedAppointment.status).includes("completed") && (
                      <Button 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white w-full h-12" 
                        disabled={loadingId === selectedAppointment.id} 
                        onClick={() => {
                          setActiveApptId(selectedAppointment.id);
                          setIsCompletionDialogOpen(true);
                        }}
                      >
                        Mark Completed
                      </Button>
                    )}

                    {AppointmentStateMachine.getValidNextStates(selectedAppointment.status).includes("cancelled") && (
                      <Button 
                        variant="ghost" 
                        className="text-rose-600 hover:bg-rose-50 h-12" 
                        disabled={loadingId === selectedAppointment.id} 
                        onClick={() => setConfirmAction({ id: selectedAppointment.id, status: "cancelled", label: "Cancel Booking" })}
                      >
                        Cancel Booking
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent className="sm:max-w-[500px] border-none shadow-[0_4px_32px_rgba(0,0,0,0.15)] bg-white font-outfit">
          <div className="p-6">
            <h2 className="font-playfair text-2xl font-semibold text-obsidian mb-4">Clinical Note</h2>
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
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCompletionDialogOpen} onOpenChange={setIsCompletionDialogOpen}>
        <DialogContent className="sm:max-w-[425px] border-none shadow-[0_4px_32px_rgba(0,0,0,0.15)] bg-white font-outfit">
          <div className="p-6">
            <h2 className="font-playfair text-2xl font-semibold text-obsidian mb-4">Complete Appointment</h2>
            <div className="py-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-slate-600">Final Price ($)</Label>
                <Input
                  id="price"
                  type="text"
                  placeholder="0.00"
                  value={actualPrice}
                  onChange={(e) => setActualPrice(e.target.value)}
                  className="rounded-xl h-12 border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 font-outfit text-lg tabular-nums"
                />
                <p className="text-xs text-slate-400 italic">Leave blank to use the service's base price.</p>
              </div>
            </div>
            <DialogFooter className="gap-3">
              <Button variant="ghost" onClick={() => setIsCompletionDialogOpen(false)} disabled={loadingId !== null}>Cancel</Button>
              <Button 
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8" 
                onClick={async () => {
                  if (activeApptId) {
                    await handleStatusChange(activeApptId, "completed", actualPrice || undefined);
                    setIsCompletionDialogOpen(false);
                    setActualPrice("");
                  }
                }} 
                disabled={loadingId !== null}
              >
                {loadingId ? "Processing..." : "Complete & Bill"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <DialogContent className="sm:max-w-[400px] border-none shadow-[0_4px_32px_rgba(0,0,0,0.15)] bg-white font-outfit">
          <div className="p-6">
            <h2 className="font-playfair text-2xl font-semibold text-obsidian mb-2">Confirm Action</h2>
            <p className="text-slate-500 mb-6">
              Are you sure you want to <strong>{confirmAction?.label}</strong> this appointment?
            </p>
            <DialogFooter className="gap-3">
              <Button variant="ghost" onClick={() => setConfirmAction(null)} disabled={loadingId !== null}>Cancel</Button>
              <Button 
                className={cn(
                  "px-8",
                  confirmAction?.status === 'cancelled' ? "bg-rose-600 hover:bg-rose-700 text-white" : "bg-sapphire hover:bg-blue-700 text-white"
                )}
                onClick={() => confirmAction && handleStatusChange(confirmAction.id, confirmAction.status)}
                disabled={loadingId !== null}
              >
                {loadingId ? "Processing..." : "Confirm"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
