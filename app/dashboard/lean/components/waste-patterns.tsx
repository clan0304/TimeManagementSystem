'use client';

import { useState } from 'react';
import { useSession, useUser } from '@clerk/nextjs';
import { AlertTriangle, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClerkSupabaseClient } from '@/lib/supabase/client';
import { createElimination, formatMinutes } from '@/lib/systems/lean/queries';
import type { LeanWastePattern, LeanElimination } from '@/types';

type WastePatternsProps = {
  patterns: LeanWastePattern[];
  onEliminationCreate: (elimination: LeanElimination) => void;
};

export function WastePatterns({
  patterns,
  onEliminationCreate,
}: WastePatternsProps) {
  const { user } = useUser();
  const { session } = useSession();
  const [eliminatingId, setEliminatingId] = useState<string | null>(null);

  const handleEliminate = async (pattern: LeanWastePattern) => {
    if (!user || !session) return;

    setEliminatingId(pattern.name);
    try {
      const client = createClerkSupabaseClient(session);
      const elimination = await createElimination(client, user.id, {
        activity_name: pattern.name,
        estimated_weekly_minutes: pattern.totalMinutes,
      });
      onEliminationCreate(elimination);
    } catch (error) {
      console.error('Failed to create elimination:', error);
    } finally {
      setEliminatingId(null);
    }
  };

  if (patterns.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Waste Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 text-center py-4">
            No waste activities logged this week. Great job!
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalWaste = patterns.reduce((sum, p) => sum + p.totalMinutes, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Top Waste Activities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {patterns.slice(0, 5).map((pattern) => (
            <div
              key={pattern.name}
              className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100"
            >
              <div>
                <p className="font-medium text-slate-900">{pattern.name}</p>
                <p className="text-sm text-slate-500">
                  {formatMinutes(pattern.totalMinutes)} • {pattern.occurrences}x
                  this week
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-100"
                onClick={() => handleEliminate(pattern)}
                disabled={eliminatingId === pattern.name}
              >
                <X className="h-4 w-4 mr-1" />
                Eliminate
              </Button>
            </div>
          ))}
        </div>

        <p className="text-sm text-slate-500 mt-4 text-center">
          Potential savings: {formatMinutes(totalWaste)}/week
        </p>
      </CardContent>
    </Card>
  );
}
