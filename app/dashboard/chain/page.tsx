'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession, useUser } from '@clerk/nextjs';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClerkSupabaseClient } from '@/lib/supabase/client';
import { getActiveHabits, getHabitStats } from '@/lib/systems/chain/queries';
import { MAX_HABITS } from '@/lib/systems/chain/constants';
import type { ChainHabit, ChainHabitStats } from '@/types';
import { HabitCard } from './components/habit-card';
import { AddHabitDialog } from './components/add-habit-dialog';

export default function ChainPage() {
  const { user } = useUser();
  const { session } = useSession();
  const [habits, setHabits] = useState<ChainHabit[]>([]);
  const [habitStats, setHabitStats] = useState<Record<string, ChainHabitStats>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user || !session) return;

    setLoading(true);
    try {
      const client = createClerkSupabaseClient(session);
      const habitsData = await getActiveHabits(client, user.id);
      setHabits(habitsData);

      const statsPromises = habitsData.map(async (habit) => {
        const stats = await getHabitStats(client, habit.id);
        return { habitId: habit.id, stats };
      });

      const statsResults = await Promise.all(statsPromises);
      const statsMap: Record<string, ChainHabitStats> = {};
      statsResults.forEach(({ habitId, stats }) => {
        statsMap[habitId] = stats;
      });
      setHabitStats(statsMap);
    } catch (error) {
      console.error('Failed to fetch habits:', error);
    } finally {
      setLoading(false);
    }
  }, [user, session]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleHabitCreate = (newHabit: ChainHabit) => {
    setHabits((prev) => [...prev, newHabit]);
    setHabitStats((prev) => ({
      ...prev,
      [newHabit.id]: {
        currentStreak: 0,
        longestStreak: 0,
        totalSuccess: 0,
        totalFail: 0,
        totalSkip: 0,
        successRate: 0,
      },
    }));
  };

  const handleHabitUpdate = (updatedHabit: ChainHabit) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === updatedHabit.id ? updatedHabit : h))
    );
  };

  const handleHabitDelete = (habitId: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    setHabitStats((prev) => {
      const newStats = { ...prev };
      delete newStats[habitId];
      return newStats;
    });
  };

  const handleStatsUpdate = (habitId: string, stats: ChainHabitStats) => {
    setHabitStats((prev) => ({
      ...prev,
      [habitId]: stats,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Seinfeld Chain</h1>
          <p className="text-slate-600 mt-1">
            Don&apos;t break the chain. Build habits that last.
          </p>
        </div>
        {habits.length < MAX_HABITS && (
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Habit
          </Button>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-600">
        <p className="font-medium text-slate-700 mb-2">How it works:</p>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-green-500 text-white flex items-center justify-center text-xs font-bold">
              ✓
            </span>
            <span>Success - completed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-red-500 text-white flex items-center justify-center text-xs font-bold">
              ✗
            </span>
            <span>Fail - breaks streak</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-slate-400 text-white flex items-center justify-center text-xs font-bold">
              −
            </span>
            <span>Skip - doesn&apos;t break streak</span>
          </div>
        </div>
      </div>

      {/* Habits */}
      {habits.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <div className="text-4xl mb-4">🔗</div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            No habits yet
          </h3>
          <p className="text-slate-500 mb-4">
            Start building your first chain today! (Max {MAX_HABITS} habits)
          </p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Habit
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              stats={habitStats[habit.id]}
              onHabitUpdate={handleHabitUpdate}
              onHabitDelete={handleHabitDelete}
              onStatsUpdate={(stats) => handleStatsUpdate(habit.id, stats)}
            />
          ))}
        </div>
      )}

      {/* Add Habit Dialog */}
      <AddHabitDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onHabitCreate={handleHabitCreate}
      />
    </div>
  );
}
