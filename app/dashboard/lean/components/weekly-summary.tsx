'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ACTIVITY_TYPES } from '@/lib/systems/lean/constants';
import { formatMinutes } from '@/lib/systems/lean/queries';
import type { LeanWeeklyStats, LeanActivityType } from '@/types';

type WeeklySummaryProps = {
  stats: LeanWeeklyStats;
};

export function WeeklySummary({ stats }: WeeklySummaryProps) {
  const categories: {
    type: LeanActivityType;
    minutes: number;
    percentage: number;
  }[] = [
    {
      type: 'value',
      minutes: stats.valueMinutes,
      percentage: stats.valuePercentage,
    },
    {
      type: 'support',
      minutes: stats.supportMinutes,
      percentage: stats.supportPercentage,
    },
    {
      type: 'waste',
      minutes: stats.wasteMinutes,
      percentage: stats.wastePercentage,
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Weekly Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center gap-8">
          {categories.map((cat) => {
            const config = ACTIVITY_TYPES[cat.type];
            return (
              <div key={cat.type} className="text-center">
                <div
                  className="w-24 h-24 rounded-xl flex flex-col items-center justify-center mb-2"
                  style={{ backgroundColor: `${config.color}15` }}
                >
                  <span
                    className="text-2xl font-bold"
                    style={{ color: config.color }}
                  >
                    {formatMinutes(cat.minutes)}
                  </span>
                  <span className="text-sm text-slate-500">
                    {cat.percentage}%
                  </span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <span>{config.icon}</span>
                  <span className="text-sm font-medium text-slate-700">
                    {config.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="mt-6 h-3 rounded-full bg-slate-100 overflow-hidden flex">
          {stats.totalMinutes > 0 && (
            <>
              <div
                className="h-full transition-all"
                style={{
                  width: `${stats.valuePercentage}%`,
                  backgroundColor: ACTIVITY_TYPES.value.color,
                }}
              />
              <div
                className="h-full transition-all"
                style={{
                  width: `${stats.supportPercentage}%`,
                  backgroundColor: ACTIVITY_TYPES.support.color,
                }}
              />
              <div
                className="h-full transition-all"
                style={{
                  width: `${stats.wastePercentage}%`,
                  backgroundColor: ACTIVITY_TYPES.waste.color,
                }}
              />
            </>
          )}
        </div>

        <p className="text-center text-sm text-slate-500 mt-4">
          Total tracked: {formatMinutes(stats.totalMinutes)}
        </p>
      </CardContent>
    </Card>
  );
}
