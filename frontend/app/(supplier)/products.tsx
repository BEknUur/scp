import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  Switch,
} from 'react-native';
import { productsApi } from '@/api';
import { ProductOut, ProductCreate, ProductUpdate } from '@/types';

export default function ProductsScreen() {
  const [products, setProducts] = useState<ProductOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductOut | null>(null);

  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [moq, setMoq] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productsApi.listMyProducts();
      setProducts(data);
    } catch (error: any) {
      console.error('Failed to load products:', error);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setUnit('kg');
    setPrice('');
    setStock('0');
    setMoq('1');
    setIsActive(true);
    setIsModalVisible(true);
  };

  const openEditModal = (product: ProductOut) => {
    setEditingProduct(product);
    setName(product.name);
    setUnit(product.unit);
    setPrice(product.price.toString());
    setStock(product.stock.toString());
    setMoq(product.moq.toString());
    setIsActive(product.is_active);
    setIsModalVisible(true);
  };

  const handleSaveProduct = async () => {
    if (!name.trim() || !unit.trim() || !price.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      if (editingProduct) {
        const updateData: ProductUpdate = {
          name: name.trim(),
          unit: unit.trim(),
          price: parseFloat(price),
          stock: parseInt(stock) || 0,
          moq: parseInt(moq) || 1,
          is_active: isActive,
        };
        await productsApi.update(editingProduct.id, updateData);
        Alert.alert('Success', 'Product updated');
      } else {
        const createData: ProductCreate = {
          name: name.trim(),
          unit: unit.trim(),
          price: parseFloat(price),
          stock: parseInt(stock) || 0,
          moq: parseInt(moq) || 1,
        };
        await productsApi.create(createData);
        Alert.alert('Success', 'Product created');
      }
      setIsModalVisible(false);
      loadProducts();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to save product');
    }
  };

  const handleDeleteProduct = (productId: number) => {
    Alert.alert('Delete Product', 'Are you sure you want to delete this product?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await productsApi.delete(productId);
            Alert.alert('Success', 'Product deleted');
            loadProducts();
          } catch (error: any) {
            Alert.alert('Error', 'Failed to delete product');
          }
        },
      },
    ]);
  };

  const renderProductItem = ({ item }: { item: ProductOut }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.titleRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.name.slice(0, 1).toUpperCase()}</Text>
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productPrice}>${item.price} / {item.unit}</Text>
            <Text style={styles.productSubtext}>Stock: {item.stock} • MOQ: {item.moq} {item.unit}</Text>
          </View>
        </View>
        <View style={[styles.statusPill, item.is_active ? styles.activePill : styles.inactivePill]}>
          <Text style={item.is_active ? styles.statusActiveText : styles.statusInactiveText}>
            {item.is_active ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.buttonEdit}
          onPress={() => openEditModal(item)}
        >
          <Text style={styles.buttonEditText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonDelete}
          onPress={() => handleDeleteProduct(item.id)}
        >
          <Text style={styles.buttonDeleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Products</Text>
          <Text style={styles.headerSubtitle}>Manage items in your catalog</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {products.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No products yet</Text>
          <Text style={styles.emptySubtext}>Add products to your catalog</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={loadProducts} />
          }
        />
      )}

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </Text>

            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Product name"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Unit *</Text>
            <TextInput
              style={styles.input}
              placeholder="kg, liter, pack, etc."
              value={unit}
              onChangeText={setUnit}
            />

            <Text style={styles.label}>Price *</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
            />

            <Text style={styles.label}>Stock</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              value={stock}
              onChangeText={setStock}
              keyboardType="number-pad"
            />

            <Text style={styles.label}>Minimum Order Quantity (MOQ)</Text>
            <TextInput
              style={styles.input}
              placeholder="1"
              value={moq}
              onChangeText={setMoq}
              keyboardType="number-pad"
            />

            {editingProduct && (
              <View style={styles.switchRow}>
                <Text style={styles.label}>Active</Text>
                <Switch value={isActive} onValueChange={setIsActive} />
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.buttonSecondary}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.buttonTextSecondary}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonPrimary} onPress={handleSaveProduct}>
                <Text style={styles.buttonTextPrimary}>Save</Text>
              </TouchableOpacity>
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
    backgroundColor: '#f6f7f8',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  headerSubtitle: {
    marginTop: 2,
    color: '#6b7280',
    fontSize: 13,
  },
  addButton: {
    minWidth: 68,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 18,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  avatar: {
    height: 42,
    width: 42,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontWeight: '800',
    color: '#111827',
    fontSize: 18,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
  },
  productSubtext: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 74,
    alignItems: 'center',
  },
  activePill: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
  },
  inactivePill: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
  },
  statusActiveText: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 12,
  },
  statusInactiveText: {
    color: '#6b7280',
    fontWeight: '600',
    fontSize: 12,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    justifyContent: 'flex-end',
  },
  buttonEdit: {
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 86,
    alignItems: 'center',
  },
  buttonEditText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  buttonDelete: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 86,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  buttonDeleteText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 14,
    color: '#111827',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  buttonPrimary: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonTextPrimary: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonSecondary: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonTextSecondary: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
  },
});
