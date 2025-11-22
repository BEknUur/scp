import { TextStyle } from 'react-native';
import { colors } from './colors';

// Typography scale following Shadcn principles
export const typography = {
  // Headings
  h1: {
    fontSize: 32,
    fontWeight: '700' as TextStyle['fontWeight'],
    lineHeight: 40,
    letterSpacing: -0.5,
    color: colors.foreground.primary,
  },

  h2: {
    fontSize: 24,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 32,
    letterSpacing: -0.25,
    color: colors.foreground.primary,
  },

  h3: {
    fontSize: 20,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 28,
    letterSpacing: 0,
    color: colors.foreground.primary,
  },

  h4: {
    fontSize: 16,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 24,
    letterSpacing: 0,
    color: colors.foreground.primary,
  },

  // Body text
  body: {
    fontSize: 14,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: 20,
    letterSpacing: 0,
    color: colors.foreground.primary,
  },

  bodyLarge: {
    fontSize: 16,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: 24,
    letterSpacing: 0,
    color: colors.foreground.primary,
  },

  bodySmall: {
    fontSize: 12,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: 16,
    letterSpacing: 0,
    color: colors.foreground.primary,
  },

  // Special text styles
  label: {
    fontSize: 12,
    fontWeight: '500' as TextStyle['fontWeight'],
    lineHeight: 16,
    letterSpacing: 0.5,
    color: colors.foreground.secondary,
    textTransform: 'uppercase' as TextStyle['textTransform'],
  },

  button: {
    fontSize: 14,
    fontWeight: '500' as TextStyle['fontWeight'],
    lineHeight: 20,
    letterSpacing: 0,
  },

  caption: {
    fontSize: 12,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: 16,
    letterSpacing: 0,
    color: colors.foreground.secondary,
  },

  code: {
    fontSize: 14,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: 20,
    letterSpacing: 0,
    fontFamily: 'monospace',
    color: colors.foreground.primary,
  },
} as const;

export type Typography = typeof typography;
