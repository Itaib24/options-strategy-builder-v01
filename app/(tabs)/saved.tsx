import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import useOptionsStore from '@/store/optionsStore';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react-native';

export default function SavedScreen() {
  const { savedStrategies, rollStrategy } = useOptionsStore();
  const [selectedStrategy, setSelectedStrategy] = useState(null);

  const handleRoll = async (strategy) => {
    // Example: Roll to next month with same strikes
    const currentExpiry = new Date(strategy.contracts[0].expiration);
    const nextMonth = new Date(currentExpiry.setMonth(currentExpiry.getMonth() + 1));
    
    await rollStrategy(
      strategy.id,
      nextMonth.toISOString(),
      0 // No strike adjustment
    );
  };

  const renderStrategy = ({ item }) => (
    <View style={styles.strategyCard}>
      <Text style={styles.strategyName}>{item.name}</Text>
      <Text style={styles.strategyDetails}>
        {item.contracts.length} contracts | Last updated{' '}
        {format(new Date(item.updatedAt), 'MMM d, yyyy')}
      </Text>
      
      <TouchableOpacity
        style={styles.rollButton}
        onPress={() => handleRoll(item)}
      >
        <Calendar size={20} color="#000" />
        <Text style={styles.rollButtonText}>Roll Strategy</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Roll Strategies</Text>
      
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
    marginBottom: 15,
  },
  rollButton: {
    backgroundColor: '#00ff88',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 5,
  },
  rollButtonText: {
    color: '#000',
    marginLeft: 10,
    fontFamily: 'Inter_600SemiBold',
  },
});