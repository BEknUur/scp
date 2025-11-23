import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ordersApi } from '@/api';
import { Order, OrderStatus } from '@/types';
import { Card, Badge, Button } from '@/components/ui';
import { colors, typography, spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/hooks/useTranslation';

export default function SupplierOrdersScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | null>(null);

  useEffect(() => {
    loadOrders();
  }, [filterStatus]);

  const loadOrders = async () => {
    try {
      const data = await ordersApi.getMyOrders(filterStatus || undefined);
      setOrders(data);
    } catch (error: any) {
      console.error('Failed to load orders:', error);
      Alert.alert(t('app.error'), t('orders.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: OrderStatus): 'pending' | 'accepted' | 'completed' | 'cancelled' => {
    switch (status) {
      case OrderStatus.CREATED:
        return 'pending';
      case OrderStatus.ACCEPTED:
        return 'accepted';
      case OrderStatus.COMPLETED:
        return 'completed';
      case OrderStatus.CANCELLED:
      case OrderStatus.REJECTED:
        return 'cancelled';
      default:
        return 'pending';
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.CREATED:
        return t('orders.status.created');
      case OrderStatus.ACCEPTED:
        return t('orders.status.accepted');
      case OrderStatus.COMPLETED:
        return t('orders.status.completed');
      case OrderStatus.CANCELLED:
        return t('orders.status.cancelled');
      case OrderStatus.REJECTED:
        return t('orders.status.rejected');
      default:
        return status;
    }
  };

  const renderOrderItem = (item: Order) => {
    const needsAction = item.status === OrderStatus.CREATED;

    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => router.push(`/(supplier)/orders/${item.id}` as any)}
      >
        <Card style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <View style={styles.orderInfo}>
              <View style={styles.orderTitleRow}>
                <Ionicons
                  name="receipt"
                  size={20}
                  color={colors.foreground.primary}
                  style={styles.orderIcon}
                />
                <Text style={styles.orderTitle}>{t('orders.orderNumber', { number: item.id })}</Text>
              </View>
              {item.consumer && (
                <View style={styles.consumerRow}>
                  <Ionicons
                    name="person"
                    size={14}
                    color={colors.foreground.secondary}
                    style={styles.consumerIcon}
                  />
                  <Text style={styles.consumerName}>
                    {item.consumer.email}
                  </Text>
                </View>
              )}
            </View>
            <Badge variant={getStatusBadgeVariant(item.status)}>{getStatusText(item.status)}</Badge>
          </View>

          <View style={styles.orderMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="cube" size={14} color={colors.foreground.tertiary} style={styles.metaIcon} />
              <Text style={styles.metaText}>
                {t('orders.itemCount', { count: item.items.length })}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="calendar" size={14} color={colors.foreground.tertiary} style={styles.metaIcon} />
              <Text style={styles.metaText}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <View style={styles.orderFooter}>
            <Text style={styles.totalLabel}>{t('orders.totalAmount')}</Text>
            <View style={styles.footerRight}>
              <Text style={styles.totalPrice}>${item.total_amount.toFixed(2)}</Text>
              {needsAction && (
                <Badge variant="pending" style={styles.actionBadge}>{t('supplierOrders.actionRequired')}</Badge>
              )}
            </View>
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
              name="clipboard"
              size={48}
              color={colors.foreground.primary}
              style={styles.headerIcon}
            />
            <Text style={styles.headerTitle}>{t('supplierOrders.title')}</Text>
            <Text style={styles.headerSubtitle}>
              {t('supplierOrders.subtitle')}
            </Text>
          </View>

          <View style={styles.filterSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <View style={styles.filterContainer}>
                <Button
                  variant={filterStatus === null ? 'primary' : 'ghost'}
                  size="sm"
                  onPress={() => setFilterStatus(null)}
                  style={styles.filterButton}
                >
                  {t('orders.filter.all')}
                </Button>
                <Button
                  variant={filterStatus === OrderStatus.CREATED ? 'primary' : 'ghost'}
                  size="sm"
                  onPress={() => setFilterStatus(OrderStatus.CREATED)}
                  style={styles.filterButton}
                >
                  {t('orders.filter.pending')}
                </Button>
                <Button
                  variant={filterStatus === OrderStatus.ACCEPTED ? 'primary' : 'ghost'}
                  size="sm"
                  onPress={() => setFilterStatus(OrderStatus.ACCEPTED)}
                  style={styles.filterButton}
                >
                  {t('orders.filter.accepted')}
                </Button>
                <Button
                  variant={filterStatus === OrderStatus.COMPLETED ? 'primary' : 'ghost'}
                  size="sm"
                  onPress={() => setFilterStatus(OrderStatus.COMPLETED)}
                  style={styles.filterButton}
                >
                  {t('orders.filter.completed')}
                </Button>
              </View>
            </ScrollView>
          </View>

          {orders.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="clipboard-outline"
                size={64}
                color={colors.foreground.tertiary}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyText}>{t('orders.noOrders')}</Text>
              <Text style={styles.emptySubtext}>
                {filterStatus
                  ? t('orders.noFilteredOrders', { status: getStatusText(filterStatus).toLowerCase() })
                  : t('supplierOrders.noOrdersSubtext')}
              </Text>
            </View>
          ) : (
            <View style={styles.ordersList}>{orders.map((order) => renderOrderItem(order))}</View>
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
  filterSection: {
    marginBottom: spacing.lg,
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterButton: {
    minWidth: 80,
  },
  ordersList: {
    gap: spacing.md,
  },
  orderCard: {
    marginBottom: spacing.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  orderInfo: {
    flex: 1,
  },
  orderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  orderIcon: {
    marginRight: spacing.xs,
  },
  orderTitle: {
    ...typography.h4,
    flex: 1,
  },
  consumerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  consumerIcon: {
    marginRight: spacing.xs,
  },
  consumerName: {
    ...typography.body,
    color: colors.foreground.secondary,
    fontSize: 14,
  },
  orderMeta: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    marginRight: spacing.xs,
  },
  metaText: {
    ...typography.caption,
    color: colors.foreground.tertiary,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
    paddingTop: spacing.sm,
  },
  totalLabel: {
    ...typography.body,
    color: colors.foreground.secondary,
    fontSize: 14,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  totalPrice: {
    ...typography.h3,
    fontWeight: '700',
  },
  actionBadge: {
    marginLeft: spacing.xs,
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
