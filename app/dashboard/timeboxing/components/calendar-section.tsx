'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HOURS } from '@/lib/systems/timeboxing/constants';
import type { TimeboxingBlock, TimeboxingItem } from '@/types';
import { TimeBlockCard } from './time-block-card';
import { AddBlockDialog } from './add-block-dialog';

type CalendarSectionProps = {
  blocks: TimeboxingBlock[];
  dumpItems: TimeboxingItem[];
  date: string;
  onUpdate: () => void;
};

export function CalendarSection({
  blocks,
  dumpItems,
  date,
  onUpdate,
}: CalendarSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<TimeboxingBlock | null>(
    null
  );

  const handleAddClick = () => {
    setEditingBlock(null);
    setDialogOpen(true);
  };

  const handleEditClick = (block: TimeboxingBlock) => {
    setEditingBlock(block);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingBlock(null);
  };

  const getBlocksForHour = (hour: number) => {
    return blocks.filter((block) => {
      const startHour = parseInt(block.start_time.split(':')[0]);
      return startHour === hour;
    });
  };

  const getBlockHeight = (block: TimeboxingBlock) => {
    const [startHour, startMin] = block.start_time.split(':').map(Number);
    const [endHour, endMin] = block.end_time.split(':').map(Number);
    const durationMinutes = endHour * 60 + endMin - (startHour * 60 + startMin);
    return (durationMinutes / 60) * 60; // 60px per hour
  };

  const getBlockTop = (block: TimeboxingBlock) => {
    const [, startMin] = block.start_time.split(':').map(Number);
    return (startMin / 60) * 60;
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Daily Calendar</CardTitle>
          <Button size="sm" onClick={handleAddClick}>
            <Plus className="h-4 w-4 mr-2" />
            Add Block
          </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="relative">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="flex border-t border-slate-100 h-[60px]"
                >
                  {/* Time label */}
                  <div className="w-16 shrink-0 pr-2 text-right">
                    <span className="text-xs text-slate-400">
                      {hour.toString().padStart(2, '0')}:00
                    </span>
                  </div>

                  {/* Hour row */}
                  <div className="flex-1 relative">
                    {getBlocksForHour(hour).map((block) => (
                      <TimeBlockCard
                        key={block.id}
                        block={block}
                        height={getBlockHeight(block)}
                        top={getBlockTop(block)}
                        onClick={() => handleEditClick(block)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <AddBlockDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        date={date}
        dumpItems={dumpItems}
        editingBlock={editingBlock}
        onUpdate={onUpdate}
      />
    </>
  );
}
