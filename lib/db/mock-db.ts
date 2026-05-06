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
  name: string;
  address: string;
  timezone: string;
  operatingHours: { start: string; end: string };
  serviceDuration: number;
  bufferTime: number;
  latitude: number;
  longitude: number;
}

export interface ClinicConfig {
  id: string;
  tenantId: string;
  name: string;
  logoUrl?: string;
  primaryColor: string;
  subdomain: string;
  description?: string;
}

// In-memory state
const appointments: DBAppointment[] = [];
const clinics: ClinicConfig[] = [
  {
    id: "clinic-1",
    tenantId: "org_123",
    name: "Smile Dental Studio",
    primaryColor: "#0047FF",
    subdomain: "smile-dental",
    description: "Premium cosmetic and family dentistry in the heart of the city.",
  },
  {
    id: "clinic-2",
    tenantId: "org_456",
    name: "Elite Orthodontics",
    primaryColor: "#00A86B",
    subdomain: "elite-ortho",
    description: "Specialized orthodontic care for all ages.",
  }
];

const branches: BranchConfig[] = [
  {
    id: "branch-1",
    tenantId: "org_123",
    name: "Downtown Branch",
    address: "123 Main St, New York, NY 10001",
    timezone: "America/New_York",
    operatingHours: { start: "09:00", end: "17:00" },
    serviceDuration: 30,
    bufferTime: 10,
    latitude: 40.7128,
    longitude: -74.0060,
  },
  {
    id: "branch-2",
    tenantId: "org_456",
    name: "Uptown Branch",
    address: "456 Park Ave, New York, NY 10022",
    timezone: "America/New_York",
    operatingHours: { start: "08:00", end: "16:00" },
    serviceDuration: 45,
    bufferTime: 15,
    latitude: 40.7736,
    longitude: -73.9566,
  }
];

// Mock locking mechanism
const activeLocks = new Set<string>();

export const mockDb = {
  // Clear data for testing
  _reset: () => {
    appointments.length = 0;
    activeLocks.clear();
  },

  getClinicBySubdomain: async (subdomain: string) => {
    await new Promise((resolve) => setTimeout(resolve, 10));
    return clinics.find((c) => c.subdomain === subdomain);
  },

  getBranch: async (branchId: string, tenantId: string) => {
    // Simulate DB delay
    await new Promise((resolve) => setTimeout(resolve, 10));
    return branches.find((b) => b.id === branchId && b.tenantId === tenantId);
  },

  getBranches: async (tenantId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 10));
    return branches.filter((b) => b.tenantId === tenantId);
  },

  searchClinics: async (query?: string) => {
    await new Promise((resolve) => setTimeout(resolve, 10));
    let results = clinics.map(clinic => ({
      ...clinic,
      branches: branches.filter(b => b.tenantId === clinic.tenantId)
    }));

    if (query) {
      const q = query.toLowerCase();
      results = results.filter(r => 
        r.name.toLowerCase().includes(q) || 
        r.description?.toLowerCase().includes(q) ||
        r.branches.some(b => b.name.toLowerCase().includes(q) || b.address.toLowerCase().includes(q))
      );
    }

    return results;
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
