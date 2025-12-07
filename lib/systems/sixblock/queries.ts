import { SupabaseClient } from '@supabase/supabase-js';
import type {
  SixBlockDay,
  SixBlockBlock,
  SixBlockChecklistItem,
  CreateSixBlockDay,
  UpdateSixBlockDay,
  CreateSixBlockBlock,
  UpdateSixBlockBlock,
  CreateSixBlockChecklistItem,
  UpdateSixBlockChecklistItem,
} from '@/types';

// ============ Days ============

export async function getDayByDate(
  client: SupabaseClient,
  userId: string,
  date: string
): Promise<SixBlockDay | null> {
  const { data, error } = await client
    .from('sixblock_days')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as SixBlockDay | null;
}

export async function upsertDay(
  client: SupabaseClient,
  userId: string,
  day: CreateSixBlockDay
): Promise<SixBlockDay> {
  const { data, error } = await client
    .from('sixblock_days')
    .upsert(
      {
        user_id: userId,
        ...day,
      },
      { onConflict: 'user_id,date' }
    )
    .select()
    .single();

  if (error) throw error;
  return data as SixBlockDay;
}

export async function updateDay(
  client: SupabaseClient,
  dayId: string,
  updates: UpdateSixBlockDay
): Promise<SixBlockDay> {
  const { data, error } = await client
    .from('sixblock_days')
    .update(updates)
    .eq('id', dayId)
    .select()
    .single();

  if (error) throw error;
  return data as SixBlockDay;
}

// ============ Blocks ============

export async function getBlocksByDate(
  client: SupabaseClient,
  userId: string,
  date: string
): Promise<SixBlockBlock[]> {
  const { data, error } = await client
    .from('sixblock_blocks')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('block_order', { ascending: true });

  if (error) throw error;
  return data as SixBlockBlock[];
}

export async function createBlock(
  client: SupabaseClient,
  userId: string,
  block: CreateSixBlockBlock
): Promise<SixBlockBlock> {
  const { data, error } = await client
    .from('sixblock_blocks')
    .insert({
      user_id: userId,
      ...block,
    })
    .select()
    .single();

  if (error) throw error;
  return data as SixBlockBlock;
}

export async function updateBlock(
  client: SupabaseClient,
  blockId: string,
  updates: UpdateSixBlockBlock
): Promise<SixBlockBlock> {
  const { data, error } = await client
    .from('sixblock_blocks')
    .update(updates)
    .eq('id', blockId)
    .select()
    .single();

  if (error) throw error;
  return data as SixBlockBlock;
}

export async function deleteBlock(
  client: SupabaseClient,
  blockId: string
): Promise<void> {
  const { error } = await client
    .from('sixblock_blocks')
    .delete()
    .eq('id', blockId);

  if (error) throw error;
}

export async function toggleCoreBlock(
  client: SupabaseClient,
  blockId: string,
  isCore: boolean
): Promise<SixBlockBlock> {
  const { data, error } = await client
    .from('sixblock_blocks')
    .update({ is_core: isCore })
    .eq('id', blockId)
    .select()
    .single();

  if (error) throw error;
  return data as SixBlockBlock;
}

// ============ Checklist Items ============

export async function getChecklistItemsByBlock(
  client: SupabaseClient,
  blockId: string
): Promise<SixBlockChecklistItem[]> {
  const { data, error } = await client
    .from('sixblock_checklist_items')
    .select('*')
    .eq('block_id', blockId)
    .order('item_order', { ascending: true });

  if (error) throw error;
  return data as SixBlockChecklistItem[];
}

export async function getChecklistItemsByDate(
  client: SupabaseClient,
  userId: string,
  blockIds: string[]
): Promise<SixBlockChecklistItem[]> {
  if (blockIds.length === 0) return [];

  const { data, error } = await client
    .from('sixblock_checklist_items')
    .select('*')
    .eq('user_id', userId)
    .in('block_id', blockIds)
    .order('item_order', { ascending: true });

  if (error) throw error;
  return data as SixBlockChecklistItem[];
}

export async function createChecklistItem(
  client: SupabaseClient,
  userId: string,
  item: CreateSixBlockChecklistItem
): Promise<SixBlockChecklistItem> {
  const { data, error } = await client
    .from('sixblock_checklist_items')
    .insert({
      user_id: userId,
      ...item,
    })
    .select()
    .single();

  if (error) throw error;
  return data as SixBlockChecklistItem;
}

export async function updateChecklistItem(
  client: SupabaseClient,
  itemId: string,
  updates: UpdateSixBlockChecklistItem
): Promise<SixBlockChecklistItem> {
  const { data, error } = await client
    .from('sixblock_checklist_items')
    .update(updates)
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw error;
  return data as SixBlockChecklistItem;
}

export async function deleteChecklistItem(
  client: SupabaseClient,
  itemId: string
): Promise<void> {
  const { error } = await client
    .from('sixblock_checklist_items')
    .delete()
    .eq('id', itemId);

  if (error) throw error;
}

export async function toggleChecklistItem(
  client: SupabaseClient,
  itemId: string,
  isCompleted: boolean
): Promise<SixBlockChecklistItem> {
  const { data, error } = await client
    .from('sixblock_checklist_items')
    .update({ is_completed: isCompleted })
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw error;
  return data as SixBlockChecklistItem;
}
