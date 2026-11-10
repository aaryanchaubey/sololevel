import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  Archive,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  ChartNoAxesCombined,
  Check,
  ChevronRight,
  CloudOff,
  Dumbbell,
  Flame,
  FolderOpen,
  LockKeyhole,
  Medal,
  Palette,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Target,
  Utensils,
  Droplets,
  Moon,
  Settings,
  Trophy,
  Zap,
  X,
} from "lucide-react";
import { db, loadAppData, saveAppData, DEFAULT_DATA } from "./db";
import {
  chooseBackupFolder,
  createBackup,
  downloadBackup,
  downloadEncryptedBackup,
  restoreBackup,
  restoreEncryptedBackup,
  saveWeeklyBackup,
  requestStoredFolderPermission,
} from "./backup";
import type { AppData, Category, MissionId, MissionLog } from "./types";
import ModuleWorkspace from "./ModuleWorkspace";
import { DEFAULT_MODULES } from "./db";
import { evaluateChallenge, scoreCategoryToDate } from "./engine/challenge";
import { syncAchievements, ACHIEVEMENT_LABELS } from "./engine/achievements";
import GovernmentJobs from "./GovernmentJobs";
import { createPinCredential, verifyPin } from "./security";
import PersonalChallenges from "./PersonalChallenges";
import type { PersonalChallenge, PersonalChallengeLog } from "./types";
import {
  firebaseAuthIsConfigured,
  listenForGoogleUser,
  signInWithGoogle,
  signOutGoogle,
} from "./firebaseAuth";
import type { User } from "firebase/auth";
import StepMap from "./StepMap";
import {
  downloadGoogleDriveBackup,
  googleSyncIsConfigured,
  requestGoogleDriveToken,
  revokeGoogleDriveToken,
  uploadGoogleDriveBackup,
} from "./googleDriveSync";
const missions: {
  id: MissionId;
  title: string;
  desc: string;
  category: Category;
  icon: any;
  xp: number;
}[] = [
  {
    id: "self_control",
    title: "No FAP",
    desc: "Track your personal commitment honestly. Involuntary events are not intentional choices.",
    category: "discipline",
    icon: ShieldCheck,
    xp: 20,
  },
  {
    id: "fitness",
    title: "Hit the Gym",
    desc: "Train on Monday–Saturday. Sunday is mandatory rest with meditation instead.",
    category: "fitness",
    icon: Dumbbell,
    xp: 30,
  },
  {
    id: "career",
    title: "Career & Openings",
    desc: "Check company openings, take an application step, and review government vacancies.",
    category: "career",
    icon: BriefcaseBusiness,
    xp: 20,
  },
  {
    id: "sleep",
    title: "Sleep & Recovery",
    desc: "Record recovery and reach your daily goal of 6 hours of sleep.",
    category: "discipline",
    icon: Moon,
    xp: 15,
  },
  {
    id: "study",
    title: "Study 3 Hours",
    desc: "Complete 3 hours of focused study each day.",
    category: "study",
    icon: BookOpen,
    xp: 30,
  },
  {
    id: "revision",
    title: "Revision & Goal Setting",
    desc: "Revise due topics and set tomorrow’s goals.",
    category: "study",
    icon: CalendarDays,
    xp: 20,
  },
  {
    id: "digital",
    title: "Adult Content & Reels",
    desc: "Avoid intentional porn, Instagram Reels, and YouTube Shorts. Accidental exposure is fine.",
    category: "discipline",
    icon: LockKeyhole,
    xp: 20,
  },
];
const categories: Category[] = ["fitness", "study", "career", "discipline"];
const shopItems = [
  {
    id: "recovery-skip",
    label: "Recovery Skip",
    description:
      "Excuse one mission marked missed during an active 21-day challenge. It never counts as a completion.",
    kind: "recovery_skip" as const,
    target: "any" as const,
    price: 1200,
  },
  {
    id: "mission-booster",
    label: "Mission Booster",
    description: "Add 50% bonus XP to your next newly completed main mission.",
    kind: "booster" as const,
    target: "any" as const,
    price: 1000,
  },
];
const themes = [
  "shadow",
  "silver",
  "gold",
  "redblack",
  "monarch",
  "inferno",
  "frost",
  "emerald",
  "solar",
];
const profileAvatars = [
  "⚔️", "🛡️", "🗡️", "🏹", "🦊", "🐺", "🦅", "🐉", "🦁", "🐯",
  "🐻", "🦉", "🐈‍⬛", "🦈", "🐍", "🦂", "🦇", "🦖", "🐗", "🦌",
  "🐸", "🐼", "🐵", "🦄", "🐙", "🦋", "🪼", "🦚", "🦜", "🐢",
  "🌙", "☀️", "🌌", "⚡", "🔥", "❄️", "🌊", "🌪️", "🌿", "🌸",
  "💎", "👑", "🧿", "🔮", "🪬", "🎭", "🦾", "🤖", "👽", "👻",
  "🥷", "🧙", "🧛", "🧝", "🧞", "🧟", "🦸", "🦹", "🎴", "🏆",
];
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const localDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export default function App() {
  const [data, setData] = useState<AppData>(DEFAULT_DATA);
  const [ready, setReady] = useState(false);
  const [saveStatus, setSaveStatus] = useState("saved");
  const [locked, setLocked] = useState(false);
  const [lockPin, setLockPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [tab, setTab] = useState("Home");
  const [notice, setNotice] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(!firebaseAuthIsConfigured);
  const [authBusy, setAuthBusy] = useState(false);
  const [selectedSummaryMonth, setSelectedSummaryMonth] = useState("");
  const [name, setName] = useState("Player");
  const [showRestore, setShowRestore] = useState(false);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [reflectionMission, setReflectionMission] = useState<MissionId | null>(
    null,
  );
  const [reflectionNote, setReflectionNote] = useState("");
  const [reflectionDate, setReflectionDate] = useState(today());
  const [googleAccessToken, setGoogleAccessToken] = useState("");
  const [googleSyncStatus, setGoogleSyncStatus] = useState(
    "Not connected in this session",
  );
  const day = today();
  useEffect(() => {
    if (!firebaseAuthIsConfigured) return;
    return listenForGoogleUser((user) => {
      setGoogleUser(user);
      setAuthReady(true);
    });
  }, []);
  useEffect(() => {
    loadAppData()
      .then((d) => {
        setData(syncAchievements(d));
        setName(d.profile.displayName);
        setReady(true);
        setLocked(
          Boolean(
            d.settings.pinEnabled && d.settings.pinHash && d.settings.pinSalt,
          ),
        );
        setShowWelcome(
          d.profile.displayName === "Player" &&
            d.missions.length === 0 &&
            d.challenges.length === 0,
        );
      })
      .catch(() => {
        setData(DEFAULT_DATA);
        setName(DEFAULT_DATA.profile.displayName);
        setReady(true);
        setNotice(
          "Local data could not be opened. Changes may not persist; download a backup if storage becomes available.",
        );
      });
  }, []);
  useEffect(() => {
    if (!ready || !authReady) return;
    const signedInName = googleUser?.displayName || googleUser?.email || "Player";
    if (googleUser && data.profile.displayName === "Player")
      setName(signedInName);
    setData((current) => {
      const profile = googleUser
        ? {
            ...current.profile,
            accountType: "google" as const,
            googleUid: googleUser.uid,
            accountEmail: googleUser.email ?? undefined,
            displayName:
              current.profile.displayName === "Player"
                ? googleUser.displayName || googleUser.email || "Player"
                : current.profile.displayName,
          }
        : {
            ...current.profile,
            accountType: "guest" as const,
            googleUid: undefined,
            accountEmail: undefined,
          };
      if (
        profile.accountType === current.profile.accountType &&
        profile.googleUid === current.profile.googleUid &&
        profile.accountEmail === current.profile.accountEmail &&
        profile.displayName === current.profile.displayName
      ) return current;
      return { ...current, profile };
    });
    if (googleUser) setShowWelcome(false);
  }, [googleUser, authReady, ready, data.profile.displayName]);
  useEffect(() => {
    if (!ready) return;
    setSaveStatus("saving");
    saveAppData(data)
      .then(() => setSaveStatus("saved"))
      .catch(() => {
        setSaveStatus("error");
        setNotice("Could not save locally. Export a backup immediately.");
      });
  }, [data, ready]);
  useEffect(() => {
    if (!ready) return;
    const expired = (data.personalChallenges ?? []).some(
      (challenge) => challenge.status === "active" && challenge.endDate < day,
    );
    if (!expired) return;
    setData((previous) => {
      const expiredIds = new Set(
        (previous.personalChallenges ?? [])
          .filter(
            (challenge) =>
              challenge.status === "active" && challenge.endDate < day,
          )
          .map((challenge) => challenge.id),
      );
      if (!expiredIds.size) return previous;
      return {
        ...previous,
        personalChallenges: (previous.personalChallenges ?? []).map(
          (challenge) =>
            expiredIds.has(challenge.id)
              ? {
                  ...challenge,
                  status: "completed",
                  completedAt: new Date().toISOString(),
                }
              : challenge,
        ),
        activePersonalChallengeId:
          previous.activePersonalChallengeId &&
          expiredIds.has(previous.activePersonalChallengeId)
            ? undefined
            : previous.activePersonalChallengeId,
        settings: {
          ...previous.settings,
          dashboardChallengeFocus:
            previous.settings.dashboardChallengeFocus === "personal" &&
            previous.activePersonalChallengeId &&
            expiredIds.has(previous.activePersonalChallengeId)
              ? "main"
              : previous.settings.dashboardChallengeFocus,
        },
      };
    });
  }, [
    ready,
    data.personalChallenges,
    data.activePersonalChallengeId,
    data.settings.dashboardChallengeFocus,
    day,
  ]);
  useEffect(() => {
    if (!ready || !data.settings.backupFolderHandle) return;
    const last = data.settings.lastWeeklyBackupAt
      ? new Date(data.settings.lastWeeklyBackupAt).getTime()
      : 0;
    if (Date.now() - last < 7 * 24 * 60 * 60 * 1000) return;
    let cancelled = false;
    (async () => {
      const handle = data.settings.backupFolderHandle!;
      const permission = await (
        handle as FileSystemDirectoryHandle & {
          queryPermission: (o: {
            mode: "readwrite";
          }) => Promise<PermissionState>;
        }
      ).queryPermission({ mode: "readwrite" });
      if (permission === "granted") {
        await saveWeeklyBackup(handle);
        const refreshed = await loadAppData();
        if (!cancelled) setData(refreshed);
      } else if (!cancelled) {
        setNotice(
          "Weekly backup is due. Reconnect your backup folder from Profile → Local data & backup.",
        );
      }
    })().catch(() => {
      if (!cancelled)
        setNotice(
          "Weekly backup could not be completed. Check folder access in Profile.",
        );
    });
    return () => {
      cancelled = true;
    };
  }, [
    ready,
    data.settings.backupFolderHandle,
    data.settings.lastWeeklyBackupAt,
  ]);
  const todays = useMemo(
    () => data.missions.filter((m) => m.date === day),
    [data.missions, day],
  );
  const done = todays.filter((m) => m.status === "complete").length;
  const progress = Math.round((done / 7) * 100);
  const tierLabel = (c: Category) =>
    `${data.ranks[c].tier.rank} ${data.ranks[c].tier.level}`;
  const rankOrder = [
    "Bronze",
    "Silver",
    "Gold",
    "Platinum",
    "Diamond",
    "Emerald",
  ];
  const highestRank = categories
    .map((c) => data.ranks[c].tier.rank)
    .sort((a, b) => rankOrder.indexOf(b) - rankOrder.indexOf(a))[0];
  const automaticTheme: Record<string, string> = {
    Bronze: "shadow",
    Silver: "silver",
    Gold: "gold",
    Platinum: "redblack",
    Diamond: "frost",
    Emerald: "emerald",
  };
  const activeTheme =
    data.settings.themeMode === "manual"
      ? data.settings.theme
      : (automaticTheme[highestRank] ?? "shadow");
  const isSunday = new Date(`${day}T12:00:00`).getDay() === 0;
  const weekday = new Date(`${day}T12:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
  });
  const weeklyProgress = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(`${day}T12:00:00`);
    date.setDate(date.getDate() - (6 - i));
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return {
      day: date.toLocaleDateString(undefined, { weekday: "short" }),
      complete: data.missions.filter(
        (m) => m.date === key && m.status === "complete",
      ).length,
    };
  });
  const activeChallengeScores = data.activeChallenge
    ? (Object.fromEntries(
        categories.map((category) => [
          category,
          scoreCategoryToDate(data, data.activeChallenge!, category, day),
        ]),
      ) as Record<
        Category,
        {
          earned: number;
          possible: number;
          percentage: number;
          passed: boolean;
        }
      >)
    : null;
  const personalChallenges = data.personalChallenges ?? [];
  const activePersonalChallenge = personalChallenges.find(
    (challenge) =>
      challenge.id === data.activePersonalChallengeId &&
      challenge.status === "active",
  );
  const challengeFocus =
    data.settings.dashboardChallengeFocus ??
    (activePersonalChallenge ? "personal" : "main");
  const profileChallenge =
    data.activeChallenge?.status === "active"
      ? data.activeChallenge
      : data.challenges
          .slice()
          .sort((a, b) => b.startDate.localeCompare(a.startDate))[0];
  const monthlySummaries = (data.monthlySummaries ?? []).slice().sort((a, b) =>
    b.month.localeCompare(a.month),
  );
  const selectedMonthSummary =
    monthlySummaries.find(
      (summary) => summary.month === (selectedSummaryMonth || monthlySummaries[0]?.month),
    ) ?? monthlySummaries[0];
  useEffect(() => {
    if (
      !ready ||
      !data.settings.notificationsEnabled ||
      typeof Notification === "undefined" ||
      Notification.permission !== "granted"
    )
      return;
    const check = () => {
      const now = new Date();
      const clock = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      if (
        clock !== data.settings.missionReminderTime ||
        data.settings.lastReminderDate === day
      )
        return;
      const quiet = data.settings.quietHours;
      const inQuiet =
        quiet.enabled &&
        (quiet.start <= quiet.end
          ? clock >= quiet.start && clock < quiet.end
          : clock >= quiet.start || clock < quiet.end);
      if (inQuiet) return;
      new Notification("Solo Leveling · Daily missions", {
        body: `${Math.max(0, 7 - done)} missions remain today.`,
      });
      setData((prev) => ({
        ...prev,
        settings: { ...prev.settings, lastReminderDate: day },
      }));
    };
    check();
    const timer = window.setInterval(check, 15000);
    return () => window.clearInterval(timer);
  }, [
    ready,
    data.settings.notificationsEnabled,
    data.settings.missionReminderTime,
    data.settings.lastReminderDate,
    data.settings.quietHours,
    day,
    done,
  ]);
  async function startFolder() {
    try {
      const handle = await chooseBackupFolder();
      const ok = await requestStoredFolderPermission(handle);
      if (!ok) throw new Error("Folder permission was not granted.");
      const next = {
        ...data,
        settings: { ...data.settings, backupFolderHandle: handle },
      };
      setData(next);
      setNotice(
        "Backup folder connected. Weekly backups will be saved when the app is opened and due.",
      );
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Could not select folder.");
    }
  }
  async function enableReminders() {
    if (typeof Notification === "undefined") {
      setNotice("This browser does not support notifications.");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setNotice(
        "Notifications were not enabled. You can change this in browser settings.",
      );
      return;
    }
    setData({
      ...data,
      settings: { ...data.settings, notificationsEnabled: true },
    });
    setNotice("Mission reminders enabled while the app is open.");
  }
  async function unlockWithPin() {
    if (
      data.settings.pinHash &&
      data.settings.pinSalt &&
      (await verifyPin(lockPin, data.settings.pinSalt, data.settings.pinHash))
    ) {
      setLocked(false);
      setLockPin("");
      setPinError("");
    } else setPinError("That PIN did not match.");
  }
  async function savePin() {
    if (!/^\d{4,12}$/.test(newPin)) {
      setPinError("Choose a 4–12 digit PIN.");
      return;
    }
    if (newPin !== confirmPin) {
      setPinError("The PIN entries do not match.");
      return;
    }
    const credential = await createPinCredential(newPin);
    setData({
      ...data,
      settings: { ...data.settings, ...credential, pinEnabled: true },
    });
    setNewPin("");
    setConfirmPin("");
    setPinError("");
    setNotice(
      "Local PIN enabled. It gates this app on this device but does not encrypt your files.",
    );
  }
  function disablePin() {
    setData({
      ...data,
      settings: {
        ...data.settings,
        pinEnabled: false,
        pinHash: undefined,
        pinSalt: undefined,
      },
    });
    setNotice("Local PIN disabled.");
  }
  async function weeklyBackup() {
    try {
      const h = data.settings.backupFolderHandle;
      if (!h) throw new Error("Choose a backup folder first.");
      const ok = await requestStoredFolderPermission(h);
      if (!ok) throw new Error("Folder access needs permission again.");
      const last = data.settings.lastWeeklyBackupAt
        ? new Date(data.settings.lastWeeklyBackupAt).getTime()
        : 0;
      if (Date.now() - last < 7 * 24 * 60 * 60 * 1000)
        throw new Error("Your weekly backup is not due yet.");
      const file = await saveWeeklyBackup(h);
      const next = await loadAppData();
      setData(next);
      setNotice(`Weekly backup saved: ${file}`);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Backup failed.");
    }
  }
  function logMission(
    id: MissionId,
    status: "complete" | "missed",
    note = "",
    missionDate = day,
  ) {
    const existing = data.missions.find(
      (m) => m.date === missionDate && m.missionId === id,
    );
    const booster =
      status === "complete" && existing?.status !== "complete"
        ? data.inventory.find(
            (item) =>
              item.kind === "booster" &&
              item.target === "any" &&
              item.quantity > 0,
          )
        : undefined;
    const baseXp = missions.find((x) => x.id === id)?.xp ?? 0;
    const missionXp =
      status !== "complete"
        ? 0
        : existing?.status === "complete"
          ? existing.xp
          : baseXp + (booster ? Math.round(baseXp * 0.5) : 0);
    const m: MissionLog = {
      id: existing?.id ?? crypto.randomUUID(),
      date: missionDate,
      missionId: id,
      status,
      xp: missionXp,
      note: note || existing?.note,
      createdAt: new Date().toISOString(),
    };
    setData(
      syncAchievements({
        ...data,
        missions: [
          ...data.missions.filter(
            (x) => !(x.date === missionDate && x.missionId === id),
          ),
          m,
        ],
        profile: {
          ...data.profile,
          lifetimeXp: data.profile.lifetimeXp + (m.xp - (existing?.xp ?? 0)),
          availableXp: Math.max(
            0,
            (data.profile.availableXp ?? data.profile.lifetimeXp) +
              (m.xp - (existing?.xp ?? 0)),
          ),
        },
        inventory: booster
          ? data.inventory.map((item) =>
              item.id === booster.id
                ? { ...item, quantity: item.quantity - 1 }
                : item,
            )
          : data.inventory,
      }),
    );
    setNotice(
      status === "complete"
        ? "Mission logged and saved on this device."
        : "Mission updated as missed.",
    );
  }
  function purchaseShopItem(productId: string) {
    const product = shopItems.find((item) => item.id === productId);
    if (!product) return;
    const availableXp = data.profile.availableXp ?? data.profile.lifetimeXp;
    if (availableXp < product.price) {
      setNotice(
        `You need ${product.price - availableXp} more XP to buy ${product.label}.`,
      );
      return;
    }
    const existing = data.inventory.find(
      (item) =>
        item.kind === product.kind &&
        item.target === product.target &&
        item.label === product.label,
    );
    setData({
      ...data,
      profile: { ...data.profile, availableXp: availableXp - product.price },
      inventory: existing
        ? data.inventory.map((item) =>
            item.id === existing.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          )
        : [
            ...data.inventory,
            {
              id: crypto.randomUUID(),
              kind: product.kind,
              target: product.target,
              label: product.label,
              quantity: 1,
              earnedAt: new Date().toISOString(),
            },
          ],
    });
    setNotice(`${product.label} added to inventory.`);
  }
  function missionReady(id: MissionId) {
    const modules = data.modules ?? DEFAULT_MODULES;
    switch (id) {
      case "self_control":
        return modules.selfControl.some(
          (x) => x.date === day && x.outcome === "resisted",
        );
      case "fitness":
        return modules.workouts.some(
          (x) =>
            x.date === day && (isSunday ? x.activity === "Meditation" : true),
        );
      case "career":
        return modules.career.some(
          (x) => localDate(new Date(x.createdAt)) === day,
        );
      case "sleep":
        return modules.sleep.some((x) => x.date === day && x.hours >= 6);
      case "study":
        return (
          modules.study
            .filter((x) => x.date === day)
            .reduce((sum, x) => sum + x.minutes, 0) >= 180
        );
      case "revision":
        return modules.revisions.some(
          (x) =>
            x.completedAt &&
            localDate(new Date(x.completedAt)) === day &&
            x.notes.trim().length > 0,
        );
      case "digital":
        return modules.digital.some(
          (x) =>
            x.date === day &&
            (x.outcome === "avoided" || x.outcome === "accidental"),
        );
    }
  }
  function useRecoverySkip(id: MissionId) {
    const challenge = data.activeChallenge;
    if (!challenge || day < challenge.startDate || day > challenge.endDate) {
      setNotice(
        "Recovery skips can only excuse a missed mission inside the active 21-day challenge.",
      );
      return;
    }
    const item = data.inventory.find(
      (i) => i.kind === "recovery_skip" && i.target === "any" && i.quantity > 0,
    );
    if (!item) {
      setNotice("No recovery skip is available.");
      return;
    }
    const existing = data.missions.find(
      (m) => m.date === day && m.missionId === id,
    );
    if (existing?.status !== "missed") {
      setNotice(
        "A Recovery Skip can only be used on a mission already marked missed; it cannot replace a completion.",
      );
      return;
    }
    const skipped: MissionLog = {
      ...existing,
      status: "skipped",
      xp: 0,
      previousStatus: "missed",
      createdAt: new Date().toISOString(),
    };
    setData({
      ...data,
      missions: [
        ...data.missions.filter((m) => !(m.date === day && m.missionId === id)),
        skipped,
      ],
      inventory: data.inventory.map((i) =>
        i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i,
      ),
    });
    setNotice(
      "Recovery skip used. The missed outcome remains in history; it is excused, not counted as completed.",
    );
  }
  function finalizeChallenge() {
    if (!data.activeChallenge) return;
    const working: AppData = {
      ...data,
      ranks: structuredClone(data.ranks),
      challenges: [...data.challenges],
      inventory: data.inventory.map((item) => ({ ...item })),
      activeChallenge: { ...data.activeChallenge },
    };
    try {
      const result = evaluateChallenge(working, working.activeChallenge!);
      setData(syncAchievements(working));
      setNotice(
        `Challenge evaluated: ${result.overallPercentage}% overall. Check Progress for category results.`,
      );
    } catch (e) {
      setNotice(
        e instanceof Error ? e.message : "Challenge could not be evaluated.",
      );
    }
  }
  function cancelChallenge() {
    const challenge = data.activeChallenge;
    if (!challenge) return;
    if (
      !confirm(
        "Cancel this 21-day challenge? Its daily logs stay saved, and no rank changes will be applied.",
      )
    )
      return;
    setData({
      ...data,
      activeChallenge: undefined,
      challenges: [
        ...data.challenges,
        {
          ...challenge,
          status: "cancelled",
          completedAt: new Date().toISOString(),
        },
      ],
    });
    setNotice(
      "Challenge cancelled. Your mission history and rank progress were preserved.",
    );
  }
  function startPersonalChallenge(
    title: string,
    goal: string,
    durationDays: number,
  ) {
    if (
      (data.personalChallenges ?? []).some(
        (challenge) => challenge.status === "active",
      )
    )
      return;
    const startDate = day;
    const end = new Date(`${startDate}T12:00:00`);
    end.setDate(end.getDate() + durationDays - 1);
    const challenge: PersonalChallenge = {
      id: crypto.randomUUID(),
      title,
      goal,
      durationDays,
      startDate,
      endDate: localDate(end),
      status: "active",
      createdAt: new Date().toISOString(),
    };
    setData({
      ...data,
      personalChallenges: [...(data.personalChallenges ?? []), challenge],
      activePersonalChallengeId: challenge.id,
      settings: { ...data.settings, dashboardChallengeFocus: "personal" },
    });
    setNotice(
      "Personal challenge started. Daily check-ins do not award XP or affect ranks.",
    );
  }
  function logPersonalChallenge(
    challengeId: string,
    date: string,
    completed: boolean,
  ) {
    if (date > day) return;
    const existing = (data.personalChallengeLogs ?? []).find(
      (entry) => entry.challengeId === challengeId && entry.date === date,
    );
    const next: PersonalChallengeLog[] = [
      ...(data.personalChallengeLogs ?? []).filter(
        (entry) => !(entry.challengeId === challengeId && entry.date === date),
      ),
    ];
    if (completed)
      next.push({
        id: existing?.id ?? crypto.randomUUID(),
        challengeId,
        date,
        completed: true,
        createdAt: new Date().toISOString(),
      });
    setData({ ...data, personalChallengeLogs: next });
  }
  function cancelPersonalChallenge(challengeId: string) {
    const challenge = (data.personalChallenges ?? []).find(
      (item) => item.id === challengeId,
    );
    if (
      !challenge ||
      !confirm(
        `Cancel “${challenge.title}”? Its check-ins will remain in history.`,
      )
    )
      return;
    setData({
      ...data,
      personalChallenges: (data.personalChallenges ?? []).map((item) =>
        item.id === challengeId ? { ...item, status: "cancelled" } : item,
      ),
      activePersonalChallengeId: undefined,
      settings: { ...data.settings, dashboardChallengeFocus: "main" },
    });
    setNotice(
      "Personal challenge cancelled. History retained; no XP or rank changes were made.",
    );
  }
  function setChallengeFocus(focus: "main" | "personal") {
    setData({
      ...data,
      settings: { ...data.settings, dashboardChallengeFocus: focus },
    });
  }
  async function getGoogleToken() {
    const token = googleAccessToken || (await requestGoogleDriveToken());
    setGoogleAccessToken(token);
    setGoogleSyncStatus("Google Drive connected for this browser session");
    return token;
  }
  async function connectGoogleDrive() {
    try {
      await getGoogleToken();
      setNotice(
        "Google Drive connected for this browser session. Tokens are kept in memory only.",
      );
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Could not connect Google Drive.",
      );
    }
  }
  async function syncToGoogleDrive() {
    try {
      const token = await getGoogleToken();
      await uploadGoogleDriveBackup(await createBackup(), token);
      setGoogleSyncStatus(
        `Backed up to Google Drive · ${new Date().toLocaleTimeString()}`,
      );
      setNotice(
        "A verified JSON backup was saved in your Google Drive app data.",
      );
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Google Drive backup failed.",
      );
    }
  }
  async function restoreFromGoogleDrive() {
    if (
      !confirm(
        "Restore the Google Drive backup and replace data on this device? Download a local backup first if you need to preserve this device's current data.",
      )
    )
      return;
    try {
      const token = await getGoogleToken();
      const backup = await downloadGoogleDriveBackup(token);
      const file = new File(
        [JSON.stringify(backup)],
        "solo-leveling-google-drive.json",
        { type: "application/json" },
      );
      const restored = await restoreBackup(file);
      setData(restored);
      setLocked(false);
      setNotice("Google Drive backup restored to this device.");
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Google Drive restore failed.",
      );
    }
  }
  function disconnectGoogleDrive() {
    if (googleAccessToken) revokeGoogleDriveToken(googleAccessToken);
    setGoogleAccessToken("");
    setGoogleSyncStatus("Not connected in this session");
    setNotice("Google Drive access disconnected for this browser session.");
  }
  async function importFile(file?: File) {
    if (!file) return;
    try {
      let restored: AppData;
      const text = await file.text();
      const envelope = JSON.parse(text) as { encrypted?: boolean };
      if (envelope?.encrypted) {
        const password = window.prompt(
          "Enter the password used to encrypt this backup.",
        );
        if (password === null) return;
        restored = await restoreEncryptedBackup(file, password);
      } else restored = await restoreBackup(file);
      setData(restored);
      setLocked(false);
      setNotice("Backup restored successfully.");
      setShowRestore(false);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Restore failed.");
    }
  }
  async function exportPlain() {
    try {
      await downloadBackup();
      setNotice("JSON backup downloaded.");
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Backup download failed.",
      );
    }
  }
  async function deleteLocalData() {
    if (
      !confirm(
        "This permanently deletes local Solo Leveling data. Have you created a backup?",
      )
    )
      return;
    try {
      await db.delete();
      location.reload();
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Could not delete local data. Close other Solo Leveling tabs and try again.",
      );
    }
  }
  async function exportEncrypted() {
    const password = window.prompt(
      "Choose a backup password (at least 12 characters). Store it safely; it cannot be recovered.",
    );
    if (password === null) return;
    const confirmation = window.prompt(
      "Enter that backup password again to confirm.",
    );
    if (confirmation === null) return;
    if (password !== confirmation) {
      setNotice(
        "The passwords did not match. No encrypted backup was created.",
      );
      return;
    }
    try {
      await downloadEncryptedBackup(password);
      setNotice(
        "Encrypted backup downloaded. Keep the password separately; it cannot be recovered.",
      );
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Encrypted backup failed.");
    }
  }
  async function beginGoogleLogin() {
    setAuthBusy(true);
    try {
      await signInWithGoogle();
      setNotice("Signed in with Google. Your progress remains stored on this device.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Google login failed.");
    } finally {
      setAuthBusy(false);
    }
  }
  async function logOutGoogle() {
    setAuthBusy(true);
    try {
      await signOutGoogle();
      setShowWelcome(true);
      setNotice("Signed out of Google. Your local player data was kept on this device.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not sign out.");
    } finally {
      setAuthBusy(false);
    }
  }
  if (!ready || !authReady) return <div className="loading">LOADING PLAYER DATA…</div>;
  if (locked)
    return (
      <div className={`app theme-${activeTheme}`}>
        <div className="welcome-backdrop">
          <div className="welcome panel">
            <div className="sigil">SL</div>
            <p className="eyebrow">LOCAL PROFILE</p>
            <h1>Enter your PIN</h1>
            <p className="muted">
              This PIN is a local access gate, not file encryption. If
              forgotten, restore a backup to regain access.
            </p>
            <label className="field-label">
              PIN
              <input
                type="password"
                inputMode="numeric"
                autoComplete="current-password"
                value={lockPin}
                onChange={(e) => setLockPin(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && unlockWithPin()}
              />
            </label>
            {pinError && <p className="pin-error">{pinError}</p>}
            <div className="button-row">
              <button className="primary" onClick={unlockWithPin}>
                Unlock
              </button>
              <button onClick={() => setShowRestore(true)}>
                Restore from backup
              </button>
            </div>
          </div>
        </div>
        {showRestore && (
          <div className="modal-backdrop">
            <div className="panel modal">
              <h2>Restore player data</h2>
              <p className="muted">
                Choose a valid backup. It replaces current local data and will
                not carry over the local PIN.
              </p>
              <input
                type="file"
                accept="application/json,.json"
                onChange={(e) => importFile(e.target.files?.[0])}
              />
              <button onClick={() => setShowRestore(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    );
  return (
    <div className={`app theme-${activeTheme}`}>
      {showWelcome && !googleUser && (
        <div className="welcome-backdrop">
          <div className="welcome panel">
            <div className="sigil">SL</div>
            <p className="eyebrow">PLAYER INITIALIZATION</p>
            <h1>
              Welcome to <span>Solo Leveling</span>
            </h1>
            <div className="warning">
              <ShieldAlert />
              <div>
                <b>IMPORTANT: YOUR DATA IS STORED LOCALLY</b>
                <p>
                  Your progress is stored on this device, not automatically in
                  the cloud. Do not clear browser or app data without a backup.
                  Choose a backup folder and keep your JSON backups safe. After
                  reinstalling, select the same folder or import a backup to
                  restore your progress.
                </p>
              </div>
            </div>
            <label className="field-label">
              PLAYER NAME
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter player name"
              />
            </label>
            <div className="button-row">
              <button
                className="primary"
                onClick={() => {
                  setData({
                    ...data,
                    profile: {
                      ...data.profile,
                      displayName: name.trim() || "Player",
                    },
                  });
                  setShowWelcome(false);
                }}
              >
                Continue as Guest <ChevronRight size={17} />
              </button>
              {firebaseAuthIsConfigured && (
                <button onClick={beginGoogleLogin} disabled={authBusy}>
                  {authBusy ? "Connecting…" : "Continue with Google"}
                </button>
              )}
              <button onClick={startFolder}>
                <FolderOpen size={16} /> Choose backup folder
              </button>
              <button onClick={() => setShowRestore(true)}>
                Restore backup
              </button>
            </div>
            <p className="fine">
              Local-first · Offline-capable · You control your data
            </p>
          </div>
        </div>
      )}
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">SL</div>
          <div>
            <b>SOLO LEVELING</b>
            <small>PLAYER SYSTEM · V1.0</small>
          </div>
        </div>
        <div className="top-actions">
          <button
            className="icon-btn"
            title={`Change theme. Current: ${activeTheme}`}
            aria-label={`Change theme. Current: ${activeTheme}`}
            onClick={() => {
              if (
                data.settings.themeMode === "manual" &&
                activeTheme === themes[themes.length - 1]
              ) {
                setData({
                  ...data,
                  settings: { ...data.settings, themeMode: "auto" },
                });
                return;
              }
              const next =
                themes[(themes.indexOf(activeTheme) + 1) % themes.length];
              setData({
                ...data,
                settings: {
                  ...data.settings,
                  theme: next,
                  themeMode: "manual",
                },
              });
            }}
          >
            <Palette />
          </button>
          <button
            className="icon-btn"
            title="Settings"
            onClick={() => setTab("Profile")}
          >
            <Settings />
          </button>
          <button
            className="player-chip profile-trigger"
            type="button"
            title={data.profile.accountType === "google" ? "Google account connected · Open profile" : "Open profile and settings"}
            aria-label="Open profile and settings"
            onClick={() => setTab("Profile")}
          >
            <div className="avatar avatar-emoji" aria-hidden="true">
              {data.profile.avatarId || profileAvatars[0]}
              {data.profile.accountType === "google" && <i className="google-avatar-dot" />}
            </div>
            <span>{data.profile.displayName}</span>
          </button>
        </div>
      </header>
      <div className="layout">
        <aside className="sidebar">
          {[
            ["Home", Target],
            ["Quests", Flame],
            ["Progress", ChartNoAxesCombined],
            ["Challenges", CalendarDays],
            ["Inventory", Archive],
          ].map(([label, Icon]: any) => (
            <button
              key={label}
              className={tab === label ? "nav active" : "nav"}
              onClick={() => setTab(label)}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
          <div className="side-note">
            <CloudOff size={17} />
            <b>LOCAL MODE</b>
            <span>Your progress stays on this device.</span>
          </div>
        </aside>
        <main
          className="content page-transition"
          key={`${tab}-${activeModule ?? ""}`}
        >
          {tab === "Home" && (
            <>
              <div className="hero">
                <div>
                  <p className="eyebrow">
                    {weekday.toUpperCase()} · PLAYER STATUS
                  </p>
                  <h1>
                    Rise beyond your <span>limits.</span>
                  </h1>
                  <p className="muted">
                    Every completed mission is a step toward becoming stronger.
                  </p>
                </div>
                <div className="hero-level">
                  <span>PLAYER LEVEL</span>
                  <b>{data.profile.level}</b>
                  <small>
                    {data.profile.lifetimeXp.toLocaleString()} lifetime XP
                  </small>
                </div>
              </div>
              <div className="rank-grid">
                {categories.map((c) => (
                  <div className="rank-card panel" key={c}>
                    <span>{c.toUpperCase()} RANK</span>
                    <b>{tierLabel(c)}</b>
                    <small>
                      {data.ranks[c].successfulChallenges} successful challenges
                    </small>
                  </div>
                ))}
              </div>
              <section className="panel daily-panel">
                <div className="section-head">
                  <div>
                    <p className="eyebrow">DAILY QUESTS</p>
                    <h2>Today's missions</h2>
                  </div>
                  <div className="completion">
                    <b>{done}/7</b>
                    <span>COMPLETED</span>
                  </div>
                </div>
                <div className="progress-track">
                  <div style={{ width: `${progress}%` }} />
                </div>
                <div className="mission-list">
                  {missions.map((m) => {
                    const entry = todays.find((x) => x.missionId === m.id);
                    const Icon = m.icon;
                    return (
                      <div
                        className={`mission ${entry?.status === "complete" ? "is-done" : ""}`}
                        key={m.id}
                      >
                        <div className="mission-icon">
                          <Icon size={19} />
                        </div>
                        <div
                          className={`mission-copy ${entry?.status === "complete" ? "hidden-copy" : ""}`}
                        >
                          <b>
                            {m.id === "fitness" && isSunday
                              ? "Rest & Meditation"
                              : m.title}
                          </b>
                          <span>
                            {m.id === "fitness" && isSunday
                              ? "Mandatory rest day. Complete a meditation session instead of gym training."
                              : m.desc}
                          </span>
                        </div>
                        <span
                          className={`xp ${entry?.status === "complete" ? "hidden-copy" : ""}`}
                        >
                          +{m.xp} XP
                        </span>
                        <div className="mission-actions">
                          {entry?.status === "complete" ? (
                            <>
                              <span className="mission-copy is-struck">
                                <b>
                                  <del>
                                    {m.id === "fitness" && isSunday
                                      ? "Rest & Meditation"
                                      : m.title}
                                  </del>
                                </b>
                                <span>Logged · +{m.xp} XP</span>
                              </span>
                              <button
                                className="reopen-btn"
                                aria-label={`Mark ${m.title} missed`}
                                title="Mark missed / undo completion"
                                onClick={() => {
                                  setReflectionMission(m.id);
                                  setReflectionDate(day);
                                  setReflectionNote(entry?.note ?? "");
                                }}
                              >
                                <X size={18} />
                              </button>
                            </>
                          ) : entry?.status === "skipped" ? (
                            <span className="completed">EXCUSED</span>
                          ) : (
                            <>
                              <button
                                className="complete-btn"
                                onClick={() => logMission(m.id, "complete")}
                              >
                                Complete
                              </button>
                              <button
                                className="miss-btn"
                                onClick={() => {
                                  setReflectionMission(m.id);
                                  setReflectionDate(day);
                                  setReflectionNote(entry?.note ?? "");
                                }}
                              >
                                Missed
                              </button>
                              {entry?.status === "missed" &&
                                data.activeChallenge &&
                                data.inventory.some(
                                  (i) =>
                                    i.kind === "recovery_skip" &&
                                    i.target === "any" &&
                                    i.quantity > 0,
                                ) && (
                                  <button
                                    className="miss-btn"
                                    onClick={() => useRecoverySkip(m.id)}
                                  >
                                    Use skip
                                  </button>
                                )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
              <div className="lower-grid">
                <section className="panel quote">
                  <p className="eyebrow">TODAY'S DIRECTIVE</p>
                  <h3>
                    Discipline is built when the mood disappears and the mission
                    remains.
                  </h3>
                  <span>— PLAYER SYSTEM</span>
                </section>
                <section className="panel challenge-card">
                  {challengeFocus === "personal" && activePersonalChallenge ? (
                    <>
                      <div className="section-head">
                        <div>
                          <p className="eyebrow">PERSONAL CHALLENGE · NO XP</p>
                          <h3>{activePersonalChallenge.title}</h3>
                        </div>
                        <button
                          className="challenge-switch"
                          onClick={() => setChallengeFocus("main")}
                        >
                          Return to main challenge
                        </button>
                      </div>
                      <p className="muted">{activePersonalChallenge.goal}</p>
                      <p className="muted">
                        {activePersonalChallenge.startDate} →{" "}
                        {activePersonalChallenge.endDate} ·{" "}
                        {activePersonalChallenge.durationDays} days
                      </p>
                      <div className="progress-track">
                        <div
                          style={{
                            width: `${Math.round(((data.personalChallengeLogs ?? []).filter((entry) => entry.challengeId === activePersonalChallenge.id && entry.completed).length / activePersonalChallenge.durationDays) * 100)}%`,
                          }}
                        />
                      </div>
                      <p className="muted">
                        {
                          (data.personalChallengeLogs ?? []).filter(
                            (entry) =>
                              entry.challengeId ===
                                activePersonalChallenge.id && entry.completed,
                          ).length
                        }
                        /{activePersonalChallenge.durationDays} days complete
                      </p>
                      <div className="button-row">
                        <button
                          className="primary"
                          onClick={() =>
                            logPersonalChallenge(
                              activePersonalChallenge.id,
                              day,
                              !(data.personalChallengeLogs ?? []).some(
                                (entry) =>
                                  entry.challengeId ===
                                    activePersonalChallenge.id &&
                                  entry.date === day &&
                                  entry.completed,
                              ),
                            )
                          }
                        >
                          {(data.personalChallengeLogs ?? []).some(
                            (entry) =>
                              entry.challengeId ===
                                activePersonalChallenge.id &&
                              entry.date === day &&
                              entry.completed,
                          )
                            ? "Undo today's check-in"
                            : "Log today"}
                        </button>
                        <button onClick={() => setTab("Challenges")}>
                          Open challenge
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="section-head">
                        <div>
                          <p className="eyebrow">21-DAY RANKED CHALLENGE</p>
                          <h3>
                            {data.activeChallenge
                              ? "Challenge in progress"
                              : "No active challenge"}
                          </h3>
                        </div>
                        {data.activeChallenge && (
                          <button
                            className="icon-btn cancel-challenge"
                            aria-label="Cancel main challenge"
                            title="Cancel challenge"
                            onClick={cancelChallenge}
                          >
                            <X size={18} />
                          </button>
                        )}
                      </div>
                      <p className="muted">
                        {data.activeChallenge
                          ? `Day ${Math.max(1, Math.min(21, Math.floor((new Date(`${day}T12:00:00`).getTime() - new Date(`${data.activeChallenge.startDate}T12:00:00`).getTime()) / 86400000) + 1))} of 21 · ${data.activeChallenge.startDate} → ${data.activeChallenge.endDate}`
                          : "Start a challenge manually to begin your next tier progression cycle."}
                      </p>
                      {activeChallengeScores && (
                        <div className="challenge-results">
                          <b>Category progress · 80% required</b>
                          {categories.map((category) => {
                            const result = activeChallengeScores[category];
                            return (
                              <div className="history-row" key={category}>
                                <span>{category.toUpperCase()}</span>
                                <span>
                                  {result.earned}/{result.possible} ·{" "}
                                  {result.percentage}%
                                </span>
                                <small>
                                  {result.passed
                                    ? "At or above threshold"
                                    : "Below threshold so far"}
                                </small>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      <button
                        className="primary"
                        onClick={() => {
                          if (!data.activeChallenge) {
                            const start = day;
                            const end = new Date(`${start}T12:00:00`);
                            end.setDate(end.getDate() + 20);
                            setData({
                              ...data,
                              activeChallenge: {
                                id: crypto.randomUUID(),
                                startDate: start,
                                endDate: localDate(end),
                                status: "active",
                                createdAt: new Date().toISOString(),
                              },
                            });
                            setNotice("Your 21-day challenge has started.");
                          }
                        }}
                        disabled={!!data.activeChallenge}
                      >
                        {data.activeChallenge ? "ACTIVE" : "Start challenge"}
                      </button>
                      {data.activeChallenge &&
                        day >= data.activeChallenge.endDate && (
                          <button
                            className="primary"
                            onClick={finalizeChallenge}
                          >
                            Evaluate 21-day challenge
                          </button>
                        )}
                      {activePersonalChallenge && (
                        <button
                          className="challenge-switch"
                          onClick={() => setChallengeFocus("personal")}
                        >
                          Switch to personal challenge
                        </button>
                      )}
                      <button
                        className="create-personal-shortcut"
                        onClick={() => setTab("Challenges")}
                      >
                        <Plus size={16} /> Create personal challenge
                      </button>
                    </>
                  )}
                </section>
              </div>
            </>
          )}
          {tab === "Challenges" && (
            <PersonalChallenges
              challenges={personalChallenges}
              logs={data.personalChallengeLogs ?? []}
              activeId={data.activePersonalChallengeId}
              focus={challengeFocus}
              onCreate={startPersonalChallenge}
              onLog={logPersonalChallenge}
              onCancel={cancelPersonalChallenge}
              onFocus={setChallengeFocus}
            />
          )}
          {tab === "Quests" &&
            (activeModule === "government" ? (
              <>
                <button className="round-back government-back" type="button" onClick={() => setActiveModule(null)} aria-label="Back" title="Back">
                  <ArrowLeft size={18} />
                </button>
                <GovernmentJobs
                  notices={data.modules?.governmentNotices ?? []}
                  onChange={(governmentNotices) =>
                    setData(
                      syncAchievements({
                        ...data,
                        modules: {
                          ...(data.modules ?? DEFAULT_MODULES),
                          governmentNotices,
                        },
                      }),
                    )
                  }
                />
              </>
            ) : activeModule ? (
              <ModuleWorkspace
                moduleId={activeModule}
                modules={data.modules ?? DEFAULT_MODULES}
                onChange={(modules) =>
                  setData(syncAchievements({ ...data, modules }))
                }
                onBack={() => setActiveModule(null)}
              />
            ) : (
              <>
                <p className="eyebrow">MISSION ARCHIVE</p>
                <h1>Quests & modules</h1>
                <p className="muted">
                  Open a module to log progress. Records stay on this device.
                </p>
                <div className="module-grid">
                  {missions.map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        className="panel module-card module-button"
                        key={m.id}
                        onClick={() => setActiveModule(m.id)}
                      >
                        <Icon />
                        <h3>
                          {m.id === "fitness" && isSunday
                            ? "Rest & Meditation"
                            : m.title}
                        </h3>
                        <p>{m.desc}</p>
                        <span>
                          {m.category.toUpperCase()} · {m.xp} XP
                        </span>
                      </button>
                    );
                  })}
                  {[
                    {
                      id: "nutrition",
                      name: "Nutrition",
                      icon: Utensils,
                      desc: "Indian meals, portions and estimated nutrition.",
                    },
                    {
                      id: "hydration",
                      name: "Hydration",
                      icon: Droplets,
                      desc: "Log water through the day.",
                    },
                    {
                      id: "government",
                      name: "Government job notices",
                      icon: BriefcaseBusiness,
                      desc: "Open official recruitment pages and save notices with application links.",
                    },
                  ].map((m) => (
                    <button
                      className="panel module-card module-button"
                      key={m.id}
                      onClick={() => setActiveModule(m.id)}
                    >
                      <m.icon />
                      <h3>{m.name}</h3>
                      <p>{m.desc}</p>
                      <span>OPEN MODULE</span>
                    </button>
                  ))}
                </div>
              </>
            ))}
          {tab === "Progress" && (
            <>
              <p className="eyebrow">PLAYER RECORD</p>
              <h1>Progress & ranks</h1>
              <section className="panel monthly-summary">
                <div className="section-head">
                  <div>
                    <p className="eyebrow">LONG-TERM RECORD</p>
                    <h2>Monthly summary</h2>
                  </div>
                  {monthlySummaries.length > 0 && (
                    <label className="month-select">
                      <span className="sr-only">Choose summary month</span>
                      <select
                        value={selectedMonthSummary?.month ?? ""}
                        onChange={(event) =>
                          setSelectedSummaryMonth(event.target.value)
                        }
                      >
                        {monthlySummaries.map((summary) => (
                          <option key={summary.month} value={summary.month}>
                            {new Date(`${summary.month}-15T12:00:00`).toLocaleDateString(undefined, {
                              month: "long",
                              year: "numeric",
                            })}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>
                {selectedMonthSummary ? (
                  <>
                    <p className="muted">
                      Individual daily records for completed months are compacted into these totals. Current-month data stays detailed.
                    </p>
                    <div className="summary-metric-grid">
                      <div><span>QUESTS COMPLETED</span><b>{selectedMonthSummary.missionCompletions}</b><small>{selectedMonthSummary.missionMisses} missed</small></div>
                      <div><span>XP EARNED</span><b>{selectedMonthSummary.xpEarned.toLocaleString()}</b><small>From completed quests</small></div>
                      <div><span>FITNESS</span><b>{selectedMonthSummary.workoutDays} days</b><small>{selectedMonthSummary.workoutEntries} exercise entries · {Math.round(selectedMonthSummary.workoutVolumeKgReps).toLocaleString()} kg-reps</small></div>
                      <div><span>FOCUSED STUDY</span><b>{Math.floor(selectedMonthSummary.studyMinutes / 60)}h {selectedMonthSummary.studyMinutes % 60}m</b><small>Logged study time</small></div>
                      <div><span>NUTRITION</span><b>{Math.round(selectedMonthSummary.calories).toLocaleString()} kcal</b><small>{selectedMonthSummary.foodEntries} food entries · {Math.round(selectedMonthSummary.proteinGrams)} g protein</small></div>
                      <div><span>RECOVERY & WATER</span><b>{selectedMonthSummary.sleepHours.toFixed(1)}h sleep</b><small>{Math.round(selectedMonthSummary.waterMl / 1000)} L water logged</small></div>
                      {selectedMonthSummary.bodyWeightFirstKg !== undefined && selectedMonthSummary.bodyWeightLastKg !== undefined && (
                        <div><span>BODY WEIGHT</span><b>{selectedMonthSummary.bodyWeightLastKg} kg</b><small>{selectedMonthSummary.bodyWeightFirstKg} kg → {selectedMonthSummary.bodyWeightLastKg} kg in that month</small></div>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="muted">Monthly summaries appear here after the calendar moves into a new month. Detailed logs for the current month remain available in each module.</p>
                )}
              </section>
              <div className="rank-detail-grid">
                {categories.map((c) => (
                  <div className="panel rank-detail" key={c}>
                    <span>{c.toUpperCase()}</span>
                    <h2>{tierLabel(c)}</h2>
                    <p>
                      {data.ranks[c].successfulChallenges} successful ·{" "}
                      {data.ranks[c].failedChallenges} failed challenges
                    </p>
                    <div className="mini-track">
                      <i
                        style={{
                          width: `${Math.min(100, data.ranks[c].boundaryWins * 50)}%`,
                        }}
                      />
                    </div>
                    <small>
                      Rank-boundary wins: {data.ranks[c].boundaryWins}/2
                    </small>
                  </div>
                ))}
              </div>
              <div className="panel analytics-panel">
                <h2>Mission completion · last 7 days</h2>
                <div className="weekly-bars">
                  {weeklyProgress.map((entry) => (
                    <div className="weekly-bar" key={entry.day}>
                      <span>{entry.complete}</span>
                      <i
                        style={{
                          height: `${Math.max(8, (entry.complete / 7) * 100)}%`,
                        }}
                      />
                      <small>{entry.day}</small>
                    </div>
                  ))}
                </div>
              </div>
              <div className="panel">
                <h2>Medals & achievements</h2>
                <div className="achievement-list">
                  {data.achievements.length ? (
                    data.achievements.map((id) => (
                      <span className="achievement-medal" key={id}>
                        <Medal size={15} />
                        {ACHIEVEMENT_LABELS[id] ?? id}
                      </span>
                    ))
                  ) : (
                    <p className="muted">
                      Milestones you earn will be kept here permanently.
                    </p>
                  )}
                </div>
              </div>
              <div className="panel">
                <h2>Recent mission history</h2>
                {data.missions.length ? (
                  data.missions
                    .slice()
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .slice(0, 14)
                    .map((m) => (
                      <div className="history-row" key={m.id}>
                        <span>
                          {m.date} ·{" "}
                          {missions.find((x) => x.id === m.missionId)?.title ??
                            m.missionId}
                        </span>
                        <b>{m.status.toUpperCase()}</b>
                        <span>{m.xp} XP</span>
                        {m.status === "complete" ? (
                          <button
                            onClick={() => {
                              setReflectionMission(m.missionId);
                              setReflectionDate(m.date);
                              setReflectionNote(m.note ?? "");
                            }}
                          >
                            Mark missed
                          </button>
                        ) : m.status === "missed" ? (
                          <button
                            onClick={() =>
                              logMission(m.missionId, "complete", "", m.date)
                            }
                          >
                            Re-log complete
                          </button>
                        ) : null}
                      </div>
                    ))
                ) : (
                  <p className="muted">
                    Mission records appear here after you log a goal.
                  </p>
                )}
              </div>
              <div className="panel">
                <h2>Challenge history</h2>
                {data.challenges.length ? (
                  data.challenges.map((c) => (
                    <div className="history-row" key={c.id}>
                      <span>
                        {c.startDate} → {c.endDate}
                      </span>
                      <b>{c.status.toUpperCase()}</b>
                      <span>{c.overallPercentage ?? 0}% overall</span>
                      {c.categoryResults && (
                        <small>
                          {categories
                            .map(
                              (category) =>
                                `${category}: ${c.categoryResults?.[category].earned ?? 0}/${c.categoryResults?.[category].possible ?? 0} (${c.categoryResults?.[category].percentage ?? 0}%)`,
                            )
                            .join(" · ")}
                        </small>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="muted">
                    Your completed challenges will appear here.
                  </p>
                )}
              </div>
            </>
          )}
          {tab === "Inventory" && (
            <>
              <p className="eyebrow">REWARD STORAGE</p>
              <h1>Inventory</h1>
              <div className="panel inventory-summary">
                <Archive />
                <div>
                  <b>
                    {data.inventory.reduce((s, i) => s + i.quantity, 0)} items
                    available
                  </b>
                  <p className="muted">
                    {(
                      data.profile.availableXp ?? data.profile.lifetimeXp
                    ).toLocaleString()}{" "}
                    spendable XP · earned from completed main missions.
                  </p>
                </div>
              </div>
              <section className="inventory-shop">
                <div className="section-head">
                  <div>
                    <p className="eyebrow">XP SHOP</p>
                    <h2>Choose a reward</h2>
                  </div>
                  <span className="shop-balance">
                    {(
                      data.profile.availableXp ?? data.profile.lifetimeXp
                    ).toLocaleString()}{" "}
                    XP
                  </span>
                </div>
                <div className="shop-grid">
                  {shopItems.map((item) => (
                    <article className="panel shop-item" key={item.id}>
                      <span className="shop-item-icon">
                        {item.kind === "recovery_skip" ? (
                          <ShieldCheck size={20} />
                        ) : (
                          <Zap size={20} />
                        )}
                      </span>
                      <h3>{item.label}</h3>
                      <p className="muted">{item.description}</p>
                      <button
                        className="primary"
                        disabled={
                          (data.profile.availableXp ??
                            data.profile.lifetimeXp) < item.price
                        }
                        onClick={() => purchaseShopItem(item.id)}
                      >
                        <Zap size={15} />
                        {item.price} XP
                      </button>
                    </article>
                  ))}
                </div>
              </section>
              {data.inventory.length ? (
                data.inventory.map((i) => (
                  <div className="panel history-row" key={i.id}>
                    <span>{i.label}</span>
                    <b>×{i.quantity}</b>
                    <small>{i.kind.replace("_", " ")}</small>
                  </div>
                ))
              ) : (
                <div className="panel empty-state">
                  No items owned yet. Purchase an item with earned XP, or earn a
                  Recovery Skip from challenge milestones.
                </div>
              )}
            </>
          )}
          {tab === "Profile" && (
            <>
              <p className="eyebrow">PLAYER CONFIGURATION</p>
              <h1>Profile & settings</h1>
              <StepMap startDate={profileChallenge?.startDate} missions={data.missions} />
              <div className="panel settings-card">
                <h2>Account</h2>
                {googleUser ? (
                  <>
                    <p>
                      <span className="account-status"><i /> Google account connected</span><br />
                      {googleUser.displayName && <b>{googleUser.displayName} · </b>}
                      <b>{googleUser.email}</b>
                    </p>
                    <p className="muted">
                      Google sign-in is active, not guest mode. Your progress remains local to this device; use a backup to transfer it.
                    </p>
                    <button
                      className="danger"
                      disabled={authBusy}
                      onClick={logOutGoogle}
                    >
                      {authBusy ? "Signing out…" : "Log out of Google"}
                    </button>
                  </>
                ) : (
                  <>
                    <p className="muted">
                      Guest profile · your progress is saved locally on this device.
                    </p>
                    {firebaseAuthIsConfigured ? (
                      <div className="button-row">
                        <button className="primary" disabled={authBusy} onClick={beginGoogleLogin}>
                          {authBusy ? "Connecting…" : "Sign in with Google"}
                        </button>
                        <button className="logout-link" disabled={authBusy} onClick={logOutGoogle}>
                          Log out of guest profile
                        </button>
                      </div>
                    ) : (
                      <div className="warning inline-warning">
                        <ShieldAlert />
                        <p>
                          Google account sign-in is not configured for this
                          build yet. Guest mode remains available.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="panel settings-card profile-details">
                <h2>Player details</h2>
                <label className="field-label">
                  Display name
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    onBlur={() => setData({
                      ...data,
                      profile: { ...data.profile, displayName: name.trim() || "Player" },
                    })}
                  />
                </label>
                <label className="field-label">
                  Age <span className="muted inline-hint">Google does not share age automatically</span>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    inputMode="numeric"
                    placeholder="Optional"
                    value={data.profile.age ?? ""}
                    onChange={(event) => {
                      const value = event.target.value;
                      setData({
                        ...data,
                        profile: {
                          ...data.profile,
                          age: value === "" ? undefined : Math.max(1, Math.min(120, Number(value))),
                        },
                      });
                    }}
                  />
                </label>
                <div className="avatar-picker-section">
                  <div className="section-head">
                    <div><h3>Choose your avatar</h3><p className="muted">60 illustrated-style icons · saved on this device</p></div>
                    <span className="avatar-large">{data.profile.avatarId || profileAvatars[0]}</span>
                  </div>
                  <div className="avatar-picker">
                    {profileAvatars.map((avatar, index) => (
                      <button
                        type="button"
                        key={`${avatar}-${index}`}
                        className={data.profile.avatarId === avatar ? "avatar-option selected" : "avatar-option"}
                        aria-label={`Select avatar ${index + 1}: ${avatar}`}
                        aria-pressed={data.profile.avatarId === avatar}
                        onClick={() => setData({ ...data, profile: { ...data.profile, avatarId: avatar } })}
                      >{avatar}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="panel settings-card">
                <h2>Local data & backup</h2>
                <div className="warning inline-warning">
                  <ShieldAlert />
                  <p>
                    Your data is stored locally first. Use Google Drive or JSON
                    backups to move it to another device.
                  </p>
                </div>
                <div className="button-row">
                  <button className="primary" onClick={startFolder}>
                    <FolderOpen size={16} /> Choose backup folder
                  </button>
                  <button onClick={weeklyBackup}>Run weekly backup</button>
                  <button onClick={exportPlain}>Download JSON</button>
                  <button onClick={exportEncrypted}>Encrypted backup</button>
                  <button onClick={() => setShowRestore(true)}>
                    Restore JSON
                  </button>
                </div>
                <p className="muted">
                  Last weekly backup:{" "}
                  {data.settings.lastWeeklyBackupAt
                    ? new Date(
                        data.settings.lastWeeklyBackupAt,
                      ).toLocaleString()
                    : "Not yet created"}
                </p>
                <p className="muted">
                  Automatic weekly backup runs when you open the app and a full
                  week has elapsed, if folder permission is available.
                </p>
              </div>
              <div className="panel settings-card google-sync-card">
                <h2>Google account & Drive backup</h2>
                <p className="muted">{googleSyncStatus}</p>
                {googleSyncIsConfigured() ? (
                  <>
                    <p className="muted">
                      Connect with Google, then save or restore a JSON snapshot.
                      Sync is manual, so review the current device before
                      uploading. The access token stays in memory and expires
                      when this app session ends. Backups are stored in Google's
                      hidden app data folder.
                    </p>
                    <div className="button-row">
                      <button className="primary" onClick={connectGoogleDrive}>
                        {googleAccessToken
                          ? "Reconnect Google Drive"
                          : "Connect Google Drive"}
                      </button>
                      <button onClick={syncToGoogleDrive}>
                        Sync this device to Drive
                      </button>
                      <button onClick={restoreFromGoogleDrive}>
                        Restore from Drive
                      </button>
                      {googleAccessToken && (
                        <button onClick={disconnectGoogleDrive}>
                          Disconnect
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="warning inline-warning">
                    <ShieldAlert />
                    <p>
                      Google sign-in code is ready, but this site needs a Google
                      OAuth web client ID before the buttons can connect. Follow{" "}
                      <b>GOOGLE_SYNC_SETUP.md</b>; add it in Netlify environment
                      variables, then redeploy.
                    </p>
                  </div>
                )}
              </div>
              <div className="panel settings-card">
                <h2>Player preferences</h2>
                <label className="field-label">
                  Sleep target
                  <select
                    value={data.settings.sleepTargetHours}
                    onChange={(e) =>
                      setData({
                        ...data,
                        settings: {
                          ...data.settings,
                          sleepTargetHours: Number(e.target.value),
                        },
                      })
                    }
                  >
                    <option value="6">6 hours</option>
                    <option value="7">7 hours</option>
                    <option value="8">8 hours</option>
                    <option value="9">9 hours</option>
                  </select>
                </label>
                <label className="field-label">
                  Sleep minimum
                  <select
                    value={data.settings.sleepMinimumHours}
                    onChange={(e) =>
                      setData({
                        ...data,
                        settings: {
                          ...data.settings,
                          sleepMinimumHours: Number(e.target.value),
                        },
                      })
                    }
                  >
                    <option value="6">6 hours</option>
                    <option value="7">7 hours</option>
                  </select>
                </label>
                <div className="panel module-form">
                  <h2>Mission reminders</h2>
                  <p className="muted">
                    Browser reminders run only while Solo Leveling is open.
                    Quiet hours suppress reminders during the selected period.
                  </p>
                  <div className="button-row">
                    <button
                      onClick={() =>
                        data.settings.notificationsEnabled
                          ? setData({
                              ...data,
                              settings: {
                                ...data.settings,
                                notificationsEnabled: false,
                              },
                            })
                          : enableReminders()
                      }
                    >
                      {data.settings.notificationsEnabled
                        ? "Disable reminders"
                        : "Enable browser reminders"}
                    </button>
                  </div>
                  {data.settings.notificationsEnabled && (
                    <>
                      <label className="field-label">
                        Reminder time
                        <input
                          type="time"
                          value={data.settings.missionReminderTime ?? "20:00"}
                          onChange={(e) =>
                            setData({
                              ...data,
                              settings: {
                                ...data.settings,
                                missionReminderTime: e.target.value,
                              },
                            })
                          }
                        />
                      </label>
                      <label className="field-label">
                        <input
                          type="checkbox"
                          checked={data.settings.quietHours.enabled}
                          onChange={(e) =>
                            setData({
                              ...data,
                              settings: {
                                ...data.settings,
                                quietHours: {
                                  ...data.settings.quietHours,
                                  enabled: e.target.checked,
                                },
                              },
                            })
                          }
                        />{" "}
                        Enable quiet hours
                      </label>
                      <div className="form-grid">
                        <label className="field-label">
                          Quiet hours start
                          <input
                            type="time"
                            value={data.settings.quietHours.start}
                            onChange={(e) =>
                              setData({
                                ...data,
                                settings: {
                                  ...data.settings,
                                  quietHours: {
                                    ...data.settings.quietHours,
                                    start: e.target.value,
                                  },
                                },
                              })
                            }
                          />
                        </label>
                        <label className="field-label">
                          Quiet hours end
                          <input
                            type="time"
                            value={data.settings.quietHours.end}
                            onChange={(e) =>
                              setData({
                                ...data,
                                settings: {
                                  ...data.settings,
                                  quietHours: {
                                    ...data.settings.quietHours,
                                    end: e.target.value,
                                  },
                                },
                              })
                            }
                          />
                        </label>
                      </div>
                    </>
                  )}
                </div>
                <div className="setting-row">
                  <div>
                    <b>Global leaderboard</b>
                    <p className="muted">
                      Under development. No account or cloud connection in V1.
                    </p>
                  </div>
                  <span className="locked">LOCKED</span>
                </div>
                <div className="panel settings-card">
                  <h2>Local PIN</h2>
                  <p className="muted">
                    A 4–12 digit PIN gates the profile on this device. It does
                    not encrypt IndexedDB or backup files.
                  </p>
                  {data.settings.pinEnabled ? (
                    <div className="button-row">
                      <span className="locked">ENABLED</span>
                      <button onClick={disablePin}>Disable PIN</button>
                    </div>
                  ) : (
                    <>
                      <label className="field-label">
                        New PIN
                        <input
                          type="password"
                          inputMode="numeric"
                          autoComplete="new-password"
                          value={newPin}
                          onChange={(e) => setNewPin(e.target.value)}
                        />
                      </label>
                      <label className="field-label">
                        Confirm PIN
                        <input
                          type="password"
                          inputMode="numeric"
                          autoComplete="new-password"
                          value={confirmPin}
                          onChange={(e) => setConfirmPin(e.target.value)}
                        />
                      </label>
                      {pinError && <p className="pin-error">{pinError}</p>}
                      <button className="primary" onClick={savePin}>
                        Set local PIN
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="panel settings-card">
                <h2>Application data</h2>
                <button className="danger" onClick={deleteLocalData}>
                  Delete all local data
                </button>
              </div>
            </>
          )}
          <footer>
            SOLO LEVELING · LOCAL-FIRST PLAYER SYSTEM · V1.0 FOUNDATION · DATA{" "}
            {saveStatus.toUpperCase()}
          </footer>
        </main>
      </div>
      {reflectionMission && (
        <div className="modal-backdrop">
          <div className="panel modal">
            <h2>
              {missions.find((m) => m.id === reflectionMission)?.title}{" "}
              reflection
            </h2>
            <p className="muted">
              What got in the way, and what is one change you can try tomorrow?
              This is for learning, not judgment.
            </p>
            <textarea
              className="reflection-input"
              value={reflectionNote}
              onChange={(e) => setReflectionNote(e.target.value)}
              rows={4}
              placeholder="Optional note"
            />
            <div className="button-row">
              <button
                className="primary"
                onClick={() => {
                  logMission(
                    reflectionMission,
                    "missed",
                    reflectionNote,
                    reflectionDate,
                  );
                  setReflectionMission(null);
                  setReflectionNote("");
                }}
              >
                Save reflection
              </button>
              <button
                onClick={() => {
                  logMission(reflectionMission, "missed", "", reflectionDate);
                  setReflectionMission(null);
                }}
              >
                Mark missed without note
              </button>
              <button onClick={() => setReflectionMission(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {showRestore && (
        <div className="modal-backdrop">
          <div className="panel modal">
            <h2>Restore player data</h2>
            <p className="muted">
              Choose a previously exported Solo Leveling JSON backup. Existing
              local data will be replaced.
            </p>
            <input
              type="file"
              accept="application/json,.json"
              onChange={(e) => importFile(e.target.files?.[0])}
            />
            <button onClick={() => setShowRestore(false)}>Cancel</button>
          </div>
        </div>
      )}
      {notice && (
        <div className="toast" onClick={() => setNotice("")}>
          {notice}
          <button>×</button>
        </div>
      )}
    </div>
  );
}
