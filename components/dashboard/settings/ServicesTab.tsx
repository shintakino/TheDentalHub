"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Timer, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
import { toast } from "sonner";
import { ServiceForm } from "./ServiceForm";
import { Service } from "@/lib/db/schema";

export function ServicesTab({ tenantId }: { tenantId: string }) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const fetchServices = async () => {
    try {
      const response = await fetch(`/api/clinics/${tenantId}/services`);
      if (!response.ok) throw new Error("Failed to fetch services");
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error(error);
      toast.error("Could not load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [tenantId]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    try {
      const response = await fetch(`/api/clinics/${tenantId}/services/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete service");
      }
      toast.success("Service deleted");
      fetchServices();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete service";
      toast.error(message);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingService(null);
    setIsDialogOpen(true);
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading services...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-playfair font-semibold text-obsidian">Services</h2>
        <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90 rounded-xl gap-2 h-11 px-6">
          <Plus className="w-4 h-4" />
          Add Service
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border-none">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-100 hover:bg-transparent">
              <TableHead className="font-outfit font-medium text-slate-500 py-6 pl-8">Service Name</TableHead>
              <TableHead className="font-outfit font-medium text-slate-500 py-6">Duration</TableHead>
              <TableHead className="font-outfit font-medium text-slate-500 py-6">Base Price</TableHead>
              <TableHead className="font-outfit font-medium text-slate-500 py-6 text-right pr-8">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-slate-400 font-outfit">
                  No services configured yet.
                </TableCell>
              </TableRow>
            ) : (
              services.map((service) => (
                <TableRow key={service.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <TableCell className="py-6 pl-8 font-outfit font-medium text-obsidian">{service.name}</TableCell>
                  <TableCell className="py-6 font-outfit text-slate-600">
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4 text-slate-400" />
                      {service.duration} minutes
                    </div>
                  </TableCell>
                  <TableCell className="py-6 font-outfit text-slate-600 tabular-nums">
                    ${service.price}
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
                        <DropdownMenuItem onClick={() => handleEdit(service)} className="gap-2 cursor-pointer py-2.5">
                          <Pencil className="w-4 h-4" />
                          Edit Service
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(service.id)} className="gap-2 text-rose-600 focus:text-rose-600 cursor-pointer py-2.5">
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
        <DialogContent className="sm:max-w-[450px] rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-8 pb-0">
            <DialogTitle className="text-2xl font-playfair font-semibold text-obsidian">
              {editingService ? "Edit Service" : "Add New Service"}
            </DialogTitle>
          </DialogHeader>
          <div className="p-8 pt-6">
            <ServiceForm 
              tenantId={tenantId} 
              initialData={editingService || undefined} 
              onSuccess={() => {
                setIsDialogOpen(false);
                fetchServices();
              }} 
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
