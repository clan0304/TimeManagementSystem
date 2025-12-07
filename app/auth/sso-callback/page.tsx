'use client';

import { useEffect } from 'react';
import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function SSOCallback() {
  const { handleRedirectCallback } = useClerk();
  const router = useRouter();

  useEffect(() => {
    async function handleCallback() {
      try {
        await handleRedirectCallback({
          afterSignInUrl: '/dashboard',
          afterSignUpUrl: '/dashboard',
        });
      } catch (err) {
        console.error('SSO callback error:', err);
        router.push('/auth');
      }
    }

    handleCallback();
  }, [handleRedirectCallback, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
        <p className="mt-4 text-slate-600">Completing sign in...</p>
      </div>
    </div>
  );
}
