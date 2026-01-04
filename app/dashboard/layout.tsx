import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getEnabledSystems } from '@/lib/systems/queries';
import { SYSTEMS } from '@/lib/systems/registry';
import { DashboardLanguageSwitcher } from './components/dashboard-language-switcher';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/auth');
  }

  const client = await createServerSupabaseClient();
  const enabledSystems = await getEnabledSystems(client, userId);
  const t = await getTranslations('dashboard');

  const enabledSystemList = SYSTEMS.filter(
    (system) => enabledSystems[system.id] === true
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              href="/dashboard"
              className="text-xl font-semibold text-slate-900"
            >
              TimeFlow
            </Link>
            <div className="flex items-center gap-4">
              <DashboardLanguageSwitcher />
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-2">
            <Link
              href="/dashboard"
              className="block px-4 py-2 text-sm font-medium text-slate-700 rounded-md hover:bg-slate-100"
            >
              🏠 {t('nav.home')}
            </Link>

            {enabledSystemList.length > 0 && (
              <>
                <div className="pt-4 pb-2">
                  <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {t('nav.yourSystems')}
                  </p>
                </div>
                {enabledSystemList.map((system) => (
                  <Link
                    key={system.id}
                    href={system.href}
                    className="block px-4 py-2 text-sm font-medium text-slate-700 rounded-md hover:bg-slate-100"
                  >
                    {system.icon} {t(`systems.${system.id}.name`)}
                  </Link>
                ))}
              </>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
