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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  CalendarDays, 
  Mail, 
  Phone, 
  MoreHorizontal, 
  FileText, 
  Search, 
  UserPlus,
  Filter,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";
import { useParams, useRouter, usePathname, useSearchParams } from "next/navigation";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSkeleton } from "@/components/ui/table-skeleton";

interface Patient {
  id: string;
  name: string;
  email: string | null;
  lastVisit: string | null;
  totalAppointments: number;
  loyaltyPoints: number;
}

export function PatientDirectory({ branchId }: { branchId?: string }) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tenantSlug = params.tenantSlug as string;
  
  // URL parameters
  const page = Number(searchParams.get("page")) || 1;
  const activeBranchId = branchId || searchParams.get("branchId") || "all";
  const pageSize = 10;

  const [patients, setPatients] = useState<Patient[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: "", email: "", phone: "" });

  const fetchPatients = async (searchTerm: string = "", pageNum: number = 1, selectedBranch: string = "all") => {
    setLoading(true);
    try {
      const offset = (pageNum - 1) * pageSize;
      let url = `/api/clinics/${tenantSlug}/patients?search=${searchTerm}&limit=${pageSize}&offset=${offset}`;
      if (selectedBranch !== "all") {
        url += `&branchId=${selectedBranch}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch patients");
      const result = await response.json();
      setPatients(result.data || []);
      setTotalCount(result.totalCount || 0);
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error("Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPatients(search, page, activeBranchId);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, page, activeBranchId]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete("page"); // Reset page when query changes
    router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/clinics/${tenantSlug}/patients/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPatient),
      });

      if (!response.ok) throw new Error("Failed to create patient");

      toast.success("Patient created successfully");
      setIsCreateDialogOpen(false);
      setNewPatient({ name: "", email: "", phone: "" });
      fetchPatients(search, page, activeBranchId);
    } catch (error) {
      console.error("Error creating patient:", error);
      toast.error("Failed to create patient");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search patients by name or email..."
            className="pl-11 h-12 rounded-xl border-transparent bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] focus:ring-2 focus:ring-primary/20 transition-all font-outfit"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-12 px-6 rounded-xl border-transparent bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] font-outfit text-slate-600">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger
              render={
                <Button className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 font-outfit">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Patient
                </Button>
              }
            />
            <DialogContent className="sm:max-w-[425px] rounded-2xl border-transparent shadow-2xl">
              <form onSubmit={handleCreatePatient}>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-playfair font-semibold text-obsidian">Add New Patient</DialogTitle>
                  <DialogDescription className="font-outfit text-slate-500">
                    Create a manual patient record for walk-ins or guest bookings.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-outfit text-sm font-medium text-slate-700">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g. John Doe"
                      className="h-11 rounded-lg font-outfit"
                      required
                      value={newPatient.name}
                      onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-outfit text-sm font-medium text-slate-700">Email Address (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      className="h-11 rounded-lg font-outfit"
                      value={newPatient.email}
                      onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-outfit text-sm font-medium text-slate-700">Phone Number (Optional)</Label>
                    <Input
                      id="phone"
                      placeholder="+1 (555) 000-0000"
                      className="h-11 rounded-lg font-outfit"
                      value={newPatient.phone}
                      onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    className="w-full h-11 bg-primary hover:bg-primary/90 rounded-lg font-outfit shadow-md shadow-primary/10"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Create Patient
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <TableSkeleton columnsCount={5} rowsCount={5} />
      ) : patients.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No patients found"
          description={search ? "Try adjusting your search query or branch filter." : "Get started by adding your first patient record."}
          action={
            !search && (
              <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-primary hover:bg-primary/90">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Patient
              </Button>
            )
          }
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border-transparent">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="font-outfit text-slate-500 py-6 px-8">Patient Name</TableHead>
                <TableHead className="font-outfit text-slate-500 py-6 px-8">Contact Info</TableHead>
                <TableHead className="font-outfit text-slate-500 py-6 px-8">Last Visit</TableHead>
                <TableHead className="font-outfit text-slate-500 py-6 px-8 text-center">Total Visits</TableHead>
                <TableHead className="font-outfit text-slate-500 py-6 px-8 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id} className="hover:bg-slate-50/50 border-slate-100 transition-colors group">
                  <TableCell className="py-6 px-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/5 text-primary flex items-center justify-center font-outfit font-semibold text-sm">
                        {patient.name.charAt(0)}
                      </div>
                      <Link 
                        href={`/manage/${tenantSlug}/patients/${patient.id}`}
                        className="font-semibold text-obsidian font-outfit hover:text-primary transition-colors"
                      >
                        {patient.name}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell className="py-6 px-8">
                    <div className="flex flex-col gap-1">
                      {patient.email ? (
                        <div className="flex items-center gap-2 text-slate-600 text-sm font-outfit">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {patient.email}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm font-outfit italic">No email</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-6 px-8 text-slate-600 font-outfit">
                    {patient.lastVisit ? format(new Date(patient.lastVisit), "MMM d, yyyy") : "Never"}
                  </TableCell>
                  <TableCell className="py-6 px-8 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/5 text-primary font-outfit">
                      {patient.totalAppointments} visits
                    </span>
                  </TableCell>
                  <TableCell className="py-6 px-8 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-slate-100 text-slate-400">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-transparent p-1">
                        <DropdownMenuItem className="font-outfit cursor-pointer rounded-lg py-2.5">
                          <CalendarDays className="w-4 h-4 mr-2 text-slate-400" />
                          Book Appointment
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          render={
                            <Link href={`/manage/${tenantSlug}/patients/${patient.id}`} className="font-outfit cursor-pointer rounded-lg py-2.5">
                              <FileText className="w-4 h-4 mr-2 text-slate-400" />
                              View Full Profile
                            </Link>
                          }
                        />
                        <DropdownMenuItem className="font-outfit cursor-pointer rounded-lg py-2.5 text-rose-600 focus:text-rose-600 focus:bg-rose-50">
                          Archive Patient
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination
            totalCount={totalCount}
            pageSize={pageSize}
            currentPage={page}
          />
        </div>
      )}
    </div>
  );
}
