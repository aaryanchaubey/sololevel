import type { AppData, MonthlySummary } from "./types";

const monthOf = (date: string) => date.slice(0, 7);
const isPreviousMonth = (date: string, currentMonth: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(date) && monthOf(date) < currentMonth;

function emptySummary(month: string): MonthlySummary {
  return {
    month,
    missionCompletions: 0,
    missionMisses: 0,
    xpEarned: 0,
    workoutDays: 0,
    workoutEntries: 0,
    workoutVolumeKgReps: 0,
    studyMinutes: 0,
    studySessions: 0,
    foodEntries: 0,
    calories: 0,
    proteinGrams: 0,
    waterMl: 0,
    waterEntries: 0,
    sleepHours: 0,
    sleepEntries: 0,
    selfControlEntries: 0,
    selfControlOutcomes: {},
    digitalEntries: 0,
    digitalOutcomes: {},
    personalChallengeCheckins: 0,
    archivedAt: new Date().toISOString(),
  };
}

/** Roll older daily records into compact month totals; never touches current-month or active-challenge records. */
export function archiveCompletedMonths(data: AppData, today: string): AppData {
  const currentMonth = monthOf(today);
  const summaries = new Map(
    (data.monthlySummaries ?? []).map((summary) => [summary.month, summary]),
  );
  const summaryFor = (date: string) => {
    const month = monthOf(date);
    const summary = summaries.get(month) ?? emptySummary(month);
    summaries.set(month, summary);
    return summary;
  };
  const activeChallenge = data.activeChallenge?.status === "active"
    ? data.activeChallenge
    : undefined;
  const withinActiveChallenge = (date: string) => Boolean(
    activeChallenge && date >= activeChallenge.startDate && date <= activeChallenge.endDate,
  );
  const modules = { ...data.modules! };
  let changed = false;

  const archivedMissions = data.missions.filter((entry) =>
    isPreviousMonth(entry.date, currentMonth) && !withinActiveChallenge(entry.date),
  );
  if (archivedMissions.length) {
    changed = true;
    for (const entry of archivedMissions) {
      const summary = summaryFor(entry.date);
      if (entry.status === "complete") summary.missionCompletions += 1;
      if (entry.status === "missed") summary.missionMisses += 1;
      summary.xpEarned += entry.status === "complete" ? entry.xp : 0;
    }
  }

  const archiveModuleRecords = <T extends { date: string }>(
    entries: T[],
    consume: (entry: T, summary: MonthlySummary) => void,
    preserve: (entry: T) => boolean = () => false,
  ) => {
    const archived = entries.filter(
      (entry) => isPreviousMonth(entry.date, currentMonth) && !preserve(entry),
    );
    if (!archived.length) return entries;
    changed = true;
    for (const entry of archived) consume(entry, summaryFor(entry.date));
    return entries.filter((entry) => !archived.includes(entry));
  };

  const archivedWorkoutDates = new Map<string, Set<string>>();
  modules.workouts = archiveModuleRecords(modules.workouts, (entry, summary) => {
    summary.workoutEntries += 1;
    summary.workoutVolumeKgReps += entry.sets * entry.reps * entry.weightKg;
    const days = archivedWorkoutDates.get(summary.month) ?? new Set<string>();
    days.add(entry.date);
    archivedWorkoutDates.set(summary.month, days);
  });
  for (const [month, days] of archivedWorkoutDates)
    summaryFor(`${month}-01`).workoutDays += days.size;
  modules.study = archiveModuleRecords(modules.study, (entry, summary) => {
    summary.studyMinutes += entry.minutes;
    summary.studySessions += 1;
  });
  modules.food = archiveModuleRecords(modules.food, (entry, summary) => {
    summary.foodEntries += 1;
    summary.calories += entry.calories;
    summary.proteinGrams += entry.proteinGrams;
  });
  modules.water = archiveModuleRecords(modules.water, (entry, summary) => {
    summary.waterMl += entry.milliliters;
    summary.waterEntries += 1;
  });
  modules.sleep = archiveModuleRecords(modules.sleep, (entry, summary) => {
    summary.sleepHours += entry.hours;
    summary.sleepEntries += 1;
  });
  modules.selfControl = archiveModuleRecords(modules.selfControl, (entry, summary) => {
    summary.selfControlEntries += 1;
    summary.selfControlOutcomes[entry.outcome] = (summary.selfControlOutcomes[entry.outcome] ?? 0) + 1;
  });
  modules.digital = archiveModuleRecords(modules.digital, (entry, summary) => {
    summary.digitalEntries += 1;
    summary.digitalOutcomes[entry.outcome] = (summary.digitalOutcomes[entry.outcome] ?? 0) + 1;
  });
  modules.bodyWeights = archiveModuleRecords(
    modules.bodyWeights,
    (entry, summary) => {
      const previousFirst = summary.bodyWeightFirstDate;
      const previousLast = summary.bodyWeightLastDate;
      if (!previousFirst || entry.date < previousFirst) {
        summary.bodyWeightFirstDate = entry.date;
        summary.bodyWeightFirstKg = entry.weightKg;
      }
      if (!previousLast || entry.date > previousLast) {
        summary.bodyWeightLastDate = entry.date;
        summary.bodyWeightLastKg = entry.weightKg;
      }
    },
  );

  const activePersonalIds = new Set(
    (data.personalChallenges ?? [])
      .filter((challenge) => challenge.status === "active")
      .map((challenge) => challenge.id),
  );
  const personalLogs = data.personalChallengeLogs ?? [];
  const oldPersonalLogs = personalLogs.filter(
    (entry) =>
      isPreviousMonth(entry.date, currentMonth) &&
      !activePersonalIds.has(entry.challengeId),
  );
  if (oldPersonalLogs.length) {
    changed = true;
    for (const entry of oldPersonalLogs)
      summaryFor(entry.date).personalChallengeCheckins += 1;
  }

  if (!changed) return data;
  return {
    ...data,
    missions: data.missions.filter((entry) => !archivedMissions.includes(entry)),
    personalChallengeLogs: personalLogs.filter((entry) => !oldPersonalLogs.includes(entry)),
    modules,
    monthlySummaries: [...summaries.values()].sort((a, b) => b.month.localeCompare(a.month)),
  };
}
