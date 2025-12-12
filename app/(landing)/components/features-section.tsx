'use client';

import { LayoutGrid, Shield, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function FeaturesSection() {
  const t = useTranslations('landing.features');

  const features = [
    {
      icon: LayoutGrid,
      titleKey: 'modular.title',
      descriptionKey: 'modular.description',
    },
    {
      icon: Shield,
      titleKey: 'privacy.title',
      descriptionKey: 'privacy.description',
    },
    {
      icon: Zap,
      titleKey: 'fast.title',
      descriptionKey: 'fast.description',
    },
  ];

  return (
    <section
      id="features"
      className="relative z-10 px-6 py-24 border-t border-zinc-800"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {t('title')}{' '}
            <span className="text-[#22D3EE]">{t('titleHighlight')}</span>?
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">{t('subtitle')}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.titleKey}
              className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-[#22D3EE]/10 flex items-center justify-center mb-6">
                <feature.icon className="w-6 h-6 text-[#22D3EE]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                {t(feature.titleKey)}
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                {t(feature.descriptionKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
