import { useState } from "react";
import { CalendarDays, Check, Plus, X } from "lucide-react";
import type { PersonalChallenge, PersonalChallengeLog } from "./types";

type Props = {
  challenges: PersonalChallenge[];
  logs: PersonalChallengeLog[];
  activeId?: string;
  focus?: "main" | "personal";
  onCreate: (title: string, goal: string, durationDays: number) => void;
  onLog: (challengeId: string, date: string, completed: boolean) => void;
  onCancel: (challengeId: string) => void;
  onFocus: (focus: "main" | "personal") => void;
};

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const addDays = (date: string, count: number) => {
  const d = new Date(`${date}T12:00:00`);
  d.setDate(d.getDate() + count);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function PersonalChallenges({
  challenges,
  logs,
  activeId,
  focus = "main",
  onCreate,
  onLog,
  onCancel,
  onFocus,
}: Props) {
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [duration, setDuration] = useState(21);
  const active = challenges.find(
    (challenge) => challenge.id === activeId && challenge.status === "active",
  );
  const create = () => {
    if (
      !title.trim() ||
      !goal.trim() ||
      !Number.isInteger(duration) ||
      duration < 1 ||
      duration > 90
    )
      return;
    onCreate(title.trim(), goal.trim(), duration);
    setTitle("");
    setGoal("");
    setDuration(21);
    setCreating(false);
  };

  return (
    <section className="personal-challenges">
      <div className="section-head">
        <div>
          <p className="eyebrow">SELF-DIRECTED TRACKING</p>
          <h1>Personal challenges</h1>
        </div>
        <button
          className="primary"
          onClick={() => setCreating((value) => !value)}
          disabled={!!active}
        >
          <Plus size={16} />
          {creating ? "Close" : "Create challenge"}
        </button>
      </div>
      <p className="muted">
        Set one personal goal and track it day by day. Personal challenges do
        not award XP or change rank progress.
      </p>
      {creating && (
        <div className="panel module-form create-challenge-form">
          <h2>Build your challenge</h2>
          <label className="field-label">
            Challenge name
            <input
              maxLength={48}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Morning run streak"
            />
          </label>
          <label className="field-label">
            Daily goal
            <input
              maxLength={120}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Run for at least 20 minutes"
            />
          </label>
          <label className="field-label">
            Duration in days
            <input
              type="number"
              min="1"
              max="90"
              step="1"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </label>
          <button
            className="primary"
            disabled={
              !title.trim() || !goal.trim() || duration < 1 || duration > 90
            }
            onClick={create}
          >
            Start personal challenge
          </button>
        </div>
      )}
      {active && (
        <article className="panel personal-challenge-card active-personal-challenge">
          <div className="personal-challenge-heading">
            <div>
              <p className="eyebrow">ACTIVE · NO XP REWARDS</p>
              <h2>{active.title}</h2>
            </div>
            <button
              className="icon-btn cancel-challenge"
              aria-label={`Cancel ${active.title}`}
              title="Cancel challenge"
              onClick={() => onCancel(active.id)}
            >
              <X size={18} />
            </button>
          </div>
          <p className="muted">{active.goal}</p>
          <p className="personal-date">
            <CalendarDays size={15} />
            {active.startDate} → {active.endDate}
          </p>
          <div className="personal-day-list">
            {Array.from({ length: active.durationDays }, (_, i) => {
              const date = addDays(active.startDate, i);
              const entry = logs.find(
                (item) => item.challengeId === active.id && item.date === date,
              );
              return (
                <button
                  key={date}
                  className={`personal-day ${entry?.completed ? "is-complete" : ""}`}
                  disabled={date > today()}
                  onClick={() => onLog(active.id, date, !entry?.completed)}
                >
                  <span>Day {i + 1}</span>
                  <small>{date}</small>
                  {entry?.completed ? (
                    <Check size={17} />
                  ) : (
                    <span className="day-dot" />
                  )}
                </button>
              );
            })}
          </div>
          <div className="personal-challenge-actions">
            <button className="primary" onClick={() => onFocus("personal")}>
              Show on dashboard
            </button>
            <span className="muted">
              {
                logs.filter(
                  (item) => item.challengeId === active.id && item.completed,
                ).length
              }
              /{active.durationDays} days complete
            </span>
          </div>
        </article>
      )}
      {!challenges.length && !creating && (
        <div className="panel empty-state challenge-empty">
          <Plus size={22} />
          <b>Your first personal challenge starts here.</b>
          <span>
            Choose a daily action, set a duration, and track it without
            affecting the rank system.
          </span>
        </div>
      )}
      {!!challenges.length && (
        <div className="personal-challenge-history">
          <h2>Challenge history</h2>
          {challenges
            .filter((item) => item.id !== active?.id)
            .map((challenge) => (
              <article className="panel history-row" key={challenge.id}>
                <span>
                  <b>{challenge.title}</b>
                  <small>{challenge.goal}</small>
                </span>
                <b>{challenge.status.toUpperCase()}</b>
                <span>
                  {
                    logs.filter(
                      (item) =>
                        item.challengeId === challenge.id && item.completed,
                    ).length
                  }
                  /{challenge.durationDays} days
                </span>
              </article>
            ))}
        </div>
      )}
      <div className="panel challenge-focus-settings">
        <b>Dashboard challenge</b>
        <p className="muted">
          Switch between this personal goal and the ranked 21-day challenge.
          Both continue tracking in the background.
        </p>
        <div className="button-row">
          <button
            className={focus === "main" ? "selected" : ""}
            onClick={() => onFocus("main")}
          >
            Main challenge
          </button>
          <button
            className={focus === "personal" ? "selected" : ""}
            disabled={!active}
            onClick={() => onFocus("personal")}
          >
            Personal challenge
          </button>
        </div>
      </div>
    </section>
  );
}
