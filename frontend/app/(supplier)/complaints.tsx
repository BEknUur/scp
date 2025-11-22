import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { complaintsApi } from '@/api';
import { ComplaintOut } from '@/types';
import { ComplaintStatus } from '@/enums';
import { Card, Button, Badge } from '@/components/ui';
import { colors, typography, spacing, radius } from '@/theme';
import { Ionicons } from '@expo/vector-icons';

export default function ComplaintsScreen() {
  const [complaints, setComplaints] = useState<ComplaintOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintOut | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      const data = await complaintsApi.list(undefined, true);
      setComplaints(data);
    } catch (error: any) {
      console.error('Failed to load complaints:', error);
      Alert.alert('Error', 'Failed to load complaints');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (complaintId: number, newStatus: ComplaintStatus) => {
    try {
      await complaintsApi.updateStatus(complaintId, { status: newStatus });
      Alert.alert('Success', 'Status updated');
      setIsModalVisible(false);
      setSelectedComplaint(null);
      loadComplaints();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to update status');
    }
  };

  const getBadgeVariant = (status: ComplaintStatus): 'pending' | 'accepted' | 'completed' | 'cancelled' => {
    switch (status) {
      case ComplaintStatus.OPEN:
        return 'pending';
      case ComplaintStatus.IN_PROGRESS:
        return 'accepted';
      case ComplaintStatus.RESOLVED:
        return 'completed';
      default:
        return 'pending';
    }
  };

  const getStatusText = (status: ComplaintStatus) => {
    switch (status) {
      case ComplaintStatus.OPEN:
        return 'Open';
      case ComplaintStatus.IN_PROGRESS:
        return 'In Progress';
      case ComplaintStatus.RESOLVED:
        return 'Resolved';
      default:
        return status;
    }
  };

  const renderComplaintItem = (item: ComplaintOut) => {
    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => {
          setSelectedComplaint(item);
          setIsModalVisible(true);
        }}
      >
        <Card style={styles.complaintCard}>
          <View style={styles.complaintHeader}>
            <View style={styles.complaintInfo}>
              <View style={styles.complaintTitleRow}>
                <Ionicons
                  name="alert-circle"
                  size={20}
                  color={colors.foreground.primary}
                  style={styles.complaintIcon}
                />
                <Text style={styles.complaintTitle}>Complaint #{item.id}</Text>
              </View>
              {item.link_id && (
                <View style={styles.linkInfoRow}>
                  <Ionicons
                    name="link"
                    size={14}
                    color={colors.foreground.secondary}
                    style={styles.linkIcon}
                  />
                  <Text style={styles.linkInfo}>Link #{item.link_id}</Text>
                </View>
              )}
            </View>
            <Badge variant={getBadgeVariant(item.status)}>{getStatusText(item.status)}</Badge>
          </View>

          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionLabel}>Description</Text>
            <Text style={styles.descriptionText} numberOfLines={2}>
              {item.description}
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
              Created: {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={styles.contentWrapper}>
          <View style={styles.header}>
            <Ionicons
              name="document-text"
              size={48}
              color={colors.foreground.primary}
              style={styles.headerIcon}
            />
            <Text style={styles.headerTitle}>Customer Complaints</Text>
            <Text style={styles.headerSubtitle}>
              Review and manage customer complaints
            </Text>
          </View>

          {complaints.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="document-text-outline"
                size={64}
                color={colors.foreground.tertiary}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyText}>No complaints yet</Text>
              <Text style={styles.emptySubtext}>
                Customer complaints will appear here
              </Text>
            </View>
          ) : (
            <View style={styles.complaintsList}>{complaints.map((complaint) => renderComplaintItem(complaint))}</View>
          )}
        </View>
      </View>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setIsModalVisible(false);
          setSelectedComplaint(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Complaint #{selectedComplaint?.id}</Text>
              <TouchableOpacity
                onPress={() => {
                  setIsModalVisible(false);
                  setSelectedComplaint(null);
                }}
                style={styles.closeIcon}
              >
                <Ionicons name="close" size={24} color={colors.foreground.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSection}>
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="information-circle"
                  size={20}
                  color={colors.foreground.primary}
                  style={styles.sectionIcon}
                />
                <Text style={styles.sectionLabel}>Description</Text>
              </View>
              <Text style={styles.descriptionFullText}>{selectedComplaint?.description}</Text>
            </View>

            <View style={styles.modalSection}>
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="flag"
                  size={20}
                  color={colors.foreground.primary}
                  style={styles.sectionIcon}
                />
                <Text style={styles.sectionLabel}>Current Status</Text>
              </View>
              <Badge variant={getBadgeVariant(selectedComplaint?.status || ComplaintStatus.OPEN)}>
                {getStatusText(selectedComplaint?.status || ComplaintStatus.OPEN)}
              </Badge>
            </View>

            <View style={styles.modalSection}>
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="settings"
                  size={20}
                  color={colors.foreground.primary}
                  style={styles.sectionIcon}
                />
                <Text style={styles.sectionLabel}>Change Status</Text>
              </View>
              <View style={styles.statusButtons}>
                <Button
                  variant={selectedComplaint?.status === ComplaintStatus.OPEN ? 'primary' : 'outline'}
                  size="sm"
                  onPress={() =>
                    selectedComplaint &&
                    handleStatusChange(selectedComplaint.id, ComplaintStatus.OPEN)
                  }
                  style={styles.statusButton}
                >
                  Open
                </Button>

                <Button
                  variant={selectedComplaint?.status === ComplaintStatus.IN_PROGRESS ? 'primary' : 'outline'}
                  size="sm"
                  onPress={() =>
                    selectedComplaint &&
                    handleStatusChange(selectedComplaint.id, ComplaintStatus.IN_PROGRESS)
                  }
                  style={styles.statusButton}
                >
                  In Progress
                </Button>

                <Button
                  variant={selectedComplaint?.status === ComplaintStatus.RESOLVED ? 'primary' : 'outline'}
                  size="sm"
                  onPress={() =>
                    selectedComplaint &&
                    handleStatusChange(selectedComplaint.id, ComplaintStatus.RESOLVED)
                  }
                  style={styles.statusButton}
                >
                  Resolved
                </Button>
              </View>
            </View>

            <Button
              variant="outline"
              onPress={() => {
                setIsModalVisible(false);
                setSelectedComplaint(null);
              }}
              style={styles.closeButton}
            >
              Close
            </Button>
          </View>
        </View>
      </Modal>
    </ScrollView>
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
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerIcon: {
    marginBottom: spacing.md,
  },
  headerTitle: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.foreground.secondary,
    textAlign: 'center',
  },
  complaintsList: {
    gap: spacing.md,
  },
  complaintCard: {
    marginBottom: spacing.md,
  },
  complaintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  complaintInfo: {
    flex: 1,
  },
  complaintTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  complaintIcon: {
    marginRight: spacing.xs,
  },
  complaintTitle: {
    ...typography.h4,
    flex: 1,
  },
  linkInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkIcon: {
    marginRight: spacing.xs,
  },
  linkInfo: {
    ...typography.caption,
    color: colors.foreground.secondary,
  },
  descriptionSection: {
    marginBottom: spacing.md,
  },
  descriptionLabel: {
    ...typography.caption,
    color: colors.foreground.secondary,
    fontWeight: '600',
    marginBottom: spacing.xs,
    fontSize: 12,
  },
  descriptionText: {
    ...typography.body,
    color: colors.foreground.primary,
    fontSize: 15,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...typography.h3,
  },
  closeIcon: {
    padding: spacing.xs,
  },
  modalSection: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionIcon: {
    marginRight: spacing.xs,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.foreground.secondary,
    fontWeight: '600',
    fontSize: 14,
  },
  descriptionFullText: {
    ...typography.body,
    color: colors.foreground.primary,
    fontSize: 15,
    lineHeight: 22,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statusButton: {
    flex: 1,
  },
  closeButton: {
    marginTop: spacing.md,
  },
});
