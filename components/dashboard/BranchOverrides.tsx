"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Calendar as CalendarIcon,
  Plus, 
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Override {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
  isClosed: boolean;
}

export function BranchOverrides({ branchId, branchName }: { branchId: string, branchName: string }) {
  const [overrides, setOverrides] = useState<Override[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form state
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [reason, setReason] = useState("");

  const fetchOverrides = async () => {
    try {
      const response = await fetch(`/api/branches/${branchId}/overrides`);
      if (!response.ok) throw new Error("Failed to fetch overrides");
      const data = await response.json();
      setOverrides(data);
    } catch (error) {
      console.error(error);
      toast.error("Could not load overrides");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverrides();
  }, [branchId]);

  const handleAddOverride = async () => {
    if (!startDate || !endDate || !reason) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const response = await fetch(`/api/branches/${branchId}/overrides`, {
        method: "POST",
        body: JSON.stringify({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          reason,
          isClosed: true
        }),
      });

      if (!response.ok) throw new Error("Failed to create override");
      
      toast.success("Branch blackout scheduled");
      setIsAdding(false);
      setStartDate(undefined);
      setEndDate(undefined);
      setReason("");
      fetchOverrides();
    } catch (error) {
      toast.error("Failed to schedule blackout");
    }
  };

  const handleDeleteOverride = async (id: string) => {
    try {
      const response = await fetch(`/api/branches/${branchId}/overrides/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete override");
      toast.success("Override removed");
      fetchOverrides();
    } catch (error) {
      toast.error("Failed to remove override");
    }
  };

  const handleEmergencyClose = async () => {
    if (!confirm("This will close the branch for the next 24 hours and cancel all appointments. Are you sure?")) return;

    const start = new Date();
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

    try {
      const response = await fetch(`/api/branches/${branchId}/overrides`, {
        method: "POST",
        body: JSON.stringify({
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          reason: "Emergency Closure",
          isClosed: true
        }),
      });

      if (!response.ok) throw new Error("Failed to emergency close");
      
      toast.success("EMERGENCY CLOSURE ACTIVATED");
      fetchOverrides();
    } catch (error) {
      toast.error("Failed to activate emergency closure");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold font-playfair">Scheduled Disruptions for {branchName}</h3>
        <div className="flex gap-2">
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleEmergencyClose}
            className="rounded-xl gap-2 font-semibold"
          >
            <AlertTriangle className="w-4 h-4" />
            Emergency Close
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsAdding(!isAdding)}
            className="rounded-xl gap-2 font-semibold"
          >
            {isAdding ? "Cancel" : <><Plus className="w-4 h-4" /> Schedule Blackout</>}
          </Button>
        </div>
      </div>

      {isAdding && (
        <Card className="bg-slate-50 border-dashed border-slate-200">
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal rounded-xl",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal rounded-xl",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Input 
                placeholder="e.g. Public Holiday, Maintenance" 
                value={reason} 
                onChange={(e) => setReason(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <Button onClick={handleAddOverride} className="w-full rounded-xl">Save Blackout Period</Button>
          </CardContent>
        </Card>
      )}

      <div className="border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Period</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : overrides.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-slate-400">No scheduled disruptions</TableCell></TableRow>
            ) : (
              overrides.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span className="text-sm">{format(new Date(o.startDate), "PP")}</span>
                      <span className="text-xs text-slate-500">to {format(new Date(o.endDate), "PP")}</span>
                    </div>
                  </TableCell>
                  <TableCell>{o.reason}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-rose-50 text-rose-700 border-rose-100 font-outfit uppercase text-[10px]">CLOSED</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteOverride(o.id)}
                      className="text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
