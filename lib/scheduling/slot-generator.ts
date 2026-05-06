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

export interface SlotGeneratorParams {
  date: string; // "YYYY-MM-DD"
  timezone: string;
  operatingHours: OperatingHours;
  serviceDuration: number; // in minutes
  bufferTime: number; // in minutes
  bookedAppointments: Appointment[];
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

  let currentSlotStart = dayStart;

  while (isBefore(currentSlotStart, dayEnd)) {
    const currentSlotEnd = addMinutes(currentSlotStart, serviceDuration);

    // If the slot ends after the day's operating hours, stop generating
    if (isAfter(currentSlotEnd, dayEnd)) {
      break;
    }

    // Check if the current slot overlaps with any booked appointment
    const hasOverlap = bookings.some((booking) => {
      return (
        (isBefore(currentSlotStart, booking.endTime) && isAfter(currentSlotEnd, booking.startTime)) ||
        isEqual(currentSlotStart, booking.startTime) ||
        isEqual(currentSlotEnd, booking.endTime)
      );
    });

    if (!hasOverlap) {
      availableSlots.push({
        startTime: currentSlotStart.toISOString(),
        endTime: currentSlotEnd.toISOString(),
      });
      // Move to next potential slot based on interval (usually serviceDuration + bufferTime, or just fixed intervals)
      // For simplicity, let's increment by service duration + buffer. But usually slots start at fixed intervals e.g. every 15 mins.
      // Let's implement fixed 15 min increments to give more options, or just next available.
      // Let's just step by serviceDuration + bufferTime for a packed schedule, or standard 15-min increments.
      // The requirement doesn't specify, we'll increment by `serviceDuration + bufferTime` for strict sequential booking, 
      // or maybe standard fixed intervals. Let's use `serviceDuration + bufferTime`.
      currentSlotStart = addMinutes(currentSlotStart, serviceDuration + bufferTime);
    } else {
      // If there's an overlap, find the conflicting booking and advance the currentSlotStart to its end + buffer
      const conflictingBooking = bookings.find((booking) => {
        return (
          (isBefore(currentSlotStart, booking.endTime) && isAfter(currentSlotEnd, booking.startTime)) ||
          isEqual(currentSlotStart, booking.startTime) ||
          isEqual(currentSlotEnd, booking.endTime)
        );
      });
      
      if (conflictingBooking) {
        currentSlotStart = addMinutes(conflictingBooking.endTime, bufferTime);
      } else {
        // Fallback (shouldn't be reached due to hasOverlap check)
        currentSlotStart = addMinutes(currentSlotStart, 15);
      }
    }
  }

  return availableSlots;
}
