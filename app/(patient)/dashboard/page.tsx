import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { appointments } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { AppointmentCard } from "@/components/patient/AppointmentCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

async function getAppointments(userId: string) {
  return await db.query.appointments.findMany({
    where: eq(appointments.patientId, userId),
    with: {
      clinic: true,
      branch: true,
      service: true,
    },
    orderBy: [desc(appointments.startTime)],
  });
}

export default async function PatientDashboard() {
  const { userId } = await auth();
  if (!userId) return null;

  const allAppointments = await getAppointments(userId);
  const now = new Date();

  const upcoming = allAppointments.filter(
    (a) => new Date(a.startTime) > now && a.status !== "cancelled"
  );
  const past = allAppointments.filter(
    (a) => new Date(a.startTime) <= now || a.status === "cancelled"
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-heading">My Appointments</h1>
          <p className="text-muted-foreground">Manage your upcoming and past dental visits.</p>
        </div>
        <Button asChild>
          <Link href="/search">
            <Plus className="mr-2 h-4 w-4" />
            Book New Appointment
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Past / Cancelled ({past.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="mt-6">
          {upcoming.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((apt) => (
                <AppointmentCard key={apt.id} appointment={apt} isUpcoming />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-white shadow-sm space-y-4">
              <p className="text-muted-foreground">You have no upcoming appointments.</p>
              <Button asChild variant="outline">
                <Link href="/search">
                  Explore Clinics & Book
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {past.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {past.map((apt) => (
                <AppointmentCard key={apt.id} appointment={apt} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-white shadow-sm">
              <p className="text-muted-foreground">You have no past appointments.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
