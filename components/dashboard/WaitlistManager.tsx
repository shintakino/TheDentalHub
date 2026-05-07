"use client";

import { useState, useEffect } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Bell, CalendarCheck, X, UserPlus } from "lucide-react";
import { useParams } from "next/navigation";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";

interface WaitlistEntry {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string | null;
  status: "waiting" | "notified" | "booked" | "cancelled" | "expired";
  createdAt: string;
  service: {
    id: string;
    name: string;
  };
  branch: {
    id: string;
    name: string;
  };
}

interface Service {
  id: string;
  name: string;
}

interface Branch {
  id: string;
  name: string;
}

export function WaitlistManager() {
  const params = useParams();
  const tenantId = params.tenantSlug as string; // Usually the org ID in this project's API pattern
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<WaitlistEntry | null>(null);
  
  const [services, setServices] = useState<Service[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  // Form states
  const [formData, setFormData] = useState({
    patientName: "",
    patientPhone: "",
    patientEmail: "",
    serviceId: "",
    branchId: "",
  });

  const [bookData, setBookData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: "09:00",
  });

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/clinics/${tenantId}/waitlist`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch (error) {
      toast.error("Failed to load waitlist");
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [sRes, bRes] = await Promise.all([
        fetch(`/api/clinics/${tenantId}/services`),
        fetch(`/api/clinics/${tenantId}/branches`)
      ]);
      if (sRes.ok) setServices(await sRes.json());
      if (bRes.ok) setBranches(await bRes.json());
    } catch (error) {
      console.error("Failed to load metadata");
    }
  };

  useEffect(() => {
    if (tenantId) {
      fetchEntries();
      fetchMetadata();
    }
  }, [tenantId]);

  const handleAddEntry = async () => {
    try {
      const res = await fetch(`/api/clinics/${tenantId}/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Added to waitlist");
        setIsAddOpen(false);
        setFormData({ patientName: "", patientPhone: "", patientEmail: "", serviceId: "", branchId: "" });
        fetchEntries();
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to add entry");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleStatusChange = async (entryId: string, status: string) => {
    try {
      const res = await fetch(`/api/clinics/${tenantId}/waitlist/${entryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        toast.success(`Status updated to ${status}`);
        fetchEntries();
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleConvert = async () => {
    if (!selectedEntry) return;

    try {
      // In a real app, this would be a single atomic transaction API call
      // For this MVP, we book then update waitlist status
      const startTime = new Date(`${bookData.date}T${bookData.startTime}:00Z`);
      const endTime = new Date(startTime.getTime() + 30 * 60000); // Default 30 min if not specified

      const res = await fetch(`/api/appointments/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId: selectedEntry.branch.id,
          serviceId: selectedEntry.service.id,
          patientName: selectedEntry.patientName,
          patientEmail: selectedEntry.patientEmail || "patient@example.com", // Fallback for schema requirement
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          isWalkIn: true, // Mark as walk-in/waitlist conversion
        }),
      });

      if (res.ok) {
        await handleStatusChange(selectedEntry.id, "booked");
        setIsBookOpen(false);
        toast.success("Appointment created successfully");
        fetchEntries();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to book appointment");
      }
    } catch (error) {
      toast.error("An error occurred during conversion");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "waiting": return <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none">Waiting</Badge>;
      case "notified": return <Badge variant="secondary" className="bg-sapphire/10 text-sapphire border-none">Notified</Badge>;
      case "booked": return <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-none">Booked</Badge>;
      case "cancelled": return <Badge variant="secondary" className="bg-rose-100 text-rose-600 border-none">Cancelled</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <>
      <Sheet>
        <SheetTrigger render={
          <Button variant="outline" className="gap-2 font-outfit border-slate-200 text-slate-600 hover:bg-slate-50">
            <UserPlus className="w-4 h-4" />
            Waitlist & Walk-ins
          </Button>
        } />
        <SheetContent className="w-full sm:max-w-xl font-outfit">
          <SheetHeader className="mb-6">
            <div className="flex justify-between items-center">
              <SheetTitle className="font-playfair text-3xl font-bold text-obsidian">Waitlist Management</SheetTitle>
              <Button size="sm" onClick={() => setIsAddOpen(true)} className="bg-sapphire hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-1" /> Add Patient
              </Button>
            </div>
            <SheetDescription className="text-slate-500 font-outfit">
              Manage the queue of patients waiting for the next available slot.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-8">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">Patient</TableHead>
                  <TableHead className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">Service</TableHead>
                  <TableHead className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">Status</TableHead>
                  <TableHead className="text-right text-slate-400 font-medium uppercase tracking-wider text-[10px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-slate-400">
                      No patients currently on the waitlist.
                    </TableCell>
                  </TableRow>
                ) : (
                  entries.map((entry) => (
                    <TableRow key={entry.id} className="group hover:bg-alabaster/50 border-slate-50 transition-colors">
                      <TableCell>
                        <div className="font-medium text-obsidian">{entry.patientName}</div>
                        <div className="text-xs text-slate-400">{entry.patientPhone}</div>
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm">
                        {entry.service?.name}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(entry.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {entry.status === "waiting" && (
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="w-8 h-8 text-sapphire hover:bg-sapphire/10"
                              onClick={() => handleStatusChange(entry.id, "notified")}
                              title="Notify Patient"
                            >
                              <Bell className="w-4 h-4" />
                            </Button>
                          )}
                          {(entry.status === "waiting" || entry.status === "notified") && (
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="w-8 h-8 text-emerald-600 hover:bg-emerald-50"
                              onClick={() => {
                                setSelectedEntry(entry);
                                setIsBookOpen(true);
                              }}
                              title="Book Appointment"
                            >
                              <CalendarCheck className="w-4 h-4" />
                            </Button>
                          )}
                          {(entry.status === "waiting" || entry.status === "notified") && (
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="w-8 h-8 text-rose-500 hover:bg-rose-50"
                              onClick={() => handleStatusChange(entry.id, "cancelled")}
                              title="Remove"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </SheetContent>
      </Sheet>

      {/* Add Entry Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px] font-outfit border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-playfair text-2xl font-bold">Add to Waitlist</DialogTitle>
            <DialogDescription>Enter patient details for the waitlist or walk-in queue.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Patient Name</Label>
              <Input 
                id="name" 
                placeholder="John Doe" 
                value={formData.patientName}
                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                className="border-slate-200 focus:ring-sapphire"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                placeholder="+1 234 567 890" 
                value={formData.patientPhone}
                onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                className="border-slate-200 focus:ring-sapphire"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email"
                placeholder="john@example.com" 
                value={formData.patientEmail}
                onChange={(e) => setFormData({ ...formData, patientEmail: e.target.value })}
                className="border-slate-200 focus:ring-sapphire"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="branch">Branch</Label>
              <Select onValueChange={(v) => setFormData({ ...formData, branchId: v as string })}>
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="service">Service</Label>
              <Select onValueChange={(v) => setFormData({ ...formData, serviceId: v as string })}>
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button className="bg-sapphire hover:bg-blue-700" onClick={handleAddEntry}>Add to Queue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Book Appointment Dialog */}
      <Dialog open={isBookOpen} onOpenChange={setIsBookOpen}>
        <DialogContent className="sm:max-w-[425px] font-outfit border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-playfair text-2xl font-bold">Promote to Appointment</DialogTitle>
            <DialogDescription>Confirm the slot for {selectedEntry?.patientName}.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input 
                id="date" 
                type="date" 
                value={bookData.date}
                onChange={(e) => setBookData({ ...bookData, date: e.target.value })}
                className="border-slate-200 focus:ring-sapphire"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time">Start Time</Label>
              <Input 
                id="time" 
                type="time" 
                value={bookData.startTime}
                onChange={(e) => setBookData({ ...bookData, startTime: e.target.value })}
                className="border-slate-200 focus:ring-sapphire"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsBookOpen(false)}>Cancel</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleConvert}>Confirm Appointment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
