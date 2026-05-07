// Mock Database implementation since the actual DB will be set up in Feature 06

import { Appointment } from "../scheduling/slot-generator";

export interface DBAppointment extends Appointment {
  id: string;
  tenantId: string;
  branchId: string;
  serviceId: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  status: "confirmed" | "cancelled" | "checked_in" | "in_progress" | "completed" | "no_show";
}

export interface ServiceConfig {
  id: string;
  tenantId: string;
  name: string;
  duration: number; // minutes
}

export interface BranchConfig {
  id: string;
  tenantId: string;
  name: string;
  address: string;
  timezone: string;
  operatingHours: { day: number; open: string; close: string; active: boolean }[];
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
const services: ServiceConfig[] = [
  { id: "s1", tenantId: "org_123", name: "General Consultation", duration: 30 },
  { id: "s2", tenantId: "org_123", name: "Teeth Whitening", duration: 60 },
  { id: "s3", tenantId: "org_123", name: "Dental Emergency", duration: 45 },
];

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
    address: "Quezon Boulevard, Kidapawan City, Cotabato",
    timezone: "Asia/Manila",
    operatingHours: [
      { day: 0, open: "09:00", close: "17:00", active: false },
      { day: 1, open: "09:00", close: "17:00", active: true },
      { day: 2, open: "09:00", close: "17:00", active: true },
      { day: 3, open: "09:00", close: "17:00", active: true },
      { day: 4, open: "09:00", close: "17:00", active: true },
      { day: 5, open: "09:00", close: "17:00", active: true },
      { day: 6, open: "09:00", close: "17:00", active: false },
    ],
    latitude: 7.0085,
    longitude: 125.0140,
  },
  {
    id: "branch-2",
    tenantId: "org_456",
    name: "Uptown Branch",
    address: "Datu Ingkal Street, Kidapawan City, Cotabato",
    timezone: "Asia/Manila",
    operatingHours: [
      { day: 1, open: "08:00", close: "16:00", active: true },
    ],
    latitude: 7.0075,
    longitude: 125.0125,
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

  getBranchById: async (branchId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 10));
    return branches.find((b) => b.id === branchId);
  },

  getServiceById: async (serviceId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 10));
    return services.find((s) => s.id === serviceId);
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

  getServices: async (tenantId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 10));
    return services.filter((s) => s.tenantId === tenantId);
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

  getAppointmentsByBranchAndDate: async (branchId: string, date: string) => {
    await new Promise((resolve) => setTimeout(resolve, 10));
    return appointments.filter(
      (app) => app.branchId === branchId && app.startTime.startsWith(date) && app.status === "confirmed"
    );
  },

  isSlotAvailable: async (branchId: string, startTime: string, endTime: string) => {
    await new Promise((resolve) => setTimeout(resolve, 10));
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const conflicting = appointments.find((app) => 
      app.branchId === branchId &&
      app.status === "confirmed" &&
      !(
        end <= new Date(app.startTime) ||
        start >= new Date(app.endTime)
      )
    );
    
    return !conflicting;
  },

  getBookings: async (branchId: string, tenantId: string, date: string) => {
    await new Promise((resolve) => setTimeout(resolve, 10));
    return appointments.filter(
      (app) => app.branchId === branchId && app.tenantId === tenantId && app.status === "confirmed"
    );
  },

  getAppointmentById: async (id: string) => {
    await new Promise((resolve) => setTimeout(resolve, 10));
    return appointments.find((a) => a.id === id);
  },

  createAppointment: async (appointment: Omit<DBAppointment, "id">) => {
    await new Promise((resolve) => setTimeout(resolve, 10));
    const newApp: DBAppointment = {
      ...appointment,
      id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    appointments.push(newApp);
    return newApp;
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
        status: "confirmed",
        id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
