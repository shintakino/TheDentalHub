"use client";

import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AppointmentStateMachine } from "@/lib/appointments/state-machine";
import { AppointmentStatus } from "@/lib/db/schema";
import { AlertCircle, Send, MapPin, Calendar, Clock as ClockIcon, User, Info, Check, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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

export function DailySchedule({ initialAppointments }: { initialAppointments: Appointment[] }) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);

  const router = useRouter();
  
  useEffect(() => {
    setAppointments(initialAppointments);
  }, [initialAppointments]);

  // Poll for real-time updates every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 10000);
    return () => clearInterval(interval);
  }, [router]);

  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [activeApptId, setActiveApptId] = useState<string | null>(null);
  const [isCompletionDialogOpen, setIsCompletionDialogOpen] = useState(false);
  const [actualPrice, setActualPrice] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
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
      case "pending_approval": return "bg-primary/5 text-primary/80 border-primary/10 border-dashed";
      case "confirmed": return "bg-slate-100 text-slate-800 border-slate-200";
      case "checked_in": return "bg-amber-100 text-amber-800 border-amber-200";
      case "in_progress": return "bg-primary/10 text-primary border-primary/20";
      case "completed": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "cancelled":
      case "no_show": return "bg-rose-100 text-rose-800 border-rose-200";
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
            const isHighRisk = parseFloat(app.riskScore) >= 3;
            
            return (
              <Card 
                key={app.id} 
                className={`group p-8 border-none shadow-[0_4px_32px_rgba(0,0,0,0.06)] bg-white transition-all hover:shadow-[0_4px_48px_rgba(0,0,0,0.1)] cursor-pointer relative overflow-hidden ${isHighRisk ? 'ring-1 ring-rose-200' : ''}`}
                onClick={() => setSelectedAppointment(app)}
              >
                {app.status === "pending_approval" && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                )}
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-playfair text-2xl font-medium text-obsidian">{app.patientName}</h3>
                      <div className="flex gap-2">
                        <Badge className={`${getStatusColor(app.status)} font-outfit font-medium px-3 py-1 uppercase tracking-wider text-[10px] border`} variant="outline">
                          {app.status.replace("_", " ")}
                        </Badge>
                        <Badge variant="outline" className="font-outfit font-medium text-slate-500 border-slate-200 bg-slate-50 flex items-center gap-1 uppercase tracking-wider text-[10px]">
                          <MapPin className="h-3 w-3" />
                          {app.branchName}
                        </Badge>
                        {isHighRisk && (
                          <Badge className="bg-rose-500 text-white font-outfit font-medium border-none px-3 py-1 uppercase tracking-wider text-[10px] animate-pulse flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            High Risk
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-slate-500 font-outfit text-sm">
                      <div className="flex items-center gap-1.5">
                        <ClockIcon className="h-4 w-4" />
                        <span className="tabular-nums font-medium text-slate-700">
                          {new Date(app.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Info className="h-4 w-4" />
                        <span>{app.serviceName} ({app.duration}m)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 sm:justify-end" onClick={(e) => e.stopPropagation()}>
                    {app.status === "pending_approval" ? (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-outfit font-medium px-4"
                          disabled={loadingId === app.id}
                          onClick={() => setConfirmAction({ id: app.id, status: "confirmed", label: "Approve" })}
                        >
                          <Check className="h-4 w-4 mr-1.5" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-rose-600 border-rose-200 hover:bg-rose-50 font-outfit font-medium px-4"
                          disabled={loadingId === app.id}
                          onClick={() => setConfirmAction({ id: app.id, status: "cancelled", label: "Reject" })}
                        >
                          <X className="h-4 w-4 mr-1.5" />
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <>
                        {isHighRisk && app.status === "confirmed" && (
                          <Button 
                            size="sm" 
                            variant="secondary"
                            className="bg-amber-100 text-amber-700 hover:bg-amber-200 font-outfit font-medium px-4"
                            onClick={() => toast.success("Extra reminder SMS sent")}
                          >
                            <Send className="h-4 w-4 mr-1.5" />
                            Remind
                          </Button>
                        )}
                        {validNextStates.includes("checked_in") && (
                          <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-outfit font-medium px-6" disabled={loadingId === app.id} onClick={() => setConfirmAction({ id: app.id, status: "checked_in", label: "Check In" })}>
                            Check In
                          </Button>
                        )}
                        {validNextStates.includes("in_progress") && (
                          <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-outfit font-medium px-6" disabled={loadingId === app.id} onClick={() => setConfirmAction({ id: app.id, status: "in_progress", label: "Start Service" })}>
                            Start
                          </Button>
                        )}
                        {validNextStates.includes("completed") && (
                          <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 font-outfit font-medium px-6" disabled={loadingId === app.id} onClick={() => { setActiveApptId(app.id); setIsCompletionDialogOpen(true); }}>
                            Complete
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

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
                        {new Date(selectedAppointment.startTime).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </p>
                      <p className="text-slate-500 font-medium tabular-nums">
                        {new Date(selectedAppointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(selectedAppointment.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                        className="bg-primary hover:bg-primary/90 text-white w-full h-12" 
                        disabled={loadingId === selectedAppointment.id} 
                        onClick={() => setConfirmAction({ id: selectedAppointment.id, status: "checked_in", label: "Check In" })}
                      >
                        Check In
                      </Button>
                    )}

                    {AppointmentStateMachine.getValidNextStates(selectedAppointment.status).includes("in_progress") && (
                      <Button 
                        className="bg-primary hover:bg-primary/90 text-white w-full h-12" 
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
                className="min-h-[150px] border-slate-200 focus:ring-primary focus:border-primary font-outfit text-base"
              />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsNoteDialogOpen(false)} disabled={loadingId !== null}>Cancel</Button>
              <Button className="bg-primary hover:bg-primary/90 text-white" onClick={handleAddNote} disabled={loadingId !== null || !noteContent.trim()}>
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
                  confirmAction?.status === 'cancelled' ? "bg-rose-600 hover:bg-rose-700 text-white" : "bg-primary hover:bg-primary/90 text-white"
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
    </div>
  );
}
