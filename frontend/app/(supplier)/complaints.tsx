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
  Modal,
} from 'react-native';
import { complaintsApi } from '@/api';
import { ComplaintOut } from '@/types';
import { ComplaintStatus } from '@/enums';

export default function ComplaintsScreen() {
  const [complaints, setComplaints] = useState<ComplaintOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintOut | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      const data = await complaintsApi.list(undefined, true);
      setComplaints(data);
    } catch (error: any) {
      console.error('Failed to load complaints:', error);
      Alert.alert('Error', 'Failed to load complaints');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleStatusChange = async (complaintId: number, newStatus: ComplaintStatus) => {
    try {
      await complaintsApi.updateStatus(complaintId, { status: newStatus });
      Alert.alert('Success', 'Status updated');
      setIsModalVisible(false);
      setSelectedComplaint(null);
      loadComplaints();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to update status');
    }
  };

  const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case ComplaintStatus.OPEN:
        return '#FFA500';
      case ComplaintStatus.IN_PROGRESS:
        return '#007AFF';
      case ComplaintStatus.RESOLVED:
        return '#34C759';
      default:
        return '#999';
    }
  };

  const renderComplaintItem = ({ item }: { item: ComplaintOut }) => {
    const statusColor = getStatusColor(item.status);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          setSelectedComplaint(item);
          setIsModalVisible(true);
        }}
      >
        <View style={styles.cardHeader}>
          <View style={styles.complaintInfo}>
            <Text style={styles.complaintTitle}>Complaint #{item.id}</Text>
            {item.link_id && (
              <Text style={styles.linkInfo}>Link #{item.link_id}</Text>
            )}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.date}>
          Created: {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </TouchableOpacity>
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
      {complaints.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No complaints yet</Text>
          <Text style={styles.emptySubtext}>
            Customer complaints will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={complaints}
          renderItem={renderComplaintItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={loadComplaints} />
          }
        />
      )}

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setIsModalVisible(false);
          setSelectedComplaint(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Complaint #{selectedComplaint?.id}</Text>

            <View style={styles.modalSection}>
              <Text style={styles.label}>Description</Text>
              <Text style={styles.description}>{selectedComplaint?.description}</Text>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.label}>Current Status</Text>
              <View
                style={[
                  styles.statusBadgeLarge,
                  {
                    backgroundColor: getStatusColor(
                      selectedComplaint?.status || ComplaintStatus.OPEN
                    ),
                  },
                ]}
              >
                <Text style={styles.statusTextLarge}>{selectedComplaint?.status}</Text>
              </View>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.label}>Change Status</Text>
              <View style={styles.statusButtons}>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    {
                      backgroundColor: getStatusColor(ComplaintStatus.OPEN),
                    },
                  ]}
                  onPress={() =>
                    selectedComplaint &&
                    handleStatusChange(selectedComplaint.id, ComplaintStatus.OPEN)
                  }
                >
                  <Text style={styles.statusButtonText}>Open</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    {
                      backgroundColor: getStatusColor(ComplaintStatus.IN_PROGRESS),
                    },
                  ]}
                  onPress={() =>
                    selectedComplaint &&
                    handleStatusChange(selectedComplaint.id, ComplaintStatus.IN_PROGRESS)
                  }
                >
                  <Text style={styles.statusButtonText}>In Progress</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    {
                      backgroundColor: getStatusColor(ComplaintStatus.RESOLVED),
                    },
                  ]}
                  onPress={() =>
                    selectedComplaint &&
                    handleStatusChange(selectedComplaint.id, ComplaintStatus.RESOLVED)
                  }
                >
                  <Text style={styles.statusButtonText}>Resolved</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setIsModalVisible(false);
                setSelectedComplaint(null);
              }}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  complaintInfo: {
    flex: 1,
  },
  complaintTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  linkInfo: {
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
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: '#999',
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
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  statusBadgeLarge: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignSelf: 'flex-start',
  },
  statusTextLarge: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statusButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#E5E5E5',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
});
