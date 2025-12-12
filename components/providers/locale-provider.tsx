'use client';

import { NextIntlClientProvider, AbstractIntlMessages } from 'next-intl';

type LocaleProviderProps = {
  locale: string;
  messages: AbstractIntlMessages;
  children: React.ReactNode;
};

export function LocaleProvider({
  locale,
  messages,
  children,
}: LocaleProviderProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
