'use client';

import { useState } from 'react';
import { Star, Clock } from 'lucide-react';
import type { SixBlockBlock, SixBlockChecklistItem } from '@/types';
import { BlockDetailDialog } from './block-detail-dialog';

type BlockCardProps = {
  block: SixBlockBlock;
  checklistItems: SixBlockChecklistItem[];
  coreBlockCount: number;
  onBlockUpdate: (block: SixBlockBlock) => void;
  onBlockDelete: (blockId: string) => void;
  onChecklistItemCreate: (item: SixBlockChecklistItem) => void;
  onChecklistItemUpdate: (item: SixBlockChecklistItem) => void;
  onChecklistItemDelete: (itemId: string) => void;
};

export function BlockCard({
  block,
  checklistItems,
  coreBlockCount,
  onBlockUpdate,
  onBlockDelete,
  onChecklistItemCreate,
  onChecklistItemUpdate,
  onChecklistItemDelete,
}: BlockCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const totalCount = checklistItems.length;

  const formatTime = (time: string | null) => {
    if (!time) return '';
    return time.slice(0, 5);
  };

  const hasTime = block.start_time || block.end_time;

  return (
    <>
      <div
        onClick={() => setIsDialogOpen(true)}
        className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all hover:shadow-md ${
          block.is_core
            ? 'bg-yellow-50 border-2 border-yellow-400 hover:bg-yellow-100'
            : 'bg-white border border-slate-200 hover:border-slate-300'
        }`}
      >
        {/* Block Number */}
        <div
          className={`w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm shrink-0 ${
            block.is_core
              ? 'bg-yellow-400 text-yellow-900'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {block.block_order}
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-900 truncate">{block.title}</p>
        </div>

        {/* Time Range */}
        {hasTime && (
          <div className="flex items-center gap-1 text-xs text-slate-500 shrink-0">
            <Clock className="h-3 w-3" />
            <span>
              {formatTime(block.start_time)} - {formatTime(block.end_time)}
            </span>
          </div>
        )}

        {/* Checklist Progress Dots */}
        {totalCount > 0 && (
          <div className="flex gap-0.5 shrink-0">
            {checklistItems.slice(0, 5).map((item, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full ${
                  item.is_completed ? 'bg-green-500' : 'bg-slate-300'
                }`}
              />
            ))}
            {totalCount > 5 && (
              <span className="text-xs text-slate-400 ml-1">
                +{totalCount - 5}
              </span>
            )}
          </div>
        )}

        {/* Core Badge */}
        {block.is_core && (
          <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-400 text-yellow-900 rounded-full text-xs font-semibold shrink-0">
            <Star className="h-3 w-3 fill-yellow-900" />
            Core
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <BlockDetailDialog
        block={block}
        checklistItems={checklistItems}
        coreBlockCount={coreBlockCount}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onBlockUpdate={onBlockUpdate}
        onBlockDelete={onBlockDelete}
        onChecklistItemCreate={onChecklistItemCreate}
        onChecklistItemUpdate={onChecklistItemUpdate}
        onChecklistItemDelete={onChecklistItemDelete}
      />
    </>
  );
}
