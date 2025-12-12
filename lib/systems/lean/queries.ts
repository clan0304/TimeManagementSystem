import { SupabaseClient } from '@supabase/supabase-js';
import type {
  LeanCategory,
  LeanActivity,
  LeanElimination,
  CreateLeanCategory,
  CreateLeanActivity,
  UpdateLeanActivity,
  CreateLeanElimination,
  LeanWeeklyStats,
  LeanWastePattern,
} from '@/types';

// ============ Categories ============

export async function getCategories(
  client: SupabaseClient,
  userId: string
): Promise<LeanCategory[]> {
  const { data, error } = await client
    .from('lean_categories')
    .select('*')
    .eq('user_id', userId)
    .order('type', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;
  return data as LeanCategory[];
}

export async function createCategory(
  client: SupabaseClient,
  userId: string,
  category: CreateLeanCategory
): Promise<LeanCategory> {
  const { data, error } = await client
    .from('lean_categories')
    .insert({
      user_id: userId,
      ...category,
    })
    .select()
    .single();

  if (error) throw error;
  return data as LeanCategory;
}

export async function deleteCategory(
  client: SupabaseClient,
  categoryId: string
): Promise<void> {
  const { error } = await client
    .from('lean_categories')
    .delete()
    .eq('id', categoryId);

  if (error) throw error;
}

// ============ Activities ============

export async function getActivitiesByDate(
  client: SupabaseClient,
  userId: string,
  date: string
): Promise<LeanActivity[]> {
  const { data, error } = await client
    .from('lean_activities')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('start_time', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as LeanActivity[];
}

export async function getActivitiesByDateRange(
  client: SupabaseClient,
  userId: string,
  startDate: string,
  endDate: string
): Promise<LeanActivity[]> {
  const { data, error } = await client
    .from('lean_activities')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true, nullsFirst: false });

  if (error) throw error;
  return data as LeanActivity[];
}

export async function createActivity(
  client: SupabaseClient,
  userId: string,
  activity: CreateLeanActivity
): Promise<LeanActivity> {
  const { data, error } = await client
    .from('lean_activities')
    .insert({
      user_id: userId,
      ...activity,
    })
    .select()
    .single();

  if (error) throw error;
  return data as LeanActivity;
}

export async function updateActivity(
  client: SupabaseClient,
  activityId: string,
  updates: UpdateLeanActivity
): Promise<LeanActivity> {
  const { data, error } = await client
    .from('lean_activities')
    .update(updates)
    .eq('id', activityId)
    .select()
    .single();

  if (error) throw error;
  return data as LeanActivity;
}

export async function deleteActivity(
  client: SupabaseClient,
  activityId: string
): Promise<void> {
  const { error } = await client
    .from('lean_activities')
    .delete()
    .eq('id', activityId);

  if (error) throw error;
}

// ============ Eliminations ============

export async function getEliminations(
  client: SupabaseClient,
  userId: string
): Promise<LeanElimination[]> {
  const { data, error } = await client
    .from('lean_eliminations')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('eliminated_at', { ascending: false });

  if (error) throw error;
  return data as LeanElimination[];
}

export async function createElimination(
  client: SupabaseClient,
  userId: string,
  elimination: CreateLeanElimination
): Promise<LeanElimination> {
  const { data, error } = await client
    .from('lean_eliminations')
    .insert({
      user_id: userId,
      ...elimination,
    })
    .select()
    .single();

  if (error) throw error;
  return data as LeanElimination;
}

export async function deleteElimination(
  client: SupabaseClient,
  eliminationId: string
): Promise<void> {
  const { error } = await client
    .from('lean_eliminations')
    .update({ is_active: false })
    .eq('id', eliminationId);

  if (error) throw error;
}

// ============ Stats & Analysis ============

export function calculateWeeklyStats(
  activities: LeanActivity[]
): LeanWeeklyStats {
  const valueMinutes = activities
    .filter((a) => a.type === 'value')
    .reduce((sum, a) => sum + a.duration_minutes, 0);

  const supportMinutes = activities
    .filter((a) => a.type === 'support')
    .reduce((sum, a) => sum + a.duration_minutes, 0);

  const wasteMinutes = activities
    .filter((a) => a.type === 'waste')
    .reduce((sum, a) => sum + a.duration_minutes, 0);

  const totalMinutes = valueMinutes + supportMinutes + wasteMinutes;

  return {
    valueMinutes,
    supportMinutes,
    wasteMinutes,
    totalMinutes,
    valuePercentage:
      totalMinutes > 0 ? Math.round((valueMinutes / totalMinutes) * 100) : 0,
    supportPercentage:
      totalMinutes > 0 ? Math.round((supportMinutes / totalMinutes) * 100) : 0,
    wastePercentage:
      totalMinutes > 0 ? Math.round((wasteMinutes / totalMinutes) * 100) : 0,
  };
}

export function getWastePatterns(
  activities: LeanActivity[]
): LeanWastePattern[] {
  const wasteActivities = activities.filter((a) => a.type === 'waste');

  const grouped = wasteActivities.reduce((acc, activity) => {
    const name = activity.name.toLowerCase();
    if (!acc[name]) {
      acc[name] = { name: activity.name, totalMinutes: 0, occurrences: 0 };
    }
    acc[name].totalMinutes += activity.duration_minutes;
    acc[name].occurrences += 1;
    return acc;
  }, {} as Record<string, LeanWastePattern>);

  return Object.values(grouped).sort((a, b) => b.totalMinutes - a.totalMinutes);
}

export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}
