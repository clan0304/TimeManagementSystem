export type SystemStatus = 'available' | 'coming_soon' | 'beta';

export type SystemStep = {
  title: string;
  description: string;
};

export type SystemInfo = {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: SystemStatus;
  href: string;
  details: {
    longDescription: string;
    benefits: string[];
    steps: SystemStep[];
    inspirations?: string[];
  };
};

export const SYSTEMS: SystemInfo[] = [
  {
    id: 'timeboxing',
    name: 'Daily Timeboxing',
    description: 'Plan your day with time blocks inspired by Elon Musk',
    icon: '📅',
    status: 'available',
    href: '/dashboard/timeboxing',
    details: {
      longDescription:
        'Daily Timeboxing is a time management method where you divide your day into blocks of time, each dedicated to a specific task or activity. This technique, famously used by Elon Musk, helps you focus on one thing at a time and ensures important tasks get the attention they deserve.',
      benefits: [
        'Increased focus by dedicating specific time slots to tasks',
        'Better time awareness and estimation skills',
        'Reduced decision fatigue throughout the day',
        'Clear visual overview of your entire day',
        'Prioritization of your top 3 most important tasks',
      ],
      steps: [
        {
          title: 'Brain Dump',
          description:
            "Start by adding all tasks you need to complete today to the Item Dump. Don't worry about order or priority yet.",
        },
        {
          title: 'Set Priorities',
          description:
            'Drag your 3 most important tasks from the Item Dump to the Priorities section. These are your must-complete items for the day.',
        },
        {
          title: 'Create Time Blocks',
          description:
            'Click "Add Block" to schedule tasks on your calendar. Set start time, end time, and pick a color for visual distinction.',
        },
        {
          title: 'Execute & Adjust',
          description:
            'Follow your schedule throughout the day. Adjust blocks as needed - flexibility is key to making this system work for you.',
        },
      ],
      inspirations: [
        'Elon Musk',
        'Cal Newport (Deep Work)',
        'Time Blocking Method',
      ],
    },
  },
  {
    id: 'sixblock',
    name: '6 Block Planner',
    description:
      'Structure your day into 6 focused blocks with checklists and daily reflection',
    icon: '🧱',
    status: 'available',
    href: '/dashboard/sixblock',
    details: {
      longDescription:
        'The 6 Block Planner divides your day into 6 manageable blocks, each with its own focus, checklist, and notes. Mark up to 2 blocks as your "Core" priorities, and end each day with reflection on what went well, what didn\'t, and what to focus on next.',
      benefits: [
        'Clear structure with exactly 6 focused time blocks',
        'Checklists keep you accountable within each block',
        'Up to 2 core blocks ensure your most important work gets attention',
        'Optional time ranges give flexibility in scheduling',
        'Daily reflection builds self-awareness and continuous improvement',
        'Simple enough to stick with, detailed enough to be effective',
      ],
      steps: [
        {
          title: 'Set Up Your 6 Blocks',
          description:
            'Define the 6 blocks for your day. Give each a title and optionally set time ranges. Add descriptions to clarify your focus.',
        },
        {
          title: 'Add Checklists',
          description:
            'Add specific tasks to complete within each block. Check them off as you go throughout the day.',
        },
        {
          title: 'Mark Your Core Blocks',
          description:
            'Choose up to 2 blocks as "Core" - these are your most important focuses for the day.',
        },
        {
          title: 'Daily Reflection',
          description:
            "At the end of the day, write about what went well, what didn't, and set your goals for tomorrow.",
        },
      ],
      inspirations: [
        '6 Block Method',
        'Time Blocking',
        'Daily Journaling',
        'Reflection Practice',
      ],
    },
  },
];

export function getSystemById(id: string): SystemInfo | undefined {
  return SYSTEMS.find((system) => system.id === id);
}

export function getAvailableSystems(): SystemInfo[] {
  return SYSTEMS.filter((system) => system.status === 'available');
}

export function getComingSoonSystems(): SystemInfo[] {
  return SYSTEMS.filter((system) => system.status === 'coming_soon');
}
