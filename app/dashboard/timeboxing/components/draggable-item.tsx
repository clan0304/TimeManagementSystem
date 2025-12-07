'use client';

import { useDraggable } from '@dnd-kit/core';
import { GripVertical } from 'lucide-react';
import type { TimeboxingItem } from '@/types';

type DraggableItemProps = {
  item: TimeboxingItem;
};

export function DraggableItem({ item }: DraggableItemProps) {
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
      className={`flex items-center gap-2 flex-1 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <button
        {...listeners}
        {...attributes}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-100 rounded"
      >
        <GripVertical className="h-4 w-4 text-slate-400" />
      </button>
      <span className="text-sm text-slate-700">{item.content}</span>
    </div>
  );
}
