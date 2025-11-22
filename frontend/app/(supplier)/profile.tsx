import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { Button, Card, Input, LanguageSwitcher } from '@/components/ui';
import { colors, typography, spacing, radius } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/hooks/useTranslation';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleLogout = async () => {
    try {
      console.log('Logging out...');
      await logout();
      console.log('Logged out, redirecting...');
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    // TODO: Implement password change API call
    Alert.alert('Success', 'Password changed successfully');
    setIsEditingPassword(false);
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header with Avatar */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.email?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.headerTitle}>{t('profile.title', { defaultValue: 'Profile' })}</Text>
          <Text style={styles.headerSubtitle}>{t('profile.subtitle', { defaultValue: 'Manage your account settings' })}</Text>
        </View>

        {/* Account Information Card */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>{t('profile.accountInfo', { defaultValue: 'Account Information' })}</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.label}>{t('profile.email', { defaultValue: 'Email' })}</Text>
              <Text style={styles.value} numberOfLines={1} ellipsizeMode="middle">
                {user?.email}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.label}>{t('profile.accountType', { defaultValue: 'Account Type' })}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {user?.role === 'CONSUMER'
                    ? t('profile.consumer', { defaultValue: 'Consumer' })
                    : t('profile.supplier', { defaultValue: 'Supplier' })}
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.label}>{t('profile.password', { defaultValue: 'Password' })}</Text>
              <View style={styles.passwordRow}>
                <Text style={styles.passwordValue}>
                  {showPassword ? 'mypassword123' : '••••••••'}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={18}
                    color={colors.foreground.secondary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {!isEditingPassword && (
            <Button
              variant="outline"
              onPress={() => setIsEditingPassword(true)}
              style={styles.changePasswordBtn}
            >
              {t('profile.changePassword', { defaultValue: 'Change Password' })}
            </Button>
          )}

          {isEditingPassword && (
            <View style={styles.passwordForm}>
              <Input
                label={t('profile.newPassword', { defaultValue: 'New Password' })}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder={t('profile.newPasswordPlaceholder', { defaultValue: 'Enter new password' })}
                secureTextEntry={!showNewPassword}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                    <Ionicons
                      name={showNewPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color={colors.foreground.secondary}
                    />
                  </TouchableOpacity>
                }
              />

              <Input
                label={t('profile.confirmPassword', { defaultValue: 'Confirm Password' })}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder={t('profile.confirmPasswordPlaceholder', { defaultValue: 'Confirm new password' })}
                secureTextEntry={!showConfirmPassword}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color={colors.foreground.secondary}
                    />
                  </TouchableOpacity>
                }
              />

              <View style={styles.passwordFormButtons}>
                <Button
                  variant="outline"
                  onPress={() => {
                    setIsEditingPassword(false);
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  style={styles.cancelBtn}
                >
                  {t('common.cancel', { defaultValue: 'Cancel' })}
                </Button>
                <Button onPress={handleChangePassword} style={styles.saveBtn}>
                  {t('common.save', { defaultValue: 'Save' })}
                </Button>
              </View>
            </View>
          )}
        </Card>

        {/* Account Actions Card */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>{t('profile.settings', { defaultValue: 'Account Actions' })}</Text>

          <TouchableOpacity style={styles.actionItem} activeOpacity={0.7}>
            <View style={styles.actionLeft}>
              <Ionicons name="notifications-outline" size={22} color={colors.foreground.primary} />
              <Text style={styles.actionText}>{t('profile.notifications', { defaultValue: 'Notifications' })}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.foreground.tertiary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.languageSection}>
            <View style={styles.actionLeft}>
              <Ionicons name="language-outline" size={22} color={colors.foreground.primary} />
              <Text style={styles.actionText}>{t('profile.language', { defaultValue: 'Language' })}</Text>
            </View>
            <LanguageSwitcher showLabel={false} compact />
          </View>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionItem} activeOpacity={0.7}>
            <View style={styles.actionLeft}>
              <Ionicons name="help-circle-outline" size={22} color={colors.foreground.primary} />
              <Text style={styles.actionText}>{t('profile.helpSupport', { defaultValue: 'Help & Support' })}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.foreground.tertiary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionItem} activeOpacity={0.7}>
            <View style={styles.actionLeft}>
              <Ionicons name="document-text-outline" size={22} color={colors.foreground.primary} />
              <Text style={styles.actionText}>{t('profile.termsPrivacy', { defaultValue: 'Terms & Privacy' })}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.foreground.tertiary} />
          </TouchableOpacity>
        </Card>

        {/* Sign Out Button */}
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.semantic.error} />
          <Text style={styles.logoutText}>{t('auth.logout', { defaultValue: 'Sign Out' })}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  content: {
    flex: 1,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.foreground.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.background.primary,
  },
  headerTitle: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.foreground.secondary,
  },
  card: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  cardTitle: {
    ...typography.h4,
    marginBottom: spacing.lg,
    fontWeight: '600',
  },
  infoGrid: {
    gap: spacing.md,
  },
  infoItem: {
    gap: spacing.xs,
  },
  label: {
    ...typography.caption,
    color: colors.foreground.secondary,
    fontWeight: '500',
    fontSize: 12,
  },
  value: {
    ...typography.body,
    color: colors.foreground.primary,
    fontWeight: '500',
  },
  badge: {
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  badgeText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.foreground.primary,
    fontSize: 13,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  passwordValue: {
    ...typography.body,
    color: colors.foreground.primary,
    fontWeight: '500',
  },
  changePasswordBtn: {
    marginTop: spacing.sm,
  },
  passwordForm: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
    gap: spacing.md,
  },
  passwordFormButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  cancelBtn: {
    flex: 1,
  },
  saveBtn: {
    flex: 1,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  languageSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  actionText: {
    ...typography.body,
    color: colors.foreground.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.primary,
  },
  logoutBtn: {
    marginTop: spacing.md,
    borderColor: colors.semantic.error,
    borderWidth: 1,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
  },
  logoutText: {
    ...typography.body,
    color: colors.semantic.error,
    fontWeight: '600',
  },
});
