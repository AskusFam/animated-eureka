import { describe, expect, it } from "vitest";
import { reminderSchedule, shouldSendReminder } from "../../lib/reminders/policy";

describe("reminder policy", () => {
  it("makes persistent reminders more frequent than standard reminders", () => {
    expect(reminderSchedule("persistent").length).toBeGreaterThan(reminderSchedule("standard").length);
  });

  it("does not send after completion, pause, or opt-out", () => {
    expect(shouldSendReminder({ completed: true, paused: false, optedOut: false, localHour: 10, quietStart: 21, quietEnd: 8 })).toBe(false);
    expect(shouldSendReminder({ completed: false, paused: true, optedOut: false, localHour: 10, quietStart: 21, quietEnd: 8 })).toBe(false);
    expect(shouldSendReminder({ completed: false, paused: false, optedOut: true, localHour: 10, quietStart: 21, quietEnd: 8 })).toBe(false);
  });

  it("respects overnight quiet hours", () => {
    const input = { completed: false, paused: false, optedOut: false, quietStart: 21, quietEnd: 8 };
    expect(shouldSendReminder({ ...input, localHour: 22 })).toBe(false);
    expect(shouldSendReminder({ ...input, localHour: 10 })).toBe(true);
  });
});
