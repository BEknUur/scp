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
import { Order } from '@/types';
import { Card, Badge } from '@/components/ui';
import { colors, typography, spacing } from '@/theme';
import { OrderStatus } from '@/enums';

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

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.foreground.primary} />
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
            <Text style={styles.headerTitle}>Order #{order.id}</Text>
            <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
          </View>
          <Text style={styles.supplierName}>{order.supplier?.name}</Text>
          <Text style={styles.dateText}>
            Placed on {new Date(order.created_at).toLocaleString()}
          </Text>
        </Card>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {order.items.map((item, index) => (
            <Card key={index} style={styles.itemCard}>
              <View style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.product.name}</Text>
                  <Text style={styles.itemMeta}>
                    {item.quantity} {item.product.unit} × ${item.price.toFixed(2)}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>
                  ${(item.quantity * item.price).toFixed(2)}
                </Text>
              </View>
            </Card>
          ))}
        </View>

        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>${order.total_price.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>${order.total_price.toFixed(2)}</Text>
          </View>
        </Card>

        {order.status === OrderStatus.CANCELLED && (
          <Card style={styles.infoCard}>
            <Text style={styles.infoTitle}>Order Cancelled</Text>
            <Text style={styles.infoText}>
              This order was cancelled by the supplier.
            </Text>
          </Card>
        )}

        {order.status === OrderStatus.PENDING && (
          <Card style={styles.infoCard}>
            <Text style={styles.infoTitle}>Waiting for Supplier</Text>
            <Text style={styles.infoText}>
              Your order is pending approval from the supplier.
            </Text>
          </Card>
        )}

        {order.status === OrderStatus.ACCEPTED && (
          <Card style={styles.infoCard}>
            <Text style={styles.infoTitle}>Order Accepted</Text>
            <Text style={styles.infoText}>
              Your order has been accepted and is being prepared.
            </Text>
          </Card>
        )}

        {order.status === OrderStatus.COMPLETED && (
          <Card style={styles.infoCard}>
            <Text style={styles.infoTitle}>Order Completed</Text>
            <Text style={styles.infoText}>
              This order has been completed successfully.
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
    marginBottom: spacing.sm,
  },
  headerTitle: {
    ...typography.h2,
  },
  supplierName: {
    ...typography.bodyLarge,
    color: colors.foreground.secondary,
    marginBottom: spacing.xs,
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
  infoTitle: {
    ...typography.h4,
    marginBottom: spacing.sm,
  },
  infoText: {
    ...typography.body,
    color: colors.foreground.secondary,
  },
});
