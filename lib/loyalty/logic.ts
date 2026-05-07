import { db } from "@/lib/db";
import { patientProfiles, loyaltyTransactions, Appointment } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

export const loyaltyLogic = {
  async awardPointsForAppointment(appointment: Appointment) {
    if (!appointment.patientId) return;

    // 1. Check if points were already awarded for this appointment
    const existingTx = await db.query.loyaltyTransactions.findFirst({
      where: eq(loyaltyTransactions.appointmentId, appointment.id),
    });

    if (existingTx) return;

    // 2. Get or create patient profile
    let profile = await db.query.patientProfiles.findFirst({
      where: eq(patientProfiles.userId, appointment.patientId),
    });

    if (!profile) {
      try {
        const [newProfile] = await db.insert(patientProfiles).values({
          userId: appointment.patientId,
          loyaltyPoints: 0,
        }).returning();
        profile = newProfile;
      } catch (err) {
        // Handle race condition
        profile = await db.query.patientProfiles.findFirst({
          where: eq(patientProfiles.userId, appointment.patientId),
        });
      }
    }

    if (!profile) return;

    const pointsToAward = 50; // Standard points per visit
    const reason = `Points earned for visit on ${new Date(appointment.startTime).toLocaleDateString()}`;

    await db.transaction(async (tx) => {
      // Create transaction
      await tx.insert(loyaltyTransactions).values({
        patientId: profile!.id,
        appointmentId: appointment.id,
        amount: pointsToAward,
        reason,
      });

      // Update profile points
      await tx.update(patientProfiles)
        .set({ 
          loyaltyPoints: sql`${patientProfiles.loyaltyPoints} + ${pointsToAward}`,
          updatedAt: new Date()
        })
        .where(eq(patientProfiles.id, profile!.id));
    });
  }
};
