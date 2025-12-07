'use client';

import { useState, useEffect } from 'react';
import { useSession, useUser } from '@clerk/nextjs';
import {
  ThumbsUp,
  ThumbsDown,
  Target,
  FileText,
  Save,
  Pencil,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { createClerkSupabaseClient } from '@/lib/supabase/client';
import { upsertDay, updateDay } from '@/lib/systems/sixblock/queries';
import type { SixBlockDay } from '@/types';

type DailyReflectionProps = {
  day: SixBlockDay | null;
  date: string;
  onDayUpdate: (day: SixBlockDay) => void;
};

export function DailyReflection({
  day,
  date,
  onDayUpdate,
}: DailyReflectionProps) {
  const { user } = useUser();
  const { session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [dailyMemo, setDailyMemo] = useState('');
  const [goodThings, setGoodThings] = useState('');
  const [badThings, setBadThings] = useState('');
  const [nextGoals, setNextGoals] = useState('');
  const [saving, setSaving] = useState(false);

  // Check if any content exists
  const hasContent =
    day?.daily_memo || day?.good_things || day?.bad_things || day?.next_goals;

  // Reset form when day changes
  useEffect(() => {
    if (day) {
      setDailyMemo(day.daily_memo || '');
      setGoodThings(day.good_things || '');
      setBadThings(day.bad_things || '');
      setNextGoals(day.next_goals || '');
    } else {
      setDailyMemo('');
      setGoodThings('');
      setBadThings('');
      setNextGoals('');
    }
    setIsEditing(false);
  }, [day, date]);

  const handleSave = async () => {
    if (!user || !session) return;

    setSaving(true);
    try {
      const client = createClerkSupabaseClient(session);

      let updatedDay: SixBlockDay;

      if (day) {
        updatedDay = await updateDay(client, day.id, {
          daily_memo: dailyMemo.trim() || null,
          good_things: goodThings.trim() || null,
          bad_things: badThings.trim() || null,
          next_goals: nextGoals.trim() || null,
        });
      } else {
        updatedDay = await upsertDay(client, user.id, {
          date,
          daily_memo: dailyMemo.trim() || null,
          good_things: goodThings.trim() || null,
          bad_things: badThings.trim() || null,
          next_goals: nextGoals.trim() || null,
        });
      }

      onDayUpdate(updatedDay);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save reflection:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDailyMemo(day?.daily_memo || '');
    setGoodThings(day?.good_things || '');
    setBadThings(day?.bad_things || '');
    setNextGoals(day?.next_goals || '');
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  // Empty state
  if (!hasContent && !isEditing) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-4">
              No daily reflection yet. How was your day?
            </p>
            <Button onClick={handleEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Add Reflection
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // View mode
  if (!isEditing) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Daily Reflection
          </CardTitle>
          <Button size="sm" variant="outline" onClick={handleEdit}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {day?.daily_memo && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Today&apos;s Memo
              </p>
              <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-md whitespace-pre-wrap">
                {day.daily_memo}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {day?.good_things && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-green-600 uppercase tracking-wide flex items-center gap-1">
                  <ThumbsUp className="h-3 w-3" />
                  Good Things
                </p>
                <p className="text-sm text-slate-700 bg-green-50 p-3 rounded-md whitespace-pre-wrap">
                  {day.good_things}
                </p>
              </div>
            )}

            {day?.bad_things && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-red-600 uppercase tracking-wide flex items-center gap-1">
                  <ThumbsDown className="h-3 w-3" />
                  Bad Things
                </p>
                <p className="text-sm text-slate-700 bg-red-50 p-3 rounded-md whitespace-pre-wrap">
                  {day.bad_things}
                </p>
              </div>
            )}
          </div>

          {day?.next_goals && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wide flex items-center gap-1">
                <Target className="h-3 w-3" />
                Next / Goals
              </p>
              <p className="text-sm text-slate-700 bg-blue-50 p-3 rounded-md whitespace-pre-wrap">
                {day.next_goals}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Edit mode
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Daily Reflection
        </CardTitle>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={handleCancel}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-1" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-slate-600">
            <FileText className="h-4 w-4" />
            Today&apos;s Memo
          </Label>
          <Textarea
            value={dailyMemo}
            onChange={(e) => setDailyMemo(e.target.value)}
            placeholder="General notes about your day..."
            className="min-h-20"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-green-600">
              <ThumbsUp className="h-4 w-4" />
              Good Things
            </Label>
            <Textarea
              value={goodThings}
              onChange={(e) => setGoodThings(e.target.value)}
              placeholder="What went well today..."
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-red-600">
              <ThumbsDown className="h-4 w-4" />
              Bad Things
            </Label>
            <Textarea
              value={badThings}
              onChange={(e) => setBadThings(e.target.value)}
              placeholder="What didn't go well..."
              className="min-h-[100px]"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-blue-600">
            <Target className="h-4 w-4" />
            Next / Goals
          </Label>
          <Textarea
            value={nextGoals}
            onChange={(e) => setNextGoals(e.target.value)}
            placeholder="What to focus on tomorrow..."
            className="min-h-20"
          />
        </div>
      </CardContent>
    </Card>
  );
}
