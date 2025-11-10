import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { suppliersApi } from '@/api';
import { SupplierOut } from '@/types';

export default function SupplierDashboardScreen() {
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
          'Company Not Found',
          'You need to create your company profile first.',
          [{ text: 'OK' }]
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
    <View style={styles.container}>
      <Text style={styles.title}>Supplier Dashboard</Text>
      <Text style={styles.subtitle}>Email: {user?.email}</Text>

      {supplier ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Company Information</Text>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{supplier.name}</Text>
          {supplier.description && (
            <>
              <Text style={styles.label}>Description</Text>
              <Text style={styles.value}>{supplier.description}</Text>
            </>
          )}
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.noDataText}>
            No company found. Create your company profile to get started.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
