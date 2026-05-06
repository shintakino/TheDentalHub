import { describe, it, expect } from "vitest";
import { AppointmentStateMachine } from "./state-machine";

describe("AppointmentStateMachine", () => {
  it("should allow valid transitions", () => {
    expect(AppointmentStateMachine.canTransition("confirmed", "checked_in")).toBe(true);
    expect(AppointmentStateMachine.canTransition("checked_in", "in_progress")).toBe(true);
    expect(AppointmentStateMachine.canTransition("in_progress", "completed")).toBe(true);
    expect(AppointmentStateMachine.canTransition("confirmed", "cancelled")).toBe(true);
  });

  it("should prevent invalid transitions", () => {
    expect(AppointmentStateMachine.canTransition("cancelled", "completed")).toBe(false);
    expect(AppointmentStateMachine.canTransition("confirmed", "completed")).toBe(false);
    expect(AppointmentStateMachine.canTransition("completed", "in_progress")).toBe(false);
  });

  it("should prevent transitioning to the same state", () => {
    expect(AppointmentStateMachine.canTransition("confirmed", "confirmed")).toBe(false);
  });

  it("should return valid next states", () => {
    expect(AppointmentStateMachine.getValidNextStates("confirmed")).toEqual(["checked_in", "cancelled", "no_show"]);
    expect(AppointmentStateMachine.getValidNextStates("completed")).toEqual([]);
  });
});
