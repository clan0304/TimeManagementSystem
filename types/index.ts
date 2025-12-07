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
