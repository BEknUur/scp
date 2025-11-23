import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { staffApi } from '@/api';
import { Staff, StaffCreate } from '@/types';
import { Card, Button, Input, Badge } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { colors, typography, spacing } from '@/theme';
import { Role } from '@/enums';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/hooks/useTranslation';

export default function StaffManagementScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role.SUPPLIER_MANAGER | Role.SUPPLIER_SALES>(
    Role.SUPPLIER_MANAGER
  );

  const isOwner = user?.role === Role.SUPPLIER_OWNER;

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      const data = await staffApi.list();
      setStaff(data);
    } catch (error: any) {
      console.error('Failed to load staff:', error);
      Alert.alert(t('app.error'), t('staff.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  const confirmAction = async (
    title: string,
    message: string,
    confirmText: string,
    destructive?: boolean
  ) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return window.confirm(`${title}\n\n${message}`);
    }

    return new Promise<boolean>((resolve) => {
      Alert.alert(
        title,
        message,
        [
          { text: t('app.cancel'), style: 'cancel', onPress: () => resolve(false) },
          {
            text: confirmText,
            style: destructive ? 'destructive' : 'default',
            onPress: () => resolve(true),
          },
        ]
      );
    });
  };

  const handleAddStaff = async () => {
    if (!email || !password) {
      Alert.alert(t('app.error'), t('staff.fillRequired'));
      return;
    }

    setIsSubmitting(true);
    try {
      const data: StaffCreate = {
        email,
        password,
        role,
      };
      await staffApi.create(data);
      Alert.alert(t('app.success'), t('staff.staffAdded'));
      setShowAddModal(false);
      setEmail('');
      setPassword('');
      setRole(Role.SUPPLIER_MANAGER);
      loadStaff();
    } catch (error: any) {
      console.error('Failed to add staff:', error);
      Alert.alert(t('app.error'), error.response?.data?.detail || t('staff.addError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStaff = async (staffMember: Staff) => {
    const confirmed = await confirmAction(
      t('staff.deleteStaff'),
      t('staff.deleteConfirm'),
      t('staff.remove'),
      true
    );

    if (!confirmed) return;

    try {
      await staffApi.delete(staffMember.id);
      Alert.alert(t('app.success'), t('staff.staffDeleted'));
      loadStaff();
    } catch (error: any) {
      console.error('Failed to delete staff:', error);
      Alert.alert(t('app.error'), error.response?.data?.detail || t('staff.deleteError'));
    }
  };

  const handleUpdateRole = async (staffMember: Staff) => {
    const newRole =
      staffMember.role === Role.SUPPLIER_MANAGER
        ? Role.SUPPLIER_SALES
        : Role.SUPPLIER_MANAGER;

    const newRoleText = newRole === Role.SUPPLIER_MANAGER
      ? t('staff.roles.SUPPLIER_MANAGER')
      : t('staff.roles.SUPPLIER_SALES');

    const confirmed = await confirmAction(
      t('staff.changeRoleTitle'),
      t('staff.changeRoleConfirm', { email: staffMember.user.email }) + ` → ${newRoleText}`,
      t('staff.updateRole')
    );

    if (!confirmed) return;

    try {
      await staffApi.update(staffMember.id, { role: newRole });
      Alert.alert(t('app.success'), t('staff.roleUpdated'));
      loadStaff();
    } catch (error: any) {
      console.error('Failed to update role:', error);
      Alert.alert(t('app.error'), error.response?.data?.detail || t('staff.updateError'));
    }
  };

  const getRoleBadgeVariant = (role: Role) => {
    if (role === Role.SUPPLIER_MANAGER) return 'accepted';
    return 'default';
  };

  const getRoleText = (role: Role) => {
    switch (role) {
      case Role.SUPPLIER_OWNER:
        return t('staff.roles.SUPPLIER_OWNER');
      case Role.SUPPLIER_MANAGER:
        return t('staff.roles.SUPPLIER_MANAGER');
      case Role.SUPPLIER_SALES:
        return t('staff.roles.SUPPLIER_SALES');
      default:
        return role;
    }
  };

  const renderStaffItem = ({ item }: { item: Staff }) => {
    return (
      <Card style={styles.staffCard}>
        <View style={styles.staffHeader}>
          <View style={styles.staffInfo}>
            <View style={styles.staffTitleRow}>
              <Ionicons
                name="person"
                size={20}
                color={colors.foreground.primary}
                style={styles.staffIcon}
              />
              <Text style={styles.staffEmail}>{item.user.email}</Text>
            </View>
            <View style={styles.invitedByRow}>
              <Ionicons
                name="people-outline"
                size={14}
                color={colors.foreground.secondary}
                style={styles.invitedIcon}
              />
              <Text style={styles.invitedBy}>
                {item.inviter.email}
              </Text>
            </View>
            <View style={styles.dateRow}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color={colors.foreground.tertiary}
                style={styles.dateIcon}
              />
              <Text style={styles.dateText}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
          <Badge variant={getRoleBadgeVariant(item.role)}>{getRoleText(item.role)}</Badge>
        </View>

        {isOwner && (
          <View style={styles.staffActions}>
            <Button
              variant="outline"
              size="sm"
              onPress={() => handleUpdateRole(item)}
              style={styles.actionButton}
            >
              {t('staff.changeRole')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onPress={() => handleDeleteStaff(item)}
              style={styles.actionButton}
            >
              {t('staff.remove')}
            </Button>
          </View>
        )}
      </Card>
    );
  };

  if (!isOwner) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <Ionicons
            name="lock-closed"
            size={64}
            color={colors.foreground.tertiary}
            style={styles.noAccessIcon}
          />
          <Text style={styles.noAccessTitle}>Access Denied</Text>
          <Text style={styles.noAccessText}>
            Only the business owner can manage staff members
          </Text>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.foreground.primary} />
      </View>
    );
  }

  return (
    <React.Fragment>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.contentWrapper}>
            <View style={styles.headerSection}>
              <Ionicons
                name="people"
                size={48}
                color={colors.foreground.primary}
                style={styles.headerIcon}
              />
              <Text style={styles.headerTitle}>{t('staff.title')}</Text>
              <Text style={styles.headerSubtitle}>{t('staff.subtitle')}</Text>
              <Button
                onPress={() => setShowAddModal(true)}
                style={styles.addButton}
              >
                {t('staff.addStaffMember')}
              </Button>
            </View>

            {staff.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="people-outline"
                  size={64}
                  color={colors.foreground.tertiary}
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyText}>{t('staff.noStaff')}</Text>
                <Text style={styles.emptySubtext}>{t('staff.noStaffSubtext')}</Text>
              </View>
            ) : (
              <View style={styles.staffList}>
                {staff.map((item) => (
                  <View key={item.id}>{renderStaffItem({ item })}</View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('staff.addStaffMember')}</Text>

            <Input
              label={t('staff.email')}
              value={email}
              onChangeText={setEmail}
              placeholder={t('staff.emailPlaceholder')}
              keyboardType="email-address"
              autoCapitalize="none"
              containerStyle={styles.input}
            />

            <Input
              label={t('auth.password')}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              containerStyle={styles.input}
            />

            <View style={styles.roleSection}>
              <Text style={styles.roleLabel}>{t('staff.role')}</Text>
              <View style={styles.roleButtons}>
                <Button
                  variant={role === Role.SUPPLIER_MANAGER ? 'primary' : 'outline'}
                  size="sm"
                  onPress={() => setRole(Role.SUPPLIER_MANAGER)}
                  style={styles.roleButton}
                >
                  {t('staff.roles.SUPPLIER_MANAGER')}
                </Button>
                <Button
                  variant={role === Role.SUPPLIER_SALES ? 'primary' : 'outline'}
                  size="sm"
                  onPress={() => setRole(Role.SUPPLIER_SALES)}
                  style={styles.roleButton}
                >
                  {t('staff.roles.SUPPLIER_SALES')}
                </Button>
              </View>
            </View>

            <View style={styles.modalActions}>
              <Button
                variant="outline"
                onPress={() => setShowAddModal(false)}
                disabled={isSubmitting}
                style={styles.modalButton}
                fullWidth
              >
                {t('app.cancel')}
              </Button>
              <Button
                onPress={handleAddStaff}
                loading={isSubmitting}
                disabled={isSubmitting}
                style={styles.modalButton}
                fullWidth
              >
                {t('staff.addStaff')}
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </React.Fragment>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['4xl'],
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    paddingVertical: spacing['4xl'],
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 800,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerIcon: {
    marginBottom: spacing.md,
  },
  headerTitle: {
    ...typography.h2,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.foreground.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  addButton: {
    alignSelf: 'center',
    minWidth: 200,
    maxWidth: 300,
  },
  staffList: {
    gap: spacing.md,
  },
  staffCard: {
    marginBottom: spacing.md,
  },
  staffHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  staffInfo: {
    flex: 1,
  },
  staffTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  staffIcon: {
    marginRight: spacing.xs,
  },
  staffEmail: {
    ...typography.h4,
    flex: 1,
  },
  invitedByRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  invitedIcon: {
    marginRight: spacing.xs,
  },
  invitedBy: {
    ...typography.caption,
    color: colors.foreground.secondary,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    marginRight: spacing.xs,
  },
  dateText: {
    ...typography.caption,
    color: colors.foreground.tertiary,
  },
  staffActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['4xl'],
    minHeight: 400,
  },
  emptyIcon: {
    marginBottom: spacing.lg,
  },
  emptyText: {
    ...typography.h3,
    color: colors.foreground.secondary,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.foreground.tertiary,
    textAlign: 'center',
  },
  noAccessIcon: {
    marginBottom: spacing.lg,
  },
  noAccessTitle: {
    ...typography.h2,
    color: colors.foreground.secondary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  noAccessText: {
    ...typography.body,
    color: colors.foreground.tertiary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  modalTitle: {
    ...typography.h2,
    marginBottom: spacing.xl,
  },
  input: {
    marginBottom: spacing.lg,
  },
  roleSection: {
    marginBottom: spacing.xl,
  },
  roleLabel: {
    ...typography.label,
    marginBottom: spacing.sm,
    textTransform: 'none',
    fontSize: 13,
    fontWeight: '500',
    color: colors.foreground.primary,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  roleButton: {
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
  },
});
