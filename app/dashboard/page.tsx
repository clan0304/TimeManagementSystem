import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getEnabledSystems } from '@/lib/systems/queries';
import { SYSTEMS } from '@/lib/systems/registry';
import { SystemCard } from './components/system-card';

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/auth');
  }

  const client = await createServerSupabaseClient();
  const enabledSystems = await getEnabledSystems(client, userId);
  const t = await getTranslations('dashboard');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('title')}</h1>
        <p className="text-slate-600 mt-1">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SYSTEMS.map((system) => (
          <SystemCard
            key={system.id}
            system={system}
            isEnabled={enabledSystems[system.id] === true}
          />
        ))}
      </div>
    </div>
  );
}
