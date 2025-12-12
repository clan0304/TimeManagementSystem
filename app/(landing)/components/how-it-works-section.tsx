'use client';

import { useTranslations } from 'next-intl';

export function HowItWorksSection() {
  const t = useTranslations('landing.howItWorks');

  const steps = [
    { number: 1, key: 'step1' },
    { number: 2, key: 'step2' },
    { number: 3, key: 'step3' },
  ];

  return (
    <section
      id="how-it-works"
      className="relative z-10 px-6 py-24 border-t border-zinc-800"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {t('title')}{' '}
            <span className="text-[#22D3EE]">{t('titleHighlight')}</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#22D3EE] text-[#09090B] text-2xl font-bold flex items-center justify-center mx-auto mb-6">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t(`${step.key}.title`)}
              </h3>
              <p className="text-zinc-400">{t(`${step.key}.description`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
