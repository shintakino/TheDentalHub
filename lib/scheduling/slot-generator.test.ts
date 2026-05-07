import { describe, it, expect } from "vitest";
import { generateSlots, SlotGeneratorParams } from "./slot-generator";

describe("generateSlots", () => {
  it("should generate slots for an empty day with 1 chair and 1 staff", () => {
    const params: SlotGeneratorParams = {
      date: "2026-05-10",
      timezone: "America/New_York",
      operatingHours: { start: "09:00", end: "11:00" },
      serviceDuration: 30,
      bufferTime: 0,
      bookedAppointments: [],
      maxCapacity: 1,
      staffAssignments: [
        {
          startTime: "2026-05-10T13:00:00.000Z", // 09:00 NY
          endTime: "2026-05-10T15:00:00.000Z", // 11:00 NY
        }
      ],
    };

    const slots = generateSlots(params);

    expect(slots).toHaveLength(4);
    // 09:00 NY = 13:00 UTC (EDT in May)
    expect(slots[0].startTime).toBe("2026-05-10T13:00:00.000Z");
    expect(slots[0].endTime).toBe("2026-05-10T13:30:00.000Z");
    expect(slots[3].startTime).toBe("2026-05-10T14:30:00.000Z");
    expect(slots[3].endTime).toBe("2026-05-10T15:00:00.000Z");
  });

  it("should return no slots if no staff is assigned", () => {
    const params: SlotGeneratorParams = {
      date: "2026-05-10",
      timezone: "America/New_York",
      operatingHours: { start: "09:00", end: "11:00" },
      serviceDuration: 30,
      bufferTime: 0,
      bookedAppointments: [],
      maxCapacity: 1,
      staffAssignments: [],
    };

    const slots = generateSlots(params);
    expect(slots).toHaveLength(0);
  });

  it("should respect booked appointments and buffer times", () => {
    const params: SlotGeneratorParams = {
      date: "2026-05-10",
      timezone: "America/New_York",
      operatingHours: { start: "09:00", end: "11:00" },
      serviceDuration: 30,
      bufferTime: 10,
      bookedAppointments: [
        {
          startTime: "2026-05-10T13:30:00.000Z", // 09:30 NY
          endTime: "2026-05-10T14:00:00.000Z", // 10:00 NY
        },
      ],
      maxCapacity: 1,
      staffAssignments: [
        {
          startTime: "2026-05-10T13:00:00.000Z",
          endTime: "2026-05-10T15:00:00.000Z",
        }
      ],
    };

    const slots = generateSlots(params);

    expect(slots).toHaveLength(2);
    expect(slots[0].startTime).toBe("2026-05-10T13:00:00.000Z"); // 09:00
    expect(slots[1].startTime).toBe("2026-05-10T14:10:00.000Z"); // 10:10
  });

  it("should allow concurrent appointments if maxCapacity and staff count permit", () => {
    const params: SlotGeneratorParams = {
      date: "2026-05-10",
      timezone: "UTC",
      operatingHours: { start: "09:00", end: "10:00" },
      serviceDuration: 30,
      bufferTime: 0,
      bookedAppointments: [
        {
          startTime: "2026-05-10T09:00:00.000Z",
          endTime: "2026-05-10T09:30:00.000Z",
        },
      ],
      maxCapacity: 2,
      staffAssignments: [
        {
          startTime: "2026-05-10T09:00:00.000Z",
          endTime: "2026-05-10T10:00:00.000Z",
        },
        {
          startTime: "2026-05-10T09:00:00.000Z",
          endTime: "2026-05-10T10:00:00.000Z",
        }
      ],
    };

    const slots = generateSlots(params);
    // Even though 09:00-09:30 is booked, we have 2 chairs and 2 staff.
    // So 09:00-09:30 should still be available for a SECOND appointment.
    expect(slots.some(s => s.startTime === "2026-05-10T09:00:00.000Z")).toBe(true);
    expect(slots).toHaveLength(2); // 09:00-09:30 and 09:30-10:00
  });

  it("should NOT allow concurrent appointments if staff count is 1 even if chairs is 2", () => {
    const params: SlotGeneratorParams = {
      date: "2026-05-10",
      timezone: "UTC",
      operatingHours: { start: "09:00", end: "10:00" },
      serviceDuration: 30,
      bufferTime: 0,
      bookedAppointments: [
        {
          startTime: "2026-05-10T09:00:00.000Z",
          endTime: "2026-05-10T09:30:00.000Z",
        },
      ],
      maxCapacity: 2,
      staffAssignments: [
        {
          startTime: "2026-05-10T09:00:00.000Z",
          endTime: "2026-05-10T10:00:00.000Z",
        }
      ],
    };

    const slots = generateSlots(params);
    // 09:00-09:30 is booked. 1 staff is busy. No more staff available.
    expect(slots.some(s => s.startTime === "2026-05-10T09:00:00.000Z")).toBe(false);
    expect(slots).toHaveLength(1); // Only 09:30-10:00
  });

  it("should handle partial staff coverage", () => {
    const params: SlotGeneratorParams = {
      date: "2026-05-10",
      timezone: "UTC",
      operatingHours: { start: "09:00", end: "10:00" },
      serviceDuration: 30,
      bufferTime: 0,
      bookedAppointments: [],
      maxCapacity: 1,
      staffAssignments: [
        {
          startTime: "2026-05-10T09:00:00.000Z",
          endTime: "2026-05-10T09:30:00.000Z", // Staff leaves at 09:30
        }
      ],
    };

    const slots = generateSlots(params);
    expect(slots).toHaveLength(1);
    expect(slots[0].startTime).toBe("2026-05-10T09:00:00.000Z");
  });

  it("should respect branch overrides (blackouts)", () => {
    const params: SlotGeneratorParams = {
      date: "2026-05-10",
      timezone: "UTC",
      operatingHours: { start: "09:00", end: "11:00" },
      serviceDuration: 30,
      bufferTime: 0,
      bookedAppointments: [],
      maxCapacity: 1,
      staffAssignments: [
        {
          startTime: "2026-05-10T09:00:00.000Z",
          endTime: "2026-05-10T11:00:00.000Z",
        }
      ],
      overrides: [
        {
          startTime: "2026-05-10T09:30:00.000Z",
          endTime: "2026-05-10T10:30:00.000Z",
          isClosed: true
        }
      ]
    };

    const slots = generateSlots(params);
    // Should have 09:00-09:30 and 10:30-11:00
    // 09:30-10:00 and 10:00-10:30 are blocked
    expect(slots).toHaveLength(2);
    expect(slots[0].startTime).toBe("2026-05-10T09:00:00.000Z");
    expect(slots[1].startTime).toBe("2026-05-10T10:30:00.000Z");
  });
});
