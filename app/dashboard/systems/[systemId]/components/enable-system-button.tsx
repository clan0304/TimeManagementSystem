'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { createClerkSupabaseClient } from '@/lib/supabase/client';
import { enableSystem, disableSystem } from '@/lib/systems/queries';
import type { SystemInfo } from '@/lib/systems/registry';

type EnableSystemButtonProps = {
  system: SystemInfo;
  isEnabled: boolean;
  size?: 'default' | 'lg';
};

export function EnableSystemButton({
  system,
  isEnabled,
  size = 'default',
}: EnableSystemButtonProps) {
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
        // Redirect to the system after enabling
        router.push(system.href);
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

  if (enabled) {
    return (
      <div className="flex gap-2">
        <Button onClick={handleOpen} size={size}>
          Open {system.name}
        </Button>
        <Button
          onClick={handleToggle}
          variant="outline"
          size={size}
          disabled={loading}
        >
          {loading ? '...' : 'Disable'}
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={handleToggle} size={size} disabled={loading}>
      {loading ? 'Enabling...' : `Enable ${system.name}`}
    </Button>
  );
}
