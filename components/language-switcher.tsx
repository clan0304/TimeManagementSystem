'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { setLocaleCookie } from '@/lib/actions/locale';
import { locales, localeNames, type Locale } from '@/i18n/config';

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations('settings');
  const [isPending, startTransition] = useTransition();

  const handleChange = (newLocale: string) => {
    startTransition(async () => {
      await setLocaleCookie(newLocale as Locale);
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-zinc-400" />
      <Select value={locale} onValueChange={handleChange} disabled={isPending}>
        <SelectTrigger
          className="w-[110px] h-8 bg-transparent border-zinc-700 text-zinc-300 text-sm hover:border-zinc-500"
          aria-label={t('selectLanguage')}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 border-zinc-700">
          {locales.map((loc) => (
            <SelectItem
              key={loc}
              value={loc}
              className="text-zinc-300 focus:bg-zinc-800 focus:text-white"
            >
              {localeNames[loc]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
