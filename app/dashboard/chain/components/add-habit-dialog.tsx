'use client';

import { useState } from 'react';
import { useSession, useUser } from '@clerk/nextjs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { createClerkSupabaseClient } from '@/lib/supabase/client';
import { createHabit } from '@/lib/systems/chain/queries';
import { HABIT_COLORS, HABIT_ICONS } from '@/lib/systems/chain/constants';
import type { ChainHabit } from '@/types';

type AddHabitDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onHabitCreate: (habit: ChainHabit) => void;
};

export function AddHabitDialog({
  isOpen,
  onClose,
  onHabitCreate,
}: AddHabitDialogProps) {
  const { user } = useUser();
  const { session } = useSession();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [successCriteria, setSuccessCriteria] = useState('');
  const [color, setColor] = useState(HABIT_COLORS[0].value);
  const [icon, setIcon] = useState(HABIT_ICONS[0]);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!user || !session || !name.trim()) return;

    setSaving(true);
    try {
      const client = createClerkSupabaseClient(session);
      const newHabit = await createHabit(client, user.id, {
        name: name.trim(),
        description: description.trim() || null,
        success_criteria: successCriteria.trim() || null,
        color,
        icon,
      });
      onHabitCreate(newHabit);
      handleClose();
    } catch (error) {
      console.error('Failed to create habit:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setSuccessCriteria('');
    setColor(HABIT_COLORS[0].value);
    setIcon(HABIT_ICONS[0]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Habit</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Name */}
          <div className="space-y-2">
            <Label>Habit Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Write for 10 minutes"
            />
          </div>

          {/* Success Criteria */}
          <div className="space-y-2">
            <Label>Success Criteria</Label>
            <Input
              value={successCriteria}
              onChange={(e) => setSuccessCriteria(e.target.value)}
              placeholder="e.g., Write at least 100 words"
            />
            <p className="text-xs text-slate-500">
              Define what &quot;done&quot; means for this habit
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why is this habit important to you?"
              className="min-h-[60px]"
            />
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="flex flex-wrap gap-2">
              {HABIT_ICONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg border-2 transition-all ${
                    icon === i
                      ? 'border-slate-900 bg-slate-100'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {HABIT_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    color === c.value
                      ? 'ring-2 ring-offset-2 ring-slate-900'
                      : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!name.trim() || saving}
              style={{ backgroundColor: color }}
            >
              {saving ? 'Creating...' : 'Create Habit'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
