import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Archive,
  BarChart3,
  Brain,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  Dumbbell,
  Edit3,
  Eye,
  Download,
  FileText,
  Flame,
  HeartPulse,
  History,
  Home,
  Layers3,
  Leaf,
  LineChart,
  ListPlus,
  MessageCircle,
  Moon,
  Plus,
  RefreshCcw,
  Save,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  UserRound,
  Users,
  X,
} from "lucide-react";

const STORAGE_KEY = "sadhana-os-demo-v5";

const ICONS = {
  Activity,
  MessageCircle,
  Eye,
  Leaf,
  Dumbbell,
  Brain,
  Users,
  Briefcase,
  Home,
  HeartPulse,
  Moon,
  Target,
  Layers3,
};

const OPERATE_ITEMS = [
  { id: "today", label: "Today", icon: CalendarDays },
  { id: "journal", label: "Journal", icon: FileText },
  { id: "studio", label: "Habit Studio", icon: SlidersHorizontal },
];

const REVIEW_ITEMS = [
  { id: "insights", label: "Insights", icon: BarChart3, detail: "Patterns and balance" },
  { id: "history", label: "History", icon: History, detail: "Day-by-day record" },
  { id: "audit", label: "Audit", icon: Clock3, detail: "Governance trail" },
];

const STATUS_META = {
  done: { label: "Done", score: 1, className: "is-done" },
  partial: { label: "Partial", score: 0.5, className: "is-partial" },
  missed: { label: "Missed", score: 0, className: "is-missed" },
};

const TRACKING_TYPES = {
  completion: {
    label: "Completion",
    hint: "Done, partial, or missed",
    defaultUnit: "session",
  },
  numeric: {
    label: "Number",
    hint: "Count measurable output",
    defaultUnit: "count",
  },
  duration: {
    label: "Duration",
    hint: "Minutes or hours practiced",
    defaultUnit: "min",
  },
  checklist: {
    label: "Checklist",
    hint: "Steps or sub-actions completed",
    defaultUnit: "steps",
  },
  reflection: {
    label: "Reflection",
    hint: "Qualitative review with a note",
    defaultUnit: "lines",
  },
};

const YOGA_LIMB_ALIASES = {
  Yama: "Restraint (Yama)",
  Niyama: "Observance (Niyama)",
  Asana: "Posture (Asana)",
  Pranayama: "Breath control (Pranayama)",
  Pratyahara: "Sense withdrawal (Pratyahara)",
  Dharana: "Concentration (Dharana)",
  Dhyana: "Meditation (Dhyana)",
  Samadhi: "Absorption (Samadhi)",
};

const STATUS_LABELS_BY_TYPE = {
  completion: { done: "Done", partial: "Partial", missed: "Missed" },
  numeric: { done: "Target met", partial: "Some count", missed: "None" },
  duration: { done: "Full time", partial: "Some time", missed: "Skipped" },
  checklist: { done: "All steps", partial: "Some steps", missed: "Skipped" },
  reflection: { done: "Reflected", partial: "Brief note", missed: "Skipped" },
};

const REVIEW_WINDOWS = [
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
  { label: "1y", days: 365 },
  { label: "5y", days: 1825 },
];

const uid = (prefix) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const toDateKey = (date = new Date()) => date.toISOString().slice(0, 10);

const offsetDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return toDateKey(date);
};

const formatShortDate = (dateKey) =>
  new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(`${dateKey}T12:00:00`));

const formatTime = (iso) =>
  new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));

const makeCategory = (id, name, icon, color, description, names) => ({
  id,
  name,
  icon,
  color,
  description,
  active: true,
  subcategories: names.map((subName) => ({
    id: `${id}-${subName.toLowerCase().replaceAll(" ", "-")}`,
    name: subName,
    active: true,
  })),
});

const seedCategories = () => [
  makeCategory("yoga", "8 Limbs of Yoga", "Activity", "#496b8f", "Classical practice and inner discipline.", [
    "Restraint (Yama)",
    "Observance (Niyama)",
    "Posture (Asana)",
    "Breath control (Pranayama)",
    "Sense withdrawal (Pratyahara)",
    "Concentration (Dharana)",
    "Meditation (Dhyana)",
    "Absorption (Samadhi)",
  ]),
  makeCategory("speech", "Speech", "MessageCircle", "#b96f43", "Speech control, clarity, restraint, and kindness.", [
    "Speech control",
    "Mindful words",
    "Listening",
  ]),
  makeCategory("senses", "Six Senses Control", "Eye", "#6f7f42", "Awareness and discipline across sensory inputs.", [
    "Sight",
    "Hearing",
    "Smell",
    "Taste",
    "Touch",
    "Mind",
  ]),
  makeCategory("spiritual", "Spiritual", "Leaf", "#3e8064", "Daily connection, devotion, gratitude, and study.", [
    "Prayer",
    "Scripture",
    "Gratitude",
  ]),
  makeCategory("physical", "Physical", "Dumbbell", "#a64f5f", "Strength, movement, recovery, and vitality.", [
    "Exercise",
    "Nutrition",
    "Sleep",
  ]),
  makeCategory("mental", "Mental", "Brain", "#7a67a7", "Focus, emotional regulation, and learning.", [
    "Focus",
    "Journaling",
    "Reading",
  ]),
  makeCategory("society", "Society", "Users", "#3a7d8c", "Contribution, service, and social commitments.", [
    "Service",
    "Friends",
    "Community",
  ]),
  makeCategory("professional", "Professional", "Briefcase", "#5e745d", "Career growth, deep work, and skill building.", [
    "Deep work",
    "Learning",
    "Networking",
  ]),
  makeCategory("family", "Family", "Home", "#9a6b34", "Care, responsibilities, and shared rituals.", [
    "Presence",
    "Responsibilities",
    "Rituals",
  ]),
];

const seedMembers = () => [
  {
    id: "aarav",
    name: "Aarav",
    role: "Parent",
    focus: "steady discipline",
    tone: "#496b8f",
    initials: "AA",
  },
  {
    id: "meera",
    name: "Meera",
    role: "Parent",
    focus: "wellbeing and family rhythm",
    tone: "#3e8064",
    initials: "MR",
  },
  {
    id: "isha",
    name: "Isha",
    role: "Teen",
    focus: "study focus and confidence",
    tone: "#b96f43",
    initials: "IS",
  },
  {
    id: "dev",
    name: "Dev",
    role: "Child",
    focus: "simple routines",
    tone: "#7a67a7",
    initials: "DV",
  },
];

const habitSeed = [
  {
    id: "h-pranayama",
    categoryId: "yoga",
    subcategoryName: "Breath control (Pranayama)",
    title: "12 minute pranayama",
    target: 12,
    unit: "min",
    frequency: "Daily",
    memberIds: ["aarav", "meera"],
    smart: {
      specific: "Practice alternate nostril breathing with a calm count.",
      measurable: "12 focused minutes before breakfast.",
      achievable: "Use a timer and sit near the window.",
      relevant: "Improves energy and steadiness for the day.",
      timeBound: "Complete by 7:30 AM.",
    },
  },
  {
    id: "h-speech-pause",
    categoryId: "speech",
    subcategoryName: "Speech control",
    title: "Pause before difficult replies",
    target: 3,
    unit: "pauses",
    frequency: "Daily",
    memberIds: ["aarav", "meera", "isha"],
    smart: {
      specific: "Use one breath before responding in tense moments.",
      measurable: "Record three successful pauses.",
      achievable: "Tie it to work and family conversations.",
      relevant: "Builds trust and reduces reactive speech.",
      timeBound: "Review during evening reflection.",
    },
  },
  {
    id: "h-sense-screen",
    categoryId: "senses",
    subcategoryName: "Sight",
    title: "Screen sunset",
    target: 45,
    unit: "min",
    frequency: "Daily",
    memberIds: ["aarav", "meera", "isha", "dev"],
    smart: {
      specific: "Stop recreational screens before sleep.",
      measurable: "45 minutes screen-free before bed.",
      achievable: "Charge devices outside bedrooms.",
      relevant: "Improves sleep and sensory restraint.",
      timeBound: "Start by 9:15 PM.",
    },
  },
  {
    id: "h-prayer",
    categoryId: "spiritual",
    subcategoryName: "Prayer",
    title: "Morning offering",
    target: 1,
    unit: "session",
    frequency: "Daily",
    memberIds: ["aarav", "meera", "dev"],
    smart: {
      specific: "Begin the day with prayer and a clear intention.",
      measurable: "One uninterrupted session.",
      achievable: "Keep it short and consistent.",
      relevant: "Connects discipline with meaning.",
      timeBound: "Complete before the first meeting or class.",
    },
  },
  {
    id: "h-walk",
    categoryId: "physical",
    subcategoryName: "Exercise",
    title: "Brisk walk",
    target: 30,
    unit: "min",
    frequency: "Daily",
    memberIds: ["aarav", "meera"],
    smart: {
      specific: "Walk outdoors at a pace that raises heart rate.",
      measurable: "30 minutes tracked on the watch.",
      achievable: "Use lunch break or evening school pickup.",
      relevant: "Supports energy, mood, and longevity.",
      timeBound: "Complete before dinner.",
    },
  },
  {
    id: "h-journal",
    categoryId: "mental",
    subcategoryName: "Journaling",
    title: "Two line reflection",
    target: 2,
    unit: "lines",
    frequency: "Daily",
    memberIds: ["aarav", "meera", "isha"],
    smart: {
      specific: "Write what worked and what needs adjustment.",
      measurable: "At least two honest lines.",
      achievable: "Use the review panel after tracking.",
      relevant: "Turns action into learning.",
      timeBound: "Complete before sleep.",
    },
  },
  {
    id: "h-service",
    categoryId: "society",
    subcategoryName: "Service",
    title: "One helpful act",
    target: 1,
    unit: "act",
    frequency: "3x weekly",
    memberIds: ["meera", "isha", "dev"],
    smart: {
      specific: "Do one useful act without being asked.",
      measurable: "Capture the act in notes.",
      achievable: "Keep the action small and visible.",
      relevant: "Builds care beyond the self.",
      timeBound: "Complete before evening review.",
    },
  },
  {
    id: "h-deep-work",
    categoryId: "professional",
    subcategoryName: "Deep work",
    title: "90 minute deep work block",
    target: 90,
    unit: "min",
    frequency: "Weekdays",
    memberIds: ["aarav", "meera"],
    smart: {
      specific: "Protect one block for the most valuable work.",
      measurable: "90 minutes with notifications off.",
      achievable: "Schedule it before opening chat and email.",
      relevant: "Creates professional progress without burnout.",
      timeBound: "Start before 11:00 AM.",
    },
  },
  {
    id: "h-family-dinner",
    categoryId: "family",
    subcategoryName: "Presence",
    title: "Device-free family dinner",
    target: 1,
    unit: "meal",
    frequency: "Daily",
    memberIds: ["aarav", "meera", "isha", "dev"],
    smart: {
      specific: "Eat one meal together without devices.",
      measurable: "One shared meal with everyone present.",
      achievable: "Put phones in the kitchen tray.",
      relevant: "Strengthens family rhythm and attention.",
      timeBound: "Complete by 8:30 PM.",
    },
  },
  {
    id: "h-reading",
    categoryId: "mental",
    subcategoryName: "Reading",
    title: "Study sprint",
    target: 25,
    unit: "min",
    frequency: "Daily",
    memberIds: ["isha"],
    smart: {
      specific: "Read or revise one subject without multitasking.",
      measurable: "25 minute focused sprint.",
      achievable: "Use one timer and one notebook.",
      relevant: "Improves learning confidence.",
      timeBound: "Complete before 6:00 PM.",
    },
  },
  {
    id: "h-tidy",
    categoryId: "family",
    subcategoryName: "Responsibilities",
    title: "Room reset",
    target: 10,
    unit: "min",
    frequency: "Daily",
    memberIds: ["isha", "dev"],
    smart: {
      specific: "Reset desk, bed, and school bag.",
      measurable: "10 minute tidy timer.",
      achievable: "Use the same order every day.",
      relevant: "Builds ownership and calm.",
      timeBound: "Complete before bedtime.",
    },
  },
];

const inferTrackingType = (habit) => {
  if (habit.unit === "min") return "duration";
  if (habit.unit === "lines") return "reflection";
  if (habit.unit === "pauses" || habit.unit === "act") return "numeric";
  if (habit.unit === "meal" || habit.unit === "session") return "completion";
  return "checklist";
};

const canonicalSubcategoryName = (name) => YOGA_LIMB_ALIASES[name] ?? name;

const createInitialData = () => {
  const categories = seedCategories();
  const habits = habitSeed.map((habit) => {
    const category = categories.find((item) => item.id === habit.categoryId);
    const subcategory = category.subcategories.find((item) => item.name === canonicalSubcategoryName(habit.subcategoryName));
    return {
      ...habit,
      subcategoryId: subcategory?.id ?? category.subcategories[0]?.id,
      trackingType: inferTrackingType(habit),
      criteria: habit.smart.measurable,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      active: true,
    };
  });

  const entries = [];
  habits.forEach((habit, habitIndex) => {
    habit.memberIds.forEach((memberId, memberIndex) => {
      for (let day = 0; day < 14; day += 1) {
        const pattern = (habitIndex + memberIndex + day) % 7;
        const status = pattern === 0 ? "missed" : pattern <= 2 ? "partial" : "done";
        entries.push({
          id: `entry-${habit.id}-${memberId}-${day}`,
          habitId: habit.id,
          memberId,
          date: offsetDate(day),
          status,
          value:
            status === "done"
              ? habit.target
              : status === "partial"
                ? Math.max(1, Math.round(habit.target * 0.55))
                : 0,
          note: day === 0 && status !== "missed" ? "Tracked in the morning routine." : "",
          createdAt: new Date(Date.now() - day * 86400000).toISOString(),
          updatedAt: new Date(Date.now() - day * 86400000).toISOString(),
        });
      }
    });
  });

  return {
    members: seedMembers(),
    categories,
    habits,
    entries,
    reflections: [
      {
        id: "reflection-aarav",
        memberId: "aarav",
        date: offsetDate(0),
        win: "Protected the morning block before work started.",
        blocker: "Calls compressed the evening routine.",
        adjustment: "Move family dinner reminder 20 minutes earlier.",
        journal:
          "The day felt steady when the morning rhythm was protected. Evening needs a lighter plan so discipline does not become pressure.",
        mood: "Steady",
        updatedAt: new Date().toISOString(),
      },
    ],
    audits: [
      {
        id: "audit-seed-1",
        timestamp: new Date().toISOString(),
        actor: "Legacy Loop",
        action: "Demo initialized",
        target: "Sadhana OS",
        details: "Loaded sample family members, life categories, SMART habits, and tracking history.",
      },
      {
        id: "audit-seed-2",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        actor: "Meera",
        action: "Routine tuned",
        target: "Screen sunset",
        details: "Changed the household target from 30 min to 45 min before sleep.",
      },
      {
        id: "audit-seed-3",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
        actor: "Aarav",
        action: "Habit created",
        target: "Pause before difficult replies",
        details: "Added Speech control habit with three measurable pauses per day.",
      },
    ],
  };
};

const normalizeData = (data) => ({
  ...data,
  members: data.members ?? [],
  categories: (data.categories ?? []).map((category) => ({
    ...category,
    active: category.active !== false,
    subcategories: Array.isArray(category.subcategories)
      ? category.subcategories.map((sub) => ({
          ...sub,
          name: category.id === "yoga" ? canonicalSubcategoryName(sub.name) : sub.name,
          active: sub.active !== false,
        }))
      : [],
  })),
  habits: (data.habits ?? []).map((habit) => ({
    ...habit,
    active: habit.active !== false,
    trackingType: habit.trackingType || inferTrackingType(habit),
    criteria: habit.criteria || habit.smart?.measurable || "",
    smart: {
      specific: "",
      measurable: "",
      achievable: "",
      relevant: "",
      timeBound: "",
      ...(habit.smart ?? {}),
    },
    memberIds: Array.isArray(habit.memberIds) ? habit.memberIds : [],
  })),
  entries: data.entries ?? [],
  reflections: data.reflections ?? [],
  audits: data.audits ?? [],
});

const activeSubcategories = (category) =>
  (category?.subcategories ?? []).filter((sub) => sub.active !== false);

function useStoredData() {
  const [data, setData] = useState(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (
          Array.isArray(parsed.members) &&
          parsed.members.length &&
          Array.isArray(parsed.categories) &&
          Array.isArray(parsed.habits) &&
          Array.isArray(parsed.entries) &&
          Array.isArray(parsed.audits)
        ) {
          return normalizeData(parsed);
        }
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    return createInitialData();
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  return [data, setData];
}

function scoreEntries(entries) {
  if (!entries.length) return 0;
  const score = entries.reduce((sum, entry) => sum + (STATUS_META[entry.status]?.score ?? 0), 0);
  return Math.round((score / entries.length) * 100);
}

function App() {
  const [data, setData] = useStoredData();
  const [selectedMemberId, setSelectedMemberId] = useState(data.members[0]?.id ?? "");
  const [activeView, setActiveView] = useState("today");
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedHabitId, setSelectedHabitId] = useState(data.habits[0]?.id ?? "");
  const [habitDraft, setHabitDraft] = useState(null);
  const [categoryDraft, setCategoryDraft] = useState(null);
  const [habitError, setHabitError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const today = toDateKey();

  const activeCategories = useMemo(
    () => data.categories.filter((category) => category.active !== false),
    [data.categories],
  );

  const activeCategoryIds = useMemo(
    () => new Set(activeCategories.map((category) => category.id)),
    [activeCategories],
  );

  const selectedMember = useMemo(
    () => data.members.find((member) => member.id === selectedMemberId) ?? data.members[0],
    [data.members, selectedMemberId],
  );

  const memberHabits = useMemo(
    () =>
      data.habits.filter(
        (habit) =>
          habit.active &&
          activeCategoryIds.has(habit.categoryId) &&
          habit.memberIds.includes(selectedMember.id) &&
          (selectedCategoryId === "all" || habit.categoryId === selectedCategoryId) &&
          (search.trim() === "" ||
            habit.title.toLowerCase().includes(search.toLowerCase()) ||
            findCategory(data.categories, habit.categoryId)?.name.toLowerCase().includes(search.toLowerCase())),
      ),
    [data.habits, data.categories, activeCategoryIds, selectedMember.id, selectedCategoryId, search],
  );

  const selectedHabit = useMemo(
    () =>
      memberHabits.find((habit) => habit.id === selectedHabitId) ??
      memberHabits[0] ??
      data.habits.find((habit) => habit.active && activeCategoryIds.has(habit.categoryId)),
    [memberHabits, data.habits, activeCategoryIds, selectedHabitId],
  );

  useEffect(() => {
    if (selectedHabit && selectedHabit.id !== selectedHabitId) {
      setSelectedHabitId(selectedHabit.id);
    }
  }, [selectedHabit, selectedHabitId]);

  const todayEntries = useMemo(
    () => data.entries.filter((entry) => entry.memberId === selectedMember.id && entry.date === today),
    [data.entries, selectedMember.id, today],
  );

  const visibleTodayEntries = useMemo(
    () => memberHabits
      .map((habit) => todayEntries.find((entry) => entry.habitId === habit.id))
      .filter(Boolean),
    [memberHabits, todayEntries],
  );

  const dailyScore = useMemo(() => {
    if (!memberHabits.length) return 0;
    const score = memberHabits.reduce((sum, habit) => {
      const entry = todayEntries.find((item) => item.habitId === habit.id);
      return sum + (STATUS_META[entry?.status]?.score ?? 0);
    }, 0);
    return Math.round((score / memberHabits.length) * 100);
  }, [memberHabits, todayEntries]);

  const weeklyTrend = useMemo(
    () => buildWeeklyTrend(data, selectedMember.id),
    [data, selectedMember.id],
  );

  const categoryScores = useMemo(
    () => buildCategoryScores(data, selectedMember.id, today),
    [data, selectedMember.id, today],
  );

  const visibleCategoryScores = useMemo(
    () =>
      selectedCategoryId === "all"
        ? categoryScores
        : categoryScores.filter((category) => category.id === selectedCategoryId),
    [categoryScores, selectedCategoryId],
  );

  const memberComparison = useMemo(() => buildMemberComparison(data, today), [data, today]);
  const streak = useMemo(() => calculateStreak(data, selectedMember.id), [data, selectedMember.id]);
  const reflection = data.reflections.find(
    (item) => item.memberId === selectedMember.id && item.date === today,
  ) ?? {
    win: "",
    blocker: "",
    adjustment: "",
    journal: "",
    mood: "Focused",
  };

  const memberReflections = useMemo(
    () => data.reflections.filter((item) => item.memberId === selectedMember.id),
    [data.reflections, selectedMember.id],
  );

  const selectedCategoryContext = activeCategories.find((category) => category.id === selectedCategoryId);
  const isReviewView = REVIEW_ITEMS.some((item) => item.id === activeView);
  const activeReviewItem = REVIEW_ITEMS.find((item) => item.id === activeView);
  const activeOperateItem = OPERATE_ITEMS.find((item) => item.id === activeView);
  const viewTitle = isReviewView
    ? `${selectedMember.name}'s ${activeReviewItem?.label.toLowerCase() ?? "review center"}`
    : `${selectedMember.name}'s ${activeOperateItem?.label.toLowerCase() ?? "command center"}`;
  const viewSubtitle = isReviewView
    ? "All-domain review across habits, journals, archives, and audit history."
    : `${selectedCategoryContext?.name ?? "All domains"} operating context for today's practice and habit design.`;
  const showReviewCenter = selectedCategoryId === "all";

  const chooseCategory = (categoryId) => {
    setSelectedCategoryId(categoryId);
    if (categoryId !== "all" && isReviewView) {
      setActiveView("today");
    }
  };

  const addAudit = (next, action, target, details, actor = selectedMember.name) => ({
    ...next,
    audits: [
      {
        id: uid("audit"),
        timestamp: new Date().toISOString(),
        actor,
        action,
        target,
        details,
      },
      ...next.audits,
    ].slice(0, 250),
  });

  const mutateWithAudit = (recipe, audit) => {
    setData((current) => addAudit(recipe(current), audit.action, audit.target, audit.details, audit.actor));
  };

  const handleTrack = (habit, status) => {
    mutateWithAudit(
      (current) => {
        const existing = current.entries.find(
          (entry) => entry.habitId === habit.id && entry.memberId === selectedMember.id && entry.date === today,
        );
        const nextEntry = {
          id: existing?.id ?? uid("entry"),
          habitId: habit.id,
          memberId: selectedMember.id,
          date: today,
          status,
          value:
            status === "done"
              ? habit.target
              : status === "partial"
                ? Math.max(1, Math.round(habit.target * 0.5))
                : 0,
          note: existing?.note ?? "",
          createdAt: existing?.createdAt ?? new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return {
          ...current,
          entries: existing
            ? current.entries.map((entry) => (entry.id === existing.id ? nextEntry : entry))
            : [nextEntry, ...current.entries],
        };
      },
      {
        action: "Tracked habit",
        target: habit.title,
        details: `${selectedMember.name} marked ${STATUS_META[status].label.toLowerCase()} for ${formatShortDate(today)}.`,
      },
    );
  };

  const handleEntryNote = (habit, note) => {
    mutateWithAudit(
      (current) => {
        const existing = current.entries.find(
          (entry) => entry.habitId === habit.id && entry.memberId === selectedMember.id && entry.date === today,
        );
        const nextEntry = {
          id: existing?.id ?? uid("entry"),
          habitId: habit.id,
          memberId: selectedMember.id,
          date: today,
          status: existing?.status ?? "partial",
          value: existing?.value ?? Math.max(1, Math.round(habit.target * 0.5)),
          note,
          createdAt: existing?.createdAt ?? new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return {
          ...current,
          entries: existing
            ? current.entries.map((entry) => (entry.id === existing.id ? nextEntry : entry))
            : [nextEntry, ...current.entries],
        };
      },
      {
        action: "Note updated",
        target: habit.title,
        details: `${selectedMember.name} updated today's tracking note.`,
      },
    );
  };

  const saveReflection = (draft) => {
    const reflectionDate = draft.date ?? today;
    mutateWithAudit(
      (current) => {
        const existing = current.reflections.find(
          (item) => item.memberId === selectedMember.id && item.date === reflectionDate,
        );
        const nextReflection = {
          id: existing?.id ?? uid("reflection"),
          memberId: selectedMember.id,
          ...draft,
          date: reflectionDate,
          updatedAt: new Date().toISOString(),
        };
        return {
          ...current,
          reflections: existing
            ? current.reflections.map((item) => (item.id === existing.id ? nextReflection : item))
            : [nextReflection, ...current.reflections],
        };
      },
      {
        action: "Reflection saved",
        target: `${selectedMember.name} review`,
        details: `Saved journal, win, blocker, and next adjustment for ${formatShortDate(reflectionDate)}.`,
      },
    );
  };

  const openHabitEditor = (habit = null, defaults = {}) => {
    setHabitError("");
    if (habit) {
      setHabitDraft({ ...habit, smart: { ...habit.smart }, newSubcategoryName: "" });
      return;
    }
    const category =
      activeCategories.find((item) => item.id === defaults.categoryId) ??
      activeCategories.find((item) => item.id === selectedCategoryId) ??
      activeCategories[0];
    const subcategories = activeSubcategories(category);
    const trackingType = defaults.trackingType ?? "completion";
    setHabitDraft({
      id: "",
      title: "",
      categoryId: category?.id ?? "",
      subcategoryId: defaults.subcategoryId ?? subcategories[0]?.id ?? "",
      newSubcategoryName: "",
      trackingType,
      criteria: "",
      target: 1,
      unit: TRACKING_TYPES[trackingType].defaultUnit,
      frequency: "Daily",
      memberIds: [selectedMember.id],
      smart: {
        specific: "",
        measurable: "",
        achievable: "",
        relevant: "",
        timeBound: "",
      },
      active: true,
    });
  };

  const saveHabitDraft = () => {
    const title = habitDraft.title.trim();
    if (!title) {
      setHabitError("Add a habit name before saving.");
      return;
    }
    if (!habitDraft.categoryId || (!habitDraft.subcategoryId && !habitDraft.newSubcategoryName?.trim())) {
      setHabitError("Choose a category and sub-component before saving.");
      return;
    }
    const trackingType = TRACKING_TYPES[habitDraft.trackingType] ? habitDraft.trackingType : "completion";
    const newSubcategoryName = habitDraft.newSubcategoryName?.trim();
    const newSubcategoryId = newSubcategoryName ? uid("sub") : "";
    const finalSubcategoryId = newSubcategoryId || habitDraft.subcategoryId;
    const savedHabitId = habitDraft.id || uid("habit");
    mutateWithAudit(
      (current) => {
        const exists = current.habits.some((habit) => habit.id === habitDraft.id);
        const { newSubcategoryName: _newSubcategoryName, ...habitFields } = habitDraft;
        const savedHabit = {
          ...habitFields,
          id: savedHabitId,
          title,
          subcategoryId: finalSubcategoryId,
          trackingType,
          criteria: habitDraft.criteria?.trim() || habitDraft.smart.measurable || TRACKING_TYPES[trackingType].hint,
          target: Number(habitDraft.target) || 1,
          memberIds: habitDraft.memberIds.length ? habitDraft.memberIds : [selectedMember.id],
          updatedAt: new Date().toISOString(),
          createdAt: exists ? habitDraft.createdAt : new Date().toISOString(),
          active: true,
        };
        return {
          ...current,
          categories: newSubcategoryName
            ? current.categories.map((category) =>
                category.id === habitDraft.categoryId
                  ? {
                      ...category,
                      subcategories: [
                        ...category.subcategories,
                        { id: newSubcategoryId, name: newSubcategoryName, active: true },
                      ],
                    }
                  : category,
              )
            : current.categories,
          habits: exists
            ? current.habits.map((habit) => (habit.id === savedHabit.id ? savedHabit : habit))
            : [savedHabit, ...current.habits],
        };
      },
      {
        action: habitDraft.id ? "Habit updated" : "Habit created",
        target: title,
        details: `${TRACKING_TYPES[trackingType].label} tracking set to ${habitDraft.target} ${habitDraft.unit} on ${habitDraft.frequency}.${newSubcategoryName ? ` Added sub-component ${newSubcategoryName}.` : ""}`,
      },
    );
    setSelectedHabitId(savedHabitId);
    setHabitDraft(null);
    setHabitError("");
  };

  const deleteHabit = (habit) => {
    mutateWithAudit(
      (current) => ({
        ...current,
        habits: current.habits.map((item) =>
          item.id === habit.id ? { ...item, active: false, archivedAt: new Date().toISOString() } : item,
        ),
      }),
      {
        action: "Habit archived",
        target: habit.title,
        details: "Habit was removed from active routines while keeping historical entries.",
      },
    );
    setHabitDraft(null);
  };

  const restoreHabit = (habit) => {
    mutateWithAudit(
      (current) => ({
        ...current,
        habits: current.habits.map((item) =>
          item.id === habit.id ? { ...item, active: true, restoredAt: new Date().toISOString() } : item,
        ),
      }),
      {
        action: "Habit restored",
        target: habit.title,
        details: "Habit was restored to active routines with all historical entries preserved.",
      },
    );
    setSelectedHabitId(habit.id);
  };

  const openCategoryEditor = (category = null, options = {}) => {
    setCategoryError("");
    setCategoryDraft(
      category
        ? {
            ...category,
            subcategories: [
              ...category.subcategories.map((item) => ({ ...item })),
              ...(options.appendSubcategory ? [{ id: uid("sub"), name: "", active: true }] : []),
            ],
          }
        : {
            id: "",
            name: "",
            icon: "Target",
            color: "#496b8f",
            description: "",
            active: true,
            subcategories: [{ id: uid("sub"), name: "Core practice", active: true }],
          },
    );
  };

  const saveCategoryDraft = () => {
    if (!categoryDraft.name.trim()) {
      setCategoryError("Add a category name before saving.");
      return;
    }
    const savedCategoryId = categoryDraft.id || uid("category");
    mutateWithAudit(
      (current) => {
        const exists = current.categories.some((category) => category.id === categoryDraft.id);
        const subcategories = categoryDraft.subcategories.map((item) => ({
          id: item.id || uid("sub"),
          name: item.name.trim() || "Untitled sub-component",
          active: item.active !== false,
          archivedAt: item.active === false ? item.archivedAt ?? new Date().toISOString() : undefined,
        }));
        const savedCategory = {
          ...categoryDraft,
          id: savedCategoryId,
          name: categoryDraft.name.trim(),
          active: true,
          subcategories: subcategories.length
            ? subcategories
            : [{ id: uid("sub"), name: "Core practice", active: true }],
        };
        return {
          ...current,
          categories: exists
            ? current.categories.map((category) => (category.id === savedCategory.id ? savedCategory : category))
            : [...current.categories, savedCategory],
        };
      },
      {
        action: categoryDraft.id ? "Category updated" : "Category created",
        target: categoryDraft.name.trim(),
        details: `${categoryDraft.subcategories.length} sub-components configured.`,
      },
    );
    setSelectedCategoryId(savedCategoryId);
    setCategoryDraft(null);
    setCategoryError("");
  };

  const deleteCategory = (category) => {
    mutateWithAudit(
      (current) => ({
        ...current,
        categories: current.categories.map((item) =>
          item.id === category.id ? { ...item, active: false, archivedAt: new Date().toISOString() } : item,
        ),
        habits: current.habits.map((habit) =>
          habit.categoryId === category.id ? { ...habit, active: false, archivedAt: new Date().toISOString() } : habit,
        ),
      }),
      {
        action: "Category archived",
        target: category.name,
        details: "Category and active habits were archived; historical entries remain in audit and analytics.",
      },
    );
    setCategoryDraft(null);
    setSelectedCategoryId("all");
  };

  const restoreCategory = (category) => {
    mutateWithAudit(
      (current) => ({
        ...current,
        categories: current.categories.map((item) =>
          item.id === category.id ? { ...item, active: true, restoredAt: new Date().toISOString() } : item,
        ),
      }),
      {
        action: "Category restored",
        target: category.name,
        details: "Domain was restored to the main dashboard. Archived habits remain archived until edited.",
      },
    );
  };

  const resetDemo = () => {
    const next = createInitialData();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setData(next);
    setSelectedMemberId(next.members[0].id);
    setSelectedCategoryId("all");
    setSelectedHabitId(next.habits[0].id);
    setActiveView("today");
  };

  return (
    <div className="app-shell">
      <aside className="side-rail">
        <div className="brand-lockup">
          <div className="brand-mark">
            <Sparkles size={22} />
          </div>
          <div>
            <p>Legacy Loop</p>
            <h1>Sadhana OS</h1>
          </div>
        </div>

        <div className="member-list" aria-label="Family members">
          {data.members.map((member) => (
            <button
              key={member.id}
              className={`member-button ${member.id === selectedMember.id ? "is-selected" : ""}`}
              onClick={() => setSelectedMemberId(member.id)}
            >
              <span className="avatar" style={{ "--tone": member.tone }}>
                {member.initials}
              </span>
              <span>
                <strong>{member.name}</strong>
                <small>{member.role}</small>
              </span>
            </button>
          ))}
        </div>

        <div className="category-filter">
          <div className="rail-title">
            <Layers3 size={16} />
            Operating domains
          </div>
          <p className="rail-note">Daily OS follows this filter. Review Center appears on All domains only.</p>
          <button
            className={`category-pill ${selectedCategoryId === "all" ? "is-selected" : ""}`}
            onClick={() => chooseCategory("all")}
          >
            <Target size={16} />
            All domains
          </button>
          {activeCategories.map((category) => (
            <button
              key={category.id}
              className={`category-pill ${selectedCategoryId === category.id ? "is-selected" : ""}`}
              onClick={() => chooseCategory(category.id)}
            >
              <CategoryGlyph category={category} />
              {category.name}
            </button>
          ))}
        </div>

        <button className="secondary-action" onClick={resetDemo}>
          <RefreshCcw size={16} />
          Reset demo
        </button>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">{isReviewView ? "Life review center" : "Premium habit operating system"}</p>
            <h2>{viewTitle}</h2>
            <p className="topbar-subtitle">{viewSubtitle}</p>
          </div>
          <div className="topbar-actions">
            <div className="date-chip">
              <CalendarDays size={16} />
              {formatShortDate(today)}
            </div>
            <button className="primary-action" onClick={() => openHabitEditor()}>
              <Plus size={17} />
              New habit
            </button>
          </div>
        </header>

        <section className={`operating-nav ${isReviewView ? "is-compact" : ""}`} aria-label="Daily operating space">
          <div>
            <p className="eyebrow">Daily OS</p>
            <small>Track, journal, and design habits</small>
          </div>
          <nav className="view-tabs" aria-label="Daily operating views">
            {OPERATE_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={activeView === item.id ? "is-selected" : ""}
                  onClick={() => setActiveView(item.id)}
                >
                  <Icon size={17} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </section>

        {showReviewCenter && (
          <ReviewCenterDock
            activeView={activeView}
            setActiveView={setActiveView}
            data={data}
            selectedMember={selectedMember}
          />
        )}

        {activeView === "today" && (
          <TodayView
            data={data}
            selectedMember={selectedMember}
            memberHabits={memberHabits}
            todayEntries={todayEntries}
            visibleTodayEntries={visibleTodayEntries}
            dailyScore={dailyScore}
            categoryScores={visibleCategoryScores}
            weeklyTrend={weeklyTrend}
            streak={streak}
            selectedHabit={selectedHabit}
            selectedHabitId={selectedHabitId}
            setSelectedHabitId={setSelectedHabitId}
            search={search}
            setSearch={setSearch}
            handleTrack={handleTrack}
            handleEntryNote={handleEntryNote}
            archiveHabit={deleteHabit}
            openHabitEditor={openHabitEditor}
            saveReflection={saveReflection}
            reflection={reflection}
          />
        )}

        {activeView === "journal" && (
          <JournalView
            selectedMember={selectedMember}
            reflections={memberReflections}
            today={today}
            onSave={saveReflection}
          />
        )}

        {activeView === "studio" && (
          <StudioView
            data={data}
            activeCategories={activeCategories}
            selectedMember={selectedMember}
            selectedCategoryId={selectedCategoryId}
            openHabitEditor={openHabitEditor}
            openCategoryEditor={openCategoryEditor}
            archiveHabit={deleteHabit}
            restoreHabit={restoreHabit}
            archiveCategory={deleteCategory}
            restoreCategory={restoreCategory}
          />
        )}

        {activeView === "insights" && (
          <InsightsView
            data={data}
            selectedMember={selectedMember}
            dailyScore={dailyScore}
            categoryScores={categoryScores}
            streak={streak}
          />
        )}

        {activeView === "history" && (
          <HistoryView data={data} selectedMember={selectedMember} />
        )}

        {activeView === "audit" && <AuditView audits={data.audits} />}
      </main>

      {habitDraft && (
        <HabitDrawer
          draft={habitDraft}
          setDraft={setHabitDraft}
          data={data}
          activeCategories={activeCategories}
          error={habitError}
          onClose={() => {
            setHabitDraft(null);
            setHabitError("");
          }}
          onSave={saveHabitDraft}
          onDelete={deleteHabit}
        />
      )}

      {categoryDraft && (
        <CategoryDrawer
          draft={categoryDraft}
          setDraft={setCategoryDraft}
          error={categoryError}
          onClose={() => {
            setCategoryDraft(null);
            setCategoryError("");
          }}
          onSave={saveCategoryDraft}
          onDelete={deleteCategory}
          isExisting={Boolean(categoryDraft.id)}
        />
      )}
    </div>
  );
}

function ReviewCenterDock({ activeView, setActiveView, data, selectedMember }) {
  const memberEntries = data.entries.filter((entry) => entry.memberId === selectedMember.id);
  const journalDays = data.reflections.filter((reflection) => reflection.memberId === selectedMember.id).length;
  const activeHabits = data.habits.filter(
    (habit) => habit.active && habit.memberIds.includes(selectedMember.id),
  ).length;
  const archivedRecords =
    data.categories.filter((category) => category.active === false).length +
    data.habits.filter((habit) => habit.active === false && habit.memberIds.includes(selectedMember.id)).length +
    data.categories.reduce(
      (count, category) => count + category.subcategories.filter((sub) => sub.active === false).length,
      0,
    );

  return (
    <section className="review-center" aria-label="Life Review Center">
      <div className="review-center-head">
        <div>
          <p className="eyebrow">Review Center</p>
          <h3>Life intelligence</h3>
          <span>All-domain insights, history, exports, and audit proof.</span>
        </div>
      </div>
      <nav className="review-tabs" aria-label="Review center views">
        {REVIEW_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={activeView === item.id ? "is-selected" : ""}
              onClick={() => setActiveView(item.id)}
            >
              <Icon size={18} />
              <span>
                <strong>{item.label}</strong>
                <small>{item.detail}</small>
              </span>
            </button>
          );
        })}
      </nav>
        <div className="review-center-metrics" aria-label="Review center metrics">
          <span><strong>{activeHabits}</strong> active habits</span>
          <span><strong>{memberEntries.length}</strong> tracked entries</span>
          <span><strong>{journalDays}</strong> journal days</span>
          <span><strong>{archivedRecords}</strong> archived records</span>
        </div>
    </section>
  );
}

function TodayView({
  data,
  selectedMember,
  memberHabits,
  todayEntries,
  visibleTodayEntries,
  dailyScore,
  categoryScores,
  weeklyTrend,
  streak,
  selectedHabit,
  selectedHabitId,
  setSelectedHabitId,
  search,
  setSearch,
  handleTrack,
  handleEntryNote,
  archiveHabit,
  openHabitEditor,
  saveReflection,
  reflection,
}) {
  const nextActions = memberHabits
    .filter((habit) => !todayEntries.some((entry) => entry.habitId === habit.id && entry.status === "done"))
    .slice(0, 3);

  return (
    <div className="dashboard-grid">
      <section className="main-column">
        <div className="metric-row">
          <MetricCard
            icon={CheckCircle2}
            label="Today"
            value={`${dailyScore}%`}
            detail={`${visibleTodayEntries.length}/${memberHabits.length} actions tracked`}
          />
          <MetricCard icon={Flame} label="Consistency" value={`${streak}d`} detail="rolling practice streak" />
          <MetricCard
            icon={ShieldCheck}
            label="Balance"
            value={`${Math.round(average(categoryScores.map((item) => item.score)))}%`}
            detail="across active domains"
          />
        </div>

        <div className="command-strip">
          <div className="search-box">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search routines"
              aria-label="Search routines"
            />
          </div>
          <button className="ghost-action" onClick={() => openHabitEditor()}>
            <ListPlus size={17} />
            Add habit
          </button>
        </div>

        <div className="practice-review-stack">
          <HabitDetailPanel
            habit={selectedHabit}
            data={data}
            entry={todayEntries.find((item) => item.habitId === selectedHabit?.id)}
            onEdit={openHabitEditor}
            onArchive={archiveHabit}
            onNote={handleEntryNote}
          />

          <div className="panel rhythm-panel">
            <PanelTitle icon={LineChart} title="Seven day rhythm" />
            <MiniBars data={weeklyTrend} />
          </div>
        </div>

        <div className="routine-list">
          {!memberHabits.length && (
            <div className="panel empty-panel">
              <PanelTitle icon={Target} title="No active actions" />
              <p className="empty-state">Add a habit for this member and domain.</p>
              <button className="primary-action" onClick={() => openHabitEditor()}>
                <Plus size={16} />
                Add habit
              </button>
            </div>
          )}
          {memberHabits.map((habit) => {
            const category = findCategory(data.categories, habit.categoryId);
            const subcategory = findSubcategory(category, habit.subcategoryId);
            const entry = todayEntries.find((item) => item.habitId === habit.id);
            const statusLabels = STATUS_LABELS_BY_TYPE[habit.trackingType] ?? STATUS_LABELS_BY_TYPE.completion;
            return (
              <article
                className={`habit-card ${selectedHabitId === habit.id ? "is-selected" : ""}`}
                key={habit.id}
                onClick={() => setSelectedHabitId(habit.id)}
              >
                <div className="habit-head">
                  <div className="habit-domain" style={{ "--category-color": category?.color }}>
                    <CategoryGlyph category={category} />
                  </div>
                  <div>
                    <p>{category?.name} / {subcategory?.name}</p>
                    <h3>{habit.title}</h3>
                  </div>
                  <div className="habit-card-actions">
                    <button
                      className="icon-button"
                      aria-label={`Edit ${habit.title}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        openHabitEditor(habit);
                      }}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      className="icon-button archive-icon"
                      aria-label={`Archive ${habit.title}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        archiveHabit(habit);
                      }}
                    >
                      <Archive size={16} />
                    </button>
                  </div>
                </div>
                <div className="habit-meta">
                  <span>
                    <Target size={15} />
                    {habit.target} {habit.unit}
                  </span>
                  <span>
                    <Clock3 size={15} />
                    {habit.frequency}
                  </span>
                  <span>
                    <SlidersHorizontal size={15} />
                    {TRACKING_TYPES[habit.trackingType]?.label ?? "Completion"}
                  </span>
                </div>
                <div className="status-actions" onClick={(event) => event.stopPropagation()}>
                  {Object.entries(STATUS_META).map(([status, meta]) => (
                    <button
                      key={status}
                      className={`${meta.className} ${entry?.status === status ? "is-active" : ""}`}
                      onClick={() => handleTrack(habit, status)}
                    >
                      {status === "done" ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                      {statusLabels[status]}
                    </button>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <aside className="insight-column">
        <div className="profile-panel">
          <div className="profile-ring" style={{ "--score": `${dailyScore}%`, "--tone": selectedMember.tone }}>
            <span>{dailyScore}%</span>
          </div>
          <div>
            <p>{selectedMember.role}</p>
            <h3>{selectedMember.name}</h3>
            <small>{selectedMember.focus}</small>
          </div>
        </div>

        <ReflectionPanel reflection={reflection} onSave={saveReflection} />

        <div className="panel next-panel">
          <PanelTitle icon={Sparkles} title="Next best actions" />
          <div className="next-list">
            {nextActions.map((habit) => (
              <button key={habit.id} onClick={() => setSelectedHabitId(habit.id)}>
                <span>{habit.title}</span>
                <small>{findCategory(data.categories, habit.categoryId)?.name}</small>
              </button>
            ))}
            {!nextActions.length && <p className="empty-state">All visible actions are complete.</p>}
          </div>
        </div>
      </aside>
    </div>
  );
}

function JournalView({ selectedMember, reflections, today, onSave }) {
  const [selectedDate, setSelectedDate] = useState(today);
  const currentReflection = reflections.find((item) => item.date === selectedDate) ?? {
    memberId: selectedMember.id,
    date: selectedDate,
    journal: "",
    win: "",
    blocker: "",
    adjustment: "",
    mood: "Focused",
  };
  const [draft, setDraft] = useState(currentReflection);

  useEffect(() => {
    setDraft(currentReflection);
  }, [selectedMember.id, selectedDate, currentReflection.updatedAt]);

  const sortedReflections = [...reflections].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="journal-layout">
      <section className="panel journal-editor">
        <div className="section-head">
          <div>
            <p className="eyebrow">End-of-day journaling</p>
            <h3>{selectedMember.name}'s daily review</h3>
          </div>
          <label className="field-label date-field">
            Date
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
            />
          </label>
        </div>

        <label className="field-label">
          Free-flow journal
          <textarea
            value={draft.journal ?? ""}
            onChange={(event) => setDraft({ ...draft, journal: event.target.value })}
            rows={9}
            placeholder="Write the story of the day: energy, discipline, family rhythm, learning, gratitude, and what needs care tomorrow."
          />
        </label>

        <div className="journal-grid">
          <label className="field-label">
            Win
            <input
              value={draft.win ?? ""}
              onChange={(event) => setDraft({ ...draft, win: event.target.value })}
              placeholder="What worked"
            />
          </label>
          <label className="field-label">
            Blocker
            <input
              value={draft.blocker ?? ""}
              onChange={(event) => setDraft({ ...draft, blocker: event.target.value })}
              placeholder="What got in the way"
            />
          </label>
          <label className="field-label wide">
            Next adjustment
            <input
              value={draft.adjustment ?? ""}
              onChange={(event) => setDraft({ ...draft, adjustment: event.target.value })}
              placeholder="What changes tomorrow"
            />
          </label>
        </div>

        <button className="primary-action" onClick={() => onSave({ ...draft, date: selectedDate })}>
          <Save size={16} />
          Save journal
        </button>
      </section>

      <aside className="panel journal-history">
        <PanelTitle icon={History} title="Journal history" />
        {!sortedReflections.length && <p className="empty-state">No journal entries yet.</p>}
        <div className="history-stack">
          {sortedReflections.slice(0, 8).map((item) => (
            <button key={item.id} onClick={() => setSelectedDate(item.date)}>
              <strong>{formatShortDate(item.date)}</strong>
              <span>{item.win || item.journal || "Journal saved"}</span>
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}

function StudioView({
  data,
  activeCategories,
  selectedMember,
  selectedCategoryId,
  openHabitEditor,
  openCategoryEditor,
  archiveHabit,
  restoreHabit,
  archiveCategory,
  restoreCategory,
}) {
  const categoriesToShow =
    selectedCategoryId === "all"
      ? activeCategories
      : activeCategories.filter((category) => category.id === selectedCategoryId);
  const selectedCategory = activeCategories.find((category) => category.id === selectedCategoryId);
  const archivedCategories = data.categories.filter((category) => category.active === false);
  const archivedHabits = data.habits.filter(
    (habit) => habit.active === false && (selectedCategoryId === "all" || habit.categoryId === selectedCategoryId),
  );

  return (
    <div className="studio-layout">
      <section className="main-column">
        <div className="section-head">
          <div>
            <p className="eyebrow">Editable operating model</p>
            <h3>
              {selectedCategory ? `${selectedCategory.name} domain` : "Categories, sub-components, and SMART actions"}
            </h3>
          </div>
          <button className="primary-action" onClick={() => openCategoryEditor()}>
            <Plus size={17} />
            New category
          </button>
        </div>

        <div className="category-studio">
          {!categoriesToShow.length && (
            <div className="panel empty-panel">
              <PanelTitle icon={Layers3} title="No active domain" />
              <p className="empty-state">Create a category to continue building the operating model.</p>
              <button className="primary-action" onClick={() => openCategoryEditor()}>
                <Plus size={16} />
                New category
              </button>
            </div>
          )}
          {categoriesToShow.map((category) => {
            const habits = data.habits.filter((habit) => habit.active && habit.categoryId === category.id);
            const subcomponents = activeSubcategories(category);
            return (
              <article className="category-card" key={category.id}>
                <div className="category-card-head">
                  <div className="category-title">
                    <span className="category-icon" style={{ "--category-color": category.color }}>
                      <CategoryGlyph category={category} />
                    </span>
                    <div>
                      <h4>{category.name}</h4>
                      <p>{category.description}</p>
                    </div>
                  </div>
                  <button className="ghost-action compact-action" onClick={() => openCategoryEditor(category)}>
                    <Settings2 size={16} />
                    Edit domain
                  </button>
                </div>
                <div className="subcomponent-grid">
                  {subcomponents.map((sub) => (
                    <span key={sub.id}>{sub.name}</span>
                  ))}
                </div>
                <div className="category-footer">
                  <small>{habits.length} active actions</small>
                  <button
                    className="ghost-action"
                    onClick={() => openCategoryEditor(category, { appendSubcategory: true })}
                  >
                    <Plus size={16} />
                    Add sub-component
                  </button>
                  <button
                    className="ghost-action"
                    onClick={() => openHabitEditor(null, { categoryId: category.id, subcategoryId: subcomponents[0]?.id })}
                  >
                    <Plus size={16} />
                    Add habit
                  </button>
                  <button className="danger-action soft-danger" onClick={() => archiveCategory(category)}>
                    <Archive size={16} />
                    Archive domain
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <aside className="insight-column">
        <div className="panel">
          <PanelTitle icon={UserRound} title={`${selectedMember.name}'s routine`} />
          <div className="studio-habit-list">
            {data.habits
              .filter(
                (habit) =>
                  habit.active &&
                  habit.memberIds.includes(selectedMember.id) &&
                  (selectedCategoryId === "all" || habit.categoryId === selectedCategoryId),
              )
              .map((habit) => (
                <div className="studio-habit-item" key={habit.id}>
                  <button onClick={() => openHabitEditor(habit)}>
                    <span>{habit.title}</span>
                    <small>{habit.target} {habit.unit} / {habit.frequency}</small>
                  </button>
                  <button className="icon-button archive-icon" onClick={() => archiveHabit(habit)} aria-label={`Archive ${habit.title}`}>
                    <Archive size={15} />
                  </button>
                </div>
              ))}
          </div>
        </div>
        <div className="panel impact-panel">
          <PanelTitle icon={ShieldCheck} title="Impact proof" />
          <dl>
            <div>
              <dt>{data.members.length}</dt>
              <dd>family profiles</dd>
            </div>
            <div>
              <dt>{activeCategories.length}</dt>
              <dd>life domains</dd>
            </div>
            <div>
              <dt>{data.categories.filter((category) => category.active === false).length}</dt>
              <dd>archived domains</dd>
            </div>
            <div>
              <dt>{data.audits.length}</dt>
              <dd>audit events</dd>
            </div>
          </dl>
        </div>
        <div className="panel archive-panel">
          <PanelTitle icon={Archive} title="Archived domains" />
          {!archivedCategories.length && <p className="empty-state">Nothing archived yet.</p>}
          <div className="archive-list">
            {archivedCategories.map((category) => (
              <button key={category.id} onClick={() => restoreCategory(category)}>
                <span>{category.name}</span>
                <small>Restore</small>
              </button>
            ))}
          </div>
        </div>
        <div className="panel archive-panel">
          <PanelTitle icon={Archive} title="Archived habits" />
          {!archivedHabits.length && <p className="empty-state">No archived habits in this view.</p>}
          <div className="archive-list">
            {archivedHabits.map((habit) => {
              const category = findCategory(data.categories, habit.categoryId);
              return (
                <button key={habit.id} onClick={() => restoreHabit(habit)}>
                  <span>{habit.title}</span>
                  <small>{category?.name ?? "Archived domain"} / Restore</small>
                </button>
              );
            })}
          </div>
        </div>
      </aside>
    </div>
  );
}

function InsightsView({ data, selectedMember, dailyScore, categoryScores, streak }) {
  const [reviewDays, setReviewDays] = useState(30);
  const insights = useMemo(
    () => buildPeriodInsights(data, selectedMember.id, reviewDays),
    [data, selectedMember.id, reviewDays],
  );
  const rangeLabel = `${reviewDays} day${reviewDays === 1 ? "" : "s"}`;

  return (
    <div className="insights-layout">
      <ReviewWindowControl value={reviewDays} onChange={setReviewDays} />
      <div className="metric-row">
        <MetricCard icon={Activity} label="Today score" value={`${dailyScore}%`} detail={selectedMember.name} />
        <MetricCard icon={BarChart3} label={`${rangeLabel} score`} value={`${insights.periodScore}%`} detail="average completion" />
        <MetricCard icon={Flame} label="Practice streak" value={`${streak}d`} detail="current rhythm" />
      </div>

      <section className="analytics-grid">
        <div className="panel analytics-panel">
          <PanelTitle icon={LineChart} title="Recent rhythm" />
          <TrendChart data={insights.trend} />
        </div>
        <div className="panel analytics-panel">
          <PanelTitle icon={Layers3} title="Domain performance" />
          <CategoryBars data={insights.domainScores.length ? insights.domainScores : categoryScores} />
        </div>
        <div className="panel analytics-panel">
          <PanelTitle icon={Target} title="Habit consistency" />
          <HabitPerformanceList habits={insights.habitScores} />
        </div>
        <div className="panel analytics-panel">
          <PanelTitle icon={ShieldCheck} title="Review signals" />
          <div className="review-grid">
            <ReviewStat label="Best domain" value={insights.bestDomain?.name ?? "None"} />
            <ReviewStat label="Needs attention" value={insights.focusHabit?.title ?? "None"} />
            <ReviewStat label="Journal days" value={insights.journalDays} />
            <ReviewStat label="Tracked days" value={insights.trackedDays} />
          </div>
        </div>
      </section>
    </div>
  );
}

function HistoryView({ data, selectedMember }) {
  const [reviewDays, setReviewDays] = useState(30);
  const groups = useMemo(
    () => buildDayReviewGroups(data, selectedMember.id, reviewDays),
    [data, selectedMember.id, reviewDays],
  );
  const memberEntries = groups.flatMap((group) => group.entries);
  const memberReflections = groups.map((group) => group.reflection).filter(Boolean);
  const archivedCategories = data.categories.filter((category) => category.active === false);
  const archivedHabits = data.habits.filter(
    (habit) => habit.active === false && habit.memberIds.includes(selectedMember.id),
  );
  const archivedSubcomponents = data.categories.flatMap((category) =>
    category.subcategories
      .filter((sub) => sub.active === false)
      .map((sub) => ({ ...sub, categoryName: category.name })),
  );

  return (
    <div className="history-layout">
      <div className="section-head">
        <div>
          <p className="eyebrow">Tracking history and export</p>
          <h3>{selectedMember.name}'s record</h3>
        </div>
        <div className="export-actions">
          <button className="primary-action" onClick={() => exportSadhanaReport(data, selectedMember, reviewDays)}>
            <Download size={16} />
            Export visual report
          </button>
          <button className="ghost-action" onClick={() => exportSadhanaJson(data)}>
            <Download size={16} />
            Export data
          </button>
        </div>
      </div>
      <ReviewWindowControl value={reviewDays} onChange={setReviewDays} />

      <div className="metric-row">
        <MetricCard icon={CheckCircle2} label="Tracked entries" value={memberEntries.length} detail="habit history" />
        <MetricCard icon={FileText} label="Journal days" value={memberReflections.length} detail="daily reflections" />
        <MetricCard icon={Archive} label="Archived items" value={archivedCategories.length + archivedSubcomponents.length + archivedHabits.length} detail="preserved, hidden from dashboard" />
      </div>

      <section className="history-panels">
        <div className="panel history-main-panel">
          <PanelTitle icon={Activity} title="Day-by-day review" />
          <div className="day-review-list">
            {groups.map((group) => (
              <article className="day-review-card" key={group.date}>
                <div className="day-review-head">
                  <div>
                    <strong>{formatShortDate(group.date)}</strong>
                    <span>{group.entries.length} tracked habits</span>
                  </div>
                  <b>{group.score}%</b>
                </div>
                {group.reflection && (
                  <div className="day-journal-summary">
                    <FileText size={16} />
                    <p>{group.reflection.journal || group.reflection.win || "Journal saved"}</p>
                  </div>
                )}
                <div className="day-habit-list">
                  {group.entries.map(({ entry, habit, category }) => (
                    <div className="day-habit-row" key={entry.id}>
                      <div>
                        <strong>{habit?.title ?? "Archived habit"}</strong>
                        <span>{category?.name ?? "Archived domain"}</span>
                      </div>
                      <span className={`status-chip ${entry.status}`}>{STATUS_META[entry.status]?.label ?? entry.status}</span>
                      <small>{entry.value} {habit?.unit ?? ""}</small>
                      {entry.note && <em>{entry.note}</em>}
                    </div>
                  ))}
                </div>
              </article>
            ))}
            {!groups.length && <p className="empty-state">No tracking records in this review window.</p>}
          </div>
        </div>

        <div className="panel">
          <PanelTitle icon={FileText} title="Journal history" />
          <div className="history-stack">
            {memberReflections.slice(0, 10).map((item) => (
              <article className="journal-history-card" key={item.id}>
                <strong>{formatShortDate(item.date)}</strong>
                <p>{item.journal || item.win || "Saved review"}</p>
                <small>{item.adjustment}</small>
              </article>
            ))}
            {!memberReflections.length && <p className="empty-state">No journal entries yet.</p>}
          </div>
        </div>

        <div className="panel">
          <PanelTitle icon={Archive} title="Archived records" />
          <div className="archive-records">
            {archivedCategories.map((category) => (
              <span key={category.id}>Domain: {category.name}</span>
            ))}
            {archivedHabits.map((habit) => (
              <span key={habit.id}>Habit: {habit.title}</span>
            ))}
            {archivedSubcomponents.map((sub) => (
              <span key={sub.id}>Sub-component: {sub.categoryName} / {sub.name}</span>
            ))}
            {!archivedCategories.length && !archivedHabits.length && !archivedSubcomponents.length && (
              <p className="empty-state">No archived records yet.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function AuditView({ audits }) {
  const [query, setQuery] = useState("");
  const filtered = audits.filter(
    (audit) =>
      audit.action.toLowerCase().includes(query.toLowerCase()) ||
      audit.target.toLowerCase().includes(query.toLowerCase()) ||
      audit.actor.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="audit-layout">
      <div className="section-head">
        <div>
          <p className="eyebrow">Immutable demo history</p>
          <h3>Audit trail</h3>
        </div>
        <div className="search-box slim">
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search audit"
            aria-label="Search audit"
          />
        </div>
      </div>

      <div className="audit-table">
        {filtered.map((audit) => (
          <article key={audit.id} className="audit-row">
            <div className="audit-dot" />
            <div>
              <strong>{audit.action}</strong>
              <p>{audit.details}</p>
            </div>
            <span>{audit.target}</span>
            <small>{audit.actor} / {formatTime(audit.timestamp)}</small>
          </article>
        ))}
      </div>
    </div>
  );
}

function HabitDetailPanel({ habit, data, entry, onEdit, onArchive, onNote }) {
  const [note, setNote] = useState(entry?.note ?? "");

  useEffect(() => {
    setNote(entry?.note ?? "");
  }, [entry?.id, entry?.note, habit?.id]);

  if (!habit) {
    return (
      <div className="panel">
        <PanelTitle icon={Target} title="SMART card" />
        <p className="empty-state">Select a habit to review details.</p>
      </div>
    );
  }

  const category = findCategory(data.categories, habit.categoryId);
  const subcategory = findSubcategory(category, habit.subcategoryId);

  return (
    <div className="panel smart-panel">
      <div className="panel-title">
        <span>
          <Target size={18} />
          SMART card
        </span>
        <div className="habit-card-actions">
          <button className="icon-button" onClick={() => onEdit(habit)} aria-label={`Edit ${habit.title}`}>
            <Edit3 size={16} />
          </button>
          <button className="icon-button archive-icon" onClick={() => onArchive(habit)} aria-label={`Archive ${habit.title}`}>
            <Archive size={16} />
          </button>
        </div>
      </div>
      <div className="smart-head">
        <p>{category?.name} / {subcategory?.name}</p>
        <h3>{habit.title}</h3>
        <small>
          {habit.target} {habit.unit} / {habit.frequency} / {TRACKING_TYPES[habit.trackingType]?.label ?? "Completion"}
        </small>
        {habit.criteria && <em>{habit.criteria}</em>}
      </div>
      <dl className="smart-list">
        <SmartRow label="S" value={habit.smart.specific} />
        <SmartRow label="M" value={habit.smart.measurable} />
        <SmartRow label="A" value={habit.smart.achievable} />
        <SmartRow label="R" value={habit.smart.relevant} />
        <SmartRow label="T" value={habit.smart.timeBound} />
      </dl>
      <label className="field-label">
        Habit journal
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          onBlur={() => onNote(habit, note)}
          rows={3}
          placeholder="Add habit-specific notes for this day"
        />
      </label>
    </div>
  );
}

function ReflectionPanel({ reflection, onSave }) {
  const [draft, setDraft] = useState(reflection);

  useEffect(() => {
    setDraft(reflection);
  }, [reflection.memberId, reflection.date, reflection.updatedAt]);

  return (
    <div className="panel reflection-panel">
      <PanelTitle icon={BookIcon} title="Daily journal" />
      <label className="field-label">
        Whole-day free flow
        <textarea
          value={draft.journal ?? ""}
          onChange={(event) => setDraft({ ...draft, journal: event.target.value })}
          placeholder="Summarize the day in your own words"
          rows={5}
        />
      </label>
      <div className="reflection-fields">
        <label className="field-label">
          Win
          <textarea
            value={draft.win}
            onChange={(event) => setDraft({ ...draft, win: event.target.value })}
            placeholder="What worked"
            rows={2}
          />
        </label>
        <label className="field-label">
          Blocker
          <textarea
            value={draft.blocker}
            onChange={(event) => setDraft({ ...draft, blocker: event.target.value })}
            placeholder="What got in the way"
            rows={2}
          />
        </label>
        <label className="field-label wide">
          Next adjustment
          <textarea
            value={draft.adjustment}
            onChange={(event) => setDraft({ ...draft, adjustment: event.target.value })}
            placeholder="What changes tomorrow"
            rows={2}
          />
        </label>
      </div>
      <button className="primary-action full" onClick={() => onSave(draft)}>
        <Save size={16} />
        Save review
      </button>
    </div>
  );
}

function HabitDrawer({ draft, setDraft, data, activeCategories, error, onClose, onSave, onDelete }) {
  const category = findCategory(activeCategories, draft.categoryId) ?? activeCategories[0];
  const subcomponents = activeSubcategories(category);

  const setSmart = (field, value) =>
    setDraft({
      ...draft,
      smart: {
        ...draft.smart,
        [field]: value,
      },
    });

  const toggleMember = (memberId) => {
    const exists = draft.memberIds.includes(memberId);
    setDraft({
      ...draft,
      memberIds: exists ? draft.memberIds.filter((id) => id !== memberId) : [...draft.memberIds, memberId],
    });
  };

  return (
    <div className="drawer-backdrop" role="presentation">
      <section className="drawer" aria-label="Habit editor">
        <div className="drawer-head">
          <div>
            <p className="eyebrow">SMART habit</p>
            <h3>{draft.id ? "Edit action" : "Create action"}</h3>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close habit editor">
            <X size={18} />
          </button>
        </div>

        <div className="form-grid">
          <label className="field-label wide">
            Habit name
            <input
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
              placeholder="Example: 10 minute meditation"
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <label className="field-label">
            Category
            <select
              value={draft.categoryId}
              onChange={(event) => {
                const nextCategory = findCategory(activeCategories, event.target.value);
                setDraft({
                  ...draft,
                  categoryId: event.target.value,
                  subcategoryId: activeSubcategories(nextCategory)[0]?.id ?? "",
                });
              }}
            >
              {activeCategories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field-label">
            Sub-component
            <select
              value={draft.subcategoryId}
              onChange={(event) => setDraft({ ...draft, subcategoryId: event.target.value })}
            >
              {subcomponents.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field-label">
            New sub-component
            <input
              value={draft.newSubcategoryName ?? ""}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  newSubcategoryName: event.target.value,
                })
              }
              placeholder="Optional, e.g. Mobility"
            />
          </label>
          <label className="field-label">
            Tracking type
            <select
              value={draft.trackingType}
                  onChange={(event) => {
                    const nextType = event.target.value;
                    const oldDefaultUnit = TRACKING_TYPES[draft.trackingType]?.defaultUnit;
                    setDraft({
                      ...draft,
                      trackingType: nextType,
                      unit:
                        !draft.unit || draft.unit === oldDefaultUnit
                          ? TRACKING_TYPES[nextType].defaultUnit
                          : draft.unit,
                      criteria: draft.criteria || TRACKING_TYPES[nextType].hint,
                    });
                  }}
            >
              {Object.entries(TRACKING_TYPES).map(([type, meta]) => (
                <option key={type} value={type}>
                  {meta.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field-label">
            Target
            <input
              type="number"
              min="1"
              value={draft.target}
              onChange={(event) => setDraft({ ...draft, target: event.target.value })}
            />
          </label>
          <label className="field-label">
            Unit
            <input
              value={draft.unit}
              onChange={(event) => setDraft({ ...draft, unit: event.target.value })}
              placeholder="min, reps, pages"
            />
          </label>
          <label className="field-label wide">
            Success criteria
            <input
              value={draft.criteria ?? ""}
              onChange={(event) => setDraft({ ...draft, criteria: event.target.value })}
              placeholder={TRACKING_TYPES[draft.trackingType]?.hint}
            />
          </label>
          <label className="field-label wide">
            Frequency
            <input
              value={draft.frequency}
              onChange={(event) => setDraft({ ...draft, frequency: event.target.value })}
              placeholder="Daily, weekdays, 3x weekly"
            />
          </label>
        </div>

        <div className="member-checks">
          {data.members.map((member) => (
            <label key={member.id}>
              <input
                type="checkbox"
                checked={draft.memberIds.includes(member.id)}
                onChange={() => toggleMember(member.id)}
              />
              <span>{member.name}</span>
            </label>
          ))}
        </div>

        <div className="smart-editor">
          <SmartInput label="Specific" value={draft.smart.specific} onChange={(value) => setSmart("specific", value)} />
          <SmartInput label="Measurable" value={draft.smart.measurable} onChange={(value) => setSmart("measurable", value)} />
          <SmartInput label="Achievable" value={draft.smart.achievable} onChange={(value) => setSmart("achievable", value)} />
          <SmartInput label="Relevant" value={draft.smart.relevant} onChange={(value) => setSmart("relevant", value)} />
          <SmartInput label="Time-bound" value={draft.smart.timeBound} onChange={(value) => setSmart("timeBound", value)} />
        </div>

        <div className="drawer-actions">
          {draft.id && (
            <button className="danger-action" onClick={() => onDelete(draft)}>
              <Archive size={16} />
              Archive
            </button>
          )}
          <button className="secondary-action" onClick={onClose}>
            Cancel
          </button>
          <button className="primary-action" onClick={onSave}>
            <Save size={16} />
            Save habit
          </button>
        </div>
      </section>
    </div>
  );
}

function CategoryDrawer({ draft, setDraft, error, onClose, onSave, onDelete, isExisting }) {
  const updateSub = (id, name) =>
    setDraft({
      ...draft,
      subcategories: draft.subcategories.map((item) => (item.id === id ? { ...item, name } : item)),
    });

  const setSubActive = (id, active) =>
    setDraft({
      ...draft,
      subcategories: draft.subcategories.map((item) =>
        item.id === id
          ? {
              ...item,
              active,
              archivedAt: active ? undefined : new Date().toISOString(),
            }
          : item,
      ),
    });

  return (
    <div className="drawer-backdrop" role="presentation">
      <section className="drawer compact-drawer" aria-label="Category editor">
        <div className="drawer-head">
          <div>
            <p className="eyebrow">Life domain</p>
            <h3>{isExisting ? "Edit category" : "Create category"}</h3>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close category editor">
            <X size={18} />
          </button>
        </div>
        <div className="form-grid">
          <label className="field-label wide">
            Name
            <input
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              placeholder="Example: Financial discipline"
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <label className="field-label">
            Icon
            <select value={draft.icon} onChange={(event) => setDraft({ ...draft, icon: event.target.value })}>
              {Object.keys(ICONS).map((icon) => (
                <option key={icon} value={icon}>
                  {icon}
                </option>
              ))}
            </select>
          </label>
          <label className="field-label">
            Color
            <input
              type="color"
              value={draft.color}
              onChange={(event) => setDraft({ ...draft, color: event.target.value })}
            />
          </label>
          <label className="field-label wide">
            Description
            <input
              value={draft.description}
              onChange={(event) => setDraft({ ...draft, description: event.target.value })}
              placeholder="What this domain protects"
            />
          </label>
        </div>
        <div className="sub-editor">
          <div className="rail-title">
            <Layers3 size={16} />
            Sub-components
          </div>
          {draft.subcategories.map((sub) => (
            <div className={`sub-edit-row ${sub.active === false ? "is-archived" : ""}`} key={sub.id}>
              <input
                value={sub.name}
                disabled={sub.active === false}
                onChange={(event) => updateSub(sub.id, event.target.value)}
              />
              <button
                className="icon-button"
                onClick={() => setSubActive(sub.id, sub.active === false)}
                aria-label={`${sub.active === false ? "Restore" : "Archive"} ${sub.name || "sub-component"}`}
              >
                {sub.active === false ? <RefreshCcw size={15} /> : <Archive size={15} />}
              </button>
            </div>
          ))}
          <button
            className="ghost-action"
            onClick={() =>
              setDraft({
                ...draft,
                subcategories: [...draft.subcategories, { id: uid("sub"), name: "", active: true }],
              })
            }
          >
            <Plus size={16} />
            Add sub-component
          </button>
        </div>
        <div className="drawer-actions">
          {isExisting && (
            <button className="danger-action" onClick={() => onDelete(draft)}>
              <Archive size={16} />
              Archive
            </button>
          )}
          <button className="secondary-action" onClick={onClose}>
            Cancel
          </button>
          <button className="primary-action" onClick={onSave}>
            <Save size={16} />
            Save category
          </button>
        </div>
      </section>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, detail }) {
  return (
    <article className="metric-card">
      <span>
        <Icon size={18} />
      </span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </article>
  );
}

function PanelTitle({ icon: Icon, title }) {
  return (
    <div className="panel-title">
      <span>
        <Icon size={18} />
        {title}
      </span>
    </div>
  );
}

function CategoryGlyph({ category }) {
  const Icon = ICONS[category?.icon] ?? Target;
  return <Icon size={17} />;
}

function MiniBars({ data }) {
  return (
    <div className="mini-bars">
      {data.map((item) => (
        <div className="mini-bar" key={item.date}>
          <span style={{ height: `${Math.max(6, item.score)}%` }} />
          <small>{item.label}</small>
        </div>
      ))}
    </div>
  );
}

function TrendChart({ data }) {
  return (
    <div className="trend-chart">
      {data.map((item) => (
        <div className="trend-column" key={item.date}>
          <span>{item.score}%</span>
          <div>
            <i style={{ height: `${Math.max(8, item.score)}%` }} />
          </div>
          <small>{item.label}</small>
        </div>
      ))}
    </div>
  );
}

function CategoryBars({ data }) {
  return (
    <div className="category-bars">
      {data.map((item) => (
        <div className="category-bar-row" key={item.id}>
          <div>
            <span style={{ background: item.color }} />
            <strong>{item.name}</strong>
          </div>
          <div className="bar-track">
            <i style={{ width: `${item.score}%`, background: item.color }} />
          </div>
          <small>{item.score}%</small>
        </div>
      ))}
    </div>
  );
}

function MemberComparison({ data }) {
  return (
    <div className="member-comparison">
      {data.map((item) => (
        <div className="member-score" key={item.id}>
          <span className="avatar small" style={{ "--tone": item.tone }}>
            {item.initials}
          </span>
          <div>
            <strong>{item.name}</strong>
            <div className="bar-track">
              <i style={{ width: `${item.score}%`, background: item.tone }} />
            </div>
          </div>
          <small>{item.score}%</small>
        </div>
      ))}
    </div>
  );
}

function ReviewWindowControl({ value, onChange }) {
  return (
    <div className="review-window">
      <span>Review window</span>
      <div>
        {REVIEW_WINDOWS.map((item) => (
          <button
            key={item.days}
            className={value === item.days ? "is-selected" : ""}
            onClick={() => onChange(item.days)}
          >
            {item.label}
          </button>
        ))}
        <label>
          <input
            type="number"
            min="1"
            max="1825"
            value={value}
            onChange={(event) => onChange(Math.min(1825, Math.max(1, Number(event.target.value) || 30)))}
          />
          days
        </label>
      </div>
    </div>
  );
}

function HabitPerformanceList({ habits }) {
  if (!habits.length) {
    return <p className="empty-state">No habit data in this review window.</p>;
  }

  return (
    <div className="habit-performance-list">
      {habits.slice(0, 10).map((habit) => (
        <div className="habit-performance-row" key={habit.id}>
          <div>
            <strong>{habit.title}</strong>
            <span>{habit.categoryName}</span>
          </div>
          <div className="bar-track">
            <i style={{ width: `${habit.score}%`, background: habit.color }} />
          </div>
          <small>{habit.score}%</small>
        </div>
      ))}
    </div>
  );
}

function ReviewStat({ label, value }) {
  return (
    <div className="review-stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function SmartRow({ label, value }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value || "Not set"}</dd>
    </div>
  );
}

function SmartInput({ label, value, onChange }) {
  return (
    <label className="field-label">
      {label}
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={2} />
    </label>
  );
}

function BookIcon(props) {
  return <BookOpenFallback {...props} />;
}

function BookOpenFallback({ size = 18 }) {
  return <Leaf size={size} />;
}

function findCategory(categories, categoryId) {
  return categories.find((category) => category.id === categoryId);
}

function findSubcategory(category, subcategoryId) {
  return category?.subcategories.find((sub) => sub.id === subcategoryId);
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function isWithinReviewWindow(dateKey, days) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - Math.max(0, days - 1));
  return new Date(`${dateKey}T12:00:00`) >= new Date(`${toDateKey(cutoff)}T00:00:00`);
}

function buildWeeklyTrend(data, memberId) {
  return Array.from({ length: 7 }, (_, index) => {
    const daysAgo = 6 - index;
    const date = offsetDate(daysAgo);
    const entries = data.entries.filter((entry) => entry.memberId === memberId && entry.date === date);
    return {
      date,
      label: new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(new Date(`${date}T12:00:00`)),
      score: scoreEntries(entries),
    };
  });
}

function buildPeriodInsights(data, memberId, days) {
  const entries = data.entries.filter(
    (entry) => entry.memberId === memberId && isWithinReviewWindow(entry.date, days),
  );
  const reflections = data.reflections.filter(
    (reflection) => reflection.memberId === memberId && isWithinReviewWindow(reflection.date, days),
  );
  const activeCategories = data.categories.filter((category) => category.active !== false);
  const memberHabits = data.habits.filter((habit) => habit.memberIds.includes(memberId));
  const periodScore = scoreEntries(entries);

  const domainScores = activeCategories
    .map((category) => {
      const categoryHabitIds = new Set(
        data.habits.filter((habit) => habit.categoryId === category.id && habit.memberIds.includes(memberId)).map((habit) => habit.id),
      );
      const categoryEntries = entries.filter((entry) => categoryHabitIds.has(entry.habitId));
      return {
        id: category.id,
        name: category.name,
        color: category.color,
        score: scoreEntries(categoryEntries),
        count: categoryEntries.length,
      };
    })
    .filter((item) => item.count > 0)
    .sort((a, b) => b.score - a.score);

  const habitScores = memberHabits
    .map((habit) => {
      const category = findCategory(data.categories, habit.categoryId);
      const habitEntries = entries.filter((entry) => entry.habitId === habit.id);
      return {
        id: habit.id,
        title: habit.title,
        categoryName: category?.name ?? "Archived domain",
        color: category?.color ?? "#65736f",
        score: scoreEntries(habitEntries),
        count: habitEntries.length,
        active: habit.active !== false,
      };
    })
    .filter((item) => item.active || item.count > 0)
    .sort((a, b) => b.score - a.score);

  const focusHabit = [...habitScores].filter((habit) => habit.count > 0).sort((a, b) => a.score - b.score)[0] ??
    [...habitScores].sort((a, b) => a.score - b.score)[0];

  const trendDays = Math.min(14, days);
  const trend = Array.from({ length: Math.min(7, trendDays) }, (_, index) => {
    const daysAgo = Math.min(6, trendDays - 1) - index;
    const date = offsetDate(daysAgo);
    const dayEntries = entries.filter((entry) => entry.date === date);
    return {
      date,
      label: new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(new Date(`${date}T12:00:00`)),
      score: scoreEntries(dayEntries),
    };
  });

  return {
    periodScore,
    domainScores,
    habitScores,
    bestDomain: domainScores[0],
    focusHabit,
    journalDays: reflections.length,
    trackedDays: new Set(entries.map((entry) => entry.date)).size,
    trend,
  };
}

function buildDayReviewGroups(data, memberId, days) {
  const entries = data.entries.filter(
    (entry) => entry.memberId === memberId && isWithinReviewWindow(entry.date, days),
  );
  const reflections = data.reflections.filter(
    (reflection) => reflection.memberId === memberId && isWithinReviewWindow(reflection.date, days),
  );
  const dates = [...new Set([...entries.map((entry) => entry.date), ...reflections.map((item) => item.date)])].sort((a, b) =>
    b.localeCompare(a),
  );

  return dates.map((date) => {
    const dayEntries = entries
      .filter((entry) => entry.date === date)
      .map((entry) => {
        const habit = data.habits.find((item) => item.id === entry.habitId);
        const category = findCategory(data.categories, habit?.categoryId);
        return { entry, habit, category };
      });
    return {
      date,
      entries: dayEntries,
      reflection: reflections.find((item) => item.date === date),
      score: scoreEntries(dayEntries.map((item) => item.entry)),
    };
  });
}

function buildCategoryScores(data, memberId, date) {
  return data.categories.filter((category) => category.active !== false).map((category) => {
    const habits = data.habits.filter(
      (habit) => habit.active && habit.categoryId === category.id && habit.memberIds.includes(memberId),
    );
    const entries = habits
      .map((habit) =>
        data.entries.find((entry) => entry.habitId === habit.id && entry.memberId === memberId && entry.date === date),
      )
      .filter(Boolean);
    return {
      id: category.id,
      name: category.name,
      color: category.color,
      score: habits.length ? scoreEntries(entries) : 0,
    };
  });
}

function buildMemberComparison(data, date) {
  return data.members.map((member) => {
    const entries = data.entries.filter((entry) => entry.memberId === member.id && entry.date === date);
    return {
      id: member.id,
      name: member.name,
      initials: member.initials,
      tone: member.tone,
      score: scoreEntries(entries),
    };
  });
}

function calculateStreak(data, memberId) {
  let streak = 0;
  for (let day = 0; day < 30; day += 1) {
    const date = offsetDate(day);
    const entries = data.entries.filter((entry) => entry.memberId === memberId && entry.date === date);
    if (entries.length && scoreEntries(entries) >= 65) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}

function exportSadhanaJson(data) {
  downloadText(
    `sadhana-os-data-${toDateKey()}.json`,
    JSON.stringify(data, null, 2),
    "application/json",
  );
}

function exportSadhanaReport(data, member, days = 30) {
  const html = createReportHtml(data, member, days);
  downloadText(`sadhana-os-report-${member.name.toLowerCase()}-${toDateKey()}.html`, html, "text/html");
}

function downloadText(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function createReportHtml(data, member, days = 30) {
  const groups = buildDayReviewGroups(data, member.id, days);
  const insights = buildPeriodInsights(data, member.id, days);
  const entries = groups.flatMap((group) => group.entries.map((item) => item.entry));
  const reflections = groups.map((group) => group.reflection).filter(Boolean);
  const archivedDomains = data.categories.filter((category) => category.active === false);
  const archivedHabits = data.habits.filter((habit) => habit.active === false && habit.memberIds.includes(member.id));

  const domainBars = insights.domainScores
    .map(
      (item) => `<div class="bar-row"><span>${escapeHtml(item.name)}</span><i><b style="width:${item.score}%;background:${escapeHtml(item.color)}"></b></i><strong>${item.score}%</strong></div>`,
    )
    .join("");

  const dayCards = groups
    .map(
      (group) => {
        const habitRows = group.entries
          .map(
            ({ entry, habit, category }) =>
              `<tr><td>${escapeHtml(habit?.title ?? "Archived habit")}</td><td>${escapeHtml(category?.name ?? "Archived domain")}</td><td>${escapeHtml(STATUS_META[entry.status]?.label ?? entry.status)}</td><td>${escapeHtml(`${entry.value} ${habit?.unit ?? ""}`.trim())}</td><td>${escapeHtml(entry.note || "")}</td></tr>`,
          )
          .join("");
        const journal = group.reflection
          ? `<p class="journal">${escapeHtml(group.reflection.journal || group.reflection.win || "Saved review")}</p><small>${escapeHtml(group.reflection.adjustment || "")}</small>`
          : `<p class="muted">No daily journal saved.</p>`;
        return `<article><div class="day-head"><div><h3>${escapeHtml(formatShortDate(group.date))}</h3><small>${group.entries.length} tracked habits</small></div><strong>${group.score}%</strong></div>${journal}<table><thead><tr><th>Habit</th><th>Domain</th><th>Status</th><th>Value</th><th>Habit note</th></tr></thead><tbody>${habitRows || '<tr><td colspan="5">No habit entries.</td></tr>'}</tbody></table></article>`;
      },
    )
    .join("");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Sadhana OS Report - ${escapeHtml(member.name)}</title>
  <style>
    body { font-family: Inter, Segoe UI, Arial, sans-serif; margin: 0; color: #17211e; background: #f3f6f8; }
    main { max-width: 1120px; margin: 0 auto; padding: 34px; }
    header { padding: 28px; color: white; background: #183c34; border-radius: 10px; }
    h1, h2, h3 { margin: 0; }
    section { margin-top: 22px; padding: 22px; background: white; border: 1px solid #dfe7e4; border-radius: 10px; }
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .stat { padding: 16px; background: #f7faf9; border-radius: 8px; }
    .stat strong { display: block; font-size: 28px; color: #28735f; }
    .bar-row { display: grid; grid-template-columns: 180px 1fr 54px; gap: 12px; align-items: center; margin-top: 12px; }
    .bar-row i { height: 10px; overflow: hidden; background: #e8efed; border-radius: 999px; }
    .bar-row b { display: block; height: 100%; border-radius: inherit; }
    table { width: 100%; border-collapse: collapse; margin-top: 14px; }
    th, td { padding: 10px; border-bottom: 1px solid #edf2f0; text-align: left; }
    article { padding: 14px; margin-top: 10px; background: #f7faf9; border-radius: 8px; }
    .day-head { display: flex; justify-content: space-between; gap: 16px; }
    .day-head > strong { font-size: 30px; color: #28735f; }
    .journal { padding: 12px; background: white; border: 1px solid #edf2f0; border-radius: 8px; }
    small, .muted { color: #65736f; }
  </style>
</head>
<body>
  <main>
    <header>
      <p>Legacy Loop / Sadhana OS</p>
      <h1>${escapeHtml(member.name)} practice report</h1>
      <small>${escapeHtml(days)} day review / Exported ${escapeHtml(formatShortDate(toDateKey()))}</small>
    </header>
    <section class="stats">
      <div class="stat"><strong>${insights.periodScore}%</strong><span>completion score</span></div>
      <div class="stat"><strong>${entries.length}</strong><span>tracking entries</span></div>
      <div class="stat"><strong>${reflections.length}</strong><span>journal days</span></div>
      <div class="stat"><strong>${archivedDomains.length + archivedHabits.length}</strong><span>archived records</span></div>
    </section>
    <section>
      <h2>Domain Performance</h2>
      ${domainBars || "<p>No domain data in this review window.</p>"}
    </section>
    <section>
      <h2>Day-by-Day Practice History</h2>
      ${dayCards || "<p>No records in this review window.</p>"}
    </section>
  </main>
</body>
</html>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export default App;
