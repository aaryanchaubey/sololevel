import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import type { AppModules, ReflectionEntry } from "./types";
import RecipeCalculator from "./RecipeCalculator";
import { IFCT_FOODS, IFCT_SOURCE } from "./data/ifctFoods";

type Props = {
  moduleId: string;
  modules: AppModules;
  onChange: (next: AppModules) => void;
  onBack: () => void;
};
const localDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const today = () => localDate(new Date());
const dateAfterDays = (days: number) => {
  const date = new Date(`${today()}T12:00:00`);
  date.setDate(date.getDate() + days);
  return localDate(date);
};
const id = () => crypto.randomUUID();
const nextReviewInterval = (current: number) =>
  [1, 3, 7, 14, 30][
    Math.min(4, Math.max(0, [1, 3, 7, 14, 30].indexOf(current) + 1))
  ];
const names: Record<string, string> = {
  fitness: "Fitness log",
  study: "Study & revision",
  career: "Career tracker",
  nutrition: "Nutrition log",
  hydration: "Hydration",
  sleep: "Sleep & recovery",
  self_control: "No FAP tracker",
  digital: "Digital discipline",
};
const foodPresets = IFCT_FOODS;

export default function ModuleWorkspace({
  moduleId,
  modules,
  onChange,
  onBack,
}: Props) {
  const [activity, setActivity] = useState("Gym");
  const [exercise, setExercise] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("Full body");
  const [duration, setDuration] = useState(60);
  const [distanceKm, setDistanceKm] = useState(0);
  const [rpe, setRpe] = useState(7);
  const [rir, setRir] = useState(2);
  const [setType, setSetType] = useState<"Warm-up" | "Working">("Working");
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState(0);
  const [bodyWeight, setBodyWeight] = useState(0);
  const [notes, setNotes] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [tomorrowGoal, setTomorrowGoal] = useState("");
  const [reviewInterval, setReviewInterval] = useState(1);
  const [minutes, setMinutes] = useState(25);
  const [focusedMinutes, setFocusedMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const [timerEndsAt, setTimerEndsAt] = useState<number | null>(null);
  const [timerComplete, setTimerComplete] = useState(false);
  const [reviewAccuracy, setReviewAccuracy] = useState(0);
  const [reviewNotes, setReviewNotes] = useState("");
  const [restSeconds, setRestSeconds] = useState(90);
  const [restRunning, setRestRunning] = useState(false);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("Saved");
  const [deadline, setDeadline] = useState("");
  const [discoveryDate, setDiscoveryDate] = useState(today());
  const [resumeVersion, setResumeVersion] = useState("");
  const [recruiter, setRecruiter] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [prepArea, setPrepArea] = useState("DSA");
  const [prepNotes, setPrepNotes] = useState("");
  const [mockScore, setMockScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [food, setFood] = useState("");
  const [portion, setPortion] = useState("100 g");
  const [portionGrams, setPortionGrams] = useState(100);
  const [foodPreset, setFoodPreset] = useState("");
  const [preparation, setPreparation] = useState<
    "raw" | "cooked" | "recipe" | "packaged"
  >("cooked");
  const [ingredients, setIngredients] = useState("");
  const [foodSource, setFoodSource] = useState("User-entered estimate");
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fat, setFat] = useState(0);
  const [fibre, setFibre] = useState(0);
  const [waterAmount, setWaterAmount] = useState(250);
  const [sleepHours, setSleepHours] = useState(6);
  const [quality, setQuality] = useState(3);
  const [bedtime, setBedtime] = useState("23:00");
  const [wakeTime, setWakeTime] = useState("05:00");
  const [napMinutes, setNapMinutes] = useState(0);
  const [reflectionOutcome, setReflectionOutcome] = useState("resisted");
  useEffect(() => {
    if (!running || timerEndsAt === null) return;
    const update = () => {
      const remaining = Math.max(
        0,
        Math.ceil((timerEndsAt - Date.now()) / 1000),
      );
      setSecondsLeft(remaining);
      if (remaining === 0) {
        setRunning(false);
        setTimerEndsAt(null);
        setTimerComplete(true);
      }
    };
    update();
    const timer = window.setInterval(update, 500);
    return () => window.clearInterval(timer);
  }, [running, timerEndsAt]);
  useEffect(() => {
    if (!restRunning) return;
    const timer = window.setInterval(
      () => setRestSeconds((s) => Math.max(0, s - 1)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [restRunning]);
  useEffect(() => {
    if (restRunning && restSeconds === 0) setRestRunning(false);
  }, [restRunning, restSeconds]);
  const addReflection = (kind: "selfControl" | "digital", outcome: string) => {
    const entry: ReflectionEntry = {
      id: id(),
      date: today(),
      outcome,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };
    onChange({ ...modules, [kind]: [entry, ...modules[kind]] });
    setNotes("");
  };
  const addWorkout = () => {
    const isGym = activity === "Gym";
    if (
      (isGym && !exercise.trim()) ||
      !Number.isFinite(duration) ||
      duration < 1 ||
      duration > 1440 ||
      !Number.isFinite(distanceKm) ||
      distanceKm < 0
    )
      return;
    const date = today();
    const sessionId =
      modules.workouts.find((w) => w.date === date)?.sessionId ?? id();
    onChange({
      ...modules,
      workouts: [
        {
          id: id(),
          sessionId,
          date,
          activity,
          exercise: exercise.trim() || activity,
          muscleGroup: isGym ? muscleGroup : activity,
          durationMinutes: Number(duration),
          distanceKm: distanceKm > 0 ? Number(distanceKm) : undefined,
          rpe: isGym ? Number(rpe) : undefined,
          rir: isGym ? Number(rir) : undefined,
          setType: isGym ? setType : undefined,
          sets: isGym ? Number(sets) : 0,
          reps: isGym ? Number(reps) : 0,
          weightKg: isGym ? Number(weight) : 0,
          notes: notes.trim(),
        },
        ...modules.workouts,
      ],
    });
    setExercise("");
    setDistanceKm(0);
    setNotes("");
  };
  const saveBodyWeight = () => {
    if (bodyWeight <= 0) return;
    const date = today();
    const previous = modules.bodyWeights.find((x) => x.date === date);
    onChange({
      ...modules,
      bodyWeights: [
        {
          id: previous?.id ?? id(),
          date,
          weightKg: Number(bodyWeight),
          notes: notes.trim(),
        },
        ...modules.bodyWeights.filter((x) => x.date !== date),
      ],
    });
    setNotes("");
  };
  const toggleFocusTimer = () => {
    if (running) {
      setSecondsLeft(
        Math.max(
          0,
          Math.ceil(((timerEndsAt ?? Date.now()) - Date.now()) / 1000),
        ),
      );
      setRunning(false);
      setTimerEndsAt(null);
      return;
    }
    const remaining = secondsLeft > 0 ? secondsLeft : Number(minutes) * 60;
    if (remaining <= 0) return;
    if (secondsLeft === 0) {
      setFocusedMinutes(Number(minutes));
      setTimerComplete(false);
    }
    setTimerEndsAt(Date.now() + remaining * 1000);
    setRunning(true);
  };
  const resetFocusTimer = () => {
    setRunning(false);
    setTimerEndsAt(null);
    setSecondsLeft(0);
    setTimerComplete(false);
  };
  const addStudy = () => {
    if (!subject.trim() || !timerComplete || focusedMinutes < 1) return;
    onChange({
      ...modules,
      study: [
        {
          id: id(),
          date: today(),
          subject: subject.trim(),
          topic: topic.trim(),
          minutes: focusedMinutes,
          notes: notes.trim(),
        },
        ...modules.study,
      ],
    });
    setNotes("");
    setTimerComplete(false);
    setSecondsLeft(0);
  };
  const addRevision = () => {
    if (!topic.trim() || !tomorrowGoal.trim()) return;
    onChange({
      ...modules,
      revisions: [
        {
          id: id(),
          topic: topic.trim(),
          subject: subject.trim() || "General",
          dueDate: today(),
          intervalDays: Number(reviewInterval),
          nextReviewDate: today(),
          goalDate: dateAfterDays(1),
          notes: tomorrowGoal.trim(),
        },
        ...modules.revisions,
      ],
    });
    setTopic("");
    setTomorrowGoal("");
  };
  const addCareer = () => {
    if (!company.trim() || !role.trim()) return;
    onChange({
      ...modules,
      career: [
        {
          id: id(),
          company: company.trim(),
          role: role.trim(),
          url: url.trim(),
          status,
          deadline,
          notes: notes.trim(),
          createdAt: new Date().toISOString(),
          discoveryDate,
          resumeVersion: resumeVersion.trim(),
          recruiter: recruiter.trim(),
          interviewDate,
          followUpDate,
          prepArea,
          prepNotes: prepNotes.trim(),
          mockScore: Number(mockScore),
          feedback: feedback.trim(),
        },
        ...modules.career,
      ],
    });
    setNotes("");
  };
  const addFood = () => {
    if (!food.trim() || portionGrams <= 0) return;
    const preset = foodPresets.find((item) => item.code === foodPreset);
    onChange({
      ...modules,
      food: [
        {
          id: id(),
          date: today(),
          food: food.trim(),
          portion: portion || `${portionGrams} g`,
          calories: Number(calories),
          proteinGrams: Number(protein),
          carbohydrateGrams: Number(carbs),
          fatGrams: Number(fat),
          fibreGrams: Number(fibre),
          micronutrients: preset
            ? {
                calciumMg:
                  preset.calciumMg === undefined
                    ? undefined
                    : Number(
                        ((preset.calciumMg * portionGrams) / 100).toFixed(1),
                      ),
                ironMg:
                  preset.ironMg === undefined
                    ? undefined
                    : Number(((preset.ironMg * portionGrams) / 100).toFixed(1)),
              }
            : undefined,
          preparation,
          ingredients: ingredients.trim(),
          source: preset
            ? `ICMR-NIN IFCT 2017 · Tables 1 and 5 · ${preset.code}`
            : foodSource.trim() || "User estimate",
          sourceFoodCode: preset?.code,
          sourceRegions: preset?.regions,
          nutritionConfidence: preset
            ? "official-regional-mean"
            : "user-estimate",
        },
        ...modules.food,
      ],
    });
    setFood("");
    setFoodPreset("");
    setIngredients("");
  };
  const addWater = (milliliters: number) =>
    onChange({
      ...modules,
      water: [
        {
          id: id(),
          date: today(),
          milliliters,
          createdAt: new Date().toISOString(),
        },
        ...modules.water,
      ],
    });
  const chooseFood = (code: string) => {
    setFoodPreset(code);
    const preset = foodPresets.find((item) => item.code === code);
    if (!preset) {
      setFood("");
      setFoodSource("User-entered estimate");
      setPreparation("cooked");
      setCalories(0);
      setProtein(0);
      setCarbs(0);
      setFat(0);
      setFibre(0);
      return;
    }
    setFood(preset.name);
    setPreparation(preset.preparation);
    setFoodSource(`ICMR-NIN IFCT 2017 · Table 1 · ${preset.code}`);
    const factor = portionGrams / 100;
    setCalories(Math.round(preset.kcal * factor));
    setProtein(Number((preset.protein * factor).toFixed(1)));
    setCarbs(Number((preset.carbs * factor).toFixed(1)));
    setFat(Number((preset.fat * factor).toFixed(1)));
    setFibre(Number((preset.fibre * factor).toFixed(1)));
  };
  const useQuickFood = (
    code: string,
    label: string,
    grams: number,
    basis: string,
  ) => {
    const preset = foodPresets.find((item) => item.code === code);
    if (!preset) return;
    setFoodPreset(code);
    setFood(label);
    setPortionGrams(grams);
    setPortion(`${grams} g (${basis})`);
    setPreparation(preset.preparation);
    setFoodSource(`ICMR-NIN IFCT 2017 · Table 1 · ${preset.code}`);
    const factor = grams / 100;
    setCalories(Math.round(preset.kcal * factor));
    setProtein(Number((preset.protein * factor).toFixed(1)));
    setCarbs(Number((preset.carbs * factor).toFixed(1)));
    setFat(Number((preset.fat * factor).toFixed(1)));
    setFibre(Number((preset.fibre * factor).toFixed(1)));
  };
  const setPortionSize = (grams: number) => {
    setPortionGrams(grams);
    setPortion(`${grams} g`);
    const preset = foodPresets.find((item) => item.code === foodPreset);
    if (preset) {
      const factor = grams / 100;
      setCalories(Math.round(preset.kcal * factor));
      setProtein(Number((preset.protein * factor).toFixed(1)));
      setCarbs(Number((preset.carbs * factor).toFixed(1)));
      setFat(Number((preset.fat * factor).toFixed(1)));
      setFibre(Number((preset.fibre * factor).toFixed(1)));
    }
  };
  const addSleep = () => {
    if (
      !Number.isFinite(sleepHours) ||
      sleepHours < 0 ||
      sleepHours > 24 ||
      !Number.isFinite(napMinutes) ||
      napMinutes < 0
    )
      return;
    const date = today();
    const previous = modules.sleep.find((entry) => entry.date === date);
    const entry = {
      id: previous?.id ?? id(),
      date,
      hours: Number(sleepHours),
      quality: Number(quality),
      notes: notes.trim(),
      bedtime,
      wakeTime,
      napMinutes: Number(napMinutes),
    };
    onChange({
      ...modules,
      sleep: [entry, ...modules.sleep.filter((item) => item.date !== date)],
    });
    setNotes("");
  };
  const field = (
    label: string,
    value: string | number,
    onChange: (v: string) => void,
    type = "text",
  ) => (
    <label className="field-label">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
  const editFoodEstimate =
    (update: (value: number) => void) => (value: string) => {
      update(Number(value));
      if (foodPreset) {
        setFoodPreset("");
        setFoodSource(
          `User-adjusted estimate based on IFCT 2017 food ${foodPreset}`,
        );
      }
    };
  const records = <T extends { id: string }>(
    items: T[],
    render: (item: T) => ReactNode,
  ) =>
    items.length ? (
      <div className="module-records">
        {items.slice(0, 12).map((item) => (
          <div className="panel module-record" key={item.id}>
            {render(item)}
          </div>
        ))}
      </div>
    ) : (
      <p className="muted">Nothing recorded yet.</p>
    );
  const workoutDays = Array.from(
    new Set(modules.workouts.map((entry) => entry.date)),
  )
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 14)
    .map((date) => ({
      date,
      exercises: modules.workouts.filter((entry) => entry.date === date),
    }));
  return (
    <section className={`module-workspace realm-workspace realm-${moduleId}`}>
      <div className="section-head realm-header">
        <div>
          <p className="eyebrow">PLAYER MODULE</p>
          <h1>{names[moduleId] ?? "Personal module"}</h1>
        </div>
        <button className="round-back" type="button" onClick={onBack} aria-label="Back" title="Back">
          <ArrowLeft size={18} />
        </button>
      </div>
      {moduleId === "fitness" && (
        <>
          <div className="panel module-form">
            <h2>Today’s training</h2>
            <p className="muted">
              Add exercises to one day-wise workout log. Entries for today stay grouped together.
            </p>
            <div
              className="activity-quick-picks"
              aria-label="Choose training type"
            >
              {[
                "Gym",
                "Running",
                "Walking",
                "Cycling",
                "Sport",
                "Mobility",
                "Meditation",
              ].map((item) => (
                <button
                  type="button"
                  key={item}
                  className={activity === item ? "selected" : ""}
                  onClick={() => {
                    setActivity(item);
                    if (item !== "Gym")
                      setDuration(item === "Meditation" ? 15 : 30);
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
            <label className="field-label">
              More activity types
              <select
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
              >
                {[
                  "Gym",
                  "Running",
                  "Badminton",
                  "Football",
                  "Sport",
                  "Mobility",
                  "Muay Thai / MMA",
                  "Meditation",
                  "Other",
                ].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label className="field-label">
              {activity === "Gym" ? "Exercise" : "Activity note (optional)"}
              <input
                list="exercise-library"
                value={exercise}
                onChange={(e) => setExercise(e.target.value)}
                placeholder={
                  activity === "Gym"
                    ? "e.g. Barbell squat"
                    : `Optional details for ${activity.toLowerCase()}`
                }
              />
              <datalist id="exercise-library">
                <option value="Squat" />
                <option value="Deadlift" />
                <option value="Bench press" />
                <option value="Overhead press" />
                <option value="Row" />
                <option value="Lat pulldown" />
                <option value="Push-up" />
                <option value="Pull-up" />
                <option value="Custom exercise" />
              </datalist>
            </label>
            {activity === "Gym" && (
              <>
                {field("Muscle group", muscleGroup, setMuscleGroup)}
                <div className="previous-performance">
                  {(() => {
                    const previous = modules.workouts.find(
                      (item) =>
                        item.exercise.toLowerCase() ===
                          exercise.trim().toLowerCase() &&
                        item.date !== today(),
                    );
                    return previous && exercise.trim() ? (
                      <small>
                        Last time · {previous.sets} × {previous.reps} ·{" "}
                        {previous.weightKg} kg · {previous.date}
                      </small>
                    ) : (
                      <small>
                        Choose a familiar exercise to see your previous session
                        here.
                      </small>
                    );
                  })()}
                </div>
              </>
            )}
            <div className="form-grid">
              {field(
                "Duration (minutes)",
                duration,
                (v) => setDuration(Number(v)),
                "number",
              )}
              {activity !== "Gym" &&
                ["Running", "Walking", "Cycling"].includes(activity) &&
                field(
                  "Distance (km)",
                  distanceKm,
                  (v) => setDistanceKm(Number(v)),
                  "number",
                )}
              {activity === "Gym" && (
                <>
                  {field("RPE (1–10)", rpe, (v) => setRpe(Number(v)), "number")}
                  {field("RIR (0–10)", rir, (v) => setRir(Number(v)), "number")}
                  <label className="field-label">
                    Set type
                    <select
                      value={setType}
                      onChange={(e) =>
                        setSetType(e.target.value as "Warm-up" | "Working")
                      }
                    >
                      <option>Warm-up</option>
                      <option>Working</option>
                    </select>
                  </label>
                  {field("Sets", sets, (v) => setSets(Number(v)), "number")}
                  {field("Reps", reps, (v) => setReps(Number(v)), "number")}
                  {field(
                    "Weight (kg)",
                    weight,
                    (v) => setWeight(Number(v)),
                    "number",
                  )}
                </>
              )}
            </div>
            {field("Notes", notes, setNotes)}
            <button className="primary" onClick={addWorkout}>
              Add to today’s log
            </button>
          </div>
          <div className="panel">
            <h2>Rest timer</h2>
            <div className="timer-face">
              {String(Math.floor(restSeconds / 60)).padStart(2, "0")}:
              {String(restSeconds % 60).padStart(2, "0")}
            </div>
            <div className="button-row">
              <button onClick={() => setRestRunning((v) => !v)}>
                {restRunning ? "Pause" : "Start"}
              </button>
              <button
                onClick={() => {
                  setRestRunning(false);
                  setRestSeconds(90);
                }}
              >
                Reset · 90 sec
              </button>
            </div>
          </div>
          <div className="panel">
            <h2>Training summary</h2>
            <p className="muted">
              {
                new Set(
                  modules.workouts
                    .filter((x) => x.date >= dateAfterDays(-6))
                    .map((x) => x.date),
                ).size
              }{" "}
              training days in the last 7 days ·{" "}
              {modules.workouts.filter((x) => x.date === today()).length}{" "}
              exercise entries today
              <br />
              7-day lifting volume:{" "}
              {modules.workouts
                .filter((x) => x.date >= dateAfterDays(-6))
                .reduce((sum, x) => sum + x.sets * x.reps * x.weightKg, 0)
                .toLocaleString()}{" "}
              kg-reps
            </p>
            <p className="muted">
              Best recorded load:{" "}
              {modules.workouts.length
                ? Math.max(...modules.workouts.map((x) => x.weightKg))
                : 0}{" "}
              kg
              <br />
              Weekly muscle groups:{" "}
              {Array.from(
                new Set(
                  modules.workouts
                    .filter((x) => x.date >= dateAfterDays(-6))
                    .map((x) => x.muscleGroup ?? "General"),
                ),
              )
                .map(
                  (g) =>
                    `${g}: ${modules.workouts.filter((x) => x.date >= dateAfterDays(-6) && (x.muscleGroup ?? "General") === g).reduce((sum, x) => sum + x.sets, 0)} sets`,
                )
                .join(" · ") || "No sets logged yet"}
            </p>
          </div>
          <div className="panel module-form">
            <h2>Body weight</h2>
            {field(
              "Weight (kg)",
              bodyWeight,
              (v) => setBodyWeight(Number(v)),
              "number",
            )}
            <button onClick={saveBodyWeight}>Save weight</button>
          </div>
          <div className="panel">
            <h2>Recent body-weight change</h2>
            <p className="muted">
              {modules.bodyWeights.length > 1
                ? `${modules.bodyWeights[0].weightKg - modules.bodyWeights[Math.min(6, modules.bodyWeights.length - 1)].weightKg} kg across recent records`
                : `${modules.bodyWeights.length} record saved`}
            </p>
          </div>
          {records(modules.bodyWeights, (x) => (
            <>
              <b>{x.weightKg} kg</b>
              <span>{x.date}</span>
            </>
          ))}
          <section className="workout-day-list">
            <h2>Workout log by day</h2>
            {workoutDays.length ? workoutDays.map(({ date, exercises }) => (
              <article className="panel workout-day-card" key={date}>
                <div className="workout-day-heading">
                  <b>{date === today() ? "Today" : new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</b>
                  <span>{exercises.length} {exercises.length === 1 ? "exercise" : "exercises"}</span>
                </div>
                <div className="workout-exercise-list">
                  {exercises.map((entry) => (
                    <div className="workout-exercise" key={entry.id}>
                      <div><b>{entry.activity === "Gym" ? entry.exercise : entry.activity}</b><small>{entry.activity === "Gym" ? entry.muscleGroup ?? "General" : entry.durationMinutes ? `${entry.durationMinutes} min` : "Activity"}{entry.distanceKm ? ` · ${entry.distanceKm} km` : ""}</small></div>
                      {entry.sets > 0 && <span>{entry.sets} × {entry.reps} · {entry.weightKg} kg</span>}
                      {entry.notes && <small className="exercise-notes">{entry.notes}</small>}
                    </div>
                  ))}
                </div>
              </article>
            )) : <p className="muted">Your daily exercise logs will appear here, grouped by day.</p>}
          </section>
        </>
      )}
      {moduleId === "study" && (
        <>
          <div className="panel module-form">
            <h2>Focus session</h2>
            <div className="timer-face">
              {String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:
              {String(secondsLeft % 60).padStart(2, "0")}
            </div>
            <div className="button-row">
              <button onClick={toggleFocusTimer}>
                {running ? "Pause timer" : "Start / resume focus timer"}
              </button>
              <button onClick={resetFocusTimer}>Reset</button>
            </div>
            <div className="form-grid">
              {field("Subject", subject, setSubject)}
              {field("Topic", topic, setTopic)}
              {field(
                "Session minutes",
                minutes,
                (v) => setMinutes(Number(v)),
                "number",
              )}
            </div>
            {field("Session notes", notes, setNotes)}
            <button
              className="primary"
              onClick={addStudy}
              disabled={!timerComplete}
            >
              Save completed focus session
            </button>
            <p className="muted">
              {timerComplete
                ? "Timer complete. Save this session."
                : "Finish the focus timer before saving."}
            </p>
          </div>
          <div className="panel">
            <h2>Study progress</h2>
            <p className="muted">
              Today:{" "}
              {modules.study
                .filter((x) => x.date === today())
                .reduce((sum, x) => sum + x.minutes, 0)}{" "}
              / 180 minutes · 7-day total:{" "}
              {modules.study
                .filter((x) => x.date >= dateAfterDays(-6))
                .reduce((sum, x) => sum + x.minutes, 0)}{" "}
              minutes
            </p>
          </div>
          <div className="panel module-form">
            <h2>Add revision topic & tomorrow’s goal</h2>
            {field("Subject", subject, setSubject)}
            {field("Topic to revise", topic, setTopic)}
            {field("One goal for tomorrow", tomorrowGoal, setTomorrowGoal)}
            <label className="field-label">
              Next review
              <select
                value={reviewInterval}
                onChange={(e) => setReviewInterval(Number(e.target.value))}
              >
                {[1, 3, 7, 14, 30].map((day) => (
                  <option key={day} value={day}>
                    {day} days
                  </option>
                ))}
              </select>
            </label>
            <button onClick={addRevision}>Add revision plan for today</button>
          </div>
          {records(modules.study, (x) => (
            <>
              <b>
                {x.subject}: {x.topic || "Study session"}
              </b>
              <span>
                {x.minutes} minutes · {x.date}
              </span>
              {x.notes && <small>{x.notes}</small>}
            </>
          ))}
          <h2>Revision queue</h2>
          {field(
            "Review accuracy (%)",
            reviewAccuracy,
            (v) => setReviewAccuracy(Number(v)),
            "number",
          )}
          {field("Review notes", reviewNotes, setReviewNotes)}
          {records(modules.revisions, (x) => (
            <>
              <b>
                {x.subject}: {x.topic}
              </b>
              <span>
                Due {x.dueDate} {x.completedAt ? "· reviewed" : ""} ·{" "}
                {x.reviewHistory?.length ?? 0} reviews logged
              </span>
              {(x.reviewHistory?.length ?? 0) > 0 && (
                <small>
                  Last accuracy:{" "}
                  {(x.reviewHistory ?? []).slice(-1)[0]?.accuracy ?? "—"}% ·{" "}
                  {(x.reviewHistory ?? [])
                    .slice(-1)[0]
                    ?.reviewedAt.slice(0, 10)}
                </small>
              )}
              {x.notes && (
                <small>
                  Tomorrow ({x.goalDate ?? dateAfterDays(1)}): {x.notes}
                </small>
              )}
              {x.dueDate <= today() ? (
                <button
                  onClick={() =>
                    onChange({
                      ...modules,
                      revisions: modules.revisions.map((r) =>
                        r.id === x.id
                          ? {
                              ...r,
                              completedAt: new Date().toISOString(),
                              intervalDays: nextReviewInterval(
                                r.intervalDays ?? 1,
                              ),
                              dueDate: dateAfterDays(r.intervalDays ?? 1),
                              nextReviewDate: dateAfterDays(
                                r.intervalDays ?? 1,
                              ),
                              reviewHistory: [
                                ...(r.reviewHistory ?? []),
                                {
                                  reviewedAt: new Date().toISOString(),
                                  accuracy: Number(reviewAccuracy),
                                  notes: reviewNotes.trim(),
                                },
                              ],
                            }
                          : r,
                      ),
                    })
                  }
                >
                  Mark reviewed · next in {x.intervalDays ?? 1}d
                </button>
              ) : (
                <small>Next review {x.dueDate}</small>
              )}
            </>
          ))}
        </>
      )}
      {moduleId === "career" && (
        <>
          <div className="panel module-form">
            <h2>Track a company or opening</h2>
            {field("Company / organization", company, setCompany)}
            {field("Role / opening", role, setRole)}
            {field("Source URL", url, setUrl, "url")}
            <div className="form-grid">
              <label className="field-label">
                Status
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {[
                    "Saved",
                    "To Apply",
                    "Applied",
                    "Assessment",
                    "Interview",
                    "Offer",
                    "Rejected",
                  ].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              {field("Deadline", deadline, setDeadline, "date")}
              {field("Discovery date", discoveryDate, setDiscoveryDate, "date")}
              {field("Resume version", resumeVersion, setResumeVersion)}
              {field("Recruiter", recruiter, setRecruiter)}
              {field("Interview date", interviewDate, setInterviewDate, "date")}
              {field("Follow-up date", followUpDate, setFollowUpDate, "date")}
              <label className="field-label">
                Preparation area
                <select
                  value={prepArea}
                  onChange={(e) => setPrepArea(e.target.value)}
                >
                  {[
                    "DSA",
                    "System design",
                    "Technical skills",
                    "Resume",
                    "Mock interview",
                  ].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              {field(
                "Mock interview score (%)",
                mockScore,
                (v) => setMockScore(Number(v)),
                "number",
              )}
              {field("Preparation notes", prepNotes, setPrepNotes)}
              {field("Interview feedback", feedback, setFeedback)}
            </div>
            {field("Notes", notes, setNotes)}
            <button className="primary" onClick={addCareer}>
              Save opportunity
            </button>
          </div>
          <div className="panel">
            <h2>Application pipeline</h2>
            <p className="muted">
              {modules.career.length} saved ·{" "}
              {
                modules.career.filter(
                  (x) =>
                    x.status === "Applied" ||
                    x.status === "Assessment" ||
                    x.status === "Interview",
                ).length
              }{" "}
              in progress ·{" "}
              {
                modules.career.filter(
                  (x) => x.followUpDate && x.followUpDate >= today(),
                ).length
              }{" "}
              follow-ups scheduled
            </p>
          </div>
          {records(modules.career, (x) => (
            <>
              <b>
                {x.company} · {x.role}
              </b>
              <label className="field-label">
                Application stage
                <select
                  value={x.status}
                  onChange={(e) =>
                    onChange({
                      ...modules,
                      career: modules.career.map((item) =>
                        item.id === x.id
                          ? { ...item, status: e.target.value }
                          : item,
                      ),
                    })
                  }
                >
                  {[
                    "Saved",
                    "To Apply",
                    "Applied",
                    "Assessment",
                    "Interview",
                    "Offer",
                    "Rejected",
                  ].map((stage) => (
                    <option key={stage}>{stage}</option>
                  ))}
                </select>
              </label>
              <span>{x.deadline ? `Deadline ${x.deadline}` : ""}</span>
              {x.url && (
                <a href={x.url} target="_blank" rel="noreferrer">
                  Open source page ↗
                </a>
              )}
              {x.discoveryDate && <small>Found: {x.discoveryDate}</small>}
              {x.resumeVersion && <small>Resume: {x.resumeVersion}</small>}
              {x.feedback && <small>Feedback: {x.feedback}</small>}
              {x.recruiter && <small>Recruiter: {x.recruiter}</small>}
              {x.interviewDate && <small>Interview: {x.interviewDate}</small>}
              {x.followUpDate && <small>Follow-up: {x.followUpDate}</small>}
              {x.prepArea && (
                <small>
                  Prep: {x.prepArea} · {x.prepNotes}
                </small>
              )}
              {(x.mockScore ?? 0) > 0 && (
                <small>Mock score: {x.mockScore}%</small>
              )}
              {x.feedback && <small>Feedback: {x.feedback}</small>}
              {x.notes && <small>{x.notes}</small>}
            </>
          ))}
        </>
      )}
      {moduleId === "nutrition" && (
        <>
          <div className="panel module-form">
            <h2>IFCT foods &amp; custom estimates</h2>
            <label className="field-label">
              Food preset
              <select
                value={foodPreset}
                onChange={(e) => chooseFood(e.target.value)}
              >
                <option value="">Choose a basic food or enter your own</option>
                {foodPresets.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.name} · IFCT {item.code}
                  </option>
                ))}
              </select>
            </label>
            <div className="quick-food-presets">
              <b>Indian quick presets</b>
              <div>
                {[
                  {
                    code: "A019",
                    name: "Roti / chapati",
                    grams: 30,
                    basis: "dry atta basis",
                  },
                  {
                    code: "B021",
                    name: "Toor daal",
                    grams: 50,
                    basis: "dry dal basis",
                  },
                  {
                    code: "A015",
                    name: "Chawal",
                    grams: 50,
                    basis: "dry rice basis",
                  },
                  {
                    code: "L003",
                    name: "Paneer",
                    grams: 100,
                    basis: "plain paneer",
                  },
                  {
                    code: "E012",
                    name: "Banana",
                    grams: 100,
                    basis: "edible portion",
                  },
                  {
                    code: "E028",
                    name: "Guava",
                    grams: 100,
                    basis: "edible portion",
                  },
                  {
                    code: "D059",
                    name: "Papaya",
                    grams: 100,
                    basis: "edible portion",
                  },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.name}
                    onClick={() =>
                      useQuickFood(item.code, item.name, item.grams, item.basis)
                    }
                  >
                    {item.name}
                  </button>
                ))}
              </div>
              <small>
                Roti, dal and chawal use the listed IFCT dry ingredient weight;
                cooking water and added oil are not included.
              </small>
            </div>
            {field("Food / recipe", food, (v) => {
              setFood(v);
              if (foodPreset) {
                setFoodPreset("");
                setFoodSource("User-entered estimate");
                setCalories(0);
                setProtein(0);
                setCarbs(0);
                setFat(0);
                setFibre(0);
              }
            })}
            <label className="field-label">
              Preparation
              <select
                value={preparation}
                disabled={Boolean(foodPreset)}
                title={
                  foodPreset
                    ? "Preparation is defined by the selected IFCT food. Choose a custom food to change it."
                    : undefined
                }
                onChange={(e) =>
                  setPreparation(e.target.value as typeof preparation)
                }
              >
                <option value="raw">Raw</option>
                <option value="cooked">Cooked</option>
                <option value="recipe">Recipe</option>
                <option value="packaged">Packaged</option>
              </select>
            </label>
            {field("Ingredients / oil / ghee", ingredients, setIngredients)}
            {foodPreset ? (
              <small>Source: ICMR-NIN IFCT 2017 · Table 1 · {foodPreset}</small>
            ) : (
              field(
                "Estimate source / label reference",
                foodSource,
                setFoodSource,
              )
            )}
            {field(
              "Portion size (grams)",
              portionGrams,
              (v) => setPortionSize(Number(v)),
              "number",
            )}
            <div className="form-grid">
              {field(
                "Estimated calories",
                calories,
                editFoodEstimate(setCalories),
                "number",
              )}
              {field(
                "Protein (g)",
                protein,
                editFoodEstimate(setProtein),
                "number",
              )}
              {field(
                "Carbohydrate (g)",
                carbs,
                editFoodEstimate(setCarbs),
                "number",
              )}
              {field("Fat (g)", fat, editFoodEstimate(setFat), "number")}
              {field("Fibre (g)", fibre, editFoodEstimate(setFibre), "number")}
            </div>
            <p className="muted">
              Preset values come from IFCT 2017 and are scaled from per 100 g
              edible portion to your entered serving. Region counts show the
              table coverage. Cooked dishes, added oil/ghee, and packaged brands
              vary. The recipe calculator below combines measured IFCT
              ingredients and reports values per serving. Custom foods remain
              your own estimates. Reference:{" "}
              <a href={IFCT_SOURCE} target="_blank" rel="noreferrer">
                ICMR-NIN Indian Food Composition Tables ↗
              </a>
            </p>
            {foodPresets.find((item) => item.code === foodPreset) && (
              <small>
                IFCT {foodPreset} · mean sampled across{" "}
                {foodPresets.find((item) => item.code === foodPreset)?.regions}{" "}
                region(s). Values are a food-table reference, not lab analysis
                of your serving.
              </small>
            )}
            <button className="primary nutrition-save" onClick={addFood}>
              Save food
            </button>
          </div>
          <div className="panel">
            <h2>Today’s estimate</h2>
            <p className="muted">
              {modules.food
                .filter((x) => x.date === today())
                .reduce((sum, x) => sum + x.calories, 0)}{" "}
              kcal ·{" "}
              {modules.food
                .filter((x) => x.date === today())
                .reduce((sum, x) => sum + x.proteinGrams, 0)
                .toFixed(1)}{" "}
              g protein
            </p>
          </div>
          {records(modules.food, (x) => (
            <>
              <b>{x.food}</b>
              <span>
                {x.portion} · {x.calories} kcal · {x.proteinGrams} g protein ·{" "}
                {x.carbohydrateGrams ?? 0} g carbs · {x.fatGrams ?? 0} g fat ·{" "}
                {x.fibreGrams ?? 0} g fibre
              </span>
              {x.micronutrients && (
                <small>
                  {x.micronutrients.calciumMg !== undefined
                    ? `Calcium ${x.micronutrients.calciumMg} mg`
                    : ""}
                  {x.micronutrients.calciumMg !== undefined &&
                  x.micronutrients.ironMg !== undefined
                    ? " · "
                    : ""}
                  {x.micronutrients.ironMg !== undefined
                    ? `Iron ${x.micronutrients.ironMg} mg`
                    : ""}
                </small>
              )}
              <small>
                {x.date} · {x.preparation ?? "cooked"} ·{" "}
                {x.sourceFoodCode
                  ? `IFCT ${x.sourceFoodCode}, ${x.sourceRegions} sampled regions`
                  : `${x.nutritionConfidence ?? "user-estimate"} · ${x.source ?? "user-entered"}`}
              </small>
              {x.ingredients && <small>Ingredients: {x.ingredients}</small>}
            </>
          ))}
        </>
      )}
      {moduleId === "nutrition" && (
        <RecipeCalculator
          date={today()}
          onSave={(entry) =>
            onChange({ ...modules, food: [entry, ...modules.food] })
          }
        />
      )}
      {moduleId === "hydration" &&
        (() => {
          const waterToday = modules.water
            .filter((x) => x.date === today())
            .reduce((sum, x) => sum + x.milliliters, 0);
          const target = modules.hydrationTargetMl;
          return (
            <>
              <div className="panel module-form">
                <h2>Today’s water</h2>
                <b className="water-total">{waterToday.toLocaleString()} ml</b>
                <p className="muted">
                  {target > 0
                    ? `${Math.min(100, Math.round((waterToday / target) * 100))}% of your personal ${target.toLocaleString()} ml target`
                    : "Set a personal target if you want one."}
                </p>
                <small>
                  7-day total:{" "}
                  {modules.water
                    .filter((x) => x.date >= dateAfterDays(-6))
                    .reduce((sum, x) => sum + x.milliliters, 0)
                    .toLocaleString()}{" "}
                  ml
                </small>
                <label className="field-label">
                  Personal daily target (ml)
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={target}
                    onChange={(e) =>
                      onChange({
                        ...modules,
                        hydrationTargetMl: Number(e.target.value),
                      })
                    }
                  />
                </label>
                <div className="button-row">
                  {[150, 250, 500].map((ml) => (
                    <button key={ml} onClick={() => addWater(ml)}>
                      +{ml} ml
                    </button>
                  ))}
                </div>
                {field(
                  "Custom amount (ml)",
                  waterAmount,
                  (v) => setWaterAmount(Number(v)),
                  "number",
                )}
                <button
                  className="primary"
                  onClick={() =>
                    waterAmount > 0 && addWater(Number(waterAmount))
                  }
                >
                  Add water
                </button>
              </div>
              {records(modules.water, (x) => (
                <>
                  <b>{x.milliliters} ml</b>
                  <span>{new Date(x.createdAt).toLocaleString()}</span>
                </>
              ))}
            </>
          );
        })()}
      {moduleId === "sleep" && (
        <>
          <div className="panel module-form">
            <h2>Sleep & recovery</h2>
            <p className="muted">
              Enter your sleep duration directly; bedtime and wake time are
              saved as context, and naps are tracked separately. Saving again
              today updates that record. Your mission goal is 6 hours.
            </p>
            <div className="form-grid">
              <label className="field-label">
                Hours slept
                <input
                  type="number"
                  min="0"
                  max="24"
                  step="0.25"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(Number(e.target.value))}
                />
              </label>
              {field(
                "Quality (1–5)",
                quality,
                (v) => setQuality(Number(v)),
                "number",
              )}
            </div>
            <div className="form-grid">
              <label className="field-label">
                Bedtime
                <input
                  type="time"
                  value={bedtime}
                  onChange={(e) => setBedtime(e.target.value)}
                />
              </label>
              <label className="field-label">
                Wake time
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                />
              </label>
              {field(
                "Nap minutes",
                napMinutes,
                (v) => setNapMinutes(Number(v)),
                "number",
              )}
            </div>
            {field("Notes", notes, setNotes)}
            <button className="primary" onClick={addSleep}>
              Save sleep record
            </button>
          </div>
          <div className="panel">
            <h2>Recent sleep</h2>
            <p className="muted">
              7-day average:{" "}
              {(() => {
                const recent = modules.sleep.filter(
                  (x) => x.date >= dateAfterDays(-6),
                );
                return recent.length
                  ? (
                      recent.reduce((sum, x) => sum + x.hours, 0) /
                      recent.length
                    ).toFixed(1)
                  : "—";
              })()}{" "}
              hours ·{" "}
              {modules.sleep.filter((x) => x.date >= dateAfterDays(-6)).length}{" "}
              nights recorded
            </p>
          </div>
          {records(modules.sleep, (x) => (
            <>
              <b>
                {x.hours} hours · quality {x.quality}/5
              </b>
              <span>
                {x.date}
                {x.bedtime && x.wakeTime ? ` · ${x.bedtime}–${x.wakeTime}` : ""}
                {x.napMinutes ? ` · nap ${x.napMinutes} min` : ""}
              </span>
              {x.notes && <small>{x.notes}</small>}
            </>
          ))}
        </>
      )}
      {moduleId === "self_control" && (
        <>
          <div className="panel module-form">
            <h2>Private, non-judgmental log</h2>
            <p className="muted">
              Track your personal No FAP goal. Record choices honestly;
              involuntary events are not intentional choices.
            </p>
            <label className="field-label">
              Outcome
              <select
                value={reflectionOutcome}
                onChange={(e) => setReflectionOutcome(e.target.value)}
              >
                <option value="resisted">Stayed on track</option>
                <option value="slip">I had a slip</option>
                <option value="involuntary">Involuntary event</option>
                <option value="urge">Urge only</option>
              </select>
            </label>
            {field("Trigger or reflection (optional)", notes, setNotes)}
            <button
              className="primary"
              onClick={() => addReflection("selfControl", reflectionOutcome)}
            >
              Save private entry
            </button>
          </div>
          {records(modules.selfControl, (x) => (
            <>
              <b>{x.outcome}</b>
              <span>{x.date}</span>
              {x.notes && <small>{x.notes}</small>}
            </>
          ))}
        </>
      )}
      {moduleId === "digital" && (
        <>
          <div className="panel module-form">
            <h2>Digital discipline log</h2>
            <p className="muted">
              Accidental exposure is fine and does not count as intentional use.
            </p>
            <label className="field-label">
              Outcome
              <select
                value={reflectionOutcome}
                onChange={(e) => setReflectionOutcome(e.target.value)}
              >
                <option value="avoided">Avoided intentional use</option>
                <option value="intentional">Intentional use</option>
                <option value="accidental">Accidental exposure</option>
              </select>
            </label>
            {field("Optional note", notes, setNotes)}
            <button
              className="primary"
              onClick={() => addReflection("digital", reflectionOutcome)}
            >
              Save private entry
            </button>
          </div>
          {records(modules.digital, (x) => (
            <>
              <b>{x.outcome}</b>
              <span>{x.date}</span>
              {x.notes && <small>{x.notes}</small>}
            </>
          ))}
        </>
      )}
    </section>
  );
}
