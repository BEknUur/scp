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

export default function LinksScreen() {
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
      Alert.alert('Error', 'Failed to load link requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (linkId: number) => {
    try {
      await linksApi.acceptLink(linkId);
      Alert.alert('Success', 'Link request accepted');
      loadLinks();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to accept link');
    }
  };

  const handleBlock = async (linkId: number) => {
    Alert.alert('Block Link', 'Are you sure you want to block this connection?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Block',
        style: 'destructive',
        onPress: async () => {
          try {
            await linksApi.blockLink(linkId);
            Alert.alert('Success', 'Link blocked');
            loadLinks();
          } catch (error: any) {
            Alert.alert('Error', 'Failed to block link');
          }
        },
      },
    ]);
  };

  const handleRemove = async (linkId: number) => {
    Alert.alert('Remove Link', 'Are you sure you want to remove this connection?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await linksApi.removeLink(linkId);
            Alert.alert('Success', 'Link removed');
            loadLinks();
          } catch (error: any) {
            Alert.alert('Error', 'Failed to remove link');
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
              <Text style={styles.consumerName}>Consumer #{item.consumer_id}</Text>
            </View>
            <Text style={styles.linkId}>Link ID: {item.id}</Text>
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
              Accept
            </Button>
            <Button
              variant="outline"
              size="sm"
              onPress={() => handleBlock(item.id)}
              style={styles.actionButton}
            >
              Block
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
              Chat
            </Button>
            <Button
              variant="outline"
              size="sm"
              onPress={() => handleRemove(item.id)}
              style={styles.actionButton}
            >
              Remove
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
            <Text style={styles.headerTitle}>Connection Requests</Text>
            <Text style={styles.headerSubtitle}>
              Manage consumer connections and chat requests
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
              <Text style={styles.emptyText}>No link requests yet</Text>
              <Text style={styles.emptySubtext}>
                Consumers will send connection requests to view your products
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
