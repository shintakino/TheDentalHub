// Mock Database implementation since the actual DB will be set up in Feature 06

import { Appointment } from "../scheduling/slot-generator";

export interface DBAppointment extends Appointment {
  id: string;
  tenantId: string;
  branchId: string;
  serviceId: string;
  patientId: string;
  status: "confirmed" | "cancelled";
}

export interface BranchConfig {
  id: string;
  tenantId: string;
  timezone: string;
  operatingHours: { start: string; end: string };
  serviceDuration: number;
  bufferTime: number;
}

// In-memory state
const appointments: DBAppointment[] = [];
const branches: BranchConfig[] = [
  {
    id: "branch-1",
    tenantId: "org_123",
    timezone: "America/New_York",
    operatingHours: { start: "09:00", end: "17:00" },
    serviceDuration: 30,
    bufferTime: 10,
  },
];

// Mock locking mechanism
const activeLocks = new Set<string>();

export const mockDb = {
  // Clear data for testing
  _reset: () => {
    appointments.length = 0;
    activeLocks.clear();
  },

  getBranch: async (branchId: string, tenantId: string) => {
    // Simulate DB delay
    await new Promise((resolve) => setTimeout(resolve, 10));
    return branches.find((b) => b.id === branchId && b.tenantId === tenantId);
  },

  getBookings: async (branchId: string, tenantId: string, date: string) => {
    await new Promise((resolve) => setTimeout(resolve, 10));
    // Very basic date filtering by checking if start time includes the date string
    // In a real DB, we'd do a range query on UTC timestamps covering the branch's local day
    return appointments.filter(
      (app) => app.branchId === branchId && app.tenantId === tenantId && app.status === "confirmed"
    );
  },

  // Simulates a transaction with a row-level lock or distributed lock
  bookAppointment: async (appointment: Omit<DBAppointment, "id" | "status">) => {
    await new Promise((resolve) => setTimeout(resolve, 10)); // simulated latency
    
    const lockKey = `${appointment.tenantId}:${appointment.branchId}:${appointment.startTime}:${appointment.endTime}`;
    
    if (activeLocks.has(lockKey)) {
      throw new Error("Lock acquisition failed: Slot is currently being booked by another process");
    }
    
    // Acquire lock
    activeLocks.add(lockKey);
    
    try {
      // Re-verify availability within the "transaction"
      const conflicting = appointments.find((app) => 
        app.branchId === appointment.branchId &&
        app.tenantId === appointment.tenantId &&
        app.status === "confirmed" &&
        !(
          new Date(appointment.endTime) <= new Date(app.startTime) ||
          new Date(appointment.startTime) >= new Date(app.endTime)
        )
      );

      if (conflicting) {
        throw new Error("Double booking detected: Slot is already taken");
      }

      const newApp: DBAppointment = {
        ...appointment,
        id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: "confirmed",
      };

      appointments.push(newApp);
      
      // Simulate writing audit log within the same transaction
      mockAuditLogs.push({
        id: `log-${Date.now()}`,
        tenantId: appointment.tenantId,
        action: "appointment_booked",
        entityId: newApp.id,
        timestamp: new Date().toISOString(),
      });

      return newApp;
    } finally {
      // Release lock
      activeLocks.delete(lockKey);
    }
  }
};

export interface AuditLog {
  id: string;
  tenantId: string;
  action: string;
  entityId: string;
  timestamp: string;
}

export const mockAuditLogs: AuditLog[] = [];
