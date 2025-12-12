import type { LeanActivityType } from '@/types';

export const ACTIVITY_TYPES: Record<
  LeanActivityType,
  {
    label: string;
    labelKo: string;
    icon: string;
    color: string;
    description: string;
    descriptionKo: string;
  }
> = {
  value: {
    label: 'Value',
    labelKo: '가치',
    icon: '✅',
    color: '#22C55E',
    description: 'Directly produces results',
    descriptionKo: '직접적으로 결과를 만드는 활동',
  },
  support: {
    label: 'Support',
    labelKo: '지원',
    icon: '🔧',
    color: '#3B82F6',
    description: 'Necessary but indirect value',
    descriptionKo: '필요하지만 간접적인 활동',
  },
  waste: {
    label: 'Waste',
    labelKo: '낭비',
    icon: '🗑️',
    color: '#EF4444',
    description: 'No value, should eliminate',
    descriptionKo: '가치 없음, 제거 대상',
  },
};

export const DEFAULT_CATEGORIES = [
  // Value
  {
    name: 'Deep Work',
    nameKo: '집중 작업',
    type: 'value' as const,
    icon: '🎯',
  },
  {
    name: 'Client Work',
    nameKo: '클라이언트 작업',
    type: 'value' as const,
    icon: '💼',
  },
  {
    name: 'Creating Content',
    nameKo: '콘텐츠 제작',
    type: 'value' as const,
    icon: '✍️',
  },
  {
    name: 'Problem Solving',
    nameKo: '문제 해결',
    type: 'value' as const,
    icon: '🧩',
  },

  // Support
  { name: 'Planning', nameKo: '계획', type: 'support' as const, icon: '📋' },
  { name: 'Email', nameKo: '이메일', type: 'support' as const, icon: '📧' },
  { name: 'Meetings', nameKo: '회의', type: 'support' as const, icon: '👥' },
  { name: 'Learning', nameKo: '학습', type: 'support' as const, icon: '📚' },
  {
    name: 'Admin Tasks',
    nameKo: '행정 업무',
    type: 'support' as const,
    icon: '📎',
  },

  // Waste
  {
    name: 'Unnecessary Meetings',
    nameKo: '불필요한 회의',
    type: 'waste' as const,
    icon: '🗣️',
  },
  {
    name: 'Social Media',
    nameKo: '소셜 미디어',
    type: 'waste' as const,
    icon: '📱',
  },
  {
    name: 'Excessive Email',
    nameKo: '과도한 이메일 확인',
    type: 'waste' as const,
    icon: '📬',
  },
  { name: 'Waiting', nameKo: '대기', type: 'waste' as const, icon: '⏳' },
  {
    name: 'Context Switching',
    nameKo: '컨텍스트 전환',
    type: 'waste' as const,
    icon: '🔄',
  },
];

export const DURATION_PRESETS = [
  { label: '15m', minutes: 15 },
  { label: '30m', minutes: 30 },
  { label: '45m', minutes: 45 },
  { label: '1h', minutes: 60 },
  { label: '1.5h', minutes: 90 },
  { label: '2h', minutes: 120 },
];
