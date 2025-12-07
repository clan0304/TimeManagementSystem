'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession, useUser } from '@clerk/nextjs';
import { format } from 'date-fns';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { createClerkSupabaseClient } from '@/lib/supabase/client';
import {
  getItemsByDate,
  getBlocksByDate,
  updateItem,
} from '@/lib/systems/timeboxing/queries';
import type { TimeboxingItem, TimeboxingBlock } from '@/types';
import { DatePicker } from './components/date-picker';
import { ItemDumpSection } from './components/item-dump-section';
import { PrioritiesSection } from './components/priorities-section';
import { CalendarSection } from './components/calendar-section';
import { DragOverlayWrapper } from './components/drag-overlay-wrapper';

export default function TimeboxingPage() {
  const { user } = useUser();
  const { session } = useSession();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [items, setItems] = useState<TimeboxingItem[]>([]);
  const [blocks, setBlocks] = useState<TimeboxingBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  const dateString = format(selectedDate, 'yyyy-MM-dd');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const fetchData = useCallback(async () => {
    if (!user || !session) return;

    setLoading(true);
    try {
      const client = createClerkSupabaseClient(session);
      const [itemsData, blocksData] = await Promise.all([
        getItemsByDate(client, user.id, dateString),
        getBlocksByDate(client, user.id, dateString),
      ]);
      setItems(itemsData);
      setBlocks(blocksData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, session, dateString]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const dumpItems = items.filter((item) => item.type === 'dump');
  const priorityItems = items
    .filter((item) => item.type === 'priority')
    .sort((a, b) => (a.priority_order ?? 0) - (b.priority_order ?? 0));

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || !user || !session) return;

    const activeItem = items.find((i) => i.id === active.id);
    if (!activeItem) return;

    const client = createClerkSupabaseClient(session);

    // Dropped on a priority slot
    if (over.id.toString().startsWith('priority-slot-')) {
      const newOrder = parseInt(
        over.id.toString().replace('priority-slot-', '')
      );

      // Check if slot is already occupied
      const existingItem = priorityItems.find(
        (i) => i.priority_order === newOrder
      );

      if (existingItem && existingItem.id !== activeItem.id) {
        // Move existing item back to dump
        await updateItem(client, existingItem.id, {
          type: 'dump',
          priority_order: null,
        });
      }

      // Update dragged item to priority
      await updateItem(client, activeItem.id, {
        type: 'priority',
        priority_order: newOrder,
      });

      fetchData();
    }

    // Dropped on dump area
    if (over.id === 'dump-area' && activeItem.type === 'priority') {
      await updateItem(client, activeItem.id, {
        type: 'dump',
        priority_order: null,
      });
      fetchData();
    }
  };

  const activeItem = activeId ? items.find((i) => i.id === activeId) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Daily Timeboxing
            </h1>
            <p className="text-slate-600 mt-1">
              Plan your day with time blocks
            </p>
          </div>
          <DatePicker date={selectedDate} onDateChange={setSelectedDate} />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Priorities + Item Dump */}
          <div className="space-y-6">
            <PrioritiesSection items={priorityItems} />
            <ItemDumpSection
              items={dumpItems}
              date={dateString}
              onUpdate={fetchData}
            />
          </div>

          {/* Right Column: Calendar */}
          <div className="lg:col-span-2">
            <CalendarSection
              blocks={blocks}
              dumpItems={[...dumpItems, ...priorityItems]}
              date={dateString}
              onUpdate={fetchData}
            />
          </div>
        </div>
      </div>

      <DragOverlayWrapper>
        {activeItem ? (
          <div className="p-2 bg-white border border-slate-200 rounded-md shadow-lg">
            <span className="text-sm text-slate-700">{activeItem.content}</span>
          </div>
        ) : null}
      </DragOverlayWrapper>
    </DndContext>
  );
}
