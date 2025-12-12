'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { locales, defaultLocale, type Locale } from '@/i18n/config';

export async function setLocaleCookie(locale: Locale) {
  if (!locales.includes(locale)) {
    return { error: 'Invalid locale' };
  }

  const cookieStore = await cookies();
  cookieStore.set('locale', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax',
  });

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function getLocaleCookie(): Promise<Locale> {
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value;

  if (locale && locales.includes(locale as Locale)) {
    return locale as Locale;
  }

  return defaultLocale;
}
