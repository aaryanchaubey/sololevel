export type Category = "fitness" | "study" | "career" | "discipline";
export type RankName =
  | "Bronze"
  | "Silver"
  | "Gold"
  | "Platinum"
  | "Diamond"
  | "Emerald";
export type Tier = { rank: RankName; level: 3 | 2 | 1 };
export type MissionId =
  | "self_control"
  | "fitness"
  | "career"
  | "sleep"
  | "study"
  | "revision"
  | "digital";
export type MissionStatus = "complete" | "missed" | "skipped" | "pending";
export interface MissionLog {
  id: string;
  date: string;
  missionId: MissionId;
  status: MissionStatus;
  xp: number;
  note?: string;
  createdAt: string;
  previousStatus?: "complete" | "missed";
}
export interface Challenge {
  id: string;
  startDate: string;
  endDate: string;
  status: "active" | "passed" | "failed" | "cancelled";
  categoryResults?: Record<
    Category,
    { earned: number; possible: number; percentage: number; passed: boolean }
  >;
  overallPercentage?: number;
  createdAt: string;
  completedAt?: string;
}
export interface PersonalChallenge {
  id: string;
  title: string;
  goal: string;
  durationDays: number;
  startDate: string;
  endDate: string;
  status: "active" | "completed" | "cancelled";
  createdAt: string;
  completedAt?: string;
}
export interface PersonalChallengeLog {
  id: string;
  challengeId: string;
  date: string;
  completed: boolean;
  note?: string;
  createdAt: string;
}
export type CommunityChallengeStatus = "pending_review" | "published" | "rejected" | "removed" | "completed";
export interface CommunityChallenge {
  id: string;
  ownerUid: string;
  ownerName: string;
  title: string;
  goal: string;
  durationDays: number;
  startDate: string;
  endDate: string;
  status: CommunityChallengeStatus;
  createdAt: string;
  participantCount?: number;
}
export interface RankProgress {
  category: Category;
  tier: Tier;
  boundaryWins: number;
  successfulChallenges: number;
  failedChallenges: number;
}
export interface InventoryItem {
  id: string;
  kind: "recovery_skip" | "booster";
  target: Category | "any";
  label: string;
  quantity: number;
  earnedAt: string;
  expiresAt?: string;
}
export interface AppSettings {
  theme: string;
  themeMode?: "auto" | "manual";
  sleepTargetHours: number;
  sleepMinimumHours: number;
  backupFolderHandle?: FileSystemDirectoryHandle;
  lastWeeklyBackupAt?: string;
  pinEnabled: boolean;
  pinHash?: string;
  pinSalt?: string;
  notificationsEnabled?: boolean;
  missionReminderTime?: string;
  lastReminderDate?: string;
  quietHours: { enabled: boolean; start: string; end: string };
  leaderboardEnabled: boolean;
  dashboardChallengeFocus?: "main" | "personal";
  mainChallengeEnabled?: boolean;
}
export interface AppProfile {
  id: "local-player";
  displayName: string;
  createdAt: string;
  lifetimeXp: number;
  availableXp?: number;
  level: number;
  age?: number;
  avatarId?: string;
  accountType?: "guest" | "google";
  accountEmail?: string;
  googleUid?: string;
}
export interface MonthlySummary {
  month: string;
  missionCompletions: number;
  missionMisses: number;
  xpEarned: number;
  workoutDays: number;
  workoutEntries: number;
  workoutVolumeKgReps: number;
  studyMinutes: number;
  studySessions: number;
  foodEntries: number;
  calories: number;
  proteinGrams: number;
  waterMl: number;
  waterEntries: number;
  sleepHours: number;
  sleepEntries: number;
  bodyWeightFirstKg?: number;
  bodyWeightLastKg?: number;
  bodyWeightFirstDate?: string;
  bodyWeightLastDate?: string;
  selfControlEntries: number;
  selfControlOutcomes: Record<string, number>;
  digitalEntries: number;
  digitalOutcomes: Record<string, number>;
  personalChallengeCheckins: number;
  archivedAt: string;
}
export interface WorkoutEntry {
  id: string;
  date: string;
  activity: string;
  exercise: string;
  sets: number;
  reps: number;
  weightKg: number;
  notes: string;
  muscleGroup?: string;
  durationMinutes?: number;
  distanceKm?: number;
  rpe?: number;
  rir?: number;
  setType?: "Warm-up" | "Working";
  sessionId?: string;
}
export interface StudyEntry {
  id: string;
  date: string;
  subject: string;
  topic: string;
  minutes: number;
  notes: string;
}
export interface RevisionEntry {
  id: string;
  topic: string;
  subject: string;
  dueDate: string;
  completedAt?: string;
  notes: string;
  intervalDays?: number;
  nextReviewDate?: string;
  goalDate?: string;
  reviewHistory?: { reviewedAt: string; notes?: string; accuracy?: number }[];
}
export interface CareerEntry {
  id: string;
  company: string;
  role: string;
  url: string;
  status: string;
  deadline: string;
  notes: string;
  createdAt: string;
  discoveryDate?: string;
  resumeVersion?: string;
  recruiter?: string;
  interviewDate?: string;
  followUpDate?: string;
  feedback?: string;
  prepArea?: string;
  prepNotes?: string;
  mockScore?: number;
}
export interface FoodEntry {
  id: string;
  date: string;
  food: string;
  portion: string;
  calories: number;
  proteinGrams: number;
  carbohydrateGrams?: number;
  fatGrams?: number;
  fibreGrams?: number;
  micronutrients?: { calciumMg?: number; ironMg?: number };
  preparation?: "raw" | "cooked" | "recipe" | "packaged";
  ingredients?: string;
  source?: string;
  sourceFoodCode?: string;
  sourceFoodCodes?: string[];
  sourceRegions?: number;
  nutritionConfidence?:
    | "official-regional-mean"
    | "calculated-from-ifct"
    | "user-estimate"
    | "packaged-label";
}
export interface WaterEntry {
  id: string;
  date: string;
  milliliters: number;
  createdAt: string;
}
export interface BodyWeightEntry {
  id: string;
  date: string;
  weightKg: number;
  notes?: string;
}
export interface SleepEntry {
  id: string;
  date: string;
  hours: number;
  quality: number;
  notes: string;
  bedtime?: string;
  wakeTime?: string;
  napMinutes?: number;
}
export interface ReflectionEntry {
  id: string;
  date: string;
  outcome: string;
  notes: string;
  createdAt: string;
}
export interface GovernmentNotice {
  id: string;
  title: string;
  authority: string;
  status: "upcoming" | "open" | "closed";
  deadline: string;
  notificationUrl: string;
  applicationUrl: string;
  qualification: string;
  checkedAt: string;
}
export interface AppModules {
  workouts: WorkoutEntry[];
  bodyWeights: BodyWeightEntry[];
  study: StudyEntry[];
  revisions: RevisionEntry[];
  career: CareerEntry[];
  food: FoodEntry[];
  water: WaterEntry[];
  sleep: SleepEntry[];
  selfControl: ReflectionEntry[];
  digital: ReflectionEntry[];
  governmentNotices: GovernmentNotice[];
  hydrationTargetMl: number;
}
export interface AppData {
  schemaVersion: number;
  profile: AppProfile;
  settings: AppSettings;
  ranks: Record<Category, RankProgress>;
  activeChallenge?: Challenge;
  personalChallenges?: PersonalChallenge[];
  personalChallengeLogs?: PersonalChallengeLog[];
  activePersonalChallengeId?: string;
  challenges: Challenge[];
  missions: MissionLog[];
  inventory: InventoryItem[];
  achievements: string[];
  monthlySummaries?: MonthlySummary[];
  modules?: AppModules;
}
