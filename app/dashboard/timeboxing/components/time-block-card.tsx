'use client';

import type { TimeboxingBlock } from '@/types';

type TimeBlockCardProps = {
  block: TimeboxingBlock;
  height: number;
  top: number;
  onClick: () => void;
};

export function TimeBlockCard({
  block,
  height,
  top,
  onClick,
}: TimeBlockCardProps) {
  const formatTime = (time: string) => {
    return time.slice(0, 5);
  };

  return (
    <div
      onClick={onClick}
      className="absolute left-0 right-0 mx-1 rounded-md px-2 py-1 cursor-pointer overflow-hidden transition-opacity hover:opacity-90"
      style={{
        backgroundColor: block.color,
        height: `${height}px`,
        top: `${top}px`,
        minHeight: '24px',
      }}
    >
      <p className="text-xs font-medium text-white truncate">
        {formatTime(block.start_time)} - {formatTime(block.end_time)}
      </p>
      <p className="text-sm font-semibold text-white truncate">{block.task}</p>
    </div>
  );
}
