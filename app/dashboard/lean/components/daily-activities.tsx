'use client';

import { useState } from 'react';
import { format, eachDayOfInterval, isSameDay } from 'date-fns';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ACTIVITY_TYPES } from '@/lib/systems/lean/constants';
import { formatMinutes } from '@/lib/systems/lean/queries';
import type { LeanActivity } from '@/types';
import { EditActivityDialog } from './edit-activity-dialog';

type DailyActivitiesProps = {
  activities: LeanActivity[];
  weekStart: Date;
  weekEnd: Date;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onActivityUpdate: (activity: LeanActivity) => void;
  onActivityDelete: (activityId: string) => void;
  onAddClick: () => void;
};

export function DailyActivities({
  activities,
  weekStart,
  weekEnd,
  selectedDate,
  onDateSelect,
  onActivityUpdate,
  onActivityDelete,
  onAddClick,
}: DailyActivitiesProps) {
  const [editingActivity, setEditingActivity] = useState<LeanActivity | null>(
    null
  );

  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const dayActivities = activities.filter((a) => a.date === selectedDateStr);

  const getDayStats = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayActs = activities.filter((a) => a.date === dateStr);
    return {
      total: dayActs.reduce((sum, a) => sum + a.duration_minutes, 0),
      hasWaste: dayActs.some((a) => a.type === 'waste'),
    };
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Daily Activities</CardTitle>
          <Button size="sm" onClick={onAddClick}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Day Selector */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {weekDays.map((day) => {
            const isSelected = isSameDay(day, selectedDate);
            const stats = getDayStats(day);

            return (
              <button
                key={day.toISOString()}
                onClick={() => onDateSelect(day)}
                className={`shrink-0 px-4 py-2 rounded-lg text-center transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <div className="text-xs font-medium">{format(day, 'EEE')}</div>
                <div className="text-lg font-bold">{format(day, 'd')}</div>
                {stats.total > 0 && (
                  <div
                    className={`text-xs ${
                      isSelected ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {formatMinutes(stats.total)}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Activities List */}
        <div className="space-y-2">
          {dayActivities.length === 0 ? (
            <p className="text-slate-500 text-center py-8">
              No activities logged for {format(selectedDate, 'EEEE, MMM d')}.
            </p>
          ) : (
            dayActivities.map((activity) => {
              const config = ACTIVITY_TYPES[activity.type];
              return (
                <button
                  key={activity.id}
                  onClick={() => setEditingActivity(activity)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-all text-left"
                >
                  {activity.start_time && (
                    <span className="text-sm text-slate-500 w-14">
                      {activity.start_time.slice(0, 5)}
                    </span>
                  )}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                    style={{ backgroundColor: `${config.color}20` }}
                  >
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">
                      {activity.name}
                    </p>
                    {activity.note && (
                      <p className="text-sm text-slate-500 truncate">
                        {activity.note}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p
                      className="text-sm font-medium"
                      style={{ color: config.color }}
                    >
                      {formatMinutes(activity.duration_minutes)}
                    </p>
                    <p className="text-xs text-slate-500">{config.label}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </CardContent>

      {/* Edit Dialog */}
      {editingActivity && (
        <EditActivityDialog
          activity={editingActivity}
          isOpen={!!editingActivity}
          onClose={() => setEditingActivity(null)}
          onActivityUpdate={onActivityUpdate}
          onActivityDelete={onActivityDelete}
        />
      )}
    </Card>
  );
}
