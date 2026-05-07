"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  MapPin, 
  Clock, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Copy, 
  CheckCircle2, 
  XCircle,
  ExternalLink,
  Map as MapIcon
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { BranchForm } from "./settings/BranchForm";
import { BranchOverrides } from "./BranchOverrides";
import { formatInTimeZone } from "date-fns-tz";
import Link from "next/link";

interface OperatingHour {
  day: number;
  open: string;
  close: string;
  active: boolean;
}

interface Branch {
  id: string;
  name: string;
  address: string | null;
  timezone: string;
  operatingHours: OperatingHour[];
  maxCapacity: number;
  isActive: boolean;
  latitude: string | null;
  longitude: string | null;
}

export function BranchManager({ tenantId }: { tenantId: string }) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [managingOverrides, setManagingOverrides] = useState<Branch | null>(null);

  const fetchBranches = async () => {
    try {
      const response = await fetch(`/api/clinics/${tenantId}/branches`);
      if (!response.ok) throw new Error("Failed to fetch branches");
      const data = await response.json();
      setBranches(data);
    } catch (error) {
      console.error(error);
      toast.error("Could not load branches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [tenantId]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this branch? Active appointments may prevent deletion.")) return;

    try {
      const response = await fetch(`/api/clinics/${tenantId}/branches/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete branch");
      }
      toast.success("Branch deleted");
      fetchBranches();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const toggleBranchStatus = async (branch: Branch) => {
    try {
      const response = await fetch(`/api/branches/${branch.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !branch.isActive }),
      });

      if (!response.ok) throw new Error("Failed to update status");
      
      toast.success(`Branch ${!branch.isActive ? 'activated' : 'deactivated'}`);
      fetchBranches();
    } catch (error) {
      toast.error("Failed to update branch status");
    }
  };

  const copyHours = async (fromBranch: Branch) => {
    const otherBranches = branches.filter(b => b.id !== fromBranch.id);
    if (otherBranches.length === 0) {
      toast.info("No other branches to copy to");
      return;
    }

    if (!confirm(`Copy operating hours from "${fromBranch.name}" to all other branches?`)) return;

    try {
      const promises = otherBranches.map(branch => 
        fetch(`/api/branches/${branch.id}`, {
          method: "PATCH",
          body: JSON.stringify({ operatingHours: fromBranch.operatingHours }),
        })
      );

      await Promise.all(promises);
      toast.success("Operating hours synced across all branches");
      fetchBranches();
    } catch (error) {
      toast.error("Failed to sync operating hours");
    }
  };

  const isBranchOpen = (branch: Branch) => {
    try {
      const now = new Date();
      const localTime = formatInTimeZone(now, branch.timezone, "HH:mm");
      const dayOfWeek = now.getDay(); // 0 is Sunday
      
      const todayHours = branch.operatingHours.find(h => h.day === dayOfWeek);
      if (!todayHours || !todayHours.active) return false;
      
      return localTime >= todayHours.open && localTime <= todayHours.close;
    } catch (e) {
      return false;
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading Command Center...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-obsidian">Branch Command Center</h1>
          <p className="text-slate-500 font-outfit mt-1">Manage operations across all physical locations.</p>
        </div>
        <Button 
          onClick={() => { setEditingBranch(null); setIsDialogOpen(true); }} 
          className="bg-primary hover:bg-primary/90 rounded-xl gap-2 h-12 px-8 font-semibold shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
          Register New Branch
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-2xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-outfit text-slate-500 uppercase tracking-wider">Total Branches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-playfair font-bold text-obsidian">{branches.length}</div>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              {branches.filter(b => b.isActive).length} Active Locations
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-2xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-outfit text-slate-500 uppercase tracking-wider">Operational Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-playfair font-bold text-emerald-600">
              {branches.filter(b => b.isActive && isBranchOpen(b)).length}
            </div>
            <p className="text-xs text-slate-400 mt-2">Locations Open Now</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-2xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-outfit text-slate-500 uppercase tracking-wider">Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-playfair font-bold text-primary">
              {branches.filter(b => b.latitude && b.longitude).length}
            </div>
            <p className="text-xs text-slate-400 mt-2">Geocoded for Discovery</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-slate-50">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-50 hover:bg-transparent bg-slate-50/30">
              <TableHead className="font-outfit font-semibold text-slate-600 py-6 pl-8">Location</TableHead>
              <TableHead className="font-outfit font-semibold text-slate-600 py-6">Operational Status</TableHead>
              <TableHead className="font-outfit font-semibold text-slate-600 py-6">Capacity</TableHead>
              <TableHead className="font-outfit font-semibold text-slate-600 py-6">Availability</TableHead>
              <TableHead className="font-outfit font-semibold text-slate-600 py-6 text-right pr-8">Management</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {branches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-20 text-slate-400 font-outfit">
                  <div className="flex flex-col items-center gap-3">
                    <MapPin className="w-10 h-10 opacity-20" />
                    <p>No physical locations registered yet.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              branches.map((branch) => {
                const isOpen = isBranchOpen(branch);
                return (
                  <TableRow key={branch.id} className="border-slate-50 hover:bg-slate-50/50 transition-all group">
                    <TableCell className="py-6 pl-8">
                      <div className="flex flex-col gap-1">
                        <span className="font-playfair font-bold text-lg text-obsidian group-hover:text-primary transition-colors">
                          {branch.name}
                        </span>
                        <div className="flex items-center gap-2 text-sm text-slate-500 font-outfit">
                          <MapPin className="w-3.5 h-3.5" />
                          {branch.address || "No address assigned"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="secondary" 
                            className={isOpen 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100 font-outfit" 
                              : "bg-slate-100 text-slate-600 border-slate-200 font-outfit"
                            }
                          >
                            <span className={`w-2 h-2 rounded-full mr-1.5 ${isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                            {isOpen ? "Open Now" : "Closed"}
                          </Badge>
                          {!branch.isActive && (
                            <Badge className="bg-rose-50 text-rose-700 border-rose-100 font-outfit">Inactive</Badge>
                          )}
                        </div>
                        <span className="text-xs text-slate-400 font-outfit flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {branch.timezone}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-slate-200 text-slate-600 font-outfit">
                          {branch.maxCapacity} {branch.maxCapacity === 1 ? 'Chair' : 'Chairs'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="flex items-center gap-2">
                        {branch.latitude && branch.longitude ? (
                          <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 font-outfit">
                            <MapIcon className="w-3 h-3 mr-1.5" />
                            Mapped
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-amber-200 text-amber-600 bg-amber-50 font-outfit">
                            Missing Geodata
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-6 text-right pr-8">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => { setEditingBranch(branch); setIsDialogOpen(true); }}
                          className="rounded-lg hover:bg-primary/5 hover:text-primary"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger 
                            render={
                              <Button variant="ghost" size="sm" className="rounded-lg text-slate-400 hover:text-obsidian">
                                <MoreHorizontal className="w-5 h-5" />
                              </Button>
                            }
                          />

                          <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-slate-100 p-2">
                            <DropdownMenuItem onClick={() => toggleBranchStatus(branch)} className="gap-2 cursor-pointer py-2.5 rounded-lg">
                              {branch.isActive ? (
                                <><XCircle className="w-4 h-4 text-rose-500" /> Deactivate Branch</>
                              ) : (
                                <><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Activate Branch</>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => copyHours(branch)} className="gap-2 cursor-pointer py-2.5 rounded-lg">
                              <Copy className="w-4 h-4 text-primary" />
                              Sync Hours to Others
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setManagingOverrides(branch)} 
                              className="gap-2 cursor-pointer py-2.5 rounded-lg"
                            >
                              <Clock className="w-4 h-4 text-amber-500" />
                              Manage Disruptions
                            </DropdownMenuItem>
                            <Link href={`/manage/branches/${branch.id}`} className="block">
                              <DropdownMenuItem className="gap-2 cursor-pointer py-2.5 rounded-lg">
                                <ExternalLink className="w-4 h-4" />
                                View Full Schedule
                              </DropdownMenuItem>
                            </Link>
                            <div className="h-px bg-slate-100 my-1" />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(branch.id)} 
                              className="gap-2 text-rose-600 focus:text-rose-600 cursor-pointer py-2.5 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                              Remove Branch
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-8 pb-0">
            <DialogTitle className="text-3xl font-playfair font-bold text-obsidian">
              {editingBranch ? "Branch Configuration" : "New Location Entry"}
            </DialogTitle>
            <DialogDescription className="font-outfit text-slate-500">
              {editingBranch 
                ? `Updating settings for ${editingBranch.name}. Changes reflect immediately in marketplace discovery.` 
                : "Register a new physical location for your clinic network."}
            </DialogDescription>
          </DialogHeader>
          <div className="p-8 pt-6 max-h-[80vh] overflow-y-auto">
            <BranchForm 
              tenantId={tenantId} 
              initialData={editingBranch} 
              onSuccess={() => {
                setIsDialogOpen(false);
                fetchBranches();
              }} 
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!managingOverrides} onOpenChange={(open) => !open && setManagingOverrides(null)}>
        <DialogContent className="sm:max-w-[700px] rounded-3xl border-none shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl font-playfair font-bold text-obsidian">
              Operational Resiliency
            </DialogTitle>
            <DialogDescription className="font-outfit text-slate-500">
              Manage temporary closures and emergency blackouts for {managingOverrides?.name}.
            </DialogDescription>
          </DialogHeader>
          {managingOverrides && (
            <div className="mt-6">
              <BranchOverrides branchId={managingOverrides.id} branchName={managingOverrides.name} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
