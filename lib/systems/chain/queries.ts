import { SupabaseClient } from '@supabase/supabase-js';
import type {
  ChainHabit,
  ChainEntry,
  ChainEntryStatus,
  CreateChainHabit,
  UpdateChainHabit,
  CreateChainEntry,
  UpdateChainEntry,
  ChainHabitStats,
} from '@/types';

// ============ Habits ============

export async function getHabits(
  client: SupabaseClient,
  userId: string
): Promise<ChainHabit[]> {
  const { data, error } = await client
    .from('chain_habits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as ChainHabit[];
}

export async function getActiveHabits(
  client: SupabaseClient,
  userId: string
): Promise<ChainHabit[]> {
  const { data, error } = await client
    .from('chain_habits')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as ChainHabit[];
}

export async function getHabitById(
  client: SupabaseClient,
  habitId: string
): Promise<ChainHabit | null> {
  const { data, error } = await client
    .from('chain_habits')
    .select('*')
    .eq('id', habitId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as ChainHabit | null;
}

export async function createHabit(
  client: SupabaseClient,
  userId: string,
  habit: CreateChainHabit
): Promise<ChainHabit> {
  const { data, error } = await client
    .from('chain_habits')
    .insert({
      user_id: userId,
      ...habit,
    })
    .select()
    .single();

  if (error) throw error;
  return data as ChainHabit;
}

export async function updateHabit(
  client: SupabaseClient,
  habitId: string,
  updates: UpdateChainHabit
): Promise<ChainHabit> {
  const { data, error } = await client
    .from('chain_habits')
    .update(updates)
    .eq('id', habitId)
    .select()
    .single();

  if (error) throw error;
  return data as ChainHabit;
}

export async function deleteHabit(
  client: SupabaseClient,
  habitId: string
): Promise<void> {
  const { error } = await client
    .from('chain_habits')
    .delete()
    .eq('id', habitId);

  if (error) throw error;
}

// ============ Entries ============

export async function getEntriesByHabit(
  client: SupabaseClient,
  habitId: string,
  startDate: string,
  endDate: string
): Promise<ChainEntry[]> {
  const { data, error } = await client
    .from('chain_entries')
    .select('*')
    .eq('habit_id', habitId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) throw error;
  return data as ChainEntry[];
}

export async function getEntryByDate(
  client: SupabaseClient,
  habitId: string,
  date: string
): Promise<ChainEntry | null> {
  const { data, error } = await client
    .from('chain_entries')
    .select('*')
    .eq('habit_id', habitId)
    .eq('date', date)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as ChainEntry | null;
}

export async function upsertEntry(
  client: SupabaseClient,
  userId: string,
  entry: CreateChainEntry
): Promise<ChainEntry> {
  const { data, error } = await client
    .from('chain_entries')
    .upsert(
      {
        user_id: userId,
        ...entry,
      },
      { onConflict: 'habit_id,date' }
    )
    .select()
    .single();

  if (error) throw error;
  return data as ChainEntry;
}

export async function updateEntry(
  client: SupabaseClient,
  entryId: string,
  updates: UpdateChainEntry
): Promise<ChainEntry> {
  const { data, error } = await client
    .from('chain_entries')
    .update(updates)
    .eq('id', entryId)
    .select()
    .single();

  if (error) throw error;
  return data as ChainEntry;
}

export async function deleteEntry(
  client: SupabaseClient,
  entryId: string
): Promise<void> {
  const { error } = await client
    .from('chain_entries')
    .delete()
    .eq('id', entryId);

  if (error) throw error;
}

// ============ Stats Calculation ============

export async function getHabitStats(
  client: SupabaseClient,
  habitId: string
): Promise<ChainHabitStats> {
  const { data, error } = await client
    .from('chain_entries')
    .select('date, status')
    .eq('habit_id', habitId)
    .order('date', { ascending: true });

  if (error) throw error;

  const entries = data as { date: string; status: ChainEntryStatus }[];

  if (entries.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalSuccess: 0,
      totalFail: 0,
      totalSkip: 0,
      successRate: 0,
    };
  }

  // Count totals
  const totalSuccess = entries.filter((e) => e.status === 'success').length;
  const totalFail = entries.filter((e) => e.status === 'fail').length;
  const totalSkip = entries.filter((e) => e.status === 'skip').length;

  // Success rate = success / (success + fail) - skip doesn't count against you
  const attemptedDays = totalSuccess + totalFail;
  const successRate =
    attemptedDays > 0 ? Math.round((totalSuccess / attemptedDays) * 100) : 0;

  // Build a map for quick lookup
  const entryMap = new Map<string, ChainEntryStatus>();
  entries.forEach((e) => entryMap.set(e.date, e.status));

  // Calculate current streak (counting backwards from today)
  // Skip days don't break the streak, only 'fail' or missing days do
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let currentStreak = 0;
  const checkDate = new Date(today);

  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
    const status = entryMap.get(dateStr);

    if (status === 'success') {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (status === 'skip') {
      // Skip doesn't break streak, continue checking
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // 'fail' or no entry breaks the streak
      break;
    }

    // Safety: don't go back more than 365 days
    const daysDiff = Math.floor(
      (today.getTime() - checkDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysDiff > 365) break;
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;

  // Sort entries by date and iterate
  const sortedDates = Array.from(entryMap.keys()).sort();

  for (let i = 0; i < sortedDates.length; i++) {
    const dateStr = sortedDates[i];
    const status = entryMap.get(dateStr);

    if (status === 'success') {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else if (status === 'fail') {
      tempStreak = 0;
    }
    // 'skip' doesn't change tempStreak
  }

  return {
    currentStreak,
    longestStreak,
    totalSuccess,
    totalFail,
    totalSkip,
    successRate,
  };
}
