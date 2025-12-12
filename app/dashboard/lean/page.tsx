'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSession, useUser } from '@clerk/nextjs';
import {
  format,
  startOfWeek,
  endOfWeek,
  subWeeks,
  addWeeks,
  isSameWeek,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClerkSupabaseClient } from '@/lib/supabase/client';
import {
  getActivitiesByDateRange,
  getEliminations,
  calculateWeeklyStats,
  getWastePatterns,
} from '@/lib/systems/lean/queries';
import type {
  LeanActivity,
  LeanElimination,
  LeanWeeklyStats,
  LeanWastePattern,
} from '@/types';
import { WeeklySummary } from './components/weekly-summary';
import { WastePatterns } from './components/waste-patterns';
import { DailyActivities } from './components/daily-activities';
import { AddActivityDialog } from './components/add-activity-dialog';
import { EliminationsList } from './components/eliminations-list';
import { Insights } from './components/insights';
import { WeekPicker } from './components/week-picker';

export default function LeanPage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { session, isLoaded: isSessionLoaded } = useSession();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [activities, setActivities] = useState<LeanActivity[]>([]);
  const [eliminations, setEliminations] = useState<LeanElimination[]>([]);
  const [stats, setStats] = useState<LeanWeeklyStats | null>(null);
  const [wastePatterns, setWastePatterns] = useState<LeanWastePattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Memoize week boundaries to prevent infinite re-renders
  const weekStart = useMemo(
    () => startOfWeek(currentWeek, { weekStartsOn: 1 }),
    [currentWeek]
  );
  const weekEnd = useMemo(
    () => endOfWeek(currentWeek, { weekStartsOn: 1 }),
    [currentWeek]
  );

  // Format dates for query (stable strings)
  const startDateStr = format(weekStart, 'yyyy-MM-dd');
  const endDateStr = format(weekEnd, 'yyyy-MM-dd');

  // Derived state for auth status
  const isAuthReady = isUserLoaded && isSessionLoaded;
  const isAuthenticated = isAuthReady && !!session && !!user;

  // Check if current week is selected (to disable next button)
  const isCurrentWeek = isSameWeek(currentWeek, new Date(), {
    weekStartsOn: 1,
  });

  useEffect(() => {
    if (!isAuthReady || !isAuthenticated) {
      return;
    }

    let isMounted = true;

    const fetchData = async () => {
      if (isMounted) {
        setLoading(true);
        setError(null);
      }

      try {
        const client = createClerkSupabaseClient(session);

        const [activitiesData, eliminationsData] = await Promise.all([
          getActivitiesByDateRange(client, user.id, startDateStr, endDateStr),
          getEliminations(client, user.id),
        ]);

        if (isMounted) {
          setActivities(activitiesData);
          setEliminations(eliminationsData);
          setStats(calculateWeeklyStats(activitiesData));
          setWastePatterns(getWastePatterns(activitiesData));
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load data');
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [isAuthReady, isAuthenticated, session, user, startDateStr, endDateStr]);

  const recalculateStats = (updatedActivities: LeanActivity[]) => {
    setStats(calculateWeeklyStats(updatedActivities));
    setWastePatterns(getWastePatterns(updatedActivities));
  };

  const handleActivityCreate = (newActivity: LeanActivity) => {
    const updated = [...activities, newActivity];
    setActivities(updated);
    recalculateStats(updated);
  };

  const handleActivityUpdate = (updatedActivity: LeanActivity) => {
    const updated = activities.map((a) =>
      a.id === updatedActivity.id ? updatedActivity : a
    );
    setActivities(updated);
    recalculateStats(updated);
  };

  const handleActivityDelete = (activityId: string) => {
    const updated = activities.filter((a) => a.id !== activityId);
    setActivities(updated);
    recalculateStats(updated);
  };

  const handleEliminationCreate = (newElimination: LeanElimination) => {
    setEliminations((prev) => [newElimination, ...prev]);
  };

  const handleEliminationDelete = (eliminationId: string) => {
    setEliminations((prev) => prev.filter((e) => e.id !== eliminationId));
  };

  // When week changes, update selectedDate to be within that week
  const handleWeekChange = (date: Date) => {
    setCurrentWeek(date);
    // Set selectedDate to the start of the new week or today if it's current week
    const newWeekStart = startOfWeek(date, { weekStartsOn: 1 });
    if (isSameWeek(date, new Date(), { weekStartsOn: 1 })) {
      setSelectedDate(new Date());
    } else {
      setSelectedDate(newWeekStart);
    }
  };

  // Show loading while Clerk is initializing
  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Initializing...</p>
      </div>
    );
  }

  // Show message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-slate-500">Please sign in to view this page.</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Lean Time Tracker
          </h1>
          <p className="text-slate-600 mt-1">
            Eliminate waste, maximize value.
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Log Activity
        </Button>
      </div>

      {/* Week Navigation */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleWeekChange(subWeeks(currentWeek, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <WeekPicker
            selectedWeek={currentWeek}
            onWeekSelect={handleWeekChange}
          />

          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleWeekChange(addWeeks(currentWeek, 1))}
            disabled={isCurrentWeek}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Weekly Summary */}
      {stats && <WeeklySummary stats={stats} />}

      {/* Insights */}
      {stats && <Insights activities={activities} stats={stats} />}

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Waste Patterns */}
        <WastePatterns
          patterns={wastePatterns}
          onEliminationCreate={handleEliminationCreate}
        />

        {/* Eliminations */}
        <EliminationsList
          eliminations={eliminations}
          onEliminationDelete={handleEliminationDelete}
        />
      </div>

      {/* Daily Activities */}
      <DailyActivities
        activities={activities}
        weekStart={weekStart}
        weekEnd={weekEnd}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        onActivityUpdate={handleActivityUpdate}
        onActivityDelete={handleActivityDelete}
        onAddClick={() => setIsAddDialogOpen(true)}
      />

      {/* Add Activity Dialog */}
      <AddActivityDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        selectedDate={selectedDate}
        onActivityCreate={handleActivityCreate}
      />
    </div>
  );
}
