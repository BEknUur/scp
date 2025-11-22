import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, typography, spacing, radius } from '@/theme';

type BadgeVariant = 'default' | 'pending' | 'accepted' | 'completed' | 'cancelled';

interface BadgeProps {
  children: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', style }) => {
  const containerStyle: ViewStyle[] = [styles.base, styles[variant], style];

  const textStyle: TextStyle[] = [styles.text, styles[`text_${variant}`]];

  return (
    <View style={containerStyle}>
      <Text style={textStyle}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },

  // Variant backgrounds
  default: {
    backgroundColor: colors.background.tertiary,
  },

  pending: {
    backgroundColor: colors.status.pendingBg,
  },

  accepted: {
    backgroundColor: colors.status.acceptedBg,
  },

  completed: {
    backgroundColor: colors.status.completedBg,
  },

  cancelled: {
    backgroundColor: colors.status.cancelledBg,
  },

  // Text styles
  text: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  text_default: {
    color: colors.foreground.secondary,
  },

  text_pending: {
    color: colors.status.pending,
  },

  text_accepted: {
    color: colors.status.accepted,
  },

  text_completed: {
    color: colors.status.completed,
  },

  text_cancelled: {
    color: colors.status.cancelled,
  },
});
