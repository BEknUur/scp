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
} from 'react-native';
import { useRouter } from 'expo-router';
import { linksApi, productsApi } from '@/api';
import { LinkOut } from '@/types';
import { LinkStatus } from '@/enums';

export default function MyLinksScreen() {
  const router = useRouter();
  const [links, setLinks] = useState<LinkOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    try {
      const data = await linksApi.listMyLinks();
      setLinks(data);
    } catch (error: any) {
      console.error('Failed to load links:', error);
      Alert.alert('Error', 'Failed to load connections');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const getStatusColor = (status: LinkStatus) => {
    switch (status) {
      case LinkStatus.ACCEPTED:
        return '#34C759';
      case LinkStatus.PENDING:
        return '#FFA500';
      case LinkStatus.BLOCKED:
        return '#FF3B30';
      case LinkStatus.REMOVED:
        return '#999';
      default:
        return '#999';
    }
  };

  const getStatusText = (status: LinkStatus) => {
    switch (status) {
      case LinkStatus.ACCEPTED:
        return 'Connected';
      case LinkStatus.PENDING:
        return 'Pending';
      case LinkStatus.BLOCKED:
        return 'Blocked';
      case LinkStatus.REMOVED:
        return 'Removed';
      default:
        return status;
    }
  };

  const handleViewProducts = async (supplierId: number) => {
    try {
      const products = await productsApi.listForSupplier(supplierId);
      // TODO: Navigate to products screen
      Alert.alert('Products', `Found ${products.length} products`);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to load products');
    }
  };

  const renderLinkItem = ({ item }: { item: LinkOut }) => {
    const statusColor = getStatusColor(item.status);
    const statusText = getStatusText(item.status);
    const isAccepted = item.status === LinkStatus.ACCEPTED;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.supplierInfo}>
            <Text style={styles.supplierName}>Supplier ID: {item.supplier_id}</Text>
            <Text style={styles.linkId}>Link #{item.id}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
        </View>

        {isAccepted && (
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.buttonSecondary}
              onPress={() => handleViewProducts(item.supplier_id)}
            >
              <Text style={styles.buttonTextSecondary}>View Products</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonPrimary}
              onPress={() => {
                // TODO: Navigate to chat
                Alert.alert('Chat', 'Chat feature coming soon');
              }}
            >
              <Text style={styles.buttonTextPrimary}>Chat</Text>
            </TouchableOpacity>
          </View>
        )}

        {item.status === LinkStatus.PENDING && (
          <Text style={styles.pendingText}>Waiting for supplier to accept...</Text>
        )}
      </View>
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
    <View style={styles.container}>
      {links.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No connections yet</Text>
          <Text style={styles.emptySubtext}>
            Go to Suppliers tab to request connections
          </Text>
        </View>
      ) : (
        <FlatList
          data={links}
          renderItem={renderLinkItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={loadLinks} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  supplierInfo: {
    flex: 1,
  },
  supplierName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  linkId: {
    fontSize: 12,
    color: '#999',
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  buttonPrimary: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonTextPrimary: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonSecondary: {
    flex: 1,
    backgroundColor: '#E5E5E5',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonTextSecondary: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  pendingText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
