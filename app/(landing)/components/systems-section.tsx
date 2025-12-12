'use client';

import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function SystemsSection() {
  const t = useTranslations('landing.systems');

  const systems = [
    {
      icon: '🔗',
      key: 'chain',
    },
    {
      icon: '📅',
      key: 'timeboxing',
    },
    {
      icon: '🧱',
      key: 'sixblock',
    },
  ];

  return (
    <section
      id="systems"
      className="relative z-10 px-6 py-24 border-t border-zinc-800"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {t('title')}{' '}
            <span className="text-[#22D3EE]">{t('titleHighlight')}</span>
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">{t('subtitle')}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {systems.map((system) => (
            <div
              key={system.key}
              className="group relative p-8 rounded-2xl bg-linear-to-b from-zinc-900 to-zinc-900/50 border border-zinc-800 hover:border-[#22D3EE]/50 transition-all duration-300"
            >
              <div className="absolute inset-0 rounded-2xl bg-[#22D3EE]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="text-4xl mb-4">{system.icon}</div>
                <h3 className="text-2xl font-bold mb-2">
                  {t(`${system.key}.title`)}
                </h3>
                <p className="text-[#22D3EE] text-sm font-medium mb-4">
                  {t(`${system.key}.subtitle`)}
                </p>
                <p className="text-zinc-400 mb-6 leading-relaxed">
                  {t(`${system.key}.description`)}
                </p>
                <ul className="space-y-2 text-sm text-zinc-400">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#22D3EE]" />
                    {t(`${system.key}.feature1`)}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#22D3EE]" />
                    {t(`${system.key}.feature2`)}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#22D3EE]" />
                    {t(`${system.key}.feature3`)}
                  </li>
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
