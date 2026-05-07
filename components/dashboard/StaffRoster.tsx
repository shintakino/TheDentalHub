"use client";

import { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  User, 
  MapPin, 
  Calendar, 
  Plus, 
  Trash2, 
  Clock,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Staff {
  id: string;
  name: string;
  role: string;
}

interface Branch {
  id: string;
  name: string;
  maxCapacity: number;
}

interface Assignment {
  id: string;
  staffId: string;
  branchId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

const DAYS = [
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
  { label: "Sun", value: 0 },
];

export function StaffRoster({ tenantId }: { tenantId: string }) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state for new assignment
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");

  const fetchData = async () => {
    try {
      const [staffRes, branchesRes, assignmentsRes] = await Promise.all([
        fetch(`/api/clinics/${tenantId}/staff`),
        fetch(`/api/clinics/${tenantId}/branches`),
        fetch(`/api/clinics/${tenantId}/staff-assignments`),
      ]);

      if (!staffRes.ok || !branchesRes.ok || !assignmentsRes.ok) {
        throw new Error("Failed to fetch roster data");
      }

      const [staffData, branchesData, assignmentsData] = await Promise.all([
        staffRes.json(),
        branchesRes.json(),
        assignmentsRes.json(),
      ]);

      setStaff(staffData);
      setBranches(branchesData);
      setAssignments(assignmentsData);
    } catch (error) {
      console.error(error);
      toast.error("Could not load roster");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tenantId]);

  const handleAddAssignment = async () => {
    if (!selectedStaff || !selectedBranch || !startTime || !endTime) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const response = await fetch(`/api/clinics/${tenantId}/staff-assignments`, {
        method: "POST",
        body: JSON.stringify({
          staffId: selectedStaff,
          branchId: selectedBranch,
          dayOfWeek: selectedDay,
          startTime,
          endTime,
        }),
      });

      if (!response.ok) throw new Error("Failed to save assignment");

      toast.success("Staff assigned successfully");
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Could not save assignment");
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    try {
      const response = await fetch(`/api/clinics/${tenantId}/staff-assignments?assignmentId=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to remove assignment");

      toast.success("Assignment removed");
      fetchData();
    } catch (error) {
      toast.error("Could not remove assignment");
    }
  };

  const getAssignmentsFor = (staffId: string, dayValue: number) => {
    return assignments.filter(a => a.staffId === staffId && a.dayOfWeek === dayValue);
  };

  const getCapacityWarning = (branchId: string, dayValue: number) => {
    const branch = branches.find(b => b.id === branchId);
    if (!branch) return null;

    const staffAtBranchCount = assignments.filter(a => a.branchId === branchId && a.dayOfWeek === dayValue).length;
    
    if (staffAtBranchCount > branch.maxCapacity) {
      return `Over-capacity: ${staffAtBranchCount} staff assigned but only ${branch.maxCapacity} chairs available.`;
    }
    return null;
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading Roster...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-playfair font-bold text-obsidian">Staff Roster</h2>
          <p className="text-slate-500 font-outfit mt-1">Allocate human capital across your branches.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger 
            render={
              <Button className="bg-primary hover:bg-primary/90 rounded-xl gap-2">
                <Plus className="w-4 h-4" />
                Add Assignment
              </Button>
            }
          />
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>New Staff Assignment</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="staff">Staff Member</Label>
                <Select value={selectedStaff} onValueChange={(v) => setSelectedStaff(v || "")}>
                  <SelectTrigger id="staff">
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name} ({s.role})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="day">Day of Week</Label>
                <Select value={selectedDay.toString()} onValueChange={(v) => setSelectedDay(parseInt(v || "1"))}>
                  <SelectTrigger id="day">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map(d => (
                      <SelectItem key={d.value} value={d.value.toString()}>{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="branch">Target Branch</Label>
                <Select value={selectedBranch} onValueChange={(v) => setSelectedBranch(v || "")}>
                  <SelectTrigger id="branch">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map(b => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start">Start Time</Label>
                  <Input 
                    id="start" 
                    type="time" 
                    value={startTime} 
                    onChange={(e) => setStartTime(e.target.value)} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end">End Time</Label>
                  <Input 
                    id="end" 
                    type="time" 
                    value={endTime} 
                    onChange={(e) => setEndTime(e.target.value)} 
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddAssignment}>Assign Staff</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-slate-50">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-50 hover:bg-transparent bg-slate-50/30">
                <TableHead className="font-outfit font-semibold text-slate-600 py-6 pl-8 min-w-[200px]">Staff Member</TableHead>
                {DAYS.map(day => (
                  <TableHead key={day.value} className="font-outfit font-semibold text-slate-600 py-6 min-w-[150px]">
                    {day.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((member) => (
                <TableRow key={member.id} className="border-slate-50 hover:bg-slate-50/50 transition-all">
                  <TableCell className="py-6 pl-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-playfair font-bold text-obsidian">{member.name}</span>
                        <span className="text-xs text-slate-400 font-outfit capitalize">{member.role}</span>
                      </div>
                    </div>
                  </TableCell>
                  {DAYS.map(day => {
                    const dayAssignments = getAssignmentsFor(member.id, day.value);
                    return (
                      <TableCell key={day.value} className="py-6">
                        <div className="space-y-2">
                          {dayAssignments.length === 0 ? (
                            <span className="text-xs text-slate-300 font-outfit italic">Unassigned</span>
                          ) : (
                            dayAssignments.map(as => {
                              const branch = branches.find(b => b.id === as.branchId);
                              const warning = getCapacityWarning(as.branchId, day.value);
                              return (
                                <div key={as.id} className="group relative">
                                  <Badge 
                                    variant="secondary" 
                                    className={`w-full py-1.5 px-3 flex flex-col items-start gap-1 rounded-lg border border-slate-100 ${warning ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-white text-slate-600'}`}
                                  >
                                    <div className="flex items-center justify-between w-full">
                                      <span className="font-semibold text-[10px] truncate">{branch?.name || "Unknown"}</span>
                                      <button 
                                        onClick={() => handleDeleteAssignment(as.id)}
                                        className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-700 transition-opacity"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                    <div className="flex items-center gap-1 text-[9px] text-slate-400">
                                      <Clock className="w-2.5 h-2.5" />
                                      {as.startTime} - {as.endTime}
                                    </div>
                                    {warning && (
                                      <div className="flex items-center gap-1 text-[8px] text-amber-600 font-bold mt-1">
                                        <AlertTriangle className="w-2.5 h-2.5" />
                                        Capacity Warning
                                      </div>
                                    )}
                                  </Badge>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {branches.map(branch => {
          const totalStaffAssigned = assignments.filter(a => a.branchId === branch.id).length;
          const isOverCapacityAnyDay = DAYS.some(d => {
            const count = assignments.filter(a => a.branchId === branch.id && a.dayOfWeek === d.value).length;
            return count > branch.maxCapacity;
          });

          return (
            <Card key={branch.id} className={`border-none shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-2xl overflow-hidden ${isOverCapacityAnyDay ? 'ring-1 ring-amber-500' : ''}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-outfit text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  {branch.name}
                  {isOverCapacityAnyDay && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-playfair font-bold text-obsidian">{branch.maxCapacity}</div>
                    <p className="text-xs text-slate-400">Total Chairs</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-primary">{Math.round((totalStaffAssigned / (branch.maxCapacity * 7)) * 100)}%</div>
                    <p className="text-[10px] text-slate-400">Avg Utilization</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
