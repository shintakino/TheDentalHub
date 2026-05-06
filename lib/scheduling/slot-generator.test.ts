import { describe, it, expect } from "vitest";
import { generateSlots, SlotGeneratorParams } from "./slot-generator";

describe("generateSlots", () => {
  it("should generate slots for an empty day", () => {
    const params: SlotGeneratorParams = {
      date: "2026-05-10",
      timezone: "America/New_York",
      operatingHours: { start: "09:00", end: "11:00" },
      serviceDuration: 30,
      bufferTime: 0,
      bookedAppointments: [],
    };

    const slots = generateSlots(params);

    expect(slots).toHaveLength(4);
    // 09:00 NY = 13:00 UTC (EDT in May)
    expect(slots[0].startTime).toBe("2026-05-10T13:00:00.000Z");
    expect(slots[0].endTime).toBe("2026-05-10T13:30:00.000Z");
    expect(slots[3].startTime).toBe("2026-05-10T14:30:00.000Z");
    expect(slots[3].endTime).toBe("2026-05-10T15:00:00.000Z");
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
    };

    const slots = generateSlots(params);

    // Slot 1: 09:00 - 09:30. Next slot start would be 09:30 + 10 = 09:40. But there is a booking from 09:30 to 10:00.
    // So conflict detected? Actually, slot 1 ends at 09:30. It doesn't overlap with 09:30-10:00.
    // So Slot 1 is generated. Then currentSlotStart advances to 09:30 + buffer(10) = 09:40.
    // Slot 2: 09:40 - 10:10. Overlaps with 09:30-10:00. So it advances to booking end + buffer = 10:00 + 10 = 10:10.
    // Slot 3: 10:10 - 10:40. Valid. Next slot start = 10:40 + 10 = 10:50.
    // Slot 4: 10:50 - 11:20. Ends after 11:00. Invalid.
    expect(slots).toHaveLength(2);
    expect(slots[0].startTime).toBe("2026-05-10T13:00:00.000Z"); // 09:00
    expect(slots[1].startTime).toBe("2026-05-10T14:10:00.000Z"); // 10:10
  });

  it("should handle appointments correctly even if they overlap closely", () => {
    const params: SlotGeneratorParams = {
      date: "2026-05-10",
      timezone: "UTC",
      operatingHours: { start: "09:00", end: "10:00" },
      serviceDuration: 15,
      bufferTime: 5,
      bookedAppointments: [
        {
          startTime: "2026-05-10T09:00:00.000Z",
          endTime: "2026-05-10T09:15:00.000Z",
        },
      ],
    };

    const slots = generateSlots(params);
    // 09:00 to 09:15 is booked.
    // Generator checks 09:00 - 09:15 -> overlaps with booking.
    // Advances to booking.endTime + buffer = 09:15 + 5 = 09:20.
    // Next check: 09:20 - 09:35 -> Valid. Advance to 09:35 + 5 = 09:40.
    // Next check: 09:40 - 09:55 -> Valid. Advance to 09:55 + 5 = 10:00.
    // Next check: 10:00 - 10:15 -> After end time. Break.
    
    expect(slots).toHaveLength(2);
    expect(slots[0].startTime).toBe("2026-05-10T09:20:00.000Z");
    expect(slots[1].startTime).toBe("2026-05-10T09:40:00.000Z");
  });
});
