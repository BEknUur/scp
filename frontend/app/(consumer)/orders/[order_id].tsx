import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ordersApi } from '@/api';
import { Order, OrderStatus } from '@/types';
import { Card, Badge } from '@/components/ui';
import { colors, typography, spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';

export default function OrderDetailScreen() {
  const { order_id } = useLocalSearchParams<{ order_id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [order_id]);

  const loadOrder = async () => {
    try {
      const orderId = parseInt(order_id);
      const data = await ordersApi.getDetail(orderId);
      setOrder(data);
    } catch (error: any) {
      console.error('Failed to load order:', error);
      Alert.alert('Error', 'Failed to load order details');
      router.back();
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
        return 'Pending';
      case OrderStatus.ACCEPTED:
        return 'Accepted';
      case OrderStatus.COMPLETED:
        return 'Completed';
      case OrderStatus.CANCELLED:
        return 'Cancelled';
      case OrderStatus.REJECTED:
        return 'Rejected';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: `Order #${order.id}`,
          headerBackTitle: 'Orders',
        }}
      />
      <ScrollView style={styles.container}>
        <Card style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={styles.headerInfo}>
              <View style={styles.orderTitleRow}>
                <Ionicons
                  name="receipt"
                  size={24}
                  color={colors.foreground.primary}
                  style={styles.orderIcon}
                />
                <Text style={styles.headerTitle}>Order #{order.id}</Text>
              </View>
              {order.supplier && (
                <View style={styles.supplierRow}>
                  <Ionicons
                    name="business"
                    size={16}
                    color={colors.foreground.secondary}
                    style={styles.supplierIcon}
                  />
                  <Text style={styles.supplierName}>{order.supplier.name}</Text>
                </View>
              )}
            </View>
            <Badge variant={getStatusBadgeVariant(order.status)}>{getStatusText(order.status)}</Badge>
          </View>
          <View style={styles.dateRow}>
            <Ionicons
              name="calendar"
              size={14}
              color={colors.foreground.tertiary}
              style={styles.dateIcon}
            />
            <Text style={styles.dateText}>
              Placed on {new Date(order.created_at).toLocaleString()}
            </Text>
          </View>
        </Card>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {order.items.map((item, index) => {
            const unitPrice = item.unit_price ?? (item as any).price ?? item.product?.price ?? 0;
            const total = (item.quantity || 0) * unitPrice;
            const unitLabel = item.product?.unit || 'unit';
            const productName = item.product?.name || 'Item';

            return (
              <Card key={index} style={styles.itemCard}>
                <View style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{productName}</Text>
                    <Text style={styles.itemMeta}>
                      {item.quantity} {unitLabel} × ${unitPrice.toFixed(2)}
                    </Text>
                  </View>
                  <Text style={styles.itemTotal}>${total.toFixed(2)}</Text>
                </View>
              </Card>
            );
          })}
        </View>

        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>${order.total_amount.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>${order.total_amount.toFixed(2)}</Text>
          </View>
        </Card>

        {order.status === OrderStatus.CREATED && (
          <Card style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons
                name="time"
                size={20}
                color={colors.foreground.primary}
                style={styles.infoIcon}
              />
              <Text style={styles.infoTitle}>Waiting for Supplier</Text>
            </View>
            <Text style={styles.infoText}>
              Your order is pending approval from the supplier.
            </Text>
          </Card>
        )}

        {order.status === OrderStatus.ACCEPTED && (
          <Card style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={colors.foreground.primary}
                style={styles.infoIcon}
              />
              <Text style={styles.infoTitle}>Order Accepted</Text>
            </View>
            <Text style={styles.infoText}>
              Your order has been accepted and is being prepared.
            </Text>
          </Card>
        )}

        {order.status === OrderStatus.COMPLETED && (
          <Card style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons
                name="checkmark-done-circle"
                size={20}
                color={colors.foreground.primary}
                style={styles.infoIcon}
              />
              <Text style={styles.infoTitle}>Order Completed</Text>
            </View>
            <Text style={styles.infoText}>
              This order has been completed successfully.
            </Text>
          </Card>
        )}

        {(order.status === OrderStatus.CANCELLED || order.status === OrderStatus.REJECTED) && (
          <Card style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons
                name="close-circle"
                size={20}
                color={colors.foreground.primary}
                style={styles.infoIcon}
              />
              <Text style={styles.infoTitle}>Order Cancelled</Text>
            </View>
            <Text style={styles.infoText}>
              This order was cancelled by the supplier.
            </Text>
          </Card>
        )}
      </ScrollView>
    </>
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
  headerCard: {
    margin: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  headerInfo: {
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
  headerTitle: {
    ...typography.h2,
  },
  supplierRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  supplierIcon: {
    marginRight: spacing.xs,
  },
  supplierName: {
    ...typography.body,
    color: colors.foreground.secondary,
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
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    marginBottom: spacing.md,
  },
  itemCard: {
    marginBottom: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
    fontSize: 15,
  },
  itemMeta: {
    ...typography.caption,
    color: colors.foreground.secondary,
  },
  itemTotal: {
    ...typography.bodyLarge,
    fontWeight: '700',
  },
  summaryCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    ...typography.body,
    color: colors.foreground.secondary,
  },
  summaryValue: {
    ...typography.body,
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  totalLabel: {
    ...typography.h4,
  },
  totalValue: {
    ...typography.h3,
    fontWeight: '700',
  },
  infoCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.background.tertiary,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoIcon: {
    marginRight: spacing.xs,
  },
  infoTitle: {
    ...typography.h4,
  },
  infoText: {
    ...typography.body,
    color: colors.foreground.secondary,
    fontSize: 15,
  },
});
