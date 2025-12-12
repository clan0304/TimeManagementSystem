'use client';

import { useState } from 'react';
import { useSession } from '@clerk/nextjs';
import { format } from 'date-fns';
import { CheckCircle, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClerkSupabaseClient } from '@/lib/supabase/client';
import { deleteElimination, formatMinutes } from '@/lib/systems/lean/queries';
import type { LeanElimination } from '@/types';

type EliminationsListProps = {
  eliminations: LeanElimination[];
  onEliminationDelete: (eliminationId: string) => void;
};

export function EliminationsList({
  eliminations,
  onEliminationDelete,
}: EliminationsListProps) {
  const { session } = useSession();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (eliminationId: string) => {
    if (!session) return;

    setDeletingId(eliminationId);
    try {
      const client = createClerkSupabaseClient(session);
      await deleteElimination(client, eliminationId);
      onEliminationDelete(eliminationId);
    } catch (error) {
      console.error('Failed to delete elimination:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const totalSaved = eliminations.reduce(
    (sum, e) => sum + e.estimated_weekly_minutes,
    0
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Eliminated Waste
        </CardTitle>
      </CardHeader>
      <CardContent>
        {eliminations.length === 0 ? (
          <p className="text-slate-500 text-center py-4">
            No eliminations yet. Mark waste activities to track your progress.
          </p>
        ) : (
          <>
            <div className="space-y-3">
              {eliminations.map((elimination) => (
                <div
                  key={elimination.id}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {elimination.activity_name}
                    </p>
                    <p className="text-sm text-slate-500">
                      Saving{' '}
                      {formatMinutes(elimination.estimated_weekly_minutes)}/week
                      • Eliminated{' '}
                      {format(new Date(elimination.eliminated_at), 'MMM d')}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-slate-400 hover:text-red-500"
                    onClick={() => handleDelete(elimination.id)}
                    disabled={deletingId === elimination.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-green-100 rounded-lg text-center">
              <p className="text-sm text-green-800">
                🎉 Total time saved:{' '}
                <strong>{formatMinutes(totalSaved)}/week</strong>
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
