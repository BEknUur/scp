import React, { useState, ReactNode } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { colors, typography, spacing, radius, dimensions } from '@/theme';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  size?: 'sm' | 'md' | 'lg';
  rightIcon?: ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  size = 'md',
  rightIcon,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const inputContainerStyle: ViewStyle[] = [
    styles.inputContainer,
    styles[`size_${size}`],
    isFocused && styles.focused,
    error && styles.error,
  ];

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={inputContainerStyle}>
        <TextInput
          {...textInputProps}
          style={[styles.input, rightIcon && styles.inputWithIcon]}
          placeholderTextColor={colors.foreground.tertiary}
          onFocus={(e) => {
            setIsFocused(true);
            textInputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            textInputProps.onBlur?.(e);
          }}
        />
        {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },

  label: {
    ...typography.label,
    marginBottom: spacing.xs,
    textTransform: 'none',
    fontSize: 13,
    fontWeight: '500',
    color: colors.foreground.primary,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: radius.md,
  },

  size_sm: {
    height: dimensions.inputHeight.sm,
  },

  size_md: {
    height: dimensions.inputHeight.md,
  },

  size_lg: {
    height: dimensions.inputHeight.lg,
  },

  focused: {
    borderColor: colors.border.focus,
    borderWidth: 2,
  },

  error: {
    borderColor: colors.semantic.error,
  },

  input: {
    flex: 1,
    paddingHorizontal: spacing.md,
    ...typography.body,
    color: colors.foreground.primary,
  },

  inputWithIcon: {
    paddingRight: 0,
  },

  rightIconContainer: {
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },

  errorText: {
    ...typography.caption,
    color: colors.semantic.error,
    marginTop: spacing.xs,
  },
});
