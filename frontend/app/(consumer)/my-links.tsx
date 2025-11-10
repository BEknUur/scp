import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MyLinksScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Links</Text>
      <Text style={styles.text}>Your supplier connections will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});
