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
import { Card, Input, Button } from '@/components/ui';
import { colors, typography, spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/hooks/useTranslation';
import { Role } from '@/enums';

export default function SupplierDashboardScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [supplier, setSupplier] = useState<SupplierOut | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOwner = user?.role === Role.SUPPLIER_OWNER;

  useEffect(() => {
    loadSupplier();
  }, []);

  const loadSupplier = async () => {
    try {
      const data = await suppliersApi.getMySupplier();
      setSupplier(data);
    } catch (error: any) {
      if (error.response?.status !== 404) {
        Alert.alert(t('app.error'), t('dashboard.loadError'));
      }
      setSupplier(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSupplier = async () => {
    if (!name.trim()) {
      Alert.alert(t('app.error'), t('dashboard.nameRequired'));
      return;
    }

    if (!isOwner) {
      Alert.alert(t('app.error'), t('dashboard.ownerOnly'));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
      };
      const created = await suppliersApi.create(payload);
      setSupplier(created);
      setName('');
      setDescription('');
      Alert.alert(t('app.success'), t('dashboard.createSuccess'));
    } catch (error: any) {
      Alert.alert(t('app.error'), error.response?.data?.detail || t('dashboard.createError'));
    } finally {
      setIsSubmitting(false);
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
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <Ionicons name="business" size={26} color={colors.background.primary} />
          </View>
          <Text style={styles.heroTitle}>{t('dashboard.title')}</Text>
          <Text style={styles.heroSubtitle}>{user?.email}</Text>
          <Text style={styles.heroTagline}>
            {t('dashboard.createProfileSubtext')}
          </Text>
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
          <>
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

            <Card style={styles.card}>
              <Text style={styles.cardTitle}>{t('dashboard.createProfileTitle')}</Text>
              <Text style={styles.cardHint}>{t('dashboard.createProfileSubtext')}</Text>
              <View style={styles.form}>
                <Input
                  label={t('dashboard.companyName')}
                  placeholder={t('dashboard.namePlaceholder')}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  containerStyle={styles.input}
                />
                <Input
                  label={t('dashboard.description')}
                  placeholder={t('dashboard.descriptionPlaceholder')}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  containerStyle={[styles.input, styles.multilineContainer]}
                />
                {!isOwner && (
                  <Text style={styles.helperText}>{t('dashboard.ownerOnly')}</Text>
                )}
                <Button
                  onPress={handleCreateSupplier}
                  loading={isSubmitting}
                  disabled={!isOwner}
                  fullWidth
                  style={styles.primaryButton}
                >
                  {t('dashboard.createProfileCta')}
                </Button>
              </View>
            </Card>
          </>
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
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
    padding: spacing['2xl'],
    paddingBottom: spacing['4xl'],
  },
  hero: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  heroBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.foreground.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  heroTitle: {
    ...typography.h2,
    marginTop: spacing.xs,
  },
  heroSubtitle: {
    ...typography.body,
    color: colors.foreground.secondary,
  },
  heroTagline: {
    ...typography.body,
    color: colors.foreground.tertiary,
    textAlign: 'center',
    maxWidth: 420,
  },
  card: {
    marginBottom: spacing['2xl'],
    padding: spacing.xl,
    borderRadius: 16,
    backgroundColor: colors.background.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    ...Platform.select({
      android: {
        elevation: 5,
      },
    }),
  },
  cardTitle: {
    ...typography.h4,
    marginBottom: spacing.sm,
    fontWeight: '700',
  },
  cardHint: {
    ...typography.body,
    color: colors.foreground.secondary,
    marginBottom: spacing.lg,
  },
  input: {
    marginBottom: spacing.md,
  },
  form: {
    gap: spacing.md,
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
    backgroundColor: '#0f172a0a',
    borderRadius: 16,
    marginBottom: spacing.lg,
  },
  emptyIcon: {
    marginBottom: spacing.lg,
  },
  emptyText: {
    ...typography.h3,
    color: colors.foreground.primary,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.foreground.secondary,
    textAlign: 'center',
    maxWidth: 360,
  },
  helperText: {
    ...typography.caption,
    color: colors.semantic.warning,
  },
  multilineContainer: {
    height: 120,
  },
  primaryButton: {
    marginTop: spacing.sm,
  },
});
