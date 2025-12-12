import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { getLocale, getMessages } from 'next-intl/server';
import { LocaleProvider } from '@/components/providers/locale-provider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TimeFlow',
  description: 'Master your time, build lasting habits',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <ClerkProvider>
      <html lang={locale}>
        <body className={inter.className}>
          <LocaleProvider locale={locale} messages={messages}>
            {children}
          </LocaleProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
