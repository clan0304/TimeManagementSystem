export const HABIT_COLORS = [
  { name: 'Green', value: '#22C55E' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Yellow', value: '#EAB308' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Teal', value: '#14B8A6' },
];

export const HABIT_ICONS = [
  '✓',
  '📝',
  '💪',
  '📚',
  '🏃',
  '🧘',
  '💻',
  '🎨',
  '🎵',
  '🌱',
  '💧',
  '😴',
  '🍎',
  '🧠',
  '✍️',
  '📖',
];

export const MAX_HABITS = 2;

export const ENTRY_STATUS = {
  success: {
    label: 'Success',
    icon: '✓',
    color: 'green',
  },
  fail: {
    label: 'Fail',
    icon: '✗',
    color: 'red',
  },
  skip: {
    label: 'Skip',
    icon: '−',
    color: 'gray',
  },
} as const;
