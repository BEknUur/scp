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
import { linksApi } from '@/api';
import { LinkOut } from '@/types';
import { LinkStatus } from '@/enums';

export default function LinksScreen() {
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
      Alert.alert('Error', 'Failed to load link requests');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
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

  const renderLinkItem = ({ item }: { item: LinkOut }) => {
    const statusColor = getStatusColor(item.status);
    const statusText = getStatusText(item.status);
    const isPending = item.status === LinkStatus.PENDING;
    const isAccepted = item.status === LinkStatus.ACCEPTED;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.consumerInfo}>
            <Text style={styles.consumerName}>Consumer ID: {item.consumer_id}</Text>
            <Text style={styles.linkId}>Link #{item.id}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
        </View>

        {isPending && (
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.buttonAccept}
              onPress={() => handleAccept(item.id)}
            >
              <Text style={styles.buttonTextAccept}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonReject}
              onPress={() => handleBlock(item.id)}
            >
              <Text style={styles.buttonTextReject}>Block</Text>
            </TouchableOpacity>
          </View>
        )}

        {isAccepted && (
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.buttonSecondary}
              onPress={() => {
                Alert.alert('Chat', 'Chat feature coming soon');
              }}
            >
              <Text style={styles.buttonTextSecondary}>Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonDanger}
              onPress={() => handleRemove(item.id)}
            >
              <Text style={styles.buttonTextDanger}>Remove</Text>
            </TouchableOpacity>
          </View>
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
          <Text style={styles.emptyText}>No link requests yet</Text>
          <Text style={styles.emptySubtext}>
            Consumers will send connection requests to view your products
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
  consumerInfo: {
    flex: 1,
  },
  consumerName: {
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
  buttonAccept: {
    flex: 1,
    backgroundColor: '#34C759',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonTextAccept: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonReject: {
    flex: 1,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonTextReject: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonSecondary: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonTextSecondary: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDanger: {
    flex: 1,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonTextDanger: {
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
