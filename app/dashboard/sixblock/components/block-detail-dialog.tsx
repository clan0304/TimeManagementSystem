'use client';

import { useState, useEffect } from 'react';
import { useSession, useUser } from '@clerk/nextjs';
import { Star, Clock, Trash2, Plus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
  updateBlock,
  deleteBlock,
  toggleCoreBlock,
  createChecklistItem,
  toggleChecklistItem,
  deleteChecklistItem,
} from '@/lib/systems/sixblock/queries';
import {
  TIME_OPTIONS,
  MAX_CORE_BLOCKS,
} from '@/lib/systems/sixblock/constants';
import type { SixBlockBlock, SixBlockChecklistItem } from '@/types';

type BlockDetailDialogProps = {
  block: SixBlockBlock;
  checklistItems: SixBlockChecklistItem[];
  coreBlockCount: number;
  isOpen: boolean;
  onClose: () => void;
  onBlockUpdate: (block: SixBlockBlock) => void;
  onBlockDelete: (blockId: string) => void;
  onChecklistItemCreate: (item: SixBlockChecklistItem) => void;
  onChecklistItemUpdate: (item: SixBlockChecklistItem) => void;
  onChecklistItemDelete: (itemId: string) => void;
};

export function BlockDetailDialog({
  block,
  checklistItems,
  coreBlockCount,
  isOpen,
  onClose,
  onBlockUpdate,
  onBlockDelete,
  onChecklistItemCreate,
  onChecklistItemUpdate,
  onChecklistItemDelete,
}: BlockDetailDialogProps) {
  const { user } = useUser();
  const { session } = useSession();
  const [title, setTitle] = useState(block.title);
  const [description, setDescription] = useState(block.description || '');
  const [startTime, setStartTime] = useState(block.start_time || '');
  const [endTime, setEndTime] = useState(block.end_time || '');
  const [newItem, setNewItem] = useState('');
  const [saving, setSaving] = useState(false);

  const canMarkCore = !block.is_core && coreBlockCount < MAX_CORE_BLOCKS;

  // Reset form when block changes
  useEffect(() => {
    setTitle(block.title);
    setDescription(block.description || '');
    setStartTime(block.start_time || '');
    setEndTime(block.end_time || '');
  }, [block]);

  const handleSave = async () => {
    if (!session) return;

    setSaving(true);
    try {
      const client = createClerkSupabaseClient(session);
      const updatedBlock = await updateBlock(client, block.id, {
        title: title.trim() || `Block ${block.block_order}`,
        description: description.trim() || null,
        start_time: startTime.trim() || null,
        end_time: endTime.trim() || null,
      });
      onBlockUpdate(updatedBlock);
      onClose();
    } catch (error) {
      console.error('Failed to update block:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!session) return;

    try {
      const client = createClerkSupabaseClient(session);
      await deleteBlock(client, block.id);
      onBlockDelete(block.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete block:', error);
    }
  };

  const handleToggleCore = async () => {
    if (!session) return;
    if (!block.is_core && !canMarkCore) return;

    try {
      const client = createClerkSupabaseClient(session);
      const updatedBlock = await toggleCoreBlock(
        client,
        block.id,
        !block.is_core
      );
      onBlockUpdate(updatedBlock);
    } catch (error) {
      console.error('Failed to toggle core:', error);
    }
  };

  const handleAddChecklistItem = async () => {
    if (!user || !session || !newItem.trim()) return;

    try {
      const client = createClerkSupabaseClient(session);
      const newChecklistItem = await createChecklistItem(client, user.id, {
        block_id: block.id,
        content: newItem.trim(),
        item_order: checklistItems.length + 1,
      });
      onChecklistItemCreate(newChecklistItem);
      setNewItem('');
    } catch (error) {
      console.error('Failed to add checklist item:', error);
    }
  };

  const handleToggleChecklistItem = async (item: SixBlockChecklistItem) => {
    if (!session) return;

    try {
      const client = createClerkSupabaseClient(session);
      const updatedItem = await toggleChecklistItem(
        client,
        item.id,
        !item.is_completed
      );
      onChecklistItemUpdate(updatedItem);
    } catch (error) {
      console.error('Failed to toggle checklist item:', error);
    }
  };

  const handleDeleteChecklistItem = async (itemId: string) => {
    if (!session) return;

    try {
      const client = createClerkSupabaseClient(session);
      await deleteChecklistItem(client, itemId);
      onChecklistItemDelete(itemId);
    } catch (error) {
      console.error('Failed to delete checklist item:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddChecklistItem();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                  block.is_core
                    ? 'bg-yellow-400 text-yellow-900'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {block.block_order}
              </div>
              <DialogTitle>Edit Block {block.block_order}</DialogTitle>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleToggleCore}
              disabled={!block.is_core && !canMarkCore}
              title={
                block.is_core ? 'Remove from core' : 'Mark as core (max 2)'
              }
            >
              <Star
                className={`h-5 w-5 ${
                  block.is_core
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-slate-300'
                }`}
              />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`Block ${block.block_order}`}
            />
          </div>

          {/* Time Range */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              Time Range (optional)
            </Label>
            <div className="flex items-center gap-2">
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Start time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">None</SelectItem>
                  {TIME_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-slate-400">-</span>
              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="End time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">None</SelectItem>
                  {TIME_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Memo / Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes for this block..."
              className="min-h-20"
            />
          </div>

          {/* Checklist */}
          <div className="space-y-2">
            <Label>Checklist</Label>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {checklistItems.length === 0 && (
                <p className="text-sm text-slate-400 italic py-2">
                  No checklist items yet
                </p>
              )}
              {checklistItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 group"
                >
                  <Checkbox
                    checked={item.is_completed}
                    onCheckedChange={() => handleToggleChecklistItem(item)}
                  />
                  <span
                    className={`flex-1 text-sm ${
                      item.is_completed
                        ? 'line-through text-slate-400'
                        : 'text-slate-700'
                    }`}
                  >
                    {item.content}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={() => handleDeleteChecklistItem(item.id)}
                  >
                    <X className="h-3 w-3 text-slate-400 hover:text-red-500" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Add Item */}
            <div className="flex gap-2 pt-2">
              <Input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add checklist item..."
                className="flex-1"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={handleAddChecklistItem}
                disabled={!newItem.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="ghost"
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Block
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
