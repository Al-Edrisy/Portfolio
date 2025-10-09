// Reaction Types Configuration
export const REACTION_TYPES = {
  like: {
    emoji: '👍',
    label: 'Like',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    hoverColor: 'hover:bg-blue-100'
  },
  love: {
    emoji: '❤️',
    label: 'Love',
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    hoverColor: 'hover:bg-red-100'
  },
  fire: {
    emoji: '🔥',
    label: 'Fire',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    hoverColor: 'hover:bg-orange-100'
  },
  wow: {
    emoji: '😮',
    label: 'Wow',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    hoverColor: 'hover:bg-yellow-100'
  },
  laugh: {
    emoji: '😂',
    label: 'Laugh',
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    hoverColor: 'hover:bg-green-100'
  },
  idea: {
    emoji: '💡',
    label: 'Great Idea',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    hoverColor: 'hover:bg-purple-100'
  },
  rocket: {
    emoji: '🚀',
    label: 'Amazing',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50',
    hoverColor: 'hover:bg-indigo-100'
  },
  clap: {
    emoji: '👏',
    label: 'Applause',
    color: 'text-pink-500',
    bgColor: 'bg-pink-50',
    hoverColor: 'hover:bg-pink-100'
  }
} as const

export type ReactionType = keyof typeof REACTION_TYPES

export const REACTION_TYPES_ARRAY = Object.keys(REACTION_TYPES) as ReactionType[]
