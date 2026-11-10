import { useCallback, useEffect, useState } from "react";
import { Flag, LoaderCircle, Plus, ShieldCheck, Trophy } from "lucide-react";
import type { User } from "firebase/auth";
import type { CommunityChallenge } from "./types";
import { challengeTextError } from "./challengePolicy";
import {
  communityAdminCounts,
  joinCommunityChallenge,
  leaveCommunityChallenge,
  listCommunityChallenges,
  listCommunityReports,
  listCommunityStandings,
  listMyCommunitySubmissions,
  listMyCommunityParticipation,
  logCommunityCheckin,
  moderateCommunityChallenge,
  reportCommunityChallenge,
  resolveCommunityReport,
  submitCommunityChallenge,
} from "./communityChallengeService";

type Props = {
  user: User | null;
  adminUser: User | null;
  adminOpen: boolean;
  onSignIn: () => void;
  onAdminLogin: (id: string, password: string) => Promise<void>;
  onAdminLogout: () => void;
};
type Report = {
  id: string;
  challengeId: string;
  reporterUid: string;
  reason: string;
};
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const datePlus = (from: string, days: number) => {
  const d = new Date(`${from}T12:00:00`);
  d.setDate(d.getDate() + days - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const submissionStatus = (challenge: CommunityChallenge) =>
  challenge.status === "published" && challenge.endDate < today()
    ? "completed"
    : challenge.status;
export default function CommunityChallenges({
  user,
  adminUser,
  adminOpen,
  onSignIn,
  onAdminLogin,
  onAdminLogout,
}: Props) {
  const [rows, setRows] = useState<CommunityChallenge[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [mySubmissions, setMySubmissions] = useState<CommunityChallenge[]>([]);
  const [joined, setJoined] = useState<Record<string, boolean>>({});
  const [checkins, setCheckins] = useState<Record<string, string[]>>({});
  const [standings, setStandings] = useState<
    Record<
      string,
      { uid: string; completedDays: number; currentStreak: number }[]
    >
  >({});
  const admin = Boolean(adminUser);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [adminId, setAdminId] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminBusy, setAdminBusy] = useState(false);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [duration, setDuration] = useState(21);
  const [start, setStart] = useState(today());
  const [reporting, setReporting] = useState("");
  const [reason, setReason] = useState("");
  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const [list, submissions] = await Promise.all([
        listCommunityChallenges(),
        listMyCommunitySubmissions(user.uid),
      ]);
      setRows(list);
      setMySubmissions(submissions);
      const nextJoined: Record<string, boolean> = {},
        nextLogs: Record<string, string[]> = {};
      const participation = await listMyCommunityParticipation(user.uid);
      participation.forEach(({ challengeId, checkins }) => {
        nextJoined[challengeId] = true;
        nextLogs[challengeId] = checkins;
      });
      setJoined(nextJoined);
      setCheckins(nextLogs);
      if (adminUser) {
        const [flags, count] = await Promise.all([
          listCommunityReports(),
          communityAdminCounts(),
        ]);
        setReports(flags);
        setStats(count);
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Community challenges are unavailable. Enable Firestore and deploy rules.",
      );
    } finally {
      setLoading(false);
    }
  }, [user, adminUser]);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  async function run(action: () => Promise<void>, message: string) {
    setError("");
    setNotice("");
    try {
      await action();
      setNotice(message);
      await refresh();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Action could not be completed.",
      );
    }
  }
  async function loginAdmin() {
    setAdminBusy(true);
    setError("");
    try {
      await onAdminLogin(adminId, adminPassword);
      setAdminPassword("");
      setNotice(
        "Admin session opened separately. Your player account remains signed in.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Admin sign-in failed.");
    } finally {
      setAdminBusy(false);
    }
  }
  async function create() {
    if (!user) return;
    const textError = challengeTextError(`${title} ${goal}`);
    if (textError) {
      setError(textError);
      return;
    }
    if (title.trim().length < 4 || goal.trim().length < 8) {
      setError(
        "Use a challenge name of at least 4 characters and a clear goal of at least 8 characters.",
      );
      return;
    }
    if (!Number.isInteger(duration) || duration < 1 || duration > 90) {
      setError("Duration must be between 1 and 90 days.");
      return;
    }
    if (!start || start < today()) {
      setError("Start date must be today or later.");
      return;
    }
    const end = datePlus(start, duration);
    await run(
      () =>
        submitCommunityChallenge(
          user,
          title.trim(),
          goal.trim(),
          duration,
          start,
          end,
        ),
      "Challenge published. Players can join now; reports go to admin review and do not hide it.",
    );
    setCreating(false);
    setTitle("");
    setGoal("");
  }
  if (!user)
    return (
      <section className="panel leaderboard-gate">
        <Trophy />
        <h2>Join the community arena</h2>
        <p className="muted">
          Sign in with Google to browse, create, join and report community
          challenges.
        </p>
        <button className="primary" onClick={onSignIn}>
          Sign in with Google
        </button>
      </section>
    );
  return (
    <section className="community-challenges">
      <div className="community-toolbar">
        <div>
          <p className="eyebrow">PLAYER COMMUNITY · SELF-REPORTED</p>
          <h2>Global challenges</h2>
          <p className="muted">
            Challenges publish immediately. Players can report concerns for
            admin review; a challenge stays live unless an admin removes it.
          </p>
        </div>
        <div className="button-row">
          <button className="primary" onClick={() => setCreating((v) => !v)}>
            <Plus size={16} /> Create challenge
          </button>
          {adminOpen && admin && (
            <button onClick={onAdminLogout}>Admin logout</button>
          )}
        </div>
      </div>
      {adminOpen && !admin && (
        <section className="panel community-admin-gate">
          <ShieldCheck />
          <div>
            <h2>Separate admin sign-in</h2>
            <p className="muted">
              Use the Firebase Auth admin account. It runs in a separate
              session; your Google player remains signed in. The password is
              sent to Firebase Auth and is never saved in app storage.
            </p>
            <label className="field-label">
              Admin ID
              <input
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                autoComplete="username"
              />
            </label>
            <label className="field-label">
              Password
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                autoComplete="current-password"
                onKeyDown={(e) => {
                  if (e.key === "Enter") void loginAdmin();
                }}
              />
            </label>
            <div className="button-row">
              <button
                className="primary"
                disabled={adminBusy || !adminId || !adminPassword}
                onClick={() => void loginAdmin()}
              >
                {adminBusy ? "Signing in…" : "Admin sign in"}
              </button>
              <button onClick={onAdminLogout}>Close admin</button>
            </div>
          </div>
        </section>
      )}
      {adminOpen && admin && (
        <section className="panel community-admin">
          <div className="section-head">
            <div>
              <p className="eyebrow">ADMIN REVIEW</p>
              <h2>Community moderation</h2>
              <p className="muted">
                Signed in as the allowlisted admin account · the Google player
                session stays active separately.
              </p>
            </div>
            <ShieldCheck />
          </div>
          <div className="community-stats">
            {Object.entries(stats).map(([k, v]) => (
              <div key={k}>
                <b>{v}</b>
                <small>{k.replace(/[A-Z]/g, " $&")}</small>
              </div>
            ))}
          </div>
          <p className="muted">
            User counts cover opted-in leaderboard profiles only; Firebase does
            not expose total account registrations to this client. Challenge and
            check-in totals are self-reported.
          </p>
          <h3>Reports awaiting review ({reports.length})</h3>
          {reports.map((r) => (
            <article className="panel community-review-row" key={r.id}>
              <div>
                <b>Report · {r.reason}</b>
                <small>
                  Challenge {r.challengeId} · report by{" "}
                  {r.reporterUid.slice(0, 8)}
                </small>
              </div>
              <div className="button-row">
                <button
                  onClick={() =>
                    void run(async () => {
                      await resolveCommunityReport(r.id, "kept");
                    }, "Challenge kept; report resolved.")
                  }
                >
                  Keep
                </button>
                <button
                  className="danger"
                  onClick={() =>
                    void run(async () => {
                      await moderateCommunityChallenge(
                        r.challengeId,
                        "removed",
                      );
                      await resolveCommunityReport(r.id, "removed");
                    }, "Challenge removed and report resolved.")
                  }
                >
                  Remove for everyone
                </button>
              </div>
            </article>
          ))}
          {!reports.length && (
            <p className="muted">Nothing waiting for review.</p>
          )}
        </section>
      )}
      {creating && (
        <section className="panel community-create">
          <h2>Submit a community challenge</h2>
          <p className="muted">
            This challenge will go live as soon as you create it. Keep names
            respectful and goals safe, specific, and achievable; players can
            report concerns to admin review.
          </p>
          <label className="field-label">
            Challenge name
            <input
              maxLength={60}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 30-minute daily walk"
            />
          </label>
          <label className="field-label">
            Daily goal
            <input
              maxLength={240}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Describe what participants check in each day"
            />
          </label>
          <div className="community-form-grid">
            <label className="field-label">
              Duration (days)
              <input
                type="number"
                min="1"
                max="90"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </label>
            <label className="field-label">
              Start date
              <input
                type="date"
                min={today()}
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </label>
          </div>
          <button className="primary" onClick={() => void create()}>
            Publish challenge
          </button>
        </section>
      )}
      {reporting && (
        <section className="panel community-create">
          <h3>Report this challenge</h3>
          <label className="field-label">
            Reason
            <select value={reason} onChange={(e) => setReason(e.target.value)}>
              <option value="">Choose reason</option>
              <option>Offensive or abusive</option>
              <option>Unsafe or harmful</option>
              <option>Spam or misleading</option>
              <option>Other</option>
            </select>
          </label>
          <div className="button-row">
            <button
              className="primary"
              disabled={!reason}
              onClick={() =>
                void run(
                  () => reportCommunityChallenge(reporting, user.uid, reason),
                  "Report sent to admin review.",
                ).then(() => setReporting(""))
              }
            >
              Send report
            </button>
            <button onClick={() => setReporting("")}>Cancel</button>
          </div>
        </section>
      )}
      {error && (
        <p className="leaderboard-error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="leaderboard-notice" role="status">
          {notice}
        </p>
      )}
      {mySubmissions.length > 0 && (
        <section className="panel community-submissions">
          <h3>My challenge submissions</h3>
          {mySubmissions.map((submission) => (
            <div className="community-submission-row" key={submission.id}>
              <span>
                <b>{submission.title}</b>
                <small>{submission.goal}</small>
              </span>
              <strong
                className={`submission-status ${submissionStatus(submission)}`}
              >
                {submissionStatus(submission).replaceAll("_", " ")}
              </strong>
            </div>
          ))}
        </section>
      )}
      {loading ? (
        <div className="community-empty">
          <LoaderCircle className="spin" /> Loading community challenges…
        </div>
      ) : rows.length === 0 ? (
        <div className="panel community-empty">
          No live challenges yet. Create one to start the community arena.
        </div>
      ) : (
        <div className="community-list">
          {rows.map((c) => {
            const todayKey = today(),
              inside = todayKey >= c.startDate && todayKey <= c.endDate,
              phase =
                todayKey < c.startDate
                  ? "UPCOMING"
                  : todayKey > c.endDate
                    ? "COMPLETED"
                    : "LIVE",
              dates = Array.from({ length: c.durationDays }, (_, i) =>
                datePlus(c.startDate, i),
              ),
              done = checkins[c.id] ?? [];
            return (
              <article className="panel community-card" key={c.id}>
                <div className="community-card-head">
                  <div>
                    <span className="community-chip">
                      {phase} · {c.durationDays}-DAY COMMUNITY
                    </span>
                    <h3>{c.title}</h3>
                    <p>{c.goal}</p>
                    <small>
                      Created by {c.ownerName} · {c.startDate} → {c.endDate}
                    </small>
                  </div>
                  <button
                    className="community-report"
                    title="Report challenge"
                    aria-label={`Report ${c.title}`}
                    onClick={() => {
                      setReporting(c.id);
                      setReason("");
                    }}
                  >
                    <Flag size={16} />
                  </button>
                </div>
                <div className="community-progress">
                  <span>
                    {done.length}/{c.durationDays} check-ins ·{" "}
                    {done.filter((d) => d <= todayKey).length} completed
                  </span>
                  <div className="progress-track">
                    <div
                      style={{
                        width: `${Math.min(100, Math.round((done.length / c.durationDays) * 100))}%`,
                      }}
                    />
                  </div>
                  <div className="community-days">
                    {dates.map((date, i) => (
                      <button
                        key={date}
                        aria-label={`Day ${i + 1}${done.includes(date) ? ", completed" : ""}`}
                        className={
                          done.includes(date)
                            ? "community-day done"
                            : "community-day"
                        }
                        disabled={!joined[c.id] || !inside || date > todayKey}
                        onClick={() =>
                          void run(
                            () =>
                              logCommunityCheckin(
                                c.id,
                                user.uid,
                                date,
                                !done.includes(date),
                              ),
                            "Check-in updated.",
                          )
                        }
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  className="community-standings-toggle"
                  onClick={() => {
                    if (standings[c.id]) {
                      setStandings(({ [c.id]: _omit, ...rest }) => rest);
                      return;
                    }
                    void listCommunityStandings(c.id)
                      .then((result) =>
                        setStandings((old) => ({ ...old, [c.id]: result })),
                      )
                      .catch((e) =>
                        setError(
                          e instanceof Error
                            ? e.message
                            : "Standings could not load.",
                        ),
                      );
                  }}
                >
                  {" "}
                  {standings[c.id] ? "Hide standings" : "View live standings"}
                </button>
                {standings[c.id] && (
                  <div className="community-standings">
                    <b>Standings · up to 50 participants</b>
                    {standings[c.id].length ? (
                      standings[c.id].slice(0, 10).map((entry, index) => (
                        <div key={entry.uid}>
                          <span>
                            #{index + 1} Player {entry.uid.slice(0, 6)}
                            {entry.uid === user.uid ? " · You" : ""}
                          </span>
                          <b>
                            {entry.completedDays} days · {entry.currentStreak}{" "}
                            streak
                          </b>
                        </div>
                      ))
                    ) : (
                      <small>No joined players yet.</small>
                    )}
                  </div>
                )}
                {joined[c.id] ? (
                  <div className="button-row">
                    <b className="muted">
                      {inside
                        ? "You're competing"
                        : "Joined · challenge dates shown above"}
                    </b>
                    <button
                      className="logout-link"
                      onClick={() =>
                        void run(
                          () => leaveCommunityChallenge(c.id, user.uid),
                          "You left this challenge.",
                        )
                      }
                    >
                      Leave challenge
                    </button>
                  </div>
                ) : (
                  <button
                    className="primary"
                    disabled={todayKey > c.endDate}
                    onClick={() =>
                      void run(
                        () => joinCommunityChallenge(c.id, user.uid),
                        "Joined. Log one daily check-in while the challenge is active.",
                      )
                    }
                  >
                    Join challenge
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}
      <p className="community-integrity">
        New challenges are visible to signed-in players immediately. Names use
        an automated language filter and can be reported; the filter is not
        perfect. Admins may remove reported challenges. Check-ins are
        user-reported. Do not use this board for prizes or health claims.
      </p>
    </section>
  );
}
