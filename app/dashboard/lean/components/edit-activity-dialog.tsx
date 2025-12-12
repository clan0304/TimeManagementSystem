'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@clerk/nextjs';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createClerkSupabaseClient } from '@/lib/supabase/client';
import { updateActivity, deleteActivity } from '@/lib/systems/lean/queries';
import { ACTIVITY_TYPES, DURATION_PRESETS } from '@/lib/systems/lean/constants';
import type { LeanActivity, LeanActivityType } from '@/types';

type EditActivityDialogProps = {
  activity: LeanActivity;
  isOpen: boolean;
  onClose: () => void;
  onActivityUpdate: (activity: LeanActivity) => void;
  onActivityDelete: (activityId: string) => void;
};

export function EditActivityDialog({
  activity,
  isOpen,
  onClose,
  onActivityUpdate,
  onActivityDelete,
}: EditActivityDialogProps) {
  const { session } = useSession();
  const [name, setName] = useState(activity.name);
  const [type, setType] = useState<LeanActivityType>(activity.type);
  const [durationMinutes, setDurationMinutes] = useState(
    activity.duration_minutes
  );
  const [startTime, setStartTime] = useState(activity.start_time || '');
  const [note, setNote] = useState(activity.note || '');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setName(activity.name);
    setType(activity.type);
    setDurationMinutes(activity.duration_minutes);
    setStartTime(activity.start_time || '');
    setNote(activity.note || '');
    setConfirmDelete(false);
  }, [activity]);

  const handleSubmit = async () => {
    if (!session || !name.trim()) return;

    setSaving(true);
    try {
      const client = createClerkSupabaseClient(session);
      const updatedActivity = await updateActivity(client, activity.id, {
        name: name.trim(),
        type,
        duration_minutes: durationMinutes,
        start_time: startTime || null,
        note: note.trim() || null,
      });
      onActivityUpdate(updatedActivity);
      onClose();
    } catch (error) {
      console.error('Failed to update activity:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!session) return;

    try {
      const client = createClerkSupabaseClient(session);
      await deleteActivity(client, activity.id);
      onActivityDelete(activity.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete activity:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Activity</DialogTitle>
          <p className="text-sm text-slate-500">
            {format(new Date(activity.date), 'EEEE, MMMM d, yyyy')}
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Activity Name */}
          <div className="space-y-2">
            <Label>Activity *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What did you work on?"
            />
          </div>

          {/* Type Selection */}
          <div className="space-y-2">
            <Label>Category *</Label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(ACTIVITY_TYPES) as LeanActivityType[]).map((t) => {
                const config = ACTIVITY_TYPES[t];
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                      type === t
                        ? 'border-current'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    style={{
                      borderColor: type === t ? config.color : undefined,
                      backgroundColor:
                        type === t ? `${config.color}10` : undefined,
                    }}
                  >
                    <span className="text-xl">{config.icon}</span>
                    <span className="text-sm font-medium">{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label>Duration *</Label>
            <div className="flex flex-wrap gap-2">
              {DURATION_PRESETS.map((preset) => (
                <button
                  key={preset.minutes}
                  type="button"
                  onClick={() => setDurationMinutes(preset.minutes)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    durationMinutes === preset.minutes
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                min={1}
                max={480}
                className="w-20"
              />
              <span className="text-sm text-slate-500">minutes</span>
            </div>
          </div>

          {/* Start Time (Optional) */}
          <div className="space-y-2">
            <Label>Start Time (optional)</Label>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>

          {/* Note (Optional) */}
          <div className="space-y-2">
            <Label>Note (optional)</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any additional details..."
              className="min-h-[60px]"
            />
          </div>

          {/* Delete Section */}
          <div className="pt-4 border-t">
            {confirmDelete ? (
              <div className="flex items-center justify-between bg-red-50 p-3 rounded-md">
                <span className="text-sm text-red-700">
                  Delete this activity?
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setConfirmDelete(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleDelete}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="ghost"
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Activity
              </Button>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!name.trim() || saving}
              style={{ backgroundColor: ACTIVITY_TYPES[type].color }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
