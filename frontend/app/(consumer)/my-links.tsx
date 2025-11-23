import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { linksApi, suppliersApi } from '@/api';
import { LinkOut, SupplierOut } from '@/types';
import { LinkStatus } from '@/enums';
import { Card, Button, Badge } from '@/components/ui';
import { colors, typography, spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/hooks/useTranslation';

export default function MyLinksScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [links, setLinks] = useState<LinkOut[]>([]);
  const [suppliers, setSuppliers] = useState<Map<number, SupplierOut>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [linksData, suppliersData] = await Promise.all([
        linksApi.listMyLinks(),
        suppliersApi.listAll(),
      ]);

      const suppliersMap = new Map<number, SupplierOut>();
      suppliersData.forEach((supplier) => {
        suppliersMap.set(supplier.id, supplier);
      });

      setLinks(linksData);
      setSuppliers(suppliersMap);
    } catch (error: any) {
      console.error('Failed to load links:', error);
      Alert.alert(t('app.error'), t('links.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewProducts = (supplierId: number) => {
    router.push(`/(consumer)/catalog/${supplierId}` as any);
  };

  const handleChat = (supplierId: number) => {
    router.push(`/(consumer)/chat/${supplierId}` as any);
  };

  const getBadgeVariant = (status: LinkStatus): 'pending' | 'accepted' | 'rejected' => {
    switch (status) {
      case LinkStatus.ACCEPTED:
        return 'accepted';
      case LinkStatus.PENDING:
        return 'pending';
      case LinkStatus.BLOCKED:
      case LinkStatus.REMOVED:
        return 'rejected';
      default:
        return 'pending';
    }
  };

  const getStatusText = (status: LinkStatus) => {
    switch (status) {
      case LinkStatus.ACCEPTED:
        return t('links.connected');
      case LinkStatus.PENDING:
        return t('links.pending');
      case LinkStatus.BLOCKED:
        return t('links.blocked');
      case LinkStatus.REMOVED:
        return t('links.removed');
      default:
        return status;
    }
  };

  const renderLinkItem = (item: LinkOut) => {
    const supplier = suppliers.get(item.supplier_id);
    const isAccepted = item.status === LinkStatus.ACCEPTED;

    return (
      <Card key={item.id} style={styles.linkCard}>
        <View style={styles.linkHeader}>
          <View style={styles.supplierInfo}>
            <View style={styles.supplierTitleRow}>
              <Ionicons
                name="business"
                size={20}
                color={colors.foreground.primary}
                style={styles.supplierIcon}
              />
              <Text style={styles.supplierName}>
                {supplier?.name || `Supplier #${item.supplier_id}`}
              </Text>
            </View>
            {supplier?.description && (
              <Text style={styles.supplierDescription} numberOfLines={2}>
                {supplier.description}
              </Text>
            )}
          </View>
          <Badge variant={getBadgeVariant(item.status)}>{getStatusText(item.status)}</Badge>
        </View>

        {isAccepted && (
          <View style={styles.linkActions}>
            <Button
              variant="outline"
              size="sm"
              onPress={() => handleViewProducts(item.supplier_id)}
              style={styles.actionButton}
            >
              {t('links.viewProducts')}
            </Button>
            <Button
              size="sm"
              onPress={() => handleChat(item.supplier_id)}
              style={styles.actionButton}
            >
              {t('links.chat')}
            </Button>
          </View>
        )}

        {item.status === LinkStatus.PENDING && (
          <View style={styles.pendingContainer}>
            <Ionicons
              name="time-outline"
              size={16}
              color={colors.foreground.secondary}
              style={styles.pendingIcon}
            />
            <Text style={styles.pendingText}>{t('links.waitingForAccept')}</Text>
          </View>
        )}
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
              name="link"
              size={48}
              color={colors.foreground.primary}
              style={styles.headerIcon}
            />
            <Text style={styles.headerTitle}>{t('links.title')}</Text>
            <Text style={styles.headerSubtitle}>
              {t('links.subtitle')}
            </Text>
          </View>

          {links.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="link-outline"
                size={64}
                color={colors.foreground.tertiary}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyText}>{t('links.noLinks')}</Text>
              <Text style={styles.emptySubtext}>
                {t('links.noLinksSubtext')}
              </Text>
            </View>
          ) : (
            <View style={styles.linksList}>{links.map((link) => renderLinkItem(link))}</View>
          )}
        </View>
      </View>
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
  linksList: {
    gap: spacing.md,
  },
  linkCard: {
    marginBottom: spacing.md,
  },
  linkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  supplierInfo: {
    flex: 1,
  },
  supplierTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  supplierIcon: {
    marginRight: spacing.xs,
  },
  supplierName: {
    ...typography.h4,
    flex: 1,
  },
  supplierDescription: {
    ...typography.body,
    color: colors.foreground.secondary,
    marginTop: spacing.xs,
  },
  linkActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  pendingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
    marginTop: spacing.sm,
  },
  pendingIcon: {
    marginRight: spacing.xs,
  },
  pendingText: {
    ...typography.caption,
    color: colors.foreground.secondary,
    fontStyle: 'italic',
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
});
