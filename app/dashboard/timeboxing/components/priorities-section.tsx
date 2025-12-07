'use client';

import { useDroppable } from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TimeboxingItem } from '@/types';
import { DraggableItem } from './draggable-item';

type PrioritiesSectionProps = {
  items: TimeboxingItem[];
};

export function PrioritiesSection({ items }: PrioritiesSectionProps) {
  const prioritySlots = [1, 2, 3].map((order) => {
    const item = items.find((i) => i.priority_order === order);
    return { order, item };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Top Priorities</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {prioritySlots.map(({ order, item }) => (
          <DroppablePrioritySlot key={order} order={order} item={item} />
        ))}
      </CardContent>
    </Card>
  );
}

type DroppablePrioritySlotProps = {
  order: number;
  item: TimeboxingItem | undefined;
};

function DroppablePrioritySlot({ order, item }: DroppablePrioritySlotProps) {
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
