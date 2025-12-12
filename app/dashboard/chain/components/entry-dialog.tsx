'use client';

import { useState, useEffect } from 'react';
import { useSession, useUser } from '@clerk/nextjs';
import { format } from 'date-fns';
import { Check, X, Minus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { createClerkSupabaseClient } from '@/lib/supabase/client';
import { upsertEntry, deleteEntry } from '@/lib/systems/chain/queries';
import type { ChainHabit, ChainEntry, ChainEntryStatus } from '@/types';

type EntryDialogProps = {
  habit: ChainHabit;
  date: Date;
  entry: ChainEntry | undefined;
  isOpen: boolean;
  onClose: () => void;
  onEntryUpdate: (entry: ChainEntry | null) => void;
  onEntryDelete: (date: string) => void;
};

export function EntryDialog({
  habit,
  date,
  entry,
  isOpen,
  onClose,
  onEntryUpdate,
  onEntryDelete,
}: EntryDialogProps) {
  const { user } = useUser();
  const { session } = useSession();
  const [status, setStatus] = useState<ChainEntryStatus | null>(
    entry?.status ?? null
  );
  const [memo, setMemo] = useState(entry?.memo ?? '');
  const [saving, setSaving] = useState(false);

  const dateStr = format(date, 'yyyy-MM-dd');
  const displayDate = format(date, 'EEEE, MMMM d, yyyy');

  // Reset form when entry/date changes
  useEffect(() => {
    setStatus(entry?.status ?? null);
    setMemo(entry?.memo ?? '');
  }, [entry, date]);

  const handleSave = async () => {
    if (!user || !session || !status) return;

    setSaving(true);
    try {
      const client = createClerkSupabaseClient(session);
      const updatedEntry = await upsertEntry(client, user.id, {
        habit_id: habit.id,
        date: dateStr,
        status,
        memo: memo.trim() || null,
      });
      onEntryUpdate(updatedEntry);
      onClose();
    } catch (error) {
      console.error('Failed to save entry:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!session || !entry) return;

    try {
      const client = createClerkSupabaseClient(session);
      await deleteEntry(client, entry.id);
      onEntryDelete(dateStr);
      onClose();
    } catch (error) {
      console.error('Failed to delete entry:', error);
    }
  };

  const statusOptions: {
    value: ChainEntryStatus;
    label: string;
    icon: React.ReactNode;
    color: string;
    description: string;
  }[] = [
    {
      value: 'success',
      label: 'Success',
      icon: <Check className="h-5 w-5" />,
      color: habit.color,
      description: 'I completed the habit today',
    },
    {
      value: 'fail',
      label: 'Fail',
      icon: <X className="h-5 w-5" />,
      color: '#EF4444',
      description: "I didn't complete it (breaks streak)",
    },
    {
      value: 'skip',
      label: 'Skip',
      icon: <Minus className="h-5 w-5" />,
      color: '#9CA3AF',
      description: "Couldn't do it today (doesn't break streak)",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
              style={{ backgroundColor: `${habit.color}20` }}
            >
              {habit.icon}
            </span>
            {habit.name}
          </DialogTitle>
          <p className="text-sm text-slate-500">{displayDate}</p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Status Selection */}
          <div className="space-y-2">
            <Label>How did it go?</Label>
            <div className="grid grid-cols-3 gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStatus(option.value)}
                  className={`
                    p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1
                    ${
                      status === option.value
                        ? 'border-current'
                        : 'border-slate-200 hover:border-slate-300'
                    }
                  `}
                  style={{
                    borderColor:
                      status === option.value ? option.color : undefined,
                    backgroundColor:
                      status === option.value ? `${option.color}10` : undefined,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: option.color }}
                  >
                    {option.icon}
                  </div>
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description of selected status */}
          {status && (
            <p className="text-sm text-slate-500 bg-slate-50 p-2 rounded-md">
              {statusOptions.find((o) => o.value === status)?.description}
            </p>
          )}

          {/* Memo */}
          {(status === 'fail' || status === 'skip') && (
            <div className="space-y-2">
              <Label>
                {status === 'fail' ? 'What happened?' : 'Reason for skipping'}
                {status === 'skip' && (
                  <span className="text-slate-400"> *</span>
                )}
              </Label>
              <Textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder={
                  status === 'fail'
                    ? "Optional: Why didn't you complete it?"
                    : 'e.g., Sick, traveling, family emergency...'
                }
                className="min-h-20"
              />
            </div>
          )}

          {/* Optional memo for success */}
          {status === 'success' && (
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="Any notes about today's progress?"
                className="min-h-[60px]"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            {entry ? (
              <Button
                variant="ghost"
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={
                  !status || saving || (status === 'skip' && !memo.trim())
                }
                style={{
                  backgroundColor: status
                    ? statusOptions.find((o) => o.value === status)?.color
                    : undefined,
                }}
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
