'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@clerk/nextjs';
import { Trash2 } from 'lucide-react';
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
import { updateHabit, deleteHabit } from '@/lib/systems/chain/queries';
import { HABIT_COLORS, HABIT_ICONS } from '@/lib/systems/chain/constants';
import type { ChainHabit } from '@/types';

type EditHabitDialogProps = {
  habit: ChainHabit;
  isOpen: boolean;
  onClose: () => void;
  onHabitUpdate: (habit: ChainHabit) => void;
  onHabitDelete: (habitId: string) => void;
};

export function EditHabitDialog({
  habit,
  isOpen,
  onClose,
  onHabitUpdate,
  onHabitDelete,
}: EditHabitDialogProps) {
  const { session } = useSession();
  const [name, setName] = useState(habit.name);
  const [description, setDescription] = useState(habit.description || '');
  const [successCriteria, setSuccessCriteria] = useState(
    habit.success_criteria || ''
  );
  const [color, setColor] = useState(habit.color);
  const [icon, setIcon] = useState(habit.icon);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Reset form when habit changes
  useEffect(() => {
    setName(habit.name);
    setDescription(habit.description || '');
    setSuccessCriteria(habit.success_criteria || '');
    setColor(habit.color);
    setIcon(habit.icon);
    setConfirmDelete(false);
  }, [habit]);

  const handleSubmit = async () => {
    if (!session || !name.trim()) return;

    setSaving(true);
    try {
      const client = createClerkSupabaseClient(session);
      const updatedHabit = await updateHabit(client, habit.id, {
        name: name.trim(),
        description: description.trim() || null,
        success_criteria: successCriteria.trim() || null,
        color,
        icon,
      });
      onHabitUpdate(updatedHabit);
      onClose();
    } catch (error) {
      console.error('Failed to update habit:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!session) return;

    try {
      const client = createClerkSupabaseClient(session);
      await deleteHabit(client, habit.id);
      onHabitDelete(habit.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete habit:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Habit</DialogTitle>
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

          {/* Delete Section */}
          <div className="pt-4 border-t">
            {confirmDelete ? (
              <div className="flex items-center justify-between bg-red-50 p-3 rounded-md">
                <span className="text-sm text-red-700">
                  Delete this habit and all data?
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
                Delete Habit
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
              style={{ backgroundColor: color }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
