import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import useOptionsStore from '@/store/optionsStore';
import { format } from 'date-fns';

export default function StrategiesScreen() {
  const { savedStrategies, loadStrategy } = useOptionsStore();

  const renderStrategy = ({ item }) => (
    <TouchableOpacity
      style={styles.strategyCard}
      onPress={() => loadStrategy(item.id)}
    >
      <Text style={styles.strategyName}>{item.name}</Text>
      <Text style={styles.strategyDetails}>
        {item.contracts.length} contracts | Created{' '}
        {format(new Date(item.createdAt), 'MMM d, yyyy')}
      </Text>
      {item.description && (
        <Text style={styles.description}>{item.description}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saved Strategies</Text>
      
      <FlatList
        data={savedStrategies}
        renderItem={renderStrategy}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
    padding: 20,
  },
  list: {
    padding: 10,
  },
  strategyCard: {
    backgroundColor: '#222',
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  strategyName: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
    marginBottom: 5,
  },
  strategyDetails: {
    color: '#888',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  description: {
    color: '#ccc',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    marginTop: 10,
  },
});