export type ReminderIntensity = "minimal" | "standard" | "persistent";

export function reminderSchedule(intensity: ReminderIntensity, now = new Date()) {
  const hours = intensity === "minimal" ? [48] : intensity === "persistent" ? [12, 24, 48] : [24, 72];
  return hours.map((hour, index) => ({
    attempt: index,
    scheduledFor: new Date(now.getTime() + hour * 60 * 60 * 1000),
  }));
}

export function shouldSendReminder(input: {
  completed: boolean;
  paused: boolean;
  optedOut: boolean;
  localHour: number;
  quietStart: number;
  quietEnd: number;
}) {
  if (input.completed || input.paused || input.optedOut) return false;
  if (input.quietStart < input.quietEnd) {
    return input.localHour < input.quietStart || input.localHour >= input.quietEnd;
  }
  return input.localHour < input.quietStart && input.localHour >= input.quietEnd;
}
