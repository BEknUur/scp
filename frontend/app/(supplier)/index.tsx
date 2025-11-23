import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { suppliersApi } from '@/api';
import { SupplierOut } from '@/types';
import { Card } from '@/components/ui';
import { colors, typography, spacing, radius } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/hooks/useTranslation';

export default function SupplierDashboardScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [supplier, setSupplier] = useState<SupplierOut | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSupplier();
  }, []);

  const loadSupplier = async () => {
    try {
      const data = await suppliersApi.getMySupplier();
      setSupplier(data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        Alert.alert(
          t('dashboard.companyNotFound'),
          t('dashboard.createProfileMessage'),
          [{ text: t('app.confirm') }]
        );
      }
    } finally {
      setIsLoading(false);
    }
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
        {/* Header with Avatar */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="business" size={32} color={colors.background.primary} />
          </View>
          <Text style={styles.headerTitle}>{t('dashboard.title')}</Text>
          <Text style={styles.headerSubtitle}>{user?.email}</Text>
        </View>

        {/* Company Information Card */}
        {supplier ? (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>{t('dashboard.companyInformation')}</Text>

            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.label}>{t('dashboard.companyName')}</Text>
                <Text style={styles.value}>{supplier.name}</Text>
              </View>

              {supplier.description && (
                <View style={styles.infoItem}>
                  <Text style={styles.label}>{t('dashboard.description')}</Text>
                  <Text style={styles.value}>{supplier.description}</Text>
                </View>
              )}
            </View>
          </Card>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              name="business-outline"
              size={64}
              color={colors.foreground.tertiary}
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyText}>{t('dashboard.noCompanyFound')}</Text>
            <Text style={styles.emptySubtext}>
              {t('dashboard.createProfileSubtext')}
            </Text>
          </View>
        )}
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
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.foreground.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerTitle: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.foreground.secondary,
  },
  card: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  cardTitle: {
    ...typography.h4,
    marginBottom: spacing.lg,
    fontWeight: '600',
  },
  infoGrid: {
    gap: spacing.md,
  },
  infoItem: {
    gap: spacing.xs,
  },
  label: {
    ...typography.caption,
    color: colors.foreground.secondary,
    fontWeight: '500',
    fontSize: 12,
  },
  value: {
    ...typography.body,
    color: colors.foreground.primary,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['4xl'],
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
