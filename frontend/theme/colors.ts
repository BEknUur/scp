// Shadcn-inspired monochrome color palette for React Native
export const colors = {
  // Primary brand color
  primary: {
    default: '#18181B',
    hover: '#27272A',
    active: '#09090B',
  },

  // Background colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F8F9FA',
    tertiary: '#F1F3F5',
    inverse: '#09090B',
  },

  // Foreground/Text colors
  foreground: {
    primary: '#09090B',
    secondary: '#71717A',
    tertiary: '#A1A1AA',
    inverse: '#FAFAFA',
    muted: '#71717A',
  },

  // Border colors
  border: {
    primary: '#E4E4E7',
    secondary: '#D4D4D8',
    focus: '#18181B',
  },

  // Interactive states
  interactive: {
    primary: '#18181B',
    primaryHover: '#27272A',
    primaryActive: '#09090B',
    secondary: '#F4F4F5',
    secondaryHover: '#E4E4E7',
    secondaryActive: '#D4D4D8',
    disabled: '#F4F4F5',
    disabledText: '#A1A1AA',
  },

  // Semantic colors
  semantic: {
    success: '#18181B',
    successLight: '#F4F4F5',
    error: '#DC2626',
    errorLight: '#FEE2E2',
    warning: '#18181B',
    warningLight: '#F4F4F5',
    info: '#18181B',
    infoLight: '#F4F4F5',
  },

  // Status badges
  status: {
    pending: '#A1A1AA',
    pendingBg: '#F4F4F5',
    accepted: '#18181B',
    acceptedBg: '#E4E4E7',
    completed: '#52525B',
    completedBg: '#D4D4D8',
    cancelled: '#71717A',
    cancelledBg: '#F4F4F5',
  },

  // Chat colors
  chat: {
    myMessage: '#18181B',
    myMessageText: '#FAFAFA',
    theirMessage: '#F4F4F5',
    theirMessageText: '#09090B',
  },
} as const;

export type Colors = typeof colors;
