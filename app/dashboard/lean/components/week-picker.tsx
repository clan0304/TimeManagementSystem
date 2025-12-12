'use client';

import { useState } from 'react';
import { format, startOfWeek, endOfWeek, isSameWeek } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

type WeekPickerProps = {
  selectedWeek: Date;
  onWeekSelect: (date: Date) => void;
};

export function WeekPicker({ selectedWeek, onWeekSelect }: WeekPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 });

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onWeekSelect(date);
      setIsOpen(false);
    }
  };

  // Disable future weeks
  const disabledDays = { after: new Date() };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="min-w-[240px] justify-start text-left font-medium"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="center">
        <Calendar
          mode="single"
          selected={selectedWeek}
          onSelect={handleSelect}
          disabled={disabledDays}
          initialFocus
          weekStartsOn={1}
          modifiers={{
            selectedWeek: (date) =>
              isSameWeek(date, selectedWeek, { weekStartsOn: 1 }),
          }}
          modifiersStyles={{
            selectedWeek: {
              backgroundColor: 'hsl(var(--primary) / 0.1)',
              borderRadius: 0,
            },
          }}
          className="rounded-md border"
        />
        <div className="p-3 border-t">
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              onWeekSelect(new Date());
              setIsOpen(false);
            }}
          >
            Go to Current Week
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
