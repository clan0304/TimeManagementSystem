'use client';

import { useState } from 'react';
import { useSession, useUser } from '@clerk/nextjs';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClerkSupabaseClient } from '@/lib/supabase/client';
import { createBlock } from '@/lib/systems/sixblock/queries';
import type { SixBlockBlock } from '@/types';

type AddBlockButtonProps = {
  date: string;
  nextOrder: number;
  onBlockCreate: (block: SixBlockBlock) => void;
};

export function AddBlockButton({
  date,
  nextOrder,
  onBlockCreate,
}: AddBlockButtonProps) {
  const { user } = useUser();
  const { session } = useSession();
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!user || !session) return;

    setLoading(true);
    try {
      const client = createClerkSupabaseClient(session);
      const newBlock = await createBlock(client, user.id, {
        date,
        block_order: nextOrder,
        title: title.trim() || `Block ${nextOrder}`,
      });
      onBlockCreate(newBlock);
      setTitle('');
      setIsAdding(false);
    } catch (error) {
      console.error('Failed to create block:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
    if (e.key === 'Escape') {
      setIsAdding(false);
      setTitle('');
    }
  };

  if (isAdding) {
    return (
      <div className="flex items-center gap-4 p-3 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50">
        <div className="w-8 h-8 rounded-md bg-slate-200 flex items-center justify-center font-bold text-sm text-slate-400">
          {nextOrder}
        </div>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Block ${nextOrder} title...`}
          className="flex-1 h-8"
          autoFocus
        />
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsAdding(false);
              setTitle('');
            }}
          >
            Cancel
          </Button>
          <Button size="sm" onClick={handleAdd} disabled={loading}>
            {loading ? '...' : 'Add'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsAdding(true)}
      className="flex items-center gap-4 p-3 rounded-lg border-2 border-dashed border-slate-300 cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-colors"
    >
      <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center">
        <Plus className="h-4 w-4 text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-500">
        Add Block {nextOrder}
      </p>
    </div>
  );
}
