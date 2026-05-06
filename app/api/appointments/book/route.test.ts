import { describe, it, expect, beforeEach } from "vitest";
import { mockDb, mockAuditLogs } from "../../../../lib/db/mock-db";

describe("Atomic Locking in bookAppointment", () => {
  beforeEach(() => {
    mockDb._reset();
    mockAuditLogs.length = 0;
  });

  it("should prevent double-booking for concurrent requests", async () => {
    const appointmentData = {
      tenantId: "org_123",
      branchId: "branch-1",
      serviceId: "srv_1",
      patientId: "pat_1",
      startTime: "2026-05-10T13:00:00.000Z",
      endTime: "2026-05-10T13:30:00.000Z",
    };

    // Fire two identical booking requests concurrently
    const results = await Promise.allSettled([
      mockDb.bookAppointment(appointmentData),
      mockDb.bookAppointment(appointmentData),
    ]);

    const successes = results.filter((r) => r.status === "fulfilled");
    const failures = results.filter((r) => r.status === "rejected");

    // Exactly one should succeed
    expect(successes).toHaveLength(1);
    // Exactly one should fail due to atomic locking or double booking detection
    expect(failures).toHaveLength(1);
    
    const rejectionReason = (failures[0] as PromiseRejectedResult).reason.message;
    expect(
      rejectionReason.includes("Lock acquisition failed") || 
      rejectionReason.includes("Double booking detected")
    ).toBe(true);

    // Verify audit logs
    expect(mockAuditLogs).toHaveLength(1);
    expect(mockAuditLogs[0].action).toBe("appointment_booked");
    expect(mockAuditLogs[0].tenantId).toBe("org_123");
  });

  it("should allow booking non-overlapping slots concurrently", async () => {
    const appointmentData1 = {
      tenantId: "org_123",
      branchId: "branch-1",
      serviceId: "srv_1",
      patientId: "pat_1",
      startTime: "2026-05-10T13:00:00.000Z",
      endTime: "2026-05-10T13:30:00.000Z",
    };

    const appointmentData2 = {
      tenantId: "org_123",
      branchId: "branch-1",
      serviceId: "srv_1",
      patientId: "pat_2",
      startTime: "2026-05-10T13:30:00.000Z",
      endTime: "2026-05-10T14:00:00.000Z",
    };

    const results = await Promise.allSettled([
      mockDb.bookAppointment(appointmentData1),
      mockDb.bookAppointment(appointmentData2),
    ]);

    const successes = results.filter((r) => r.status === "fulfilled");
    expect(successes).toHaveLength(2);
    expect(mockAuditLogs).toHaveLength(2);
  });
});
