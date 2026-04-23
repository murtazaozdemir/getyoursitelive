import type { HoursSchedule } from "@/lib/business-types";

type Status = {
  isOpen: boolean;
  label: string;        // "Open now", "Closed"
  detail: string;       // "Closes at 6:00 PM", "Opens at 8:00 AM Mon", "Closed today"
};

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
const DAY_NAMES_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

// Ordered Mon → Sun for display purposes
const WEEK_DISPLAY: Array<{ key: keyof HoursSchedule; name: string }> = [
  { key: "mon", name: "Monday" },
  { key: "tue", name: "Tuesday" },
  { key: "wed", name: "Wednesday" },
  { key: "thu", name: "Thursday" },
  { key: "fri", name: "Friday" },
  { key: "sat", name: "Saturday" },
  { key: "sun", name: "Sunday" },
];

function minutesFromHHMM(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function formatTime12(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return m === 0 ? `${hour12} ${period}` : `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

/**
 * Compute current open/closed status for a business given its schedule.
 * Runs entirely client-side against `new Date()` — so the caller should
 * usually re-compute on an interval (every ~60s) to keep it accurate.
 */
export function getOpenStatus(
  schedule: HoursSchedule,
  now: Date = new Date(),
): Status {
  const todayKey = DAY_KEYS[now.getDay()];
  const today = schedule[todayKey];
  const nowMins = now.getHours() * 60 + now.getMinutes();

  // --- Currently open ---
  if (today) {
    const openMins = minutesFromHHMM(today.open);
    const closeMins = minutesFromHHMM(today.close);
    // Handle midnight-spanning spans (e.g. 20:00–02:00): closeMins < openMins
    const spansminight = closeMins <= openMins;
    const isOpen = spansminight
      ? nowMins >= openMins || nowMins < closeMins
      : nowMins >= openMins && nowMins < closeMins;

    if (isOpen) {
      return {
        isOpen: true,
        label: "Open now",
        detail: `Closes at ${formatTime12(today.close)}`,
      };
    }
    // Before opening time today (only meaningful for non-midnight-spanning spans)
    if (!spansminight && nowMins < openMins) {
      return {
        isOpen: false,
        label: "Closed",
        detail: `Opens at ${formatTime12(today.open)}`,
      };
    }
  }

  // --- Closed for the day or closed day — find next open day ---
  for (let offset = 1; offset <= 7; offset++) {
    const nextDayIdx = (now.getDay() + offset) % 7;
    const nextKey = DAY_KEYS[nextDayIdx];
    const nextDay = schedule[nextKey];
    if (nextDay) {
      const dayLabel =
        offset === 1 ? "tomorrow" : DAY_NAMES_SHORT[nextDayIdx];
      return {
        isOpen: false,
        label: "Closed",
        detail: `Opens ${formatTime12(nextDay.open)} ${dayLabel}`,
      };
    }
  }

  // Fallback: all days closed
  return {
    isOpen: false,
    label: "Closed",
    detail: "Hours unavailable",
  };
}

/**
 * Return a grouped list of weekly hours with full day names.
 * Consecutive days with identical hours collapse into a range.
 *
 * For Mon-Fri all 8-18, Sat 9-15, Sun closed:
 *   [
 *     { label: "Monday–Friday", value: "8 AM – 6 PM" },
 *     { label: "Saturday",      value: "9 AM – 3 PM" },
 *     { label: "Sunday",        value: "Closed" },
 *   ]
 */
export function formatHoursLong(
  schedule: HoursSchedule,
): Array<{ label: string; value: string; closed: boolean }> {
  const valueOf = (day: HoursSchedule[keyof HoursSchedule]): string => {
    if (!day) return "Closed";
    return `${formatTime12(day.open)} – ${formatTime12(day.close)}`;
  };

  const groups: Array<{ label: string; value: string; closed: boolean }> = [];
  let current: { startName: string; endName: string; value: string } | null = null;

  const flush = () => {
    if (!current) return;
    const label =
      current.startName === current.endName
        ? current.startName
        : `${current.startName}–${current.endName}`;
    groups.push({ label, value: current.value, closed: current.value === "Closed" });
  };

  for (const { key, name } of WEEK_DISPLAY) {
    const v = valueOf(schedule[key]);
    if (current && current.value === v) {
      current.endName = name; // extend current range
    } else {
      flush();
      current = { startName: name, endName: name, value: v };
    }
  }
  flush();

  return groups;
}
