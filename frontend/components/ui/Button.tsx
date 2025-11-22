import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, typography, spacing, radius, dimensions } from '@/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
}) => {
  const isDisabled = disabled || loading;

  const containerStyle: ViewStyle[] = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style,
  ];

  const textStyle: TextStyle[] = [
    styles.text,
    styles[`text_${variant}`],
    styles[`text_${size}`],
    isDisabled && styles.textDisabled,
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.foreground.inverse : colors.foreground.primary}
        />
      ) : (
        <Text style={textStyle}>{children}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Base styles
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },

  fullWidth: {
    width: '100%',
  },

  // Sizes
  size_sm: {
    height: dimensions.buttonHeight.sm,
    paddingHorizontal: spacing.md,
  },

  size_md: {
    height: dimensions.buttonHeight.md,
    paddingHorizontal: spacing.lg,
  },

  size_lg: {
    height: dimensions.buttonHeight.lg,
    paddingHorizontal: spacing.xl,
  },

  // Variants
  primary: {
    backgroundColor: colors.interactive.primary,
  },

  secondary: {
    backgroundColor: colors.interactive.secondary,
  },

  outline: {
    backgroundColor: 'transparent',
    borderColor: colors.border.primary,
  },

  ghost: {
    backgroundColor: 'transparent',
  },

  disabled: {
    backgroundColor: colors.interactive.disabled,
    borderColor: 'transparent',
  },

  // Text styles
  text: {
    ...typography.button,
  },

  text_sm: {
    fontSize: 12,
  },

  text_md: {
    fontSize: 14,
  },

  text_lg: {
    fontSize: 16,
  },

  text_primary: {
    color: colors.foreground.inverse,
  },

  text_secondary: {
    color: colors.foreground.primary,
  },

  text_outline: {
    color: colors.foreground.primary,
  },

  text_ghost: {
    color: colors.foreground.primary,
  },

  textDisabled: {
    color: colors.interactive.disabledText,
  },
});
