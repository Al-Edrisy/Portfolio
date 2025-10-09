// Project Categories Configuration
export const PROJECT_CATEGORIES = {
  'Full-Stack': {
    label: 'Full-Stack',
    description: 'Complete web applications with frontend and backend',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: '🌐'
  },
  'AI Integration': {
    label: 'AI Integration',
    description: 'Projects featuring artificial intelligence and machine learning',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    icon: '🤖'
  },
  'Data Visualization': {
    label: 'Data Visualization',
    description: 'Interactive dashboards and data analysis tools',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: '📊'
  },
  'Mobile': {
    label: 'Mobile',
    description: 'Mobile applications and responsive designs',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    icon: '📱'
  },
  'Collaboration': {
    label: 'Collaboration',
    description: 'Tools for team collaboration and project management',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    icon: '👥'
  },
  'E-Commerce': {
    label: 'E-Commerce',
    description: 'Online stores and shopping platforms',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: '🛒'
  },
  'Design': {
    label: 'Design',
    description: 'UI/UX design and creative projects',
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    icon: '🎨'
  },
  'DevOps': {
    label: 'DevOps',
    description: 'Infrastructure, deployment, and automation',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    icon: '⚙️'
  }
} as const

export type ProjectCategory = keyof typeof PROJECT_CATEGORIES

export const PROJECT_CATEGORIES_ARRAY = Object.keys(PROJECT_CATEGORIES) as ProjectCategory[]
