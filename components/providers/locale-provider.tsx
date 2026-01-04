// components/providers/locale-provider.tsx
'use client';

import { NextIntlClientProvider, AbstractIntlMessages } from 'next-intl';

type LocaleProviderProps = {
  locale: string;
  messages: AbstractIntlMessages;
  timeZone: string;
  children: React.ReactNode;
};

export function LocaleProvider({
  locale,
  messages,
  timeZone,
  children,
}: LocaleProviderProps) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone={timeZone}
    >
      {children}
    </NextIntlClientProvider>
  );
}
