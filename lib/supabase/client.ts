import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { SessionResource } from '@clerk/types';

type SupabaseClientOptions = {
  accessToken: () => Promise<string | null>;
};

export function createClerkSupabaseClient(
  session: SessionResource | null | undefined
): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      accessToken: async () => {
        return session?.getToken() ?? null;
      },
    } as SupabaseClientOptions
  );
}
