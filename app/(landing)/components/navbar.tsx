'use client';

import Link from 'next/link';
import { Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/language-switcher';

export function Navbar() {
  const t = useTranslations('landing.nav');

  return (
    <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-[#22D3EE] flex items-center justify-center">
          <Zap className="w-5 h-5 text-[#09090B]" />
        </div>
        <span className="text-xl font-bold tracking-tight">TimeFlow</span>
      </Link>

      <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
        <Link
          href="#features"
          className="hover:text-[#22D3EE] transition-colors"
        >
          {t('features')}
        </Link>
        <Link
          href="#systems"
          className="hover:text-[#22D3EE] transition-colors"
        >
          {t('systems')}
        </Link>
        <Link
          href="#how-it-works"
          className="hover:text-[#22D3EE] transition-colors"
        >
          {t('howItWorks')}
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        <Link
          href="/sign-in"
          className="hidden sm:block text-sm text-zinc-400 hover:text-white transition-colors"
        >
          {t('signIn')}
        </Link>
        <Link
          href="/sign-up"
          className="px-4 py-2 bg-[#22D3EE] text-[#09090B] text-sm font-semibold rounded-lg hover:bg-[#67E8F9] transition-colors"
        >
          {t('getStarted')}
        </Link>
      </div>
    </nav>
  );
}
