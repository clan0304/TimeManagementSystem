'use client';

import { useEffect, useState } from 'react';
import { useSession, useUser } from '@clerk/nextjs';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createClerkSupabaseClient } from '@/lib/supabase/client';
import {
  createBlock,
  updateBlock,
  deleteBlock,
} from '@/lib/systems/timeboxing/queries';
import {
  BLOCK_COLORS,
  DEFAULT_BLOCK_COLOR,
  TIME_OPTIONS,
} from '@/lib/systems/timeboxing/constants';
import type { TimeboxingBlock, TimeboxingItem } from '@/types';

type AddBlockDialogProps = {
  open: boolean;
  onClose: () => void;
  date: string;
  dumpItems: TimeboxingItem[];
  editingBlock: TimeboxingBlock | null;
  onUpdate: () => void;
};

export function AddBlockDialog({
  open,
  onClose,
  date,
  dumpItems,
  editingBlock,
  onUpdate,
}: AddBlockDialogProps) {
  const { user } = useUser();
  const { session } = useSession();
  const [task, setTask] = useState('');
  const [startTime, setStartTime] = useState('09:00:00');
  const [endTime, setEndTime] = useState('10:00:00');
  const [color, setColor] = useState(DEFAULT_BLOCK_COLOR);
  const [loading, setLoading] = useState(false);

  const isEditing = !!editingBlock;

  useEffect(() => {
    if (editingBlock) {
      setTask(editingBlock.task);
      setStartTime(editingBlock.start_time);
      setEndTime(editingBlock.end_time);
      setColor(editingBlock.color);
    } else {
      setTask('');
      setStartTime('09:00:00');
      setEndTime('10:00:00');
      setColor(DEFAULT_BLOCK_COLOR);
    }
  }, [editingBlock, open]);

  const handleSubmit = async () => {
    if (!user || !session || !task.trim()) return;

    setLoading(true);
    try {
      const client = createClerkSupabaseClient(session);

      if (isEditing) {
        await updateBlock(client, editingBlock.id, {
          task: task.trim(),
          start_time: startTime,
          end_time: endTime,
          color,
        });
      } else {
        await createBlock(client, user.id, {
          date,
          task: task.trim(),
          start_time: startTime,
          end_time: endTime,
          color,
        });
      }

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Failed to save block:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!session || !editingBlock) return;

    setLoading(true);
    try {
      const client = createClerkSupabaseClient(session);
      await deleteBlock(client, editingBlock.id);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Failed to delete block:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Block' : 'Add Block'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Task */}
          <div className="space-y-2">
            <Label htmlFor="task">Task</Label>
            {dumpItems.length > 0 ? (
              <Select value={task} onValueChange={setTask}>
                <SelectTrigger>
                  <SelectValue placeholder="Select or type a task" />
                </SelectTrigger>
                <SelectContent>
                  {dumpItems.map((item) => (
                    <SelectItem key={item.id} value={item.content}>
                      {item.content}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
            <Input
              id="task"
              placeholder="Or type a new task..."
              value={task}
              onChange={(e) => setTask(e.target.value)}
            />
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {BLOCK_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === c.value
                      ? 'border-slate-900 scale-110'
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          {isEditing ? (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
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
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : isEditing ? 'Update' : 'Add'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
