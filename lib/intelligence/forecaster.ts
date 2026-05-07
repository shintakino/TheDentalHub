import { db } from "@/lib/db";
import { appointments } from "@/lib/db/schema";
import { and, eq, sql } from "drizzle-orm";

export interface PredictionPayload {
  riskScore: string;
  isHighRisk: boolean;
  suggestedAction?: string;
}

export class Forecaster {
  /**
   * Calculates the no-show risk score for an appointment.
   * Logic: score = (patient.no_show_count * 2) + (is_monday_morning ? 1 : 0)
   */
  static async predictNoShowRisk(
    patientId: string | null,
    startTime: Date
  ): Promise<PredictionPayload> {
    let noShowCount = 0;

    if (patientId) {
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(appointments)
        .where(
          and(
            eq(appointments.patientId, patientId),
            eq(appointments.status, "no_show")
          )
        );
      
      noShowCount = Number(result[0]?.count || 0);
    }

    const isMonday = startTime.getDay() === 1;
    const isMorning = startTime.getHours() < 12;
    const isMondayMorning = isMonday && isMorning;

    const score = (noShowCount * 2) + (isMondayMorning ? 1 : 0);
    const isHighRisk = score >= 3;

    return {
      riskScore: score.toFixed(2),
      isHighRisk,
      suggestedAction: isHighRisk ? "Send an extra reminder SMS" : undefined,
    };
  }
}
