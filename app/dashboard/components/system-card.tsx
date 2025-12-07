'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, useUser } from '@clerk/nextjs';
import { Info } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClerkSupabaseClient } from '@/lib/supabase/client';
import { enableSystem, disableSystem } from '@/lib/systems/queries';
import type { SystemInfo } from '@/lib/systems/registry';

type SystemCardProps = {
  system: SystemInfo;
  isEnabled: boolean;
};

export function SystemCard({ system, isEnabled }: SystemCardProps) {
  const { user } = useUser();
  const { session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(isEnabled);

  const handleToggle = async () => {
    if (!user || !session) return;

    setLoading(true);
    try {
      const client = createClerkSupabaseClient(session);

      if (enabled) {
        await disableSystem(client, user.id, system.id);
        setEnabled(false);
      } else {
        await enableSystem(client, user.id, system.id);
        setEnabled(true);
      }

      router.refresh();
    } catch (error) {
      console.error('Failed to toggle system:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    router.push(system.href);
  };

  const handleDetail = () => {
    router.push(`/dashboard/systems/${system.id}`);
  };

  const isAvailable = system.status === 'available';
  const isComingSoon = system.status === 'coming_soon';

  return (
    <Card className={`relative ${!isAvailable ? 'opacity-60' : ''}`}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{system.icon}</span>
          <div>
            <CardTitle className="text-lg">{system.name}</CardTitle>
            {isComingSoon && (
              <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                Coming Soon
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardDescription>{system.description}</CardDescription>

        {isAvailable && (
          <div className="space-y-2">
            {/* Action Buttons */}
            <div className="flex gap-2">
              {enabled ? (
                <>
                  <Button
                    onClick={handleOpen}
                    className="flex-1 hover:cursor-pointer"
                  >
                    Open
                  </Button>
                  <Button
                    onClick={handleToggle}
                    variant="outline"
                    disabled={loading}
                  >
                    {loading ? '...' : 'Disable'}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleToggle}
                  className="w-full hover:cursor-pointer"
                  disabled={loading}
                >
                  {loading ? 'Enabling...' : 'Enable'}
                </Button>
              )}
            </div>

            {/* Details Button - Always Visible */}
            <Button
              onClick={handleDetail}
              variant="ghost"
              className="w-full text-white bg-black hover:text-slate-700 hover:cursor-pointer"
            >
              <Info className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
