import { SupabaseClient } from '@supabase/supabase-js';
import type {
  TimeboxingItem,
  TimeboxingBlock,
  CreateTimeboxingItem,
  UpdateTimeboxingItem,
  CreateTimeboxingBlock,
  UpdateTimeboxingBlock,
} from '@/types';

// ============ Items ============

export async function getItemsByDate(
  client: SupabaseClient,
  userId: string,
  date: string
): Promise<TimeboxingItem[]> {
  const { data, error } = await client
    .from('timeboxing_items')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as TimeboxingItem[];
}

export async function createItem(
  client: SupabaseClient,
  userId: string,
  item: CreateTimeboxingItem
): Promise<TimeboxingItem> {
  const { data, error } = await client
    .from('timeboxing_items')
    .insert({
      user_id: userId,
      ...item,
    })
    .select()
    .single();

  if (error) throw error;
  return data as TimeboxingItem;
}

export async function updateItem(
  client: SupabaseClient,
  itemId: string,
  updates: UpdateTimeboxingItem
): Promise<TimeboxingItem> {
  const { data, error } = await client
    .from('timeboxing_items')
    .update(updates)
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw error;
  return data as TimeboxingItem;
}

export async function deleteItem(
  client: SupabaseClient,
  itemId: string
): Promise<void> {
  const { error } = await client
    .from('timeboxing_items')
    .delete()
    .eq('id', itemId);

  if (error) throw error;
}

// ============ Blocks ============

export async function getBlocksByDate(
  client: SupabaseClient,
  userId: string,
  date: string
): Promise<TimeboxingBlock[]> {
  const { data, error } = await client
    .from('timeboxing_blocks')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('start_time', { ascending: true });

  if (error) throw error;
  return data as TimeboxingBlock[];
}

export async function createBlock(
  client: SupabaseClient,
  userId: string,
  block: CreateTimeboxingBlock
): Promise<TimeboxingBlock> {
  const { data, error } = await client
    .from('timeboxing_blocks')
    .insert({
      user_id: userId,
      ...block,
    })
    .select()
    .single();

  if (error) throw error;
  return data as TimeboxingBlock;
}

export async function updateBlock(
  client: SupabaseClient,
  blockId: string,
  updates: UpdateTimeboxingBlock
): Promise<TimeboxingBlock> {
  const { data, error } = await client
    .from('timeboxing_blocks')
    .update(updates)
    .eq('id', blockId)
    .select()
    .single();

  if (error) throw error;
  return data as TimeboxingBlock;
}

export async function deleteBlock(
  client: SupabaseClient,
  blockId: string
): Promise<void> {
  const { error } = await client
    .from('timeboxing_blocks')
    .delete()
    .eq('id', blockId);

  if (error) throw error;
}
