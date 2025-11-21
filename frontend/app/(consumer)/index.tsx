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
import { useAuth } from '@/contexts/AuthContext';
import { suppliersApi, linksApi } from '@/api';
import { SupplierOut, LinkOut } from '@/types';
import { LinkStatus } from '@/enums';

export default function ConsumerHomeScreen() {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState<SupplierOut[]>([]);
  const [myLinks, setMyLinks] = useState<LinkOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [links, allSuppliers] = await Promise.all([
        linksApi.listMyLinks(),
        suppliersApi.listAll()
      ]);
      setMyLinks(links);
      setSuppliers(allSuppliers);
    } catch (error: any) {
      console.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load suppliers');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRequestLink = async (supplierId: number) => {
    try {
      await linksApi.requestLink(supplierId);
      Alert.alert('Success', 'Link request sent!');
      loadData();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to send link request');
    }
  };

  const getLinkStatus = (supplierId: number): LinkStatus | null => {
    const link = myLinks.find((l) => l.supplier_id === supplierId);
    return link ? link.status : null;
  };

  const renderSupplierItem = ({ item }: { item: SupplierOut }) => {
    const linkStatus = getLinkStatus(item.id);

    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <Text style={styles.supplierName}>{item.name}</Text>
          {item.description && (
            <Text style={styles.supplierDescription}>{item.description}</Text>
          )}
        </View>

        <View style={styles.cardActions}>
          {!linkStatus && (
            <TouchableOpacity
              style={styles.buttonPrimary}
              onPress={() => handleRequestLink(item.id)}
            >
              <Text style={styles.buttonTextPrimary}>Request Link</Text>
            </TouchableOpacity>
          )}

          {linkStatus === LinkStatus.PENDING && (
            <View style={styles.badgePending}>
              <Text style={styles.badgeText}>Pending</Text>
            </View>
          )}

          {linkStatus === LinkStatus.ACCEPTED && (
            <View style={styles.badgeAccepted}>
              <Text style={styles.badgeText}>Connected</Text>
            </View>
          )}

          {linkStatus === LinkStatus.BLOCKED && (
            <View style={styles.badgeBlocked}>
              <Text style={styles.badgeText}>Blocked</Text>
            </View>
          )}
        </View>
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Suppliers</Text>
        <Text style={styles.headerSubtitle}>Connect with suppliers to view their products</Text>
      </View>

      {suppliers.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No suppliers available yet</Text>
          <Text style={styles.emptySubtext}>
            Check back later or contact support to add suppliers
          </Text>
        </View>
      ) : (
        <FlatList
          data={suppliers}
          renderItem={renderSupplierItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={loadData} />
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
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
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
  cardContent: {
    marginBottom: 12,
  },
  supplierName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  supplierDescription: {
    fontSize: 14,
    color: '#666',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  buttonPrimary: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  buttonTextPrimary: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  badgePending: {
    backgroundColor: '#FFA500',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  badgeAccepted: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  badgeBlocked: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
