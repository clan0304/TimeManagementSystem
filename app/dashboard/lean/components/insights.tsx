'use client';

import { useMemo } from 'react';
import {
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  Clock,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatMinutes, getWastePatterns } from '@/lib/systems/lean/queries';
import type { LeanActivity, LeanWeeklyStats } from '@/types';

type InsightType = 'warning' | 'pattern' | 'tip' | 'success';

type Insight = {
  type: InsightType;
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: string;
};

type InsightsProps = {
  activities: LeanActivity[];
  stats: LeanWeeklyStats;
  previousStats?: LeanWeeklyStats | null;
};

const INSIGHT_STYLES: Record<
  InsightType,
  { bg: string; border: string; iconColor: string }
> = {
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconColor: 'text-amber-500',
  },
  pattern: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconColor: 'text-blue-500',
  },
  tip: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    iconColor: 'text-purple-500',
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    iconColor: 'text-green-500',
  },
};

export function Insights({ activities, stats, previousStats }: InsightsProps) {
  const insights = useMemo(() => {
    const result: Insight[] = [];
    const wastePatterns = getWastePatterns(activities);

    // 1. No data insight
    if (stats.totalMinutes === 0) {
      result.push({
        type: 'tip',
        icon: <Lightbulb className="h-5 w-5" />,
        title: 'Start logging your activities',
        description:
          'Track your time to discover where it goes and find opportunities to improve.',
      });
      return result;
    }

    // 2. High waste percentage (>20%)
    if (stats.wastePercentage > 20) {
      result.push({
        type: 'warning',
        icon: <AlertTriangle className="h-5 w-5" />,
        title: `${stats.wastePercentage}% of your time is waste`,
        description: `That's ${formatMinutes(
          stats.wasteMinutes
        )} this week. Industry benchmark is under 15%.`,
        action: 'Focus on eliminating your top waste activities.',
      });
    }

    // 3. Recurring waste pattern
    const topWaste = wastePatterns[0];
    if (topWaste && topWaste.occurrences >= 3) {
      result.push({
        type: 'pattern',
        icon: <RefreshCw className="h-5 w-5" />,
        title: `"${topWaste.name}" is recurring`,
        description: `Appeared ${
          topWaste.occurrences
        }x this week, costing ${formatMinutes(topWaste.totalMinutes)}.`,
        action: 'Consider batching, automating, or eliminating this activity.',
      });
    }

    // 4. Best productive time
    const activitiesWithTime = activities.filter((a) => a.start_time);
    if (activitiesWithTime.length >= 5) {
      const morningValue = activitiesWithTime
        .filter((a) => a.type === 'value' && a.start_time! < '12:00')
        .reduce((sum, a) => sum + a.duration_minutes, 0);

      const afternoonValue = activitiesWithTime
        .filter((a) => a.type === 'value' && a.start_time! >= '12:00')
        .reduce((sum, a) => sum + a.duration_minutes, 0);

      if (morningValue > afternoonValue * 1.5 && morningValue > 0) {
        result.push({
          type: 'tip',
          icon: <Clock className="h-5 w-5" />,
          title: 'Morning is your power time',
          description: `${Math.round(
            (morningValue / (morningValue + afternoonValue)) * 100
          )}% of value work happens before noon.`,
          action: 'Protect morning hours for your most important work.',
        });
      } else if (afternoonValue > morningValue * 1.5 && afternoonValue > 0) {
        result.push({
          type: 'tip',
          icon: <Clock className="h-5 w-5" />,
          title: 'Afternoon is your power time',
          description: `${Math.round(
            (afternoonValue / (morningValue + afternoonValue)) * 100
          )}% of value work happens after noon.`,
          action: 'Schedule important tasks in the afternoon.',
        });
      }
    }

    // 5. Improvement from last week
    if (previousStats && previousStats.wasteMinutes > stats.wasteMinutes) {
      const improvement = previousStats.wasteMinutes - stats.wasteMinutes;
      result.push({
        type: 'success',
        icon: <TrendingUp className="h-5 w-5" />,
        title: "You're improving!",
        description: `Waste decreased by ${formatMinutes(
          improvement
        )} compared to last week.`,
      });
    }

    // 6. Good value ratio
    if (stats.valuePercentage >= 60) {
      result.push({
        type: 'success',
        icon: <CheckCircle className="h-5 w-5" />,
        title: 'Excellent value ratio',
        description: `${stats.valuePercentage}% of your time produces direct value. Keep it up!`,
      });
    }

    // 7. Potential savings
    if (wastePatterns.length > 0) {
      const totalWasteSavings = wastePatterns.reduce(
        (sum, p) => sum + p.totalMinutes,
        0
      );
      if (
        totalWasteSavings >= 60 &&
        !result.some((r) => r.type === 'warning')
      ) {
        result.push({
          type: 'tip',
          icon: <Lightbulb className="h-5 w-5" />,
          title: `Potential savings: ${formatMinutes(totalWasteSavings)}/week`,
          description: `Eliminating your top ${Math.min(
            3,
            wastePatterns.length
          )} waste activities could free up significant time.`,
          action:
            'Mark these activities for elimination and track your progress.',
        });
      }
    }

    return result.slice(0, 4);
  }, [activities, stats, previousStats]);

  if (insights.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((insight, index) => {
            const style = INSIGHT_STYLES[insight.type];
            return (
              <div
                key={index}
                className={`p-4 rounded-lg border ${style.bg} ${style.border}`}
              >
                <div className="flex gap-3">
                  <div className={style.iconColor}>{insight.icon}</div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">
                      {insight.title}
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      {insight.description}
                    </p>
                    {insight.action && (
                      <p className="text-sm text-slate-500 mt-2">
                        → {insight.action}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
