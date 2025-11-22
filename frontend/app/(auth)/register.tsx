import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input } from '@/components/ui';
import { colors, typography, spacing, radius } from '@/theme';
import { Role } from '@/enums';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>(Role.CONSUMER);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      await register({ email, password, role: selectedRole });
    } catch (error: any) {
      Alert.alert(
        'Registration Failed',
        error.response?.data?.detail || 'Failed to create account'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.formWrapper}>
            <View style={styles.logoContainer}>
              <Image
                source={require('@/assets/images/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <View style={styles.header}>
              <Text style={styles.title}>Create account</Text>
              <Text style={styles.subtitle}>Get started with SCP Platform</Text>
            </View>

            <View style={styles.form}>
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                autoCapitalize="none"
                keyboardType="email-address"
                containerStyle={styles.input}
              />

              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
                containerStyle={styles.input}
              />

              <Input
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="••••••••"
                secureTextEntry
                containerStyle={styles.input}
              />

              <View style={styles.roleSection}>
                <Text style={styles.roleLabel}>Account type</Text>
                <View style={styles.roleButtons}>
                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      selectedRole === Role.CONSUMER && styles.roleButtonActive,
                    ]}
                    onPress={() => setSelectedRole(Role.CONSUMER)}
                    disabled={isLoading}
                  >
                    <View
                      style={[
                        styles.radio,
                        selectedRole === Role.CONSUMER && styles.radioActive,
                      ]}
                    >
                      {selectedRole === Role.CONSUMER && <View style={styles.radioInner} />}
                    </View>
                    <View style={styles.roleContent}>
                      <Text
                        style={[
                          styles.roleTitle,
                          selectedRole === Role.CONSUMER && styles.roleTitleActive,
                        ]}
                      >
                        Consumer
                      </Text>
                      <Text style={styles.roleSubtitle}>Buy from suppliers</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      selectedRole === Role.SUPPLIER_OWNER && styles.roleButtonActive,
                    ]}
                    onPress={() => setSelectedRole(Role.SUPPLIER_OWNER)}
                    disabled={isLoading}
                  >
                    <View
                      style={[
                        styles.radio,
                        selectedRole === Role.SUPPLIER_OWNER && styles.radioActive,
                      ]}
                    >
                      {selectedRole === Role.SUPPLIER_OWNER && <View style={styles.radioInner} />}
                    </View>
                    <View style={styles.roleContent}>
                      <Text
                        style={[
                          styles.roleTitle,
                          selectedRole === Role.SUPPLIER_OWNER && styles.roleTitleActive,
                        ]}
                      >
                        Supplier
                      </Text>
                      <Text style={styles.roleSubtitle}>Sell to consumers</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              <Button
                onPress={handleRegister}
                loading={isLoading}
                disabled={isLoading}
                fullWidth
              >
                Create Account
              </Button>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.footerLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    paddingVertical: spacing['4xl'],
  },
  formWrapper: {
    width: '100%',
    maxWidth: 400,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  logo: {
    width: 80,
    height: 80,
  },
  header: {
    marginBottom: spacing['2xl'],
  },
  title: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.foreground.secondary,
  },
  form: {
    gap: spacing.lg,
  },
  input: {
    marginBottom: 0,
  },
  roleSection: {
    gap: spacing.sm,
  },
  roleLabel: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.foreground.primary,
    marginBottom: spacing.xs,
  },
  roleButtons: {
    gap: spacing.sm,
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: radius.md,
    backgroundColor: colors.background.primary,
  },
  roleButtonActive: {
    borderColor: colors.foreground.primary,
    backgroundColor: colors.background.secondary,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.border.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  radioActive: {
    borderColor: colors.foreground.primary,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.foreground.primary,
  },
  roleContent: {
    flex: 1,
  },
  roleTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.foreground.secondary,
    marginBottom: 2,
  },
  roleTitleActive: {
    color: colors.foreground.primary,
  },
  roleSubtitle: {
    ...typography.caption,
    color: colors.foreground.tertiary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing['2xl'],
    gap: spacing.xs,
  },
  footerText: {
    ...typography.bodySmall,
    color: colors.foreground.secondary,
  },
  footerLink: {
    ...typography.bodySmall,
    color: colors.foreground.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
