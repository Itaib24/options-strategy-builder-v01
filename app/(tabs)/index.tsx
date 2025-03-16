import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, TextInput, Modal } from 'react-native';
import useOptionsStore from '@/store/optionsStore';
import { calculateTotalPL } from '@/utils/optionsCalculator';
import OptionContractForm from '@/components/OptionContractForm';
import GreeksTable from '@/components/GreeksTable';
import ScenarioAnalysis from '@/components/ScenarioAnalysis';
import { Save } from 'lucide-react-native';

// Import Victory components based on platform
const VictoryImports = Platform.select({
  web: () => require('victory'),
  default: () => require('victory-native'),
});

export default function SimulatorScreen() {
  const { VictoryLine, VictoryChart, VictoryAxis, VictoryTheme } = VictoryImports();
  const { currentStrategy, addContract, removeContract, saveStrategy } = useOptionsStore();
  const [priceRange, setPriceRange] = useState({
    min: currentStrategy.underlyingPrice * 0.8,
    max: currentStrategy.underlyingPrice * 1.2,
  });
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [strategyName, setStrategyName] = useState('');
  const [strategyDescription, setStrategyDescription] = useState('');

  const generatePLData = () => {
    const points = 100;
    const step = (priceRange.max - priceRange.min) / points;
    
    return Array.from({ length: points }, (_, i) => {
      const price = priceRange.min + step * i;
      return {
        x: price,
        y: calculateTotalPL(
          currentStrategy.contracts,
          price,
          0.3,
          30
        ),
      };
    });
  };

  const handleSave = async () => {
    if (!strategyName.trim()) return;
    
    await saveStrategy(strategyName, strategyDescription);
    setStrategyName('');
    setStrategyDescription('');
    setSaveModalVisible(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Options Strategy Builder</Text>
        <TouchableOpacity 
          style={[
            styles.saveButton,
            !currentStrategy.contracts.length && styles.saveButtonDisabled
          ]}
          onPress={() => setSaveModalVisible(true)}
          disabled={!currentStrategy.contracts.length}
        >
          <Save size={20} color={currentStrategy.contracts.length ? '#000' : '#666'} />
          <Text style={[
            styles.saveButtonText,
            !currentStrategy.contracts.length && styles.saveButtonTextDisabled
          ]}>
            Save Strategy
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.chartContainer}>
        <VictoryChart 
          theme={VictoryTheme.material}
          domainPadding={20}
          width={350}
          height={300}
          padding={{ top: 50, bottom: 50, left: 60, right: 20 }}
        >
          <VictoryAxis
            label="Price ($)"
            style={{
              axisLabel: { 
                padding: 35,
                fill: '#fff',
                fontSize: 14,
                fontFamily: 'Inter_500Medium'
              },
              tickLabels: { 
                fill: '#fff',
                fontSize: 12,
                fontFamily: 'Inter_400Regular',
                padding: 5
              },
              axis: { stroke: '#666' },
              grid: { stroke: '#333', strokeDasharray: '5,5' }
            }}
            tickFormat={(t) => `$${Math.round(t)}`}
          />
          <VictoryAxis
            dependentAxis
            label="P/L ($)"
            style={{
              axisLabel: { 
                padding: 45,
                fill: '#fff',
                fontSize: 14,
                fontFamily: 'Inter_500Medium'
              },
              tickLabels: { 
                fill: '#fff',
                fontSize: 12,
                fontFamily: 'Inter_400Regular',
                padding: 5
              },
              axis: { stroke: '#666' },
              grid: { stroke: '#333', strokeDasharray: '5,5' }
            }}
            tickFormat={(t) => `$${Math.round(t)}`}
          />
          <VictoryLine
            data={generatePLData()}
            style={{
              data: { stroke: "#00ff88" },
            }}
          />
        </VictoryChart>
      </View>

      <OptionContractForm onAdd={addContract} onRemove={removeContract} />
      
      <GreeksTable contracts={currentStrategy.contracts} onRemove={removeContract} />
      
      <ScenarioAnalysis />

      <Modal
        visible={saveModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSaveModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Save Strategy</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Strategy Name</Text>
              <TextInput
                style={styles.input}
                value={strategyName}
                onChangeText={setStrategyName}
                placeholder="Enter strategy name"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={strategyDescription}
                onChangeText={setStrategyDescription}
                placeholder="Enter strategy description"
                placeholderTextColor="#666"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setSaveModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveModalButton]}
                onPress={handleSave}
                disabled={!strategyName.trim()}
              >
                <Text style={styles.saveModalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#00ff88',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  saveButtonDisabled: {
    backgroundColor: '#333',
  },
  saveButtonText: {
    color: '#000',
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  saveButtonTextDisabled: {
    color: '#666',
  },
  chartContainer: {
    backgroundColor: '#222',
    padding: 10,
    borderRadius: 10,
    margin: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    color: '#fff',
    marginBottom: 5,
    fontFamily: 'Inter_400Regular',
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 10,
    borderRadius: 5,
    fontFamily: 'Inter_400Regular',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#444',
  },
  cancelButtonText: {
    color: '#fff',
    fontFamily: 'Inter_500Medium',
  },
  saveModalButton: {
    backgroundColor: '#00ff88',
  },
  saveModalButtonText: {
    color: '#000',
    fontFamily: 'Inter_600SemiBold',
  },
});