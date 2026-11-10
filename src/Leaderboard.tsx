import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, Crown, LoaderCircle, RefreshCw, ShieldCheck, Trophy } from "lucide-react";
import type { User } from "firebase/auth";
import type { AppData } from "./types";
import {
  hasLeaderboardProfile,
  loadLeaderboard,
  publishLeaderboardProfile,
  removeLeaderboardProfile,
  type LeaderboardMetric,
  type PublicPlayer,
} from "./leaderboardService";

type Props = {
  user: User | null;
  data: AppData;
  onSignIn: () => void;
};

const metricOptions: { id: LeaderboardMetric; label: string; detail: string }[] = [
  { id: "lifetimeXp", label: "Lifetime XP", detail: "Total XP earned from completed main missions" },
  { id: "tierScore", label: "Combined tier score", detail: "Sum of the four independent rank tiers" },
  { id: "weeklyXp", label: "Last 7 days XP", detail: "Completed mission XP in the player's trailing 7 days" },
  { id: "challengeWins", label: "21-day challenge wins", detail: "Successfully completed ranked challenges" },
];

const displayedValue = (player: PublicPlayer, metric: LeaderboardMetric) => {
  switch (metric) {
    case "lifetimeXp": return `${player.lifetimeXp.toLocaleString()} XP`;
    case "tierScore": return `${player.tierScore} pts`;
    case "weeklyXp": return `${player.weeklyXp.toLocaleString()} XP`;
    case "challengeWins": return `${player.challengeWins} wins`;
  }
};

export default function Leaderboard({ user, data, onSignIn }: Props) {
  const [metric, setMetric] = useState<LeaderboardMetric>("lifetimeXp");
  const [players, setPlayers] = useState<PublicPlayer[]>([]);
  const [joined, setJoined] = useState(false);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const [rows, optedIn] = await Promise.all([
        loadLeaderboard(metric),
        hasLeaderboardProfile(user.uid),
      ]);
      setPlayers(rows);
      setJoined(optedIn);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The leaderboard could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [metric, user]);

  useEffect(() => { void refresh(); }, [refresh]);

  const ownPosition = useMemo(
    () => user ? players.findIndex((player) => player.uid === user.uid) + 1 : 0,
    [players, user],
  );

  async function publish() {
    if (!user) return;
    if (!joined && !consent) {
      setError("Review the privacy notice and confirm before joining the public board.");
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await publishLeaderboardProfile(user, data);
      setJoined(true);
      setConsent(false);
      setNotice("Your leaderboard snapshot was published. It will not update until you publish again.");
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Your leaderboard snapshot could not be published.");
    } finally {
      setSaving(false);
    }
  }

  async function leave() {
    if (!user) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await removeLeaderboardProfile(user.uid);
      setJoined(false);
      setPlayers((current) => current.filter((player) => player.uid !== user.uid));
      setNotice("Your public leaderboard profile was removed.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Your leaderboard profile could not be removed.");
    } finally {
      setSaving(false);
    }
  }

  const selectedMetric = metricOptions.find((option) => option.id === metric)!;

  return (
    <div className="leaderboard-page">
      <header className="leaderboard-heading">
        <div>
          <p className="eyebrow">PLAYER NETWORK · OPT-IN</p>
          <h1>Global leaderboard</h1>
          <p className="muted">Compare public player snapshots. Your private logs stay on your device.</p>
        </div>
        <div className="leaderboard-mark"><Trophy size={25} /></div>
      </header>

      <section className="panel leaderboard-controls">
        <label className="leaderboard-sort">
          <span>Rank players by</span>
          <select value={metric} onChange={(event) => setMetric(event.target.value as LeaderboardMetric)}>
            {metricOptions.map((option) => <option value={option.id} key={option.id}>{option.label}</option>)}
          </select>
          <small className="muted">{selectedMetric.detail}</small>
        </label>
        <button className="leaderboard-refresh" type="button" onClick={() => void refresh()} disabled={!user || loading}>
          {loading ? <LoaderCircle size={16} className="spin" /> : <RefreshCw size={16} />}
          Refresh
        </button>
      </section>

      {!user ? (
        <section className="panel leaderboard-gate">
          <ShieldCheck size={25} />
          <h2>Sign in to view the player network</h2>
          <p className="muted">Only Google-authenticated players can view or join this leaderboard.</p>
          <button className="primary" type="button" onClick={onSignIn}>Sign in with Google</button>
        </section>
      ) : (
        <>
          <section className="panel leaderboard-optin">
            <div className="leaderboard-optin-copy">
              <p className="eyebrow">YOUR PUBLIC PLAYER CARD</p>
              <h2>{joined ? "You're on the board" : "Join the leaderboard"}</h2>
              <p className="muted">
                {joined
                  ? `Your current position for ${selectedMetric.label.toLowerCase()} is ${ownPosition || "outside the top 100"}. Update your snapshot when you want.`
                  : "Joining is optional. Your profile is private until you publish it."}
              </p>
            </div>
            <div className="leaderboard-actions">
              {!joined && (
                <label className="leaderboard-consent">
                  <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
                  <span>I agree to show my display name, avatar, lifetime XP, weekly XP, four ranks, combined tier score, and ranked challenge wins to signed-in players.</span>
                </label>
              )}
              <div className="leaderboard-action-row">
                <button className="primary" type="button" onClick={() => void publish()} disabled={saving || (!joined && !consent)}>
                  {saving ? "Saving…" : joined ? "Publish score update" : "Join leaderboard"}
                </button>
                {joined && <button className="leaderboard-leave" type="button" onClick={() => void leave()} disabled={saving}>Remove my profile</button>}
              </div>
            </div>
            <p className="leaderboard-privacy"><ShieldCheck size={15} /> Email, age, notes, mission history, workout details, nutrition, and private reflections are never published. Scores are self-reported and are not server-verified.</p>
          </section>

          {notice && <p className="leaderboard-notice" role="status">{notice}</p>}
          {error && <p className="leaderboard-error" role="alert">{error}</p>}

          <section className="panel leaderboard-table-wrap">
            <div className="section-head leaderboard-table-heading">
              <div><p className="eyebrow">TOP 100 · {selectedMetric.label.toUpperCase()}</p><h2>Player standings</h2></div>
              <BarChart3 size={20} />
            </div>
            {loading ? (
              <div className="leaderboard-empty"><LoaderCircle className="spin" /><span>Loading player standings…</span></div>
            ) : error ? (
              <div className="leaderboard-empty"><span>Connect Firestore and deploy the included security rules to enable the board.</span></div>
            ) : players.length ? (
              <div className="leaderboard-rows">
                {players.map((player, index) => (
                  <article className={`leaderboard-player${player.uid === user.uid ? " is-you" : ""}`} key={player.uid}>
                    <span className="leaderboard-rank">{index === 0 ? <Crown size={17} /> : `#${index + 1}`}</span>
                    <span className="leaderboard-avatar">{player.avatarId}</span>
                    <span className="leaderboard-player-name"><b>{player.displayName}{player.uid === user.uid ? " · You" : ""}</b><small>{player.fitnessRank} · {player.studyRank} · {player.careerRank} · {player.disciplineRank}</small></span>
                    <b className="leaderboard-score">{displayedValue(player, metric)}</b>
                  </article>
                ))}
              </div>
            ) : (
              <div className="leaderboard-empty"><Trophy size={28} /><span>No public player cards yet. Join to set the first score.</span></div>
            )}
          </section>
          <p className="leaderboard-footnote">Lifetime XP counts actual logged mission XP. Combined tier score adds each ladder independently (Bronze III = 0 points through Emerald I = 17 points per category). Weekly XP uses each player's own last seven local calendar dates.</p>
        </>
      )}
    </div>
  );
}
