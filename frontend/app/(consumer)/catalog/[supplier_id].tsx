import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { productsApi, suppliersApi, linksApi } from '@/api';
import { ProductOut, SupplierOut, LinkOut } from '@/types';
import { Button, Card } from '@/components/ui';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { useTranslation } from '@/hooks/useTranslation';
import { colors, typography, spacing } from '@/theme';

export default function CatalogScreen() {
  const { supplier_id } = useLocalSearchParams<{ supplier_id: string }>();
  const router = useRouter();
  const { addItem, getItemQuantity } = useCart();
  const { showSuccess, showError, showWarning } = useToast();
  const { t } = useTranslation();

  const [supplier, setSupplier] = useState<SupplierOut | null>(null);
  const [products, setProducts] = useState<ProductOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [hasAcceptedLink, setHasAcceptedLink] = useState(false);
  const [isRequestingLink, setIsRequestingLink] = useState(false);

  useEffect(() => {
    loadData();
  }, [supplier_id]);

  const loadData = async () => {
    try {
      const supplierId = parseInt(supplier_id);

      // Load supplier info and check links
      const [allSuppliers, myLinks] = await Promise.all([
        suppliersApi.listAll(),
        linksApi.listMyLinks(),
      ]);

      const supplierData = allSuppliers.find((s) => s.id === supplierId);
      setSupplier(supplierData || null);

      // Check if we have an accepted link with this supplier
      const link = myLinks.find((l: LinkOut) => l.supplier_id === supplierId);
      const hasLink = link && link.status === 'ACCEPTED';
      setHasAcceptedLink(hasLink);

      if (hasLink) {
        // Only load products if we have an accepted link
        const productsData = await productsApi.listBySupplier(supplierId);
        setProducts(productsData.filter((p: ProductOut) => p.is_active));
      } else {
        setProducts([]);
      }
    } catch (error: any) {
      console.error('Failed to load catalog:', error);
      console.error('Error details:', {
        status: error.status,
        response: error.response?.data,
        config: error.config
      });
      showError(`Failed to load catalog: ${error.response?.data?.detail || error.message}`);
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (product: ProductOut) => {
    const quantity = quantities[product.id] || product.moq;

    if (quantity < product.moq) {
      showWarning(t('catalog.minQuantityError', { moq: product.moq, unit: product.unit }));
      return;
    }

    if (quantity > product.stock) {
      showWarning(t('catalog.stockError', { stock: product.stock, unit: product.unit }));
      return;
    }

    addItem(product, quantity);
    showSuccess(t('cart.addedToCart', { quantity, unit: product.unit, name: product.name }));
    setQuantities((prev) => ({ ...prev, [product.id]: product.moq }));
  };

  const handleQuantityChange = (productId: number, value: string) => {
    const quantity = parseInt(value) || 0;
    setQuantities((prev) => ({ ...prev, [productId]: quantity }));
  };

  const handleRequestLink = async () => {
    if (!supplier) return;

    setIsRequestingLink(true);
    try {
      await linksApi.requestLink(supplier.id);
      showSuccess(t('catalog.linkRequestSent', { supplier: supplier.name }));
      // Reload data to check new link status
      loadData();
    } catch (error: any) {
      console.error('Failed to request link:', error);
      showError(error.response?.data?.detail || t('catalog.linkRequestError'));
    } finally {
      setIsRequestingLink(false);
    }
  };

  const renderProductItem = ({ item }: { item: ProductOut }) => {
    const currentQuantity = quantities[item.id] || item.moq;
    const inCart = getItemQuantity(item.id);

    return (
      <Card style={styles.productCard}>
        <View style={styles.productHeader}>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productPrice}>
              ${item.price.toFixed(2)} / {item.unit}
            </Text>
          </View>
        </View>

        <View style={styles.productMeta}>
          <Text style={styles.metaText}>{t('catalog.stock')}: {item.stock} {item.unit}</Text>
          <Text style={styles.metaText}>{t('catalog.moq')}: {item.moq} {item.unit}</Text>
        </View>

        {inCart > 0 && (
          <View style={styles.inCartBadge}>
            <Text style={styles.inCartText}>{t('catalog.inCart', { count: inCart })}</Text>
          </View>
        )}

        <View style={styles.productActions}>
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Quantity:</Text>
            <TextInput
              style={styles.quantityInput}
              value={currentQuantity.toString()}
              onChangeText={(value) => handleQuantityChange(item.id, value)}
              keyboardType="numeric"
              placeholder={item.moq.toString()}
            />
            <Text style={styles.unitText}>{item.unit}</Text>
          </View>

          <Button
            onPress={() => handleAddToCart(item)}
            size="sm"
            style={styles.addButton}
          >
            {t('catalog.addToCart')}
          </Button>
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
    <>
      <Stack.Screen
        options={{
          title: supplier?.name || 'Catalog',
          headerBackTitle: 'Back',
        }}
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{supplier?.name}</Text>
          {supplier?.description && (
            <Text style={styles.headerSubtitle}>{supplier.description}</Text>
          )}
        </View>

        {!hasAcceptedLink ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{t('catalog.linkRequired')}</Text>
            <Text style={styles.emptySubtext}>
              {t('catalog.linkRequiredText', { supplier: supplier?.name })}
            </Text>
            <Button
              onPress={handleRequestLink}
              loading={isRequestingLink}
              disabled={isRequestingLink}
              style={styles.requestButton}
            >
              {isRequestingLink ? t('catalog.requesting') : t('catalog.requestLink')}
            </Button>
          </View>
        ) : products.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{t('catalog.noProducts')}</Text>
            <Text style={styles.emptySubtext}>{t('catalog.noProductsSubtext')}</Text>
          </View>
        ) : (
          <FlatList
            data={products}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
          />
        )}

        <View style={styles.footer}>
          <Button onPress={() => router.push('/(consumer)/cart')} fullWidth>
            {t('catalog.viewCart')}
          </Button>
        </View>
      </View>
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
  header: {
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  headerTitle: {
    ...typography.h2,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.foreground.secondary,
    marginTop: spacing.xs,
  },
  listContent: {
    padding: spacing.lg,
  },
  productCard: {
    marginBottom: spacing.md,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    ...typography.h4,
    marginBottom: spacing.xs,
  },
  productPrice: {
    ...typography.bodyLarge,
    color: colors.foreground.secondary,
    fontWeight: '600',
  },
  productMeta: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  metaText: {
    ...typography.caption,
    color: colors.foreground.secondary,
  },
  inCartBadge: {
    backgroundColor: colors.status.acceptedBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  inCartText: {
    ...typography.caption,
    color: colors.status.accepted,
    fontWeight: '600',
  },
  productActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  addButton: {
    minWidth: 100,
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
    ...typography.h3,
    color: colors.foreground.secondary,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.foreground.tertiary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  requestButton: {
    minWidth: 200,
  },
});
