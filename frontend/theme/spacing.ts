// Consistent spacing scale (4px base unit)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
} as const;

// Border radius
export const radius = {
  none: 0,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  full: 9999,
} as const;

// Common dimensions
export const dimensions = {
  buttonHeight: {
    sm: 32,
    md: 40,
    lg: 48,
  },
  inputHeight: {
    sm: 32,
    md: 40,
    lg: 48,
  },
  iconSize: {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  },
  avatarSize: {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
  },
} as const;

export type Spacing = typeof spacing;
export type Radius = typeof radius;
export type Dimensions = typeof dimensions;
