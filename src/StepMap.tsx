import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import type { MissionLog } from "./types";
import { LANDSCAPE_JOURNEY, PORTRAIT_JOURNEY } from "./journeyPath";

const InteractiveWorld3D = lazy(() => import("./InteractiveWorld3D"));

type Props = { startDate?: string; missions: MissionLog[] };

const localDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export default function StepMap({ startDate, missions }: Props) {
  const todayKey = localDateKey(new Date());
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
  const [portrait, setPortrait] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 620px)").matches,
  );

  useEffect(() => {
    if (startDate) setSelectedDay(elapsed);
  }, [startDate, elapsed]);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 620px)");
    const update = () => setPortrait(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const challengeEndKey = useMemo(() => {
    if (!startDate) return "";
    const end = new Date(`${startDate}T12:00:00`);
    end.setDate(end.getDate() + 20);
    return localDateKey(end);
  }, [startDate]);
  const completedDates = useMemo(
    () => new Set(
      missions
        .filter((entry) => entry.status === "complete" && (!startDate || (entry.date >= startDate && entry.date <= challengeEndKey)))
        .map((entry) => entry.date),
    ),
    [missions, startDate, challengeEndKey],
  );
  const completedDays = useMemo(() => {
    if (!startDate) return [];
    return Array.from({ length: 21 }, (_, index) => {
      const date = new Date(`${startDate}T12:00:00`);
      date.setDate(date.getDate() + index);
      return completedDates.has(localDateKey(date)) ? index + 1 : 0;
    }).filter(Boolean);
  }, [completedDates, startDate]);
  const points = portrait ? PORTRAIT_JOURNEY : LANDSCAPE_JOURNEY;
  const selectedDate = startDate ? new Date(`${startDate}T12:00:00`) : undefined;
  selectedDate?.setDate(selectedDate.getDate() + selectedDay - 1);
  const selectedDateKey = selectedDate ? localDateKey(selectedDate) : "";
  const selectedLogs = missions.filter((entry) => entry.date === selectedDateKey);
  const selectedCompleted = selectedLogs.filter((entry) => entry.status === "complete").length;

  return (
    <section className={`step-map panel${portrait ? " step-map-portrait" : ""}`} aria-label="21-day challenge path">
      <Suspense fallback={null}>
        <InteractiveWorld3D
          kind="journey"
          className="journey-world"
          points={points}
          currentDay={Math.max(1, elapsed)}
          completedDays={completedDays}
        />
      </Suspense>
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
        </div>
        <div className="step-path" aria-label="Select a challenge day">
          {points.map((point, index) => {
            const dayNumber = index + 1;
            const date = startDate ? new Date(`${startDate}T12:00:00`) : undefined;
            date?.setDate(date.getDate() + index);
            const dateKey = date ? localDateKey(date) : "";
            const locked = !startDate || dayNumber > elapsed;
            const completed = Boolean(dateKey && completedDates.has(dateKey));
            const current = Boolean(startDate && dayNumber === elapsed);
            const state = current ? "current" : completed ? "complete" : locked ? "locked" : "open";
            return (
              <button
                className={`step-node ${state}${selectedDay === dayNumber ? " selected" : ""}`}
                key={dayNumber}
                type="button"
                style={{ left: `${point.x}%`, top: `${point.y}%` }}
                aria-label={`Day ${dayNumber}: ${state}${current ? ", your current step" : ""}`}
                aria-pressed={selectedDay === dayNumber}
                title={`View day ${dayNumber} · ${state}`}
                onClick={() => setSelectedDay(dayNumber)}
              >
                <span className="step-number">{dayNumber}</span>
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
