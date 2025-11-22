import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ordersApi } from '@/api';
import { Order } from '@/types';
import { Card, Badge, Button } from '@/components/ui';
import { colors, typography, spacing } from '@/theme';
import { OrderStatus } from '@/enums';

export default function SupplierOrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
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
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadOrders();
  };

  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'pending';
      case OrderStatus.ACCEPTED:
        return 'accepted';
      case OrderStatus.COMPLETED:
        return 'completed';
      case OrderStatus.CANCELLED:
        return 'cancelled';
      default:
        return 'default';
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    return (
      <Card
        onPress={() => router.push(`/(supplier)/orders/${item.id}` as any)}
        style={styles.orderCard}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderTitle}>Order #{item.id}</Text>
            <Text style={styles.consumerName}>
              From: {item.consumer?.email || 'Consumer'}
            </Text>
          </View>
          <Badge variant={getStatusBadgeVariant(item.status)}>{item.status}</Badge>
        </View>

        <View style={styles.orderMeta}>
          <Text style={styles.metaText}>
            {item.items.length} item{item.items.length > 1 ? 's' : ''}
          </Text>
          <Text style={styles.metaText}>•</Text>
          <Text style={styles.metaText}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.orderFooter}>
          <Text style={styles.totalPrice}>${item.total_price.toFixed(2)}</Text>
          {item.status === OrderStatus.PENDING && (
            <Badge variant="pending">Action Required</Badge>
          )}
        </View>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.foreground.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <Button
          variant={filterStatus === null ? 'primary' : 'ghost'}
          size="sm"
          onPress={() => setFilterStatus(null)}
        >
          All
        </Button>
        <Button
          variant={filterStatus === OrderStatus.PENDING ? 'primary' : 'ghost'}
          size="sm"
          onPress={() => setFilterStatus(OrderStatus.PENDING)}
        >
          Pending
        </Button>
        <Button
          variant={filterStatus === OrderStatus.ACCEPTED ? 'primary' : 'ghost'}
          size="sm"
          onPress={() => setFilterStatus(OrderStatus.ACCEPTED)}
        >
          Accepted
        </Button>
        <Button
          variant={filterStatus === OrderStatus.COMPLETED ? 'primary' : 'ghost'}
          size="sm"
          onPress={() => setFilterStatus(OrderStatus.COMPLETED)}
        >
          Completed
        </Button>
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No orders found</Text>
          <Text style={styles.emptySubtext}>
            {filterStatus
              ? `No ${filterStatus.toLowerCase()} orders`
              : 'Orders from consumers will appear here'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
        />
      )}
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
  },
  filterContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  listContent: {
    padding: spacing.lg,
  },
  orderCard: {
    marginBottom: spacing.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  orderInfo: {
    flex: 1,
  },
  orderTitle: {
    ...typography.h4,
    marginBottom: spacing.xs,
  },
  consumerName: {
    ...typography.body,
    color: colors.foreground.secondary,
  },
  orderMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  metaText: {
    ...typography.caption,
    color: colors.foreground.tertiary,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalPrice: {
    ...typography.h4,
    fontWeight: '700',
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
});
