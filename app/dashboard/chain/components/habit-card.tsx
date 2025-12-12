'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@clerk/nextjs';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isFuture,
  startOfWeek,
  endOfWeek,
  subMonths,
  addMonths,
} from 'date-fns';
import {
  Flame,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Settings,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { createClerkSupabaseClient } from '@/lib/supabase/client';
import { getEntriesByHabit, getHabitStats } from '@/lib/systems/chain/queries';
import { ENTRY_STATUS } from '@/lib/systems/chain/constants';
import type { ChainHabit, ChainEntry, ChainHabitStats } from '@/types';
import { EditHabitDialog } from './edit-habit-dialog';
import { EntryDialog } from './entry-dialog';

type HabitCardProps = {
  habit: ChainHabit;
  stats: ChainHabitStats | undefined;
  onHabitUpdate: (habit: ChainHabit) => void;
  onHabitDelete: (habitId: string) => void;
  onStatsUpdate: (stats: ChainHabitStats) => void;
};

type CalendarDayProps = {
  day: Date;
  entry: ChainEntry | undefined;
  habit: ChainHabit;
  isCurrentMonth: boolean;
  isTodayDate: boolean;
  isFutureDate: boolean;
  onClick: () => void;
};

function CalendarDay({
  day,
  entry,
  habit,
  isCurrentMonth,
  isTodayDate,
  isFutureDate,
  onClick,
}: CalendarDayProps) {
  let bgColor = 'bg-slate-100';
  let textColor = 'text-slate-600';
  let content: string = format(day, 'd');

  if (entry) {
    if (entry.status === 'success') {
      bgColor = '';
      textColor = 'text-white';
      content = '✓';
    } else if (entry.status === 'fail') {
      bgColor = 'bg-red-500';
      textColor = 'text-white';
      content = '✗';
    } else if (entry.status === 'skip') {
      bgColor = 'bg-slate-400';
      textColor = 'text-white';
      content = '−';
    }
  }

  const dayButton = (
    <button
      onClick={onClick}
      disabled={isFutureDate || !isCurrentMonth}
      className={`
        w-full h-full rounded-md flex items-center justify-center text-sm font-medium
        transition-all
        ${!isCurrentMonth ? 'opacity-30' : ''}
        ${
          isFutureDate ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'
        }
        ${isTodayDate ? 'ring-2 ring-offset-1' : ''}
        ${bgColor}
        ${textColor}
      `}
      style={
        {
          backgroundColor:
            entry?.status === 'success' ? habit.color : undefined,
          '--tw-ring-color': isTodayDate ? habit.color : undefined,
        } as React.CSSProperties
      }
    >
      {content}
    </button>
  );

  // Wrapper ensures consistent size for all cells
  const wrapper = (children: React.ReactNode) => (
    <div className="aspect-square w-full">{children}</div>
  );

  // If entry has memo, wrap with tooltip
  if (entry?.memo) {
    return wrapper(
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="w-full h-full">{dayButton}</div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px] text-center">
          <div className="space-y-1">
            <p className="font-medium text-xs uppercase">
              {ENTRY_STATUS[entry.status].label}
            </p>
            <p className="text-sm">{entry.memo}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return wrapper(dayButton);
}

export function HabitCard({
  habit,
  stats,
  onHabitUpdate,
  onHabitDelete,
  onStatsUpdate,
}: HabitCardProps) {
  const { session } = useSession();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [entries, setEntries] = useState<ChainEntry[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Fetch entries when session, habit, or month changes
  useEffect(() => {
    if (!session) return;

    let isMounted = true;

    const fetchEntries = async () => {
      try {
        const client = createClerkSupabaseClient(session);

        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
        const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

        const entriesData = await getEntriesByHabit(
          client,
          habit.id,
          format(calendarStart, 'yyyy-MM-dd'),
          format(calendarEnd, 'yyyy-MM-dd')
        );

        if (isMounted) {
          setEntries(entriesData);
        }
      } catch (error) {
        console.error('Failed to fetch entries:', error);
      }
    };

    fetchEntries();

    return () => {
      isMounted = false;
    };
  }, [session, habit.id, currentMonth]);

  const getEntryForDate = (date: Date): ChainEntry | undefined => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return entries.find((e) => e.date === dateStr);
  };

  const handleDayClick = (date: Date) => {
    if (isFuture(date)) return;
    setSelectedDate(date);
  };

  const handleEntryUpdate = async (updatedEntry: ChainEntry | null) => {
    if (updatedEntry) {
      setEntries((prev) => {
        const existing = prev.find((e) => e.date === updatedEntry.date);
        if (existing) {
          return prev.map((e) =>
            e.date === updatedEntry.date ? updatedEntry : e
          );
        } else {
          return [...prev, updatedEntry];
        }
      });
    }

    // Refresh stats
    if (session) {
      const client = createClerkSupabaseClient(session);
      const newStats = await getHabitStats(client, habit.id);
      onStatsUpdate(newStats);
    }
  };

  const handleEntryDelete = async (date: string) => {
    setEntries((prev) => prev.filter((e) => e.date !== date));

    // Refresh stats
    if (session) {
      const client = createClerkSupabaseClient(session);
      const newStats = await getHabitStats(client, habit.id);
      onStatsUpdate(newStats);
    }
  };

  // Generate calendar days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                style={{ backgroundColor: `${habit.color}20` }}
              >
                {habit.icon}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{habit.name}</h3>
                {habit.success_criteria && (
                  <p className="text-sm text-slate-500">
                    {habit.success_criteria}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Stats */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">
                    {stats?.currentStreak ?? 0}
                  </span>
                  <span className="text-slate-500">days</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">
                    {stats?.longestStreak ?? 0}
                  </span>
                  <span className="text-slate-500">best</span>
                </div>
              </div>

              {/* Settings */}
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Settings className="h-4 w-4 text-slate-400" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium text-slate-700">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              disabled={isSameMonth(currentMonth, new Date())}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <TooltipProvider delayDuration={300}>
            <div className="grid grid-cols-7 gap-1">
              {/* Week day headers */}
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-slate-500 py-2"
                >
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {calendarDays.map((day) => (
                <CalendarDay
                  key={day.toISOString()}
                  day={day}
                  entry={getEntryForDate(day)}
                  habit={habit}
                  isCurrentMonth={isSameMonth(day, currentMonth)}
                  isTodayDate={isToday(day)}
                  isFutureDate={isFuture(day)}
                  onClick={() => handleDayClick(day)}
                />
              ))}
            </div>
          </TooltipProvider>

          {/* Today's quick action */}
          {!getEntryForDate(new Date()) && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <Button
                className="w-full"
                style={{ backgroundColor: habit.color }}
                onClick={() => setSelectedDate(new Date())}
              >
                Record Today&apos;s Progress
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Habit Dialog */}
      <EditHabitDialog
        habit={habit}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onHabitUpdate={onHabitUpdate}
        onHabitDelete={onHabitDelete}
      />

      {/* Entry Dialog */}
      {selectedDate && (
        <EntryDialog
          habit={habit}
          date={selectedDate}
          entry={getEntryForDate(selectedDate)}
          isOpen={!!selectedDate}
          onClose={() => setSelectedDate(null)}
          onEntryUpdate={handleEntryUpdate}
          onEntryDelete={handleEntryDelete}
        />
      )}
    </>
  );
}
