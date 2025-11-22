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
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { suppliersApi, linksApi } from '@/api';
import { SupplierOut, LinkOut } from '@/types';
import { LinkStatus } from '@/enums';
import { Card, Button, Badge } from '@/components/ui';
import { colors, typography, spacing } from '@/theme';

export default function ConsumerHomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
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
      <Card style={styles.supplierCard}>
        <View style={styles.supplierHeader}>
          <View style={styles.supplierInfo}>
            <Text style={styles.supplierName}>{item.name}</Text>
            {item.description && (
              <Text style={styles.supplierDescription}>{item.description}</Text>
            )}
          </View>
        </View>

        <View style={styles.supplierActions}>
          {!linkStatus && (
            <Button size="sm" onPress={() => handleRequestLink(item.id)}>
              Request Link
            </Button>
          )}

          {linkStatus === LinkStatus.PENDING && (
            <Badge variant="pending">Pending</Badge>
          )}

          {linkStatus === LinkStatus.ACCEPTED && (
            <View style={styles.connectedActions}>
              <Button
                size="sm"
                onPress={() => router.push(`/(consumer)/catalog/${item.id}` as any)}
                style={styles.viewButton}
              >
                View Products
              </Button>
              <Badge variant="accepted">Connected</Badge>
            </View>
          )}

          {linkStatus === LinkStatus.BLOCKED && (
            <Badge variant="rejected">Blocked</Badge>
          )}
        </View>
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        <View style={styles.contentWrapper}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Find Suppliers</Text>
            <Text style={styles.headerSubtitle}>
              Connect with suppliers to view their products
            </Text>
          </View>

          {suppliers.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No suppliers available yet</Text>
              <Text style={styles.emptySubtext}>
                Check back later or contact support to add suppliers
              </Text>
            </View>
          ) : (
            <View style={styles.suppliersList}>
              {suppliers.map((supplier) => renderSupplierItem({ item: supplier }))}
            </View>
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
  scrollContent: {
    flexGrow: 1,
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
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
  suppliersList: {
    gap: spacing.md,
  },
  supplierCard: {
    marginBottom: spacing.md,
  },
  supplierHeader: {
    marginBottom: spacing.md,
  },
  supplierInfo: {
    flex: 1,
  },
  supplierName: {
    ...typography.h4,
    marginBottom: spacing.xs,
  },
  supplierDescription: {
    ...typography.body,
    color: colors.foreground.secondary,
  },
  supplierActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.sm,
  },
  connectedActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  viewButton: {
    marginRight: 0,
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
