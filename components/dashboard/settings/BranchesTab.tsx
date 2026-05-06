"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Clock, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
  DialogTrigger 
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { BranchForm } from "./BranchForm";

interface Branch {
  id: string;
  name: string;
  address: string | null;
  timezone: string;
  operatingHours: { day: number; open: string; close: string; active: boolean }[];
}

export function BranchesTab({ tenantId }: { tenantId: string }) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

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
    if (!confirm("Are you sure you want to delete this branch?")) return;

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

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingBranch(null);
    setIsDialogOpen(true);
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading branches...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-playfair font-semibold text-obsidian">Branches</h2>
        <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90 rounded-xl gap-2 h-11 px-6">
          <Plus className="w-4 h-4" />
          Add Branch
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border-none">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-100 hover:bg-transparent">
              <TableHead className="font-outfit font-medium text-slate-500 py-6 pl-8">Name</TableHead>
              <TableHead className="font-outfit font-medium text-slate-500 py-6">Address</TableHead>
              <TableHead className="font-outfit font-medium text-slate-500 py-6">Timezone</TableHead>
              <TableHead className="font-outfit font-medium text-slate-500 py-6 text-right pr-8">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {branches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-slate-400 font-outfit">
                  No branches configured yet.
                </TableCell>
              </TableRow>
            ) : (
              branches.map((branch) => (
                <TableRow key={branch.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <TableCell className="py-6 pl-8 font-outfit font-medium text-obsidian">{branch.name}</TableCell>
                  <TableCell className="py-6 font-outfit text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {branch.address || "No address provided"}
                    </div>
                  </TableCell>
                  <TableCell className="py-6 font-outfit text-slate-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {branch.timezone}
                    </div>
                  </TableCell>
                  <TableCell className="py-6 text-right pr-8">
                    <DropdownMenu>
                      <DropdownMenuTrigger 
                        render={
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-obsidian" />
                        }
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-lg border-slate-100">
                        <DropdownMenuItem onClick={() => handleEdit(branch)} className="gap-2 cursor-pointer py-2.5">
                          <Pencil className="w-4 h-4" />
                          Edit Branch
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(branch.id)} className="gap-2 text-rose-600 focus:text-rose-600 cursor-pointer py-2.5">
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-8 pb-0">
            <DialogTitle className="text-2xl font-playfair font-semibold text-obsidian">
              {editingBranch ? "Edit Branch" : "Add New Branch"}
            </DialogTitle>
          </DialogHeader>
          <div className="p-8 pt-6">
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
    </div>
  );
}
