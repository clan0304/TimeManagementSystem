export const MAX_BLOCKS = 6;
export const MAX_CORE_BLOCKS = 2;

export const BLOCK_NUMBERS = [1, 2, 3, 4, 5, 6] as const;

export const DEFAULT_BLOCK_TITLES = [
  'Block 1',
  'Block 2',
  'Block 3',
  'Block 4',
  'Block 5',
  'Block 6',
];

export const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? '00' : '30';
  const displayHour = hour.toString().padStart(2, '0');
  return {
    value: `${displayHour}:${minute}:00`,
    label: `${displayHour}:${minute}`,
  };
});
