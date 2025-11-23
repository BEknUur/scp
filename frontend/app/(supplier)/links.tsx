import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { linksApi } from '@/api';
import { LinkOut } from '@/types';
import { LinkStatus } from '@/enums';
import { Card, Button, Badge } from '@/components/ui';
import { colors, typography, spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/hooks/useTranslation';

export default function LinksScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [links, setLinks] = useState<LinkOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    try {
      const data = await linksApi.listMyLinks();
      setLinks(data);
    } catch (error: any) {
      console.error('Failed to load links:', error);
      Alert.alert(t('app.error'), t('supplierLinks.loadError'));
    } finally{
      setIsLoading(false);
    }
  };

  const handleAccept = async (linkId: number) => {
    try {
      await linksApi.acceptLink(linkId);
      Alert.alert(t('app.success'), t('supplierLinks.accepted'));
      loadLinks();
    } catch (error: any) {
      Alert.alert(t('app.error'), error.response?.data?.detail || t('supplierLinks.acceptError'));
    }
  };

  const handleBlock = async (linkId: number) => {
    Alert.alert(t('supplierLinks.blockTitle'), t('supplierLinks.blockConfirm'), [
      { text: t('app.cancel'), style: 'cancel' },
      {
        text: t('supplierLinks.block'),
        style: 'destructive',
        onPress: async () => {
          try {
            await linksApi.blockLink(linkId);
            Alert.alert(t('app.success'), t('supplierLinks.blocked'));
            loadLinks();
          } catch (error: any) {
            Alert.alert(t('app.error'), t('supplierLinks.blockError'));
          }
        },
      },
    ]);
  };

  const handleRemove = async (linkId: number) => {
    Alert.alert(t('supplierLinks.removeTitle'), t('supplierLinks.removeConfirm'), [
      { text: t('app.cancel'), style: 'cancel' },
      {
        text: t('supplierLinks.remove'),
        style: 'destructive',
        onPress: async () => {
          try {
            await linksApi.removeLink(linkId);
            Alert.alert(t('app.success'), t('supplierLinks.removed'));
            loadLinks();
          } catch (error: any) {
            Alert.alert(t('app.error'), t('supplierLinks.removeError'));
          }
        },
      },
    ]);
  };

  const handleChat = (consumerId: number) => {
    router.push(`/(supplier)/chat/${consumerId}` as any);
  };

  const getBadgeVariant = (status: LinkStatus): 'pending' | 'accepted' | 'rejected' => {
    switch (status) {
      case LinkStatus.ACCEPTED:
        return 'accepted';
      case LinkStatus.PENDING:
        return 'pending';
      case LinkStatus.BLOCKED:
      case LinkStatus.REMOVED:
        return 'rejected';
      default:
        return 'pending';
    }
  };

  const getStatusText = (status: LinkStatus) => {
    switch (status) {
      case LinkStatus.ACCEPTED:
        return t('links.connected');
      case LinkStatus.PENDING:
        return t('links.pending');
      case LinkStatus.BLOCKED:
        return t('links.blocked');
      case LinkStatus.REMOVED:
        return t('links.removed');
      default:
        return status;
    }
  };

  const renderLinkItem = (item: LinkOut) => {
    const isPending = item.status === LinkStatus.PENDING;
    const isAccepted = item.status === LinkStatus.ACCEPTED;

    return (
      <Card key={item.id} style={styles.linkCard}>
        <View style={styles.linkHeader}>
          <View style={styles.consumerInfo}>
            <View style={styles.consumerTitleRow}>
              <Ionicons
                name="person"
                size={20}
                color={colors.foreground.primary}
                style={styles.consumerIcon}
              />
              <Text style={styles.consumerName}>{t('supplierLinks.consumer', { number: item.consumer_id })}</Text>
            </View>
            <Text style={styles.linkId}>{t('supplierLinks.linkId', { id: item.id })}</Text>
          </View>
          <Badge variant={getBadgeVariant(item.status)}>{getStatusText(item.status)}</Badge>
        </View>

        {isPending && (
          <View style={styles.linkActions}>
            <Button
              variant="outline"
              size="sm"
              onPress={() => handleAccept(item.id)}
              style={styles.actionButton}
            >
              {t('supplierLinks.accept')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onPress={() => handleBlock(item.id)}
              style={styles.actionButton}
            >
              {t('supplierLinks.block')}
            </Button>
          </View>
        )}

        {isAccepted && (
          <View style={styles.linkActions}>
            <Button
              size="sm"
              onPress={() => handleChat(item.consumer_id)}
              style={styles.actionButton}
            >
              {t('links.chat')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onPress={() => handleRemove(item.id)}
              style={styles.actionButton}
            >
              {t('supplierLinks.remove')}
            </Button>
          </View>
        )}
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={styles.contentWrapper}>
          <View style={styles.header}>
            <Ionicons
              name="link"
              size={48}
              color={colors.foreground.primary}
              style={styles.headerIcon}
            />
            <Text style={styles.headerTitle}>{t('supplierLinks.title')}</Text>
            <Text style={styles.headerSubtitle}>
              {t('supplierLinks.subtitle')}
            </Text>
          </View>

          {links.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="link-outline"
                size={64}
                color={colors.foreground.tertiary}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyText}>{t('supplierLinks.noLinks')}</Text>
              <Text style={styles.emptySubtext}>
                {t('supplierLinks.noLinksSubtext')}
              </Text>
            </View>
          ) : (
            <View style={styles.linksList}>{links.map((link) => renderLinkItem(link))}</View>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerIcon: {
    marginBottom: spacing.md,
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
  linksList: {
    gap: spacing.md,
  },
  linkCard: {
    marginBottom: spacing.md,
  },
  linkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  consumerInfo: {
    flex: 1,
  },
  consumerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  consumerIcon: {
    marginRight: spacing.xs,
  },
  consumerName: {
    ...typography.h4,
    flex: 1,
  },
  linkId: {
    ...typography.caption,
    color: colors.foreground.secondary,
  },
  linkActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['4xl'],
    minHeight: 400,
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
