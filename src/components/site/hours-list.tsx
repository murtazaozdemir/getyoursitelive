"use client";

import { useBusiness } from "@/lib/business-context";
import { useEditMode } from "@/lib/edit-mode-context";
import { formatHoursLong } from "@/lib/hours";
import type { DaySchedule, HoursSchedule } from "@/lib/business-types";

const DAYS: Array<{ key: keyof HoursSchedule; label: string }> = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];

/**
 * Renders the business's weekly hours.
 *
 * View mode: collapses consecutive days with identical hours into ranges
 * (e.g. "Monday–Friday  8 AM – 6 PM").
 *
 * Edit mode: expands to one row per day with time pickers + a "Closed"
 * checkbox. Every change saves immediately via the edit-mode context.
 */
export function HoursList({ className = "" }: { className?: string }) {
  const { hoursSchedule } = useBusiness();
  const edit = useEditMode();

  if (edit) {
    function patchDay(day: keyof HoursSchedule, value: DaySchedule) {
      edit!.updateField("hoursSchedule", { ...hoursSchedule, [day]: value });
    }
    function toggleClosed(day: keyof HoursSchedule, closed: boolean) {
      patchDay(day, closed ? null : { open: "08:00", close: "18:00" });
    }

    return (
      <dl className={`hours-list hours-list--edit ${className}`}>
        {DAYS.map(({ key, label }) => {
          const v = hoursSchedule[key];
          const isClosed = v === null;
          return (
            <div key={key} className="hours-list-row hours-list-row--edit">
              <dt className="hours-list-day">{label}</dt>
              <dd className="hours-list-time">
                <label className="hours-list-closed-toggle">
                  <input
                    type="checkbox"
                    checked={isClosed}
                    onChange={(e) => toggleClosed(key, e.target.checked)}
                  />
                  <span>Closed</span>
                </label>
                {!isClosed && v && (
                  <>
                    <input
                      type="time"
                      className="hours-list-time-input"
                      value={v.open}
                      onChange={(e) => patchDay(key, { ...v, open: e.target.value })}
                    />
                    <span className="hours-list-time-sep">–</span>
                    <input
                      type="time"
                      className="hours-list-time-input"
                      value={v.close}
                      onChange={(e) => patchDay(key, { ...v, close: e.target.value })}
                    />
                  </>
                )}
              </dd>
            </div>
          );
        })}
      </dl>
    );
  }

  // View mode — keep the collapsed range display
  const groups = formatHoursLong(hoursSchedule);
  return (
    <dl className={`hours-list ${className}`}>
      {groups.map(({ label, value, closed }) => (
        <div key={label} className="hours-list-row">
          <dt className="hours-list-day">{label}</dt>
          <dd
            className={`hours-list-time${closed ? " hours-list-time--closed" : ""}`}
          >
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
