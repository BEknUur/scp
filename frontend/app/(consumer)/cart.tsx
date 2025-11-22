import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { useTranslation } from '@/hooks/useTranslation';
import { ordersApi } from '@/api';
import { Button, Card } from '@/components/ui';
import { colors, typography, spacing } from '@/theme';
import { OrderCreate } from '@/types';

export default function CartScreen() {
  const router = useRouter();
  const { items, totalPrice, removeItem, updateQuantity, clearCart } = useCart();
  const { showSuccess, showError } = useToast();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdateQuantity = (productId: number, value: string) => {
    const quantity = parseInt(value) || 0;
    updateQuantity(productId, quantity);
  };

  const handleRemoveItem = (productId: number, productName: string) => {
    Alert.alert(t('cart.remove'), t('cart.removeConfirm', { name: productName }), [
      { text: t('app.cancel'), style: 'cancel' },
      { text: t('cart.remove'), style: 'destructive', onPress: () => removeItem(productId) },
    ]);
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      Alert.alert(t('cart.empty'), t('cart.emptySubtext'));
      return;
    }

    // Group items by supplier
    const itemsBySupplier = items.reduce((acc, item) => {
      const supplierId = item.product.supplier_id;
      if (!acc[supplierId]) {
        acc[supplierId] = [];
      }
      acc[supplierId].push(item);
      return acc;
    }, {} as Record<number, typeof items>);

    setIsSubmitting(true);

    try {
      // Create separate order for each supplier
      const orderPromises = Object.entries(itemsBySupplier).map(([supplierId, supplierItems]) => {
        const orderData: OrderCreate = {
          supplier_id: parseInt(supplierId),
          items: supplierItems.map((item) => ({
            product_id: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
          })),
        };
        return ordersApi.create(orderData);
      });

      const createdOrders = await Promise.all(orderPromises);

      // Calculate total items and amount
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = totalPrice;

      // Show success toast
      showSuccess(
        t('cart.orderSuccess', {
          count: createdOrders.length,
          items: totalItems,
          total: totalAmount.toFixed(2)
        }),
        6000
      );

      // Clear cart and show options
      clearCart();

      Alert.alert(
        t('cart.whatsNext'),
        `Your order${createdOrders.length > 1 ? 's have' : ' has'} been sent to the supplier${createdOrders.length > 1 ? 's' : ''} for review.`,
        [
          {
            text: t('cart.continueShopping'),
            onPress: () => router.push('/(consumer)' as any),
          },
          {
            text: t('cart.viewOrders'),
            onPress: () => router.push('/(consumer)/orders' as any),
          },
        ]
      );
    } catch (error: any) {
      console.error('Failed to create order:', error);
      showError(error.response?.data?.detail || 'Failed to create order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCartItem = ({ item }: { item: typeof items[0] }) => {
    const { product, quantity } = item;
    const subtotal = product.price * quantity;

    return (
      <Card style={styles.cartItem}>
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.supplierName}>{product.supplier?.name}</Text>
          </View>
          <Text style={styles.itemPrice}>${product.price.toFixed(2)}</Text>
        </View>

        <View style={styles.itemDetails}>
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>{t('cart.quantity')}:</Text>
            <TextInput
              style={styles.quantityInput}
              value={quantity.toString()}
              onChangeText={(value) => handleUpdateQuantity(product.id, value)}
              keyboardType="numeric"
            />
            <Text style={styles.unitText}>{product.unit}</Text>
          </View>

          <Text style={styles.subtotal}>${subtotal.toFixed(2)}</Text>
        </View>

        <View style={styles.itemActions}>
          <Text style={styles.metaText}>
            MOQ: {product.moq} {product.unit} • Stock: {product.stock} {product.unit}
          </Text>
          <Button
            variant="ghost"
            size="sm"
            onPress={() => handleRemoveItem(product.id, product.name)}
          >
            {t('cart.remove')}
          </Button>
        </View>
      </Card>
    );
  };

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{t('cart.empty')}</Text>
          <Text style={styles.emptySubtext}>{t('cart.emptySubtext')}</Text>
          <Button
            onPress={() => router.push('/(consumer)' as any)}
            style={styles.browseButton}
          >
            {t('cart.browseSuppliers')}
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.product.id.toString()}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={
          <Card style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('cart.totalItems')}:</Text>
              <Text style={styles.summaryValue}>{items.length}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>{t('cart.totalPrice')}:</Text>
              <Text style={styles.totalValue}>${totalPrice.toFixed(2)}</Text>
            </View>
          </Card>
        }
      />

      <View style={styles.footer}>
        <Button
          onPress={handleCheckout}
          loading={isSubmitting}
          disabled={isSubmitting}
          fullWidth
        >
          {isSubmitting ? t('cart.creatingOrder') : t('cart.placeOrder')}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  listContent: {
    padding: spacing.lg,
  },
  cartItem: {
    marginBottom: spacing.md,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  itemInfo: {
    flex: 1,
  },
  productName: {
    ...typography.h4,
    marginBottom: spacing.xs,
  },
  supplierName: {
    ...typography.caption,
    color: colors.foreground.secondary,
  },
  itemPrice: {
    ...typography.bodyLarge,
    fontWeight: '600',
    color: colors.foreground.secondary,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  quantityLabel: {
    ...typography.body,
    color: colors.foreground.secondary,
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    width: 60,
    textAlign: 'center',
    ...typography.body,
  },
  unitText: {
    ...typography.caption,
    color: colors.foreground.tertiary,
  },
  subtotal: {
    ...typography.h4,
    fontWeight: '700',
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaText: {
    ...typography.caption,
    color: colors.foreground.secondary,
  },
  summaryCard: {
    marginTop: spacing.md,
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
  totalLabel: {
    ...typography.h4,
  },
  totalValue: {
    ...typography.h3,
    fontWeight: '700',
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['4xl'],
  },
  emptyText: {
    ...typography.h2,
    color: colors.foreground.secondary,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.foreground.tertiary,
    marginBottom: spacing.xl,
  },
  browseButton: {
    minWidth: 200,
  },
});
