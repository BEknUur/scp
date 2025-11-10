import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function LinksScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Link Requests</Text>
      <Text style={styles.text}>Accept or decline connection requests from consumers.</Text>
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
