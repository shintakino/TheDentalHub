"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, Mail, Shield, MoreHorizontal, Pencil, Trash2, User } from "lucide-react";
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
  DialogTitle 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { InviteStaffDialog } from "./InviteStaffDialog";
import { cn } from "@/lib/utils";

interface StaffMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  targetDailyHours: number;
  joinedAt: string;
}

export function StaffTab({ tenantId }: { tenantId: string }) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const fetchStaff = async () => {
    try {
      const response = await fetch(`/api/clinics/${tenantId}/staff`);
      if (!response.ok) throw new Error("Failed to fetch staff");
      const data = await response.json();
      setStaff(data);
    } catch (error) {
      console.error(error);
      toast.error("Could not load staff members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [tenantId]);

  const handleRemove = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this staff member? They will lose access to the clinic.")) return;

    try {
      const response = await fetch(`/api/clinics/${tenantId}/staff/${userId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to remove staff member");
      toast.success("Staff member removed");
      fetchStaff();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading staff...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-playfair font-semibold text-obsidian">Team Members</h2>
        <Button onClick={() => setIsInviteOpen(true)} className="bg-primary hover:bg-primary/90 rounded-xl gap-2 h-11 px-6">
          <UserPlus className="w-4 h-4" />
          Invite Member
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border-none">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-100 hover:bg-transparent">
              <TableHead className="font-outfit font-medium text-slate-500 py-6 pl-8">Member</TableHead>
              <TableHead className="font-outfit font-medium text-slate-500 py-6">Role</TableHead>
              <TableHead className="font-outfit font-medium text-slate-500 py-6">Daily Hours</TableHead>
              <TableHead className="font-outfit font-medium text-slate-500 py-6 text-right pr-8">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((member) => (
              <TableRow key={member.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                <TableCell className="py-6 pl-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-outfit font-medium text-obsidian">{member.name}</span>
                      <span className="font-outfit text-xs text-slate-400 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {member.email}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-6">
                  <Badge variant="secondary" className={cn(
                    "rounded-lg px-2.5 py-0.5 font-outfit font-medium capitalize",
                    member.role === "org:admin" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"
                  )}>
                    {member.role === "org:admin" ? "Admin" : "Member"}
                  </Badge>
                </TableCell>
                <TableCell className="py-6 font-outfit text-slate-600 tabular-nums">
                  {member.targetDailyHours}h
                </TableCell>
                <TableCell className="py-6 text-right pr-8">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-obsidian">
                        <MoreHorizontal className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-lg border-slate-100">
                      <DropdownMenuItem onClick={() => handleRemove(member.userId)} className="gap-2 text-rose-600 focus:text-rose-600 cursor-pointer py-2.5">
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-8 pb-0">
            <DialogTitle className="text-2xl font-playfair font-semibold text-obsidian">
              Invite Team Member
            </DialogTitle>
          </DialogHeader>
          <div className="p-8 pt-6">
            <InviteStaffDialog 
              tenantId={tenantId} 
              onSuccess={() => {
                setIsInviteOpen(false);
                fetchStaff();
              }} 
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
