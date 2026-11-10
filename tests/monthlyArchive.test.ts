import { describe, expect, it } from "vitest";
import { DEFAULT_DATA, DEFAULT_MODULES } from "../src/db";
import { archiveCompletedMonths } from "../src/monthlyArchive";

describe("archiveCompletedMonths", () => {
  it("compacts ended months while preserving active challenge records and current-month logs", () => {
    const data = {
      ...DEFAULT_DATA,
      profile: { ...DEFAULT_DATA.profile },
      settings: { ...DEFAULT_DATA.settings },
      ranks: { ...DEFAULT_DATA.ranks },
      activeChallenge: {
        id: "active",
        startDate: "2026-01-27",
        endDate: "2026-02-16",
        status: "active" as const,
        createdAt: "2026-01-27T00:00:00.000Z",
      },
      missions: [
        { id: "old", date: "2026-01-04", missionId: "study" as const, status: "complete" as const, xp: 30, createdAt: "2026-01-04T12:00:00.000Z" },
        { id: "challenge", date: "2026-01-30", missionId: "fitness" as const, status: "complete" as const, xp: 30, createdAt: "2026-01-30T12:00:00.000Z" },
        { id: "current", date: "2026-02-02", missionId: "study" as const, status: "complete" as const, xp: 30, createdAt: "2026-02-02T12:00:00.000Z" },
      ],
      personalChallenges: [{ id: "active-personal", title: "Read", goal: "Read", durationDays: 60, startDate: "2026-01-01", endDate: "2026-03-01", status: "active" as const, createdAt: "2026-01-01T00:00:00.000Z" }],
      personalChallengeLogs: [{ id: "personal", challengeId: "active-personal", date: "2026-01-08", completed: true, createdAt: "2026-01-08T12:00:00.000Z" }],
      modules: {
        ...DEFAULT_MODULES,
        workouts: [{ id: "lift", date: "2026-01-10", activity: "Gym", exercise: "Squat", sets: 3, reps: 8, weightKg: 50, notes: "", sessionId: "day-1" }],
        study: [{ id: "study", date: "2026-01-11", subject: "Math", topic: "", minutes: 90, notes: "" }],
        food: [{ id: "food", date: "2026-01-11", food: "Dal", portion: "1 bowl", calories: 250, proteinGrams: 12 }],
        water: [{ id: "water", date: "2026-01-11", milliliters: 500, createdAt: "2026-01-11T12:00:00.000Z" }],
        sleep: [{ id: "sleep", date: "2026-01-11", hours: 6, quality: 3, notes: "" }],
        bodyWeights: [{ id: "weight", date: "2026-01-12", weightKg: 70 }],
      },
    };

    const archived = archiveCompletedMonths(data, "2026-02-02");
    expect(archived.missions.map((entry) => entry.id)).toEqual(["challenge", "current"]);
    expect(archived.personalChallengeLogs).toHaveLength(1);
    expect(archived.modules?.workouts).toHaveLength(0);
    expect(archived.modules?.study).toHaveLength(0);
    expect(archived.monthlySummaries).toHaveLength(1);
    expect(archived.monthlySummaries?.[0]).toMatchObject({
      month: "2026-01",
      missionCompletions: 1,
      xpEarned: 30,
      workoutDays: 1,
      workoutEntries: 1,
      workoutVolumeKgReps: 1200,
      studyMinutes: 90,
      foodEntries: 1,
      calories: 250,
      proteinGrams: 12,
      waterMl: 500,
      sleepHours: 6,
      personalChallengeCheckins: 0,
      bodyWeightFirstKg: 70,
      bodyWeightLastKg: 70,
    });
  });

  it("does not rewrite data when there are no ended-month records", () => {
    const data = { ...DEFAULT_DATA, modules: { ...DEFAULT_MODULES } };
    expect(archiveCompletedMonths(data, "2026-02-02")).toBe(data);
  });
});
