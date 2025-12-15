'use client';

import Link from 'next/link';
import { Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useUser, UserButton } from '@clerk/nextjs';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const t = useTranslations('landing.nav');
  const { isSignedIn, isLoaded } = useUser();

  return (
    <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-[#22D3EE] flex items-center justify-center">
          <Zap className="w-5 h-5 text-[#09090B]" />
        </div>
        <span className="text-xl font-bold tracking-tight">TimeFlow</span>
      </Link>

      <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
        <Link
          href="#features"
          className="hover:text-[#22D3EE] transition-colors"
        >
          {t('features')}
        </Link>
        <Link
          href="#systems"
          className="hover:text-[#22D3EE] transition-colors"
        >
          {t('systems')}
        </Link>
        <Link
          href="#how-it-works"
          className="hover:text-[#22D3EE] transition-colors"
        >
          {t('howItWorks')}
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <LanguageSwitcher />

        {/* Show loading placeholder while Clerk loads */}
        {!isLoaded ? (
          <div className="w-8 h-8 rounded-full bg-zinc-800 animate-pulse" />
        ) : isSignedIn ? (
          /* Signed in: Show dashboard link and user button */
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                className="text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                {t('dashboard')}
              </Button>
            </Link>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: 'w-9 h-9',
                  userButtonPopoverCard: 'bg-zinc-900 border-zinc-800',
                  userButtonPopoverActionButton:
                    'text-zinc-300 hover:bg-zinc-800',
                  userButtonPopoverActionButtonText: 'text-zinc-300',
                  userButtonPopoverFooter: 'hidden',
                },
              }}
            />
          </div>
        ) : (
          /* Not signed in: Show sign in and get started */
          <>
            <Link
              href="/auth"
              className="hidden sm:block text-sm text-zinc-400 hover:text-white transition-colors"
            >
              {t('signIn')}
            </Link>
            <Link
              href="/auth"
              className="px-4 py-2 bg-[#22D3EE] text-[#09090B] text-sm font-semibold rounded-lg hover:bg-[#67E8F9] transition-colors"
            >
              {t('getStarted')}
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
