import { addMinutes, isBefore, isAfter, isEqual, parse, parseISO } from "date-fns";
import { formatInTimeZone, toDate } from "date-fns-tz";

export interface OperatingHours {
  start: string; // "HH:mm" in local time
  end: string; // "HH:mm" in local time
}

export interface Appointment {
  startTime: string; // ISO string
  endTime: string; // ISO string
}

export interface StaffAssignment {
  startTime: string; // ISO string
  endTime: string; // ISO string
}

export interface SlotGeneratorParams {
  date: string; // "YYYY-MM-DD"
  timezone: string;
  operatingHours: OperatingHours;
  serviceDuration: number; // in minutes
  bufferTime: number; // in minutes
  bookedAppointments: Appointment[];
  maxCapacity: number;
  staffAssignments: StaffAssignment[];
}

export interface AvailableSlot {
  startTime: string; // ISO string
  endTime: string; // ISO string
}

export function generateSlots({
  date,
  timezone,
  operatingHours,
  serviceDuration,
  bufferTime,
  bookedAppointments,
  maxCapacity,
  staffAssignments,
}: SlotGeneratorParams): AvailableSlot[] {
  const availableSlots: AvailableSlot[] = [];

  // Parse operating hours in the context of the branch's timezone
  const startString = `${date}T${operatingHours.start}:00`;
  const endString = `${date}T${operatingHours.end}:00`;

  // Convert local time strings to UTC Date objects
  const dayStart = toDate(startString, { timeZone: timezone });
  const dayEnd = toDate(endString, { timeZone: timezone });

  // Map booked appointments to Date objects
  const bookings = bookedAppointments.map((app) => ({
    startTime: parseISO(app.startTime),
    endTime: parseISO(app.endTime),
  }));

  // Map staff assignments to Date objects
  const assignments = staffAssignments.map((as) => ({
    startTime: parseISO(as.startTime),
    endTime: parseISO(as.endTime),
  }));

  let currentSlotStart = dayStart;

  while (isBefore(currentSlotStart, dayEnd)) {
    const currentSlotEnd = addMinutes(currentSlotStart, serviceDuration);

    if (isAfter(currentSlotEnd, dayEnd)) {
      break;
    }

    // Helper to check capacity and staff at any given time
    const isAvailableAt = (start: Date, end: Date) => {
      // Check physical capacity: at any point in [start, end], 
      // count of overlapping bookings must be < maxCapacity
      // To be precise, we check if adding one more booking would exceed capacity.
      
      // We can check this by sampling at intervals or just checking overlaps.
      // A more robust way: for the proposed slot, check all existing bookings that overlap.
      // Then check if at any point the number of concurrent bookings reaches maxCapacity.
      
      const overlappingBookings = bookings.filter(b => 
        (isBefore(start, b.endTime) && isAfter(end, b.startTime))
      );

      // Check chair capacity
      // We need to check if there's any moment t in [start, end] where concurrent bookings >= maxCapacity
      // We only need to check at the start of each overlapping booking and at the slot start.
      const checkPoints = [start, ...overlappingBookings.map(b => b.startTime)].filter(t => 
        !isBefore(t, start) && isBefore(t, end)
      );

      for (const t of checkPoints) {
        const concurrentAtT = overlappingBookings.filter(b => 
          (!isAfter(b.startTime, t) && isAfter(b.endTime, t))
        ).length;
        
        if (concurrentAtT >= maxCapacity) return false;
      }

      // Check staff availability
      // At any point t in [start, end], count of staff - count of concurrent bookings must be >= 1
      const staffAtPoints = [start, ...assignments.map(a => a.startTime), ...assignments.map(a => a.endTime)].filter(t => 
        !isBefore(t, start) && !isAfter(t, end)
      );
      
      // Also check if any staff covers the WHOLE slot (or if multiple staff cover it)
      // Actually, if we assume any staff can take any appointment, we just need
      // staff_count(t) > concurrent_bookings(t) for all t in [start, end]
      
      // Let's use the checkPoints combined with staffAtPoints
      const allPoints = Array.from(new Set([...checkPoints, ...staffAtPoints].map(d => d.getTime())))
        .sort((a, b) => a - b)
        .map(t => new Date(t));

      for (const t of allPoints) {
        // We check a tiny bit after t to see the state during the interval starting at t
        const checkTime = addMinutes(t, 0.1); 
        if (isAfter(checkTime, end)) continue;

        const staffAtT = assignments.filter(a => 
          (!isAfter(a.startTime, t) && isAfter(a.endTime, checkTime))
        ).length;

        const concurrentAtT = overlappingBookings.filter(b => 
          (!isAfter(b.startTime, t) && isAfter(b.endTime, checkTime))
        ).length;

        if (staffAtT <= concurrentAtT) return false;
      }

      return true;
    };

    if (isAvailableAt(currentSlotStart, currentSlotEnd)) {
      availableSlots.push({
        startTime: currentSlotStart.toISOString(),
        endTime: currentSlotEnd.toISOString(),
      });
      currentSlotStart = addMinutes(currentSlotStart, serviceDuration + bufferTime);
    } else {
      // If not available, increment by a small amount (e.g. 15 mins) to find next possible start
      currentSlotStart = addMinutes(currentSlotStart, 15);
    }
  }

  return availableSlots;
}
