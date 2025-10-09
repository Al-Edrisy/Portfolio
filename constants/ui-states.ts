// UI State Constants
export const UI_STATES = {
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
  IDLE: 'idle'
} as const

export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000
} as const

export const TRANSITION_TYPES = {
  FADE: 'fade',
  SLIDE: 'slide',
  SCALE: 'scale',
  ROTATE: 'rotate'
} as const

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536
} as const

export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080
} as const
