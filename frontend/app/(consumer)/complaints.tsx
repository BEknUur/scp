import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { complaintsApi, linksApi } from '@/api';
import { ComplaintOut, LinkOut } from '@/types';
import { ComplaintStatus } from '@/enums';
import { Card, Button, Badge } from '@/components/ui';
import { colors, typography, spacing, radius } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/hooks/useTranslation';

export default function ComplaintsScreen() {
  const { t } = useTranslation();
  const [complaints, setComplaints] = useState<ComplaintOut[]>([]);
  const [links, setLinks] = useState<LinkOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedLinkId, setSelectedLinkId] = useState<number | null>(null);
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [complaintsData, linksData] = await Promise.all([
        complaintsApi.list(undefined, true),
        linksApi.listMyLinks(),
      ]);
      setComplaints(complaintsData);
      setLinks(linksData);
    } catch (error: any) {
      console.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load complaints');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateComplaint = async () => {
    if (!selectedLinkId || !description.trim()) {
      Alert.alert(t('app.error'), t('complaints.selectConnectionError'));
      return;
    }

    try {
      await complaintsApi.create({
        link_id: selectedLinkId,
        description: description.trim(),
      });
      Alert.alert(t('app.success'), t('complaints.complaintSubmitted'));
      setIsModalVisible(false);
      setDescription('');
      setSelectedLinkId(null);
      loadData();
    } catch (error: any) {
      Alert.alert(t('app.error'), error.response?.data?.detail || t('complaints.createError'));
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
        return t('complaints.status.open');
      case ComplaintStatus.IN_PROGRESS:
        return t('complaints.status.inProgress');
      case ComplaintStatus.RESOLVED:
        return t('complaints.status.resolved');
      default:
        return status;
    }
  };

  const renderComplaintItem = (item: ComplaintOut) => {
    return (
      <Card key={item.id} style={styles.complaintCard}>
        <View style={styles.complaintHeader}>
          <View style={styles.complaintInfo}>
            <View style={styles.complaintTitleRow}>
              <Ionicons
                name="alert-circle"
                size={20}
                color={colors.foreground.primary}
                style={styles.complaintIcon}
              />
              <Text style={styles.complaintTitle}>{t('complaints.complaintNumber', { number: item.id })}</Text>
            </View>
            {item.link_id && (
              <View style={styles.linkInfoRow}>
                <Ionicons
                  name="link"
                  size={14}
                  color={colors.foreground.secondary}
                  style={styles.linkIcon}
                />
                <Text style={styles.linkInfo}>{t('complaints.linkNumber', { number: item.link_id })}</Text>
              </View>
            )}
          </View>
          <Badge variant={getBadgeVariant(item.status)}>{getStatusText(item.status)}</Badge>
        </View>

        <View style={styles.descriptionSection}>
          <Text style={styles.descriptionLabel}>{t('complaints.description')}</Text>
          <Text style={styles.descriptionText}>{item.description}</Text>
        </View>

        <View style={styles.dateRow}>
          <Ionicons
            name="calendar-outline"
            size={14}
            color={colors.foreground.tertiary}
            style={styles.dateIcon}
          />
          <Text style={styles.dateText}>
            {t('complaints.created')}: {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
      </Card>
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
            <Text style={styles.headerTitle}>{t('complaints.title')}</Text>
            <Text style={styles.headerSubtitle}>
              {t('complaints.subtitle')}
            </Text>
          </View>

          <View style={styles.actionSection}>
            <Button onPress={() => setIsModalVisible(true)} style={styles.createButton}>
              {t('complaints.newComplaint')}
            </Button>
          </View>

          {complaints.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="document-text-outline"
                size={64}
                color={colors.foreground.tertiary}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyText}>{t('complaints.noComplaints')}</Text>
              <Text style={styles.emptySubtext}>
                {t('complaints.noComplaintsSubtext')}
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
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('complaints.create')}</Text>
              <TouchableOpacity
                onPress={() => {
                  setIsModalVisible(false);
                  setDescription('');
                  setSelectedLinkId(null);
                }}
                style={styles.closeIcon}
              >
                <Ionicons name="close" size={24} color={colors.foreground.primary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>{t('complaints.selectConnection')}</Text>
            <ScrollView style={styles.linksContainer} showsVerticalScrollIndicator={false}>
              {links.map((link) => (
                <TouchableOpacity
                  key={link.id}
                  style={[
                    styles.linkOption,
                    selectedLinkId === link.id && styles.linkOptionSelected,
                  ]}
                  onPress={() => setSelectedLinkId(link.id)}
                >
                  <View style={styles.linkOptionContent}>
                    <Ionicons
                      name={selectedLinkId === link.id ? 'radio-button-on' : 'radio-button-off'}
                      size={20}
                      color={selectedLinkId === link.id ? colors.foreground.primary : colors.foreground.tertiary}
                    />
                    <Text
                      style={[
                        styles.linkOptionText,
                        selectedLinkId === link.id && styles.linkOptionTextSelected,
                      ]}
                    >
                      {t('complaints.linkNumber', { number: link.id })} - {t('complaints.supplierNumber', { number: link.supplier_id })}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>{t('complaints.description')}</Text>
            <TextInput
              style={styles.textArea}
              placeholder={t('complaints.descriptionPlaceholder')}
              placeholderTextColor={colors.foreground.tertiary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <Button
                variant="outline"
                onPress={() => {
                  setIsModalVisible(false);
                  setDescription('');
                  setSelectedLinkId(null);
                }}
                style={styles.modalButton}
              >
                {t('common.cancel')}
              </Button>
              <Button
                onPress={handleCreateComplaint}
                style={styles.modalButton}
              >
                {t('complaints.submit')}
              </Button>
            </View>
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
  actionSection: {
    marginBottom: spacing.lg,
  },
  createButton: {
    alignSelf: 'stretch',
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
  label: {
    ...typography.caption,
    color: colors.foreground.secondary,
    fontWeight: '600',
    marginBottom: spacing.sm,
    fontSize: 14,
  },
  linksContainer: {
    marginBottom: spacing.md,
    maxHeight: 200,
  },
  linkOption: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  linkOptionSelected: {
    borderColor: colors.foreground.primary,
    backgroundColor: colors.background.primary,
  },
  linkOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  linkOptionText: {
    ...typography.body,
    color: colors.foreground.secondary,
  },
  linkOptionTextSelected: {
    color: colors.foreground.primary,
    fontWeight: '600',
  },
  textArea: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    padding: spacing.md,
    ...typography.body,
    marginBottom: spacing.lg,
    minHeight: 100,
    color: colors.foreground.primary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalButton: {
    flex: 1,
  },
});
