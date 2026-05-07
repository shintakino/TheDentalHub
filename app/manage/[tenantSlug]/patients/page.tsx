import { db } from "@/lib/db";
import { appointments } from "@/lib/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import { getTenantId } from "@/lib/db/tenant";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CalendarDays, Mail, Phone, MoreHorizontal, FileText } from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default async function PatientsPage() {
  const tenantId = await getTenantId();

  const patientStats = await db
    .select({
      name: appointments.patientName,
      email: appointments.patientEmail,
      id: appointments.patientId,
      lastVisit: sql<Date>`max(${appointments.startTime})`,
      totalAppointments: sql<number>`count(*)`,
    })
    .from(appointments)
    .where(eq(appointments.tenantId, tenantId))
    .groupBy(appointments.patientName, appointments.patientEmail, appointments.patientId)
    .orderBy(desc(sql`max(${appointments.startTime})`));

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-4xl font-playfair font-semibold text-obsidian">Patient Directory</h1>
        <p className="text-slate-500 font-outfit text-lg">
          Manage and view your clinic&apos;s patient base.
        </p>
      </div>

      <div className="bg-card rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-transparent overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="font-outfit text-slate-500 py-4 px-6">Patient Name</TableHead>
              <TableHead className="font-outfit text-slate-500 py-4 px-6">Contact Info</TableHead>
              <TableHead className="font-outfit text-slate-500 py-4 px-6">Last Visit</TableHead>
              <TableHead className="font-outfit text-slate-500 py-4 px-6">Total Visits</TableHead>
              <TableHead className="font-outfit text-slate-500 py-4 px-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patientStats.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-400 font-outfit">
                  No patients found yet.
                </TableCell>
              </TableRow>
            ) : (
              patientStats.map((patient, index) => (
                <TableRow key={index} className="hover:bg-slate-50/50 border-slate-100 transition-colors">
                  <TableCell className="py-4 px-6 font-medium text-obsidian font-outfit">
                    {patient.name}
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <div className="flex flex-col gap-1">
                      {patient.email && (
                        <div className="flex items-center gap-2 text-slate-500 text-sm font-outfit">
                          <Mail className="w-3.5 h-3.5" />
                          {patient.email}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-outfit">
                        ID: {patient.id?.substring(0, 12) || "Guest"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6 text-slate-600 font-outfit">
                    {patient.lastVisit ? format(new Date(patient.lastVisit), "PPP") : "N/A"}
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {patient.totalAppointments} visits
                    </span>
                  </TableCell>
                  <TableCell className="py-4 px-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg border-slate-100">
                        <DropdownMenuItem className="font-outfit cursor-pointer">
                          <CalendarDays className="w-4 h-4 mr-2" />
                          Book Appointment
                        </DropdownMenuItem>
                        <DropdownMenuItem className="font-outfit cursor-pointer">
                          <FileText className="w-4 h-4 mr-2" />
                          View History
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
    </div>
  );
}
