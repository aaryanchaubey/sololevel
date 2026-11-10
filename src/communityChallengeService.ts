import {
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { firebaseAdminApp, firebaseApp } from "./firebaseAuth";
import type { CommunityChallenge } from "./types";

function store() {
  if (!firebaseApp)
    throw new Error("Firebase is not configured for community challenges.");
  return getFirestore(firebaseApp);
}
function adminStore() {
  if (!firebaseAdminApp)
    throw new Error("Firebase admin identity is not configured.");
  return getFirestore(firebaseAdminApp);
}
const fromDoc = (
  id: string,
  d: Record<string, unknown>,
): CommunityChallenge => ({
  id,
  ownerUid: String(d.ownerUid ?? ""),
  ownerName: String(d.ownerName ?? "Player"),
  title: String(d.title ?? ""),
  goal: String(d.goal ?? ""),
  durationDays: Number(d.durationDays ?? 21),
  startDate: String(d.startDate ?? ""),
  endDate: String(d.endDate ?? ""),
  status: d.status as CommunityChallenge["status"],
  createdAt: String(d.createdAt ?? ""),
  participantCount: Number(d.participantCount ?? 0),
});
export async function listCommunityChallenges() {
  const rows = await getDocs(
    query(
      collection(store(), "globalChallenges"),
      where("status", "==", "published"),
      orderBy("createdAt", "desc"),
      limit(100),
    ),
  );
  return rows.docs.map((row) => fromDoc(row.id, row.data()));
}
export async function listMyCommunitySubmissions(uid: string) {
  const rows = await getDocs(
    query(
      collection(store(), "globalChallenges"),
      where("ownerUid", "==", uid),
      limit(50),
    ),
  );
  return rows.docs.map((row) => fromDoc(row.id, row.data()));
}
export async function listReviewQueue() {
  const rows = await getDocs(
    query(
      collection(adminStore(), "globalChallenges"),
      where("status", "==", "pending_review"),
      orderBy("createdAt", "asc"),
      limit(100),
    ),
  );
  return rows.docs.map((row) => fromDoc(row.id, row.data()));
}
export async function submitCommunityChallenge(
  user: User,
  title: string,
  goal: string,
  durationDays: number,
  startDate: string,
  endDate: string,
) {
  const id = crypto.randomUUID();
  await setDoc(doc(store(), "globalChallenges", id), {
    ownerUid: user.uid,
    ownerName: (user.displayName || "Player").slice(0, 40),
    title,
    goal,
    durationDays,
    startDate,
    endDate,
    status: "pending_review",
    participantCount: 0,
    createdAt: serverTimestamp(),
  });
}
export async function joinCommunityChallenge(challengeId: string, uid: string) {
  const db = store();
  const challenge = await getDoc(doc(db, "globalChallenges", challengeId));
  if (!challenge.exists() || challenge.data().status !== "published")
    throw new Error("This challenge is not open for joining.");
  await setDoc(doc(db, "globalChallenges", challengeId, "participants", uid), {
    uid,
    joinedAt: serverTimestamp(),
  });
}
export async function leaveCommunityChallenge(
  challengeId: string,
  uid: string,
) {
  await deleteDoc(
    doc(store(), "globalChallenges", challengeId, "participants", uid),
  );
}
export async function hasJoinedCommunityChallenge(
  challengeId: string,
  uid: string,
) {
  return (
    await getDoc(
      doc(store(), "globalChallenges", challengeId, "participants", uid),
    )
  ).exists();
}
export async function logCommunityCheckin(
  challengeId: string,
  uid: string,
  date: string,
  complete: boolean,
) {
  const ref = doc(
    store(),
    "globalChallenges",
    challengeId,
    "participants",
    uid,
    "checkins",
    date,
  );
  if (complete)
    await setDoc(ref, {
      uid,
      date,
      completed: true,
      createdAt: serverTimestamp(),
    });
  else await deleteDoc(ref);
}
export async function listMyCommunityProgress(
  challengeId: string,
  uid: string,
) {
  const rows = await getDocs(
    collection(
      store(),
      "globalChallenges",
      challengeId,
      "participants",
      uid,
      "checkins",
    ),
  );
  return rows.docs.map((row) => row.id);
}
export async function listMyCommunityParticipation(uid: string) {
  const rows = await getDocs(
    query(collectionGroup(store(), "participants"), where("uid", "==", uid)),
  );
  const items = await Promise.all(
    rows.docs.map(async (row) => {
      const challengeId = row.ref.parent.parent?.id;
      return challengeId
        ? {
            challengeId,
            checkins: await listMyCommunityProgress(challengeId, uid),
          }
        : null;
    }),
  );
  return items.filter(
    (item): item is NonNullable<typeof item> => item !== null,
  );
}
export async function listCommunityStandings(challengeId: string) {
  const db = store();
  const participants = await getDocs(
    query(
      collection(db, "globalChallenges", challengeId, "participants"),
      limit(50),
    ),
  );
  const standings = await Promise.all(
    participants.docs.map(async (participant) => {
      const checkins = await getDocs(
        collection(
          db,
          "globalChallenges",
          challengeId,
          "participants",
          participant.id,
          "checkins",
        ),
      );
      const completedDays = checkins.docs.map((row) => row.id).sort();
      let currentStreak = 0;
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      let cursor = new Date(`${today}T12:00:00`);
      for (let i = 0; i < 90; i++) {
        const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
        if (!completedDays.includes(key)) break;
        currentStreak++;
        cursor.setDate(cursor.getDate() - 1);
      }
      return {
        uid: participant.id,
        completedDays: completedDays.length,
        currentStreak,
      };
    }),
  );
  return standings.sort(
    (a, b) =>
      b.completedDays - a.completedDays ||
      b.currentStreak - a.currentStreak ||
      a.uid.localeCompare(b.uid),
  );
}
export async function reportCommunityChallenge(
  challengeId: string,
  uid: string,
  reason: string,
) {
  await setDoc(
    doc(store(), "globalChallengeReports", `${challengeId}_${uid}`),
    {
      challengeId,
      reporterUid: uid,
      reason,
      status: "pending",
      createdAt: serverTimestamp(),
    },
  );
}
export async function listCommunityReports() {
  const rows = await getDocs(
    query(
      collection(adminStore(), "globalChallengeReports"),
      where("status", "==", "pending"),
      orderBy("createdAt", "asc"),
      limit(100),
    ),
  );
  return rows.docs.map((row) => ({
    id: row.id,
    ...(row.data() as {
      challengeId: string;
      reporterUid: string;
      reason: string;
    }),
  }));
}
export async function moderateCommunityChallenge(
  challengeId: string,
  status: "published" | "rejected" | "removed",
) {
  await updateDoc(doc(adminStore(), "globalChallenges", challengeId), {
    status,
    moderatedAt: serverTimestamp(),
  });
}
export async function resolveCommunityReport(
  reportId: string,
  status: "kept" | "removed",
) {
  await updateDoc(doc(adminStore(), "globalChallengeReports", reportId), {
    status,
    reviewedAt: serverTimestamp(),
  });
}
export async function communityAdminCounts() {
  const db = adminStore();
  const [players, mainChallengeProfiles, challenges, reports, participants] =
    await Promise.all([
      getCountFromServer(collection(db, "leaderboard")),
      getCountFromServer(
        query(
          collection(db, "leaderboard"),
          where("mainChallengeCompletions", ">", 0),
        ),
      ),
      getCountFromServer(collection(db, "globalChallenges")),
      getCountFromServer(
        query(
          collection(db, "globalChallengeReports"),
          where("status", "==", "pending"),
        ),
      ),
      getCountFromServer(collectionGroup(db, "participants")),
    ]);
  return {
    optedInProfiles: players.data().count,
    completedMainChallengeProfiles: mainChallengeProfiles.data().count,
    communityChallenges: challenges.data().count,
    pendingReports: reports.data().count,
    communityParticipants: participants.data().count,
  };
}
