'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function CtaSection() {
  const t = useTranslations('landing.cta');

  return (
    <section className="relative z-10 px-6 py-24 border-t border-zinc-800">
      <div className="max-w-4xl mx-auto text-center">
        {/* Glow effect */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[300px] bg-[#22D3EE] opacity-[0.08] rounded-full blur-[100px]" />
        </div>

        <div className="relative">
          <h2 className="text-3xl sm:text-5xl font-bold mb-6">{t('title')}</h2>
          <p className="text-xl text-zinc-400 mb-10">{t('subtitle')}</p>
          <Link
            href="/auth"
            className="group inline-flex items-center gap-2 px-10 py-5 bg-[#22D3EE] text-[#09090B] text-lg font-semibold rounded-xl hover:bg-[#67E8F9] transition-all hover:scale-105"
          >
            {t('button')}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
