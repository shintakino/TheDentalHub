import { AppointmentStatus } from "../db/schema";

type Transitions = Record<AppointmentStatus, AppointmentStatus[]>;

const validTransitions: Transitions = {
  confirmed: ["checked_in", "cancelled", "no_show"],
  checked_in: ["in_progress", "cancelled"],
  in_progress: ["completed"],
  completed: [], // Terminal state
  cancelled: [], // Terminal state
  no_show: [], // Terminal state
};

export class AppointmentStateMachine {
  static canTransition(currentStatus: AppointmentStatus, newStatus: AppointmentStatus): boolean {
    if (currentStatus === newStatus) return false;
    const allowed = validTransitions[currentStatus];
    return allowed ? allowed.includes(newStatus) : false;
  }

  static getValidNextStates(currentStatus: AppointmentStatus): AppointmentStatus[] {
    return validTransitions[currentStatus] || [];
  }
}
