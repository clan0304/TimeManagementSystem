'use client';

import { useDroppable } from '@dnd-kit/core';
import type { TimeboxingItem } from '@/types';
import { DraggableItem } from './draggable-item';

type DroppablePrioritySlotProps = {
  order: number;
  item: TimeboxingItem | undefined;
};

export function DroppablePrioritySlot({
  order,
  item,
}: DroppablePrioritySlotProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `priority-slot-${order}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex items-center gap-2 p-2 border-2 border-dashed rounded-md min-h-11 transition-colors ${
        isOver ? 'border-blue-500 bg-blue-50' : 'border-slate-200'
      }`}
    >
      <span className="text-sm font-medium text-slate-400 w-6">{order}.</span>
      {item ? (
        <DraggableItem item={item} />
      ) : (
        <span className="text-sm text-slate-400">Drag item here</span>
      )}
    </div>
  );
}
