import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { appointments, patientProfiles } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { AppointmentCard } from "@/components/patient/AppointmentCard";
import { LoyaltyCard } from "@/components/patient/LoyaltyCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

async function getPatientProfile(userId: string) {
  return await db.query.patientProfiles.findFirst({
    where: eq(patientProfiles.userId, userId),
  });
}

export default async function PatientDashboard() {
  const { userId } = await auth();
  if (!userId) return null;

  const [allAppointments, profile] = await Promise.all([
    getAppointments(userId),
    getPatientProfile(userId),
  ]);

  const now = new Date();

  const upcoming = allAppointments.filter(
    (a) => new Date(a.startTime) > now && a.status !== "cancelled"
  );
  const past = allAppointments.filter(
    (a) => new Date(a.startTime) <= now || a.status === "cancelled"
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
              <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
              <TabsTrigger value="past">Past / Cancelled ({past.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming" className="mt-6">
              {upcoming.length > 0 ? (
                <div className="grid gap-6 lg:grid-cols-2">
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
                <div className="grid gap-6 lg:grid-cols-2">
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
        
        <div className="space-y-6">
          <LoyaltyCard points={profile?.loyaltyPoints || 0} />
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Wellness Reminder</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Regular check-ups every 6 months keep your smile healthy and earn you bonus points!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
