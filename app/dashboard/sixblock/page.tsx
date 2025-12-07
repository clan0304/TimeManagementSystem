'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession, useUser } from '@clerk/nextjs';
import { format } from 'date-fns';
import { createClerkSupabaseClient } from '@/lib/supabase/client';
import {
  getDayByDate,
  getBlocksByDate,
  getChecklistItemsByDate,
} from '@/lib/systems/sixblock/queries';
import type {
  SixBlockDay,
  SixBlockBlock,
  SixBlockChecklistItem,
} from '@/types';
import { DatePicker } from './components/date-picker';
import { BlockCard } from './components/block-card';
import { AddBlockButton } from './components/add-block-button';
import { DailyReflection } from './components/daily-reflection';
import { MAX_BLOCKS } from '@/lib/systems/sixblock/constants';

export default function SixBlockPage() {
  const { user } = useUser();
  const { session } = useSession();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [day, setDay] = useState<SixBlockDay | null>(null);
  const [blocks, setBlocks] = useState<SixBlockBlock[]>([]);
  const [checklistItems, setChecklistItems] = useState<SixBlockChecklistItem[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  const dateString = format(selectedDate, 'yyyy-MM-dd');

  const fetchData = useCallback(async () => {
    if (!user || !session) return;

    setLoading(true);
    try {
      const client = createClerkSupabaseClient(session);

      const [dayData, blocksData] = await Promise.all([
        getDayByDate(client, user.id, dateString),
        getBlocksByDate(client, user.id, dateString),
      ]);

      setDay(dayData);
      setBlocks(blocksData);

      if (blocksData.length > 0) {
        const blockIds = blocksData.map((b) => b.id);
        const itemsData = await getChecklistItemsByDate(
          client,
          user.id,
          blockIds
        );
        setChecklistItems(itemsData);
      } else {
        setChecklistItems([]);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, session, dateString]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getChecklistForBlock = (blockId: string) => {
    return checklistItems.filter((item) => item.block_id === blockId);
  };

  const coreBlockCount = blocks.filter((b) => b.is_core).length;

  // Optimistic update handlers
  const handleBlockCreate = (newBlock: SixBlockBlock) => {
    setBlocks((prev) =>
      [...prev, newBlock].sort((a, b) => a.block_order - b.block_order)
    );
  };

  const handleBlockUpdate = (updatedBlock: SixBlockBlock) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === updatedBlock.id ? updatedBlock : b))
    );
  };

  const handleBlockDelete = (blockId: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
    setChecklistItems((prev) =>
      prev.filter((item) => item.block_id !== blockId)
    );
  };

  const handleChecklistItemCreate = (newItem: SixBlockChecklistItem) => {
    setChecklistItems((prev) => [...prev, newItem]);
  };

  const handleChecklistItemUpdate = (updatedItem: SixBlockChecklistItem) => {
    setChecklistItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
  };

  const handleChecklistItemDelete = (itemId: string) => {
    setChecklistItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleDayUpdate = (updatedDay: SixBlockDay) => {
    setDay(updatedDay);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">6 Block Planner</h1>
          <p className="text-slate-600 mt-1">
            Structure your day into 6 focused blocks
          </p>
        </div>
        <DatePicker date={selectedDate} onDateChange={setSelectedDate} />
      </div>

      {/* Blocks - Compact Single Column */}
      <div className="space-y-2">
        {blocks.map((block) => (
          <BlockCard
            key={block.id}
            block={block}
            checklistItems={getChecklistForBlock(block.id)}
            coreBlockCount={coreBlockCount}
            onBlockUpdate={handleBlockUpdate}
            onBlockDelete={handleBlockDelete}
            onChecklistItemCreate={handleChecklistItemCreate}
            onChecklistItemUpdate={handleChecklistItemUpdate}
            onChecklistItemDelete={handleChecklistItemDelete}
          />
        ))}

        {blocks.length < MAX_BLOCKS && (
          <AddBlockButton
            date={dateString}
            nextOrder={blocks.length + 1}
            onBlockCreate={handleBlockCreate}
          />
        )}
      </div>

      {/* Daily Reflection */}
      <DailyReflection
        day={day}
        date={dateString}
        onDayUpdate={handleDayUpdate}
      />
    </div>
  );
}
