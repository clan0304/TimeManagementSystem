'use client';

import { useState } from 'react';
import { useSession, useUser } from '@clerk/nextjs';
import { format } from 'date-fns';
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
import { createActivity } from '@/lib/systems/lean/queries';
import { ACTIVITY_TYPES, DURATION_PRESETS } from '@/lib/systems/lean/constants';
import type { LeanActivity, LeanActivityType } from '@/types';

type AddActivityDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onActivityCreate: (activity: LeanActivity) => void;
};

export function AddActivityDialog({
  isOpen,
  onClose,
  selectedDate,
  onActivityCreate,
}: AddActivityDialogProps) {
  const { user } = useUser();
  const { session } = useSession();
  const [name, setName] = useState('');
  const [type, setType] = useState<LeanActivityType>('value');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [startTime, setStartTime] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!user || !session || !name.trim()) return;

    setSaving(true);
    try {
      const client = createClerkSupabaseClient(session);
      const newActivity = await createActivity(client, user.id, {
        name: name.trim(),
        type,
        duration_minutes: durationMinutes,
        date: format(selectedDate, 'yyyy-MM-dd'),
        start_time: startTime || null,
        note: note.trim() || null,
      });
      onActivityCreate(newActivity);
      handleClose();
    } catch (error) {
      console.error('Failed to create activity:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setName('');
    setType('value');
    setDurationMinutes(30);
    setStartTime('');
    setNote('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Activity</DialogTitle>
          <p className="text-sm text-slate-500">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
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
            <p className="text-xs text-slate-500">
              {ACTIVITY_TYPES[type].description}
            </p>
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

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!name.trim() || saving}
              style={{ backgroundColor: ACTIVITY_TYPES[type].color }}
            >
              {saving ? 'Saving...' : 'Log Activity'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
