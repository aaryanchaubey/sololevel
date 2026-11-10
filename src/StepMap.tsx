import { Check, LockKeyhole } from "lucide-react";
import { useEffect, useState } from "react";
import type { MissionLog } from "./types";

type Props = { startDate?: string; missions: MissionLog[] };

export default function StepMap({ startDate, missions }: Props) {
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const elapsed = startDate
    ? Math.max(
        1,
        Math.min(
          21,
          Math.floor(
            (new Date(`${todayKey}T12:00:00`).getTime() -
              new Date(`${startDate}T12:00:00`).getTime()) /
              86_400_000,
          ) + 1,
        ),
      )
    : 0;
  const [selectedDay, setSelectedDay] = useState(startDate ? elapsed : 1);
  useEffect(() => {
    if (startDate) setSelectedDay(elapsed);
  }, [startDate, elapsed]);
  const challengeEnd = startDate ? new Date(`${startDate}T12:00:00`) : undefined;
  challengeEnd?.setDate(challengeEnd.getDate() + 20);
  const challengeEndKey = challengeEnd
    ? `${challengeEnd.getFullYear()}-${String(challengeEnd.getMonth() + 1).padStart(2, "0")}-${String(challengeEnd.getDate()).padStart(2, "0")}`
    : "";
  const completedDates = new Set(
    missions
      .filter(
        (entry) =>
          entry.status === "complete" &&
          (!startDate || (entry.date >= startDate && entry.date <= challengeEndKey)),
      )
      .map((entry) => entry.date),
  );
  const selectedDate = startDate ? new Date(`${startDate}T12:00:00`) : undefined;
  selectedDate?.setDate(selectedDate.getDate() + selectedDay - 1);
  const selectedDateKey = selectedDate
    ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
    : "";
  const selectedLogs = missions.filter((entry) => entry.date === selectedDateKey);
  const selectedCompleted = selectedLogs.filter((entry) => entry.status === "complete").length;

  return (
    <section className="step-map panel" aria-label="21-day challenge path">
      <div className="step-map-shade" aria-hidden="true" />
      <div className="step-map-content">
        <div className="step-map-heading">
          <div>
            <p className="eyebrow">PLAYER JOURNEY</p>
            <h2>21-day transformation</h2>
            <p className="muted">
              {startDate
                ? `Day ${elapsed} of 21 · ${completedDates.size} days with completed missions`
                : "Start a challenge to light the first step."}
            </p>
          </div>
          <div className="step-map-medal" aria-hidden="true">21</div>
        </div>
        <div className="step-path">
          {Array.from({ length: 21 }, (_, index) => {
            const dayNumber = index + 1;
            const date = startDate
              ? new Date(`${startDate}T12:00:00`)
              : undefined;
            date?.setDate(date.getDate() + index);
            const dateKey = date
              ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
              : "";
            const locked = !startDate || dayNumber > elapsed;
            const completed = Boolean(dateKey && completedDates.has(dateKey));
            const current = Boolean(startDate && dayNumber === elapsed);
            const playerHere = dayNumber === Math.max(1, elapsed);
            const state = locked ? "locked" : current ? "current" : completed ? "complete" : "open";
            return (
              <button
                className={`step-node ${state}${selectedDay === dayNumber ? " selected" : ""}`}
                key={dayNumber}
                type="button"
                aria-label={`Day ${dayNumber}: ${state}${current ? ", your current step" : ""}`}
                aria-pressed={selectedDay === dayNumber}
                title={`View day ${dayNumber} · ${state}`}
                onClick={() => setSelectedDay(dayNumber)}
              >
                <span className="step-number">{dayNumber}</span>
                <span className="step-label">Day {dayNumber}</span>
                {playerHere && (
                  <img
                    className={`step-climber${startDate ? "" : " idle"}`}
                    src="/journey-climber-v1-small.png"
                    alt=""
                    aria-hidden="true"
                    fetchPriority="high"
                  />
                )}
                {completed ? (
                  <Check size={13} aria-label="Completed mission logged" />
                ) : locked ? (
                  <LockKeyhole size={11} aria-hidden="true" />
                ) : null}
              </button>
            );
          })}
        </div>
        <div className="step-day-detail" aria-live="polite">
          <b>Day {selectedDay}</b>
          {startDate ? (
            <>
              <span>{selectedDateKey}</span>
              {selectedDay > elapsed ? (
                <small>Step locked · unlocks on this date</small>
              ) : (
                <small>{selectedCompleted}/7 missions completed · {selectedLogs.length} logged</small>
              )}
            </>
          ) : (
            <small>Start a ranked challenge to unlock your journey.</small>
          )}
        </div>
      </div>
    </section>
  );
}
