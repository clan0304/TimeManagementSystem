'use client';

import { useState } from 'react';
import { useSession, useUser } from '@clerk/nextjs';
import { useDroppable } from '@dnd-kit/core';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClerkSupabaseClient } from '@/lib/supabase/client';
import { createItem, deleteItem } from '@/lib/systems/timeboxing/queries';
import type { TimeboxingItem } from '@/types';

type ItemDumpSectionProps = {
  items: TimeboxingItem[];
  date: string;
  onUpdate: () => void;
};

export function ItemDumpSection({
  items,
  date,
  onUpdate,
}: ItemDumpSectionProps) {
  const { user } = useUser();
  const { session } = useSession();
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(false);

  const { setNodeRef, isOver } = useDroppable({
    id: 'dump-area',
  });

  const handleAddItem = async () => {
    if (!user || !session || !newItem.trim()) return;

    setLoading(true);
    try {
      const client = createClerkSupabaseClient(session);
      await createItem(client, user.id, {
        date,
        content: newItem.trim(),
        type: 'dump',
      });
      setNewItem('');
      onUpdate();
    } catch (error) {
      console.error('Failed to add item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!session) return;

    try {
      const client = createClerkSupabaseClient(session);
      await deleteItem(client, itemId);
      onUpdate();
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddItem();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Item Dump</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Add new item */}
        <div className="flex gap-2">
          <Input
            placeholder="Add a task..."
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <Button size="icon" onClick={handleAddItem} disabled={loading}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Items list */}
        <div
          ref={setNodeRef}
          className={`space-y-2 min-h-[100px] p-2 rounded-md transition-colors ${
            isOver ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''
          }`}
        >
          {items.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">
              No items yet. Add your tasks above.
            </p>
          ) : (
            items.map((item) => (
              <DraggableDumpItem
                key={item.id}
                item={item}
                onDelete={() => handleDeleteItem(item.id)}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

type DraggableDumpItemProps = {
  item: TimeboxingItem;
  onDelete: () => void;
};

function DraggableDumpItem({ item, onDelete }: DraggableDumpItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: item.id,
    });

  const style = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-2 bg-slate-50 rounded-md group ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center gap-2">
        <button
          {...listeners}
          {...attributes}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-200 rounded"
        >
          <GripVertical className="h-4 w-4 text-slate-400" />
        </button>
        <span className="text-sm text-slate-700">{item.content}</span>
      </div>
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-500" />
      </Button>
    </div>
  );
}
