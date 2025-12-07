import { SupabaseClient } from '@supabase/supabase-js';
import type { EnabledSystems } from '@/types';

export async function getEnabledSystems(
  client: SupabaseClient,
  userId: string
): Promise<EnabledSystems> {
  const { data, error } = await client
    .from('users')
    .select('enabled_systems')
    .eq('clerk_id', userId)
    .single();

  if (error) throw error;
  return (data?.enabled_systems as EnabledSystems) ?? {};
}

export async function enableSystem(
  client: SupabaseClient,
  userId: string,
  systemId: string
): Promise<void> {
  const current = await getEnabledSystems(client, userId);

  const { error } = await client
    .from('users')
    .update({
      enabled_systems: { ...current, [systemId]: true },
    })
    .eq('clerk_id', userId);

  if (error) throw error;
}

export async function disableSystem(
  client: SupabaseClient,
  userId: string,
  systemId: string
): Promise<void> {
  const current = await getEnabledSystems(client, userId);

  const { error } = await client
    .from('users')
    .update({
      enabled_systems: { ...current, [systemId]: false },
    })
    .eq('clerk_id', userId);

  if (error) throw error;
}

export function isSystemEnabled(
  enabledSystems: EnabledSystems,
  systemId: string
): boolean {
  return enabledSystems[systemId] === true;
}
