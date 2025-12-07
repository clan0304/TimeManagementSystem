'use client';

import { DragOverlay as DndKitDragOverlay } from '@dnd-kit/core';
import type { ReactNode } from 'react';

type DragOverlayWrapperProps = {
  children: ReactNode;
};

export function DragOverlayWrapper({ children }: DragOverlayWrapperProps) {
  // Double assertion through unknown to fix React 19 compatibility
  const Overlay = DndKitDragOverlay as unknown as React.ComponentType<{
    children?: ReactNode;
  }>;

  return <Overlay>{children}</Overlay>;
}
