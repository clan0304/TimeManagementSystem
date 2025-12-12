'use client';

import Link from 'next/link';
import { Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('landing.footer');

  return (
    <footer className="relative z-10 px-6 py-12 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#22D3EE] flex items-center justify-center">
            <Zap className="w-5 h-5 text-[#09090B]" />
          </div>
          <span className="text-lg font-bold">TimeFlow</span>
        </Link>

        <div className="flex items-center gap-8 text-sm text-zinc-500">
          <Link href="/privacy" className="hover:text-white transition-colors">
            {t('privacy')}
          </Link>
          <Link href="/terms" className="hover:text-white transition-colors">
            {t('terms')}
          </Link>
          <Link href="/contact" className="hover:text-white transition-colors">
            {t('contact')}
          </Link>
        </div>

        <p className="text-sm text-zinc-600">
          {t('copyright', { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
}
