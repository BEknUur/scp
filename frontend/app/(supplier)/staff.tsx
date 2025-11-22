import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { staffApi } from '@/api';
import { Staff, StaffCreate } from '@/types';
import { Card, Button, Input, Badge } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { colors, typography, spacing } from '@/theme';
import { Role } from '@/enums';

export default function StaffManagementScreen() {
  const { user } = useAuth();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
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
      Alert.alert('Error', 'Failed to load staff members');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadStaff();
  };

  const handleAddStaff = async () => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Please fill in all fields');
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
      Alert.alert('Success', 'Staff member added successfully');
      setShowAddModal(false);
      setEmail('');
      setPassword('');
      setRole(Role.SUPPLIER_MANAGER);
      loadStaff();
    } catch (error: any) {
      console.error('Failed to add staff:', error);
      Alert.alert('Error', error.response?.data?.detail || 'Failed to add staff member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStaff = (staffMember: Staff) => {
    Alert.alert(
      'Remove Staff',
      `Remove ${staffMember.user.email} from your team?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await staffApi.delete(staffMember.id);
              Alert.alert('Success', 'Staff member removed');
              loadStaff();
            } catch (error: any) {
              console.error('Failed to delete staff:', error);
              Alert.alert('Error', error.response?.data?.detail || 'Failed to remove staff');
            }
          },
        },
      ]
    );
  };

  const handleUpdateRole = (staffMember: Staff) => {
    const newRole =
      staffMember.role === Role.SUPPLIER_MANAGER
        ? Role.SUPPLIER_SALES
        : Role.SUPPLIER_MANAGER;

    Alert.alert('Change Role', `Change role to ${newRole}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Change',
        onPress: async () => {
          try {
            await staffApi.update(staffMember.id, { role: newRole });
            Alert.alert('Success', 'Role updated');
            loadStaff();
          } catch (error: any) {
            console.error('Failed to update role:', error);
            Alert.alert('Error', error.response?.data?.detail || 'Failed to update role');
          }
        },
      },
    ]);
  };

  const getRoleBadgeVariant = (role: Role) => {
    if (role === Role.SUPPLIER_MANAGER) return 'accepted';
    return 'default';
  };

  const renderStaffItem = ({ item }: { item: Staff }) => {
    return (
      <Card style={styles.staffCard}>
        <View style={styles.staffHeader}>
          <View style={styles.staffInfo}>
            <Text style={styles.staffEmail}>{item.user.email}</Text>
            <Text style={styles.invitedBy}>
              Invited by: {item.inviter.email}
            </Text>
            <Text style={styles.dateText}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
          <Badge variant={getRoleBadgeVariant(item.role)}>{item.role}</Badge>
        </View>

        {isOwner && (
          <View style={styles.staffActions}>
            <Button
              variant="ghost"
              size="sm"
              onPress={() => handleUpdateRole(item)}
            >
              Change Role
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onPress={() => handleDeleteStaff(item)}
            >
              Remove
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Button onPress={() => setShowAddModal(true)}>Add Staff Member</Button>
      </View>

      {staff.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No staff members yet</Text>
          <Text style={styles.emptySubtext}>
            Add managers and sales staff to help run your business
          </Text>
        </View>
      ) : (
        <FlatList
          data={staff}
          renderItem={renderStaffItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
        />
      )}

      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Staff Member</Text>

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="staff@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
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

            <View style={styles.roleSection}>
              <Text style={styles.roleLabel}>Role</Text>
              <View style={styles.roleButtons}>
                <Button
                  variant={role === Role.SUPPLIER_MANAGER ? 'primary' : 'outline'}
                  size="sm"
                  onPress={() => setRole(Role.SUPPLIER_MANAGER)}
                  style={styles.roleButton}
                >
                  Manager
                </Button>
                <Button
                  variant={role === Role.SUPPLIER_SALES ? 'primary' : 'outline'}
                  size="sm"
                  onPress={() => setRole(Role.SUPPLIER_SALES)}
                  style={styles.roleButton}
                >
                  Sales
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
                Cancel
              </Button>
              <Button
                onPress={handleAddStaff}
                loading={isSubmitting}
                disabled={isSubmitting}
                style={styles.modalButton}
                fullWidth
              >
                Add Staff
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  header: {
    padding: spacing.lg,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  listContent: {
    padding: spacing.lg,
  },
  staffCard: {
    marginBottom: spacing.md,
  },
  staffHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  staffInfo: {
    flex: 1,
  },
  staffEmail: {
    ...typography.h4,
    marginBottom: spacing.xs,
  },
  invitedBy: {
    ...typography.caption,
    color: colors.foreground.secondary,
    marginBottom: spacing.xs,
  },
  dateText: {
    ...typography.caption,
    color: colors.foreground.tertiary,
  },
  staffActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['4xl'],
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
  noAccessTitle: {
    ...typography.h2,
    color: colors.foreground.secondary,
    marginBottom: spacing.sm,
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
