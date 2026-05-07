import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { appointments } from "@/lib/db/schema";
import { eq, desc, lt } from "drizzle-orm";
import { AppointmentCard } from "@/components/patient/AppointmentCard";

async function getPastAppointments(userId: string) {
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

export default async function MedicalRecordsPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const allAppointments = await getPastAppointments(userId);
  const now = new Date();
  
  // Filter for completed or past appointments to show as "records"
  const records = allAppointments.filter(
    (a) => new Date(a.startTime) < now || a.status === "completed"
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-heading">Medical Records</h1>
        <p className="text-muted-foreground">View your past dental visits and treatment history.</p>
      </div>

      {records.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {records.map((apt) => (
            <AppointmentCard key={apt.id} appointment={apt} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-card shadow-sm">
          <p className="text-muted-foreground">No medical records found yet.</p>
        </div>
      )}
    </div>
  );
}
