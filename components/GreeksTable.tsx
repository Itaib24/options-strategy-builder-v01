import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { calculateGreeks } from '@/utils/optionsCalculator';
import { OptionContract } from '@/types/options';
import { Trash2 } from 'lucide-react-native';

interface Props {
  contracts: OptionContract[];
  onRemove: (id: string) => void;
}

export default function GreeksTable({ contracts, onRemove }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Greeks Analysis</Text>
      
      <ScrollView horizontal>
        <View>
          <View style={styles.headerRow}>
            <Text style={[styles.headerCell, styles.contractCell]}>Contract</Text>
            <Text style={styles.headerCell}>Delta</Text>
            <Text style={styles.headerCell}>Gamma</Text>
            <Text style={styles.headerCell}>Theta</Text>
            <Text style={styles.headerCell}>Vega</Text>
            <Text style={styles.headerCell}>Rho</Text>
            <Text style={[styles.headerCell, styles.actionCell]}>Action</Text>
          </View>

          {contracts.map((contract) => {
            const greeks = calculateGreeks(
              contract.type,
              contract.strike,
              100, // Current price
              30 / 365, // Time to expiry in years
              0.3 // Volatility
            );

            const isShort = contract.quantity < 0;

            return (
              <View key={contract.id} style={styles.row}>
                <Text style={[styles.cell, styles.contractCell]}>
                  <Text style={[styles.positionIndicator, isShort ? styles.shortPosition : styles.longPosition]}>
                    {isShort ? 'S' : 'B'}
                  </Text>
                  {` ${Math.abs(contract.quantity)} ${contract.type.toUpperCase()} ${contract.strike}`}
                </Text>
                <Text style={styles.cell}>{greeks.delta.toFixed(4)}</Text>
                <Text style={styles.cell}>{greeks.gamma.toFixed(4)}</Text>
                <Text style={styles.cell}>{greeks.theta.toFixed(4)}</Text>
                <Text style={styles.cell}>{greeks.vega.toFixed(4)}</Text>
                <Text style={styles.cell}>{greeks.rho.toFixed(4)}</Text>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => onRemove(contract.id)}
                >
                  <Trash2 size={16} color="#ff4444" />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#222',
    padding: 20,
    borderRadius: 10,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
    marginBottom: 15,
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    paddingBottom: 10,
    marginBottom: 10,
  },
  headerCell: {
    width: 80,
    color: '#888',
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    textAlign: 'center',
  },
  contractCell: {
    width: 120,
    textAlign: 'left',
  },
  actionCell: {
    width: 50,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  cell: {
    width: 80,
    color: '#fff',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    textAlign: 'center',
  },
  positionIndicator: {
    fontSize: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
    overflow: 'hidden',
  },
  longPosition: {
    backgroundColor: '#00ff88',
    color: '#000',
  },
  shortPosition: {
    backgroundColor: '#ff4444',
    color: '#fff',
  },
  deleteButton: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },
});