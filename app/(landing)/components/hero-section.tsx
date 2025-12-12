'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function HeroSection() {
  const t = useTranslations('landing.hero');

  return (
    <section className="relative z-10 px-6 pt-20 pb-32 max-w-7xl mx-auto">
      <div className="max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-400 mb-8">
          <Sparkles className="w-4 h-4 text-[#22D3EE]" />
          <span>{t('badge')}</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
          {t('title1')}
          <br />
          <span className="text-[#22D3EE]">{t('title2')}</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          {t('subtitle')}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/sign-up"
            className="group flex items-center gap-2 px-8 py-4 bg-[#22D3EE] text-[#09090B] font-semibold rounded-xl hover:bg-[#67E8F9] transition-all hover:scale-105"
          >
            {t('cta')}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="#systems"
            className="px-8 py-4 border border-zinc-700 text-zinc-300 font-medium rounded-xl hover:border-zinc-500 hover:text-white transition-all"
          >
            {t('ctaSecondary')}
          </Link>
        </div>
      </div>

      {/* Hero Visual - Chain Animation */}
      <div className="mt-20 flex justify-center">
        <div className="flex items-center gap-2">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold transition-all duration-500"
              style={{
                backgroundColor: i < 5 ? '#22D3EE' : '#27272A',
                color: i < 5 ? '#09090B' : '#71717A',
              }}
            >
              {i < 5 ? '✓' : i === 5 ? '?' : ''}
            </div>
          ))}
        </div>
      </div>
      <p className="text-center text-sm text-zinc-500 mt-4">
        {t('chainCaption')}
      </p>
    </section>
  );
}
