import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type DocumentData,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { firebaseApp } from "./firebaseAuth";
import type { AppData, Category, Tier } from "./types";

export type LeaderboardMetric =
  "lifetimeXp" | "tierScore" | "weeklyXp" | "challengeWins";
export type PublicPlayer = {
  uid: string;
  displayName: string;
  avatarId: string;
  lifetimeXp: number;
  tierScore: number;
  weeklyXp: number;
  challengeWins: number;
  mainChallengeCompletions: number;
  fitnessRank: string;
  studyRank: string;
  careerRank: string;
  disciplineRank: string;
};

const categories: Category[] = ["fitness", "study", "career", "discipline"];
const metricField: Record<LeaderboardMetric, string> = {
  lifetimeXp: "lifetimeXp",
  tierScore: "tierScore",
  weeklyXp: "weeklyXp",
  challengeWins: "challengeWins",
};

function database() {
  if (!firebaseApp)
    throw new Error(
      "Google sign-in must be configured before opening the leaderboard.",
    );
  return getFirestore(firebaseApp);
}

function tierScore(tier: Tier) {
  const rank = [
    "Bronze",
    "Silver",
    "Gold",
    "Platinum",
    "Diamond",
    "Emerald",
  ].indexOf(tier.rank);
  return Math.max(0, rank) * 3 + (3 - tier.level);
}

function formatTier(tier: Tier) {
  return `${tier.rank} ${tier.level === 3 ? "III" : tier.level === 2 ? "II" : "I"}`;
}

function trailingWeekXp(data: AppData, today = new Date()) {
  const dateKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const start = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  start.setDate(start.getDate() - 6);
  const firstDay = dateKey(start);
  const lastDay = dateKey(today);
  return data.missions.reduce(
    (sum, item) =>
      item.status === "complete" &&
      item.date >= firstDay &&
      item.date <= lastDay
        ? sum + item.xp
        : sum,
    0,
  );
}

export function makePublicPlayer(
  user: User,
  data: AppData,
): Omit<PublicPlayer, "uid"> {
  const displayName =
    (data.profile.displayName || user.displayName || "Player")
      .replace(/[\u0000-\u001f\u007f]/g, "")
      .trim()
      .slice(0, 40) || "Player";
  return {
    displayName,
    avatarId: String(data.profile.avatarId || "⚔️").slice(0, 8),
    lifetimeXp: Math.max(0, Math.floor(data.profile.lifetimeXp)),
    weeklyXp: trailingWeekXp(data),
    tierScore: categories.reduce(
      (score, category) => score + tierScore(data.ranks[category].tier),
      0,
    ),
    challengeWins: data.challenges.filter(
      (challenge) => challenge.status === "passed",
    ).length,
    mainChallengeCompletions: data.challenges.filter(
      (challenge) => challenge.status === "passed",
    ).length,
    fitnessRank: formatTier(data.ranks.fitness.tier),
    studyRank: formatTier(data.ranks.study.tier),
    careerRank: formatTier(data.ranks.career.tier),
    disciplineRank: formatTier(data.ranks.discipline.tier),
  };
}

function toPublicPlayer(uid: string, value: DocumentData): PublicPlayer {
  return {
    uid,
    displayName: String(value.displayName ?? "Player"),
    avatarId: String(value.avatarId ?? "⚔️"),
    lifetimeXp: Number(value.lifetimeXp ?? 0),
    tierScore: Number(value.tierScore ?? 0),
    weeklyXp: Number(value.weeklyXp ?? 0),
    challengeWins: Number(value.challengeWins ?? 0),
    mainChallengeCompletions: Number(
      value.mainChallengeCompletions ?? value.challengeWins ?? 0,
    ),
    fitnessRank: String(value.fitnessRank ?? "Bronze III"),
    studyRank: String(value.studyRank ?? "Bronze III"),
    careerRank: String(value.careerRank ?? "Bronze III"),
    disciplineRank: String(value.disciplineRank ?? "Bronze III"),
  };
}

export async function loadLeaderboard(metric: LeaderboardMetric) {
  const db = database();
  const results = await getDocs(
    query(
      collection(db, "leaderboard"),
      orderBy(metricField[metric], "desc"),
      limit(100),
    ),
  );
  return results.docs.map((entry) => toPublicPlayer(entry.id, entry.data()));
}

export async function hasLeaderboardProfile(uid: string) {
  return (await getDoc(doc(database(), "leaderboard", uid))).exists();
}

export async function publishLeaderboardProfile(user: User, data: AppData) {
  const db = database();
  const reference = doc(db, "leaderboard", user.uid);
  const existing = await getDoc(reference);
  const publicStats = makePublicPlayer(user, data);
  await setDoc(reference, {
    ...publicStats,
    createdAt: existing.exists()
      ? existing.data().createdAt
      : serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function removeLeaderboardProfile(uid: string) {
  await deleteDoc(doc(database(), "leaderboard", uid));
}
