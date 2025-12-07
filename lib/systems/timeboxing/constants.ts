export const BLOCK_COLORS = [
  { name: 'Pink', value: '#F472B6' },
  { name: 'Blue', value: '#60A5FA' },
  { name: 'Green', value: '#4ADE80' },
  { name: 'Yellow', value: '#FACC15' },
  { name: 'Orange', value: '#FB923C' },
  { name: 'Purple', value: '#A78BFA' },
  { name: 'Teal', value: '#2DD4BF' },
  { name: 'Gray', value: '#9CA3AF' },
] as const;

export const DEFAULT_BLOCK_COLOR = '#60A5FA';

export const HOURS = Array.from({ length: 24 }, (_, i) => i);

export const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? '00' : '30';
  const displayHour = hour.toString().padStart(2, '0');
  return {
    value: `${displayHour}:${minute}:00`,
    label: `${displayHour}:${minute}`,
  };
});
