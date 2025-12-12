// ============ User ============
export type EnabledSystems = {
  [systemId: string]: boolean;
};

export type User = {
  id: string;
  clerk_id: string;
  email: string;
  enabled_systems: EnabledSystems;
  created_at: string;
  updated_at: string;
};

export type CreateUser = {
  clerk_id: string;
  email: string;
};

export type UpdateUser = {
  email?: string;
  enabled_systems?: EnabledSystems;
};

// ============ Timeboxing ============
export type TimeboxingItemType = 'dump' | 'priority';

export type TimeboxingItem = {
  id: string;
  user_id: string;
  date: string;
  content: string;
  type: TimeboxingItemType;
  priority_order: number | null;
  created_at: string;
  updated_at: string;
};

export type CreateTimeboxingItem = {
  date: string;
  content: string;
  type?: TimeboxingItemType;
  priority_order?: number | null;
};

export type UpdateTimeboxingItem = {
  content?: string;
  type?: TimeboxingItemType;
  priority_order?: number | null;
};

export type TimeboxingBlock = {
  id: string;
  user_id: string;
  date: string;
  task: string;
  start_time: string;
  end_time: string;
  color: string;
  created_at: string;
  updated_at: string;
};

export type CreateTimeboxingBlock = {
  date: string;
  task: string;
  start_time: string;
  end_time: string;
  color: string;
};

export type UpdateTimeboxingBlock = {
  task?: string;
  start_time?: string;
  end_time?: string;
  color?: string;
};

// ============ 6 Block Planner ============
export type SixBlockDay = {
  id: string;
  user_id: string;
  date: string;
  daily_memo: string | null;
  good_things: string | null;
  bad_things: string | null;
  next_goals: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateSixBlockDay = {
  date: string;
  daily_memo?: string | null;
  good_things?: string | null;
  bad_things?: string | null;
  next_goals?: string | null;
};

export type UpdateSixBlockDay = {
  daily_memo?: string | null;
  good_things?: string | null;
  bad_things?: string | null;
  next_goals?: string | null;
};

export type SixBlockBlock = {
  id: string;
  user_id: string;
  date: string;
  block_order: number;
  title: string;
  description: string | null;
  start_time: string | null;
  end_time: string | null;
  is_core: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateSixBlockBlock = {
  date: string;
  block_order: number;
  title: string;
  description?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  is_core?: boolean;
};

export type UpdateSixBlockBlock = {
  title?: string;
  description?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  is_core?: boolean;
};

export type SixBlockChecklistItem = {
  id: string;
  block_id: string;
  user_id: string;
  content: string;
  is_completed: boolean;
  item_order: number;
  created_at: string;
  updated_at: string;
};

export type CreateSixBlockChecklistItem = {
  block_id: string;
  content: string;
  item_order: number;
};

export type UpdateSixBlockChecklistItem = {
  content?: string;
  is_completed?: boolean;
  item_order?: number;
};

// ============ Seinfeld Chain ============
export type ChainHabit = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  success_criteria: string | null;
  color: string;
  icon: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateChainHabit = {
  name: string;
  description?: string | null;
  success_criteria?: string | null;
  color?: string;
  icon?: string;
};

export type UpdateChainHabit = {
  name?: string;
  description?: string | null;
  success_criteria?: string | null;
  color?: string;
  icon?: string;
  is_active?: boolean;
};

export type ChainEntryStatus = 'success' | 'fail' | 'skip';

export type ChainEntry = {
  id: string;
  habit_id: string;
  user_id: string;
  date: string;
  status: ChainEntryStatus;
  memo: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateChainEntry = {
  habit_id: string;
  date: string;
  status: ChainEntryStatus;
  memo?: string | null;
};

export type UpdateChainEntry = {
  status?: ChainEntryStatus;
  memo?: string | null;
};

export type ChainHabitStats = {
  currentStreak: number;
  longestStreak: number;
  totalSuccess: number;
  totalFail: number;
  totalSkip: number;
  successRate: number; // percentage (success / (success + fail))
};

export type LeanActivityType = 'value' | 'support' | 'waste';

export type LeanCategory = {
  id: string;
  user_id: string;
  name: string;
  type: LeanActivityType;
  icon: string;
  is_default: boolean;
  created_at: string;
};

export type CreateLeanCategory = {
  name: string;
  type: LeanActivityType;
  icon?: string;
};

export type LeanActivity = {
  id: string;
  user_id: string;
  category_id: string | null;
  name: string;
  type: LeanActivityType;
  duration_minutes: number;
  date: string;
  start_time: string | null;
  note: string | null;
  is_recurring: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateLeanActivity = {
  category_id?: string | null;
  name: string;
  type: LeanActivityType;
  duration_minutes: number;
  date: string;
  start_time?: string | null;
  note?: string | null;
};

export type UpdateLeanActivity = {
  category_id?: string | null;
  name?: string;
  type?: LeanActivityType;
  duration_minutes?: number;
  start_time?: string | null;
  note?: string | null;
};

export type LeanElimination = {
  id: string;
  user_id: string;
  activity_name: string;
  estimated_weekly_minutes: number;
  eliminated_at: string;
  is_active: boolean;
  note: string | null;
};

export type CreateLeanElimination = {
  activity_name: string;
  estimated_weekly_minutes: number;
  note?: string | null;
};

// Stats
export type LeanWeeklyStats = {
  valueMinutes: number;
  supportMinutes: number;
  wasteMinutes: number;
  totalMinutes: number;
  valuePercentage: number;
  supportPercentage: number;
  wastePercentage: number;
};

export type LeanWastePattern = {
  name: string;
  totalMinutes: number;
  occurrences: number;
};
