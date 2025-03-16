import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform } from 'react-native';
import useOptionsStore from '@/store/optionsStore';
import { calculateTotalPL, calculateScenarioImpact } from '@/utils/optionsCalculator';

// Import Victory components based on platform
const VictoryImports = Platform.select({
  web: () => require('victory'),
  default: () => require('victory-native'),
});

export default function ScenarioAnalysis() {
  const { VictoryLine, VictoryChart, VictoryAxis, VictoryTheme, VictoryLegend } = VictoryImports();
  const { currentStrategy, addScenario } = useOptionsStore();
  const [priceChange, setPriceChange] = useState(0);
  const [volatilityChange, setVolatilityChange] = useState(0);
  const [daysToExpiration, setDaysToExpiration] = useState(30);
  const [scenarioData, setScenarioData] = useState<{ x: number; y: number }[]>([]);
  const [scenarioImpact, setScenarioImpact] = useState<{
    pricePL: number;
    volPL: number;
    timePL: number;
    totalPL: number;
  } | null>(null);

  const generatePLData = (priceAdjustment: number, volAdjustment: number, days: number) => {
    const points = 100;
    const minPrice = currentStrategy.underlyingPrice * 0.8;
    const maxPrice = currentStrategy.underlyingPrice * 1.2;
    const step = (maxPrice - minPrice) / points;
    
    return Array.from({ length: points }, (_, i) => {
      const price = minPrice + step * i;
      const adjustedPrice = price * (1 + priceAdjustment / 100);
      const adjustedVol = 0.3 * (1 + volAdjustment / 100);
      return {
        x: price,
        y: calculateTotalPL(
          currentStrategy.contracts,
          adjustedPrice,
          adjustedVol,
          days
        ),
      };
    });
  };

  const calculateScenario = () => {
    if (!currentStrategy.contracts.length) {
      return;
    }

    const newData = generatePLData(priceChange, volatilityChange, daysToExpiration);
    setScenarioData(newData);
    
    const impact = calculateScenarioImpact(
      currentStrategy.contracts,
      currentStrategy.underlyingPrice,
      0.3,
      30,
      priceChange,
      volatilityChange,
      daysToExpiration
    );

    setScenarioImpact(impact);
    
    addScenario({
      priceChange,
      volatilityChange,
      daysToExpiration,
      expectedPL: impact.totalPL,
    });
  };

  const baselinePLData = generatePLData(0, 0, 30);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scenario Analysis</Text>

      <View style={styles.chartContainer}>
        <VictoryChart 
          theme={VictoryTheme.material}
          domainPadding={{ x: 40, y: 40 }}
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
            data={baselinePLData}
            style={{
              data: { stroke: "#00ff88", strokeWidth: 2 },
            }}
          />
          {scenarioData.length > 0 && (
            <VictoryLine
              data={scenarioData}
              style={{
                data: { stroke: "#ff4444", strokeWidth: 2, strokeDasharray: "5,5" },
              }}
            />
          )}
          <VictoryLegend
            x={85}
            y={10}
            orientation="horizontal"
            gutter={20}
            style={{
              border: { stroke: "none" },
              labels: { 
                fill: '#fff',
                fontSize: 12,
                fontFamily: 'Inter_400Regular'
              }
            }}
            data={[
              { name: "Current P/L", symbol: { fill: "#00ff88" } },
              { name: "Scenario P/L", symbol: { fill: "#ff4444" } }
            ]}
          />
        </VictoryChart>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Price Change (%)</Text>
        <TextInput
          style={styles.input}
          value={String(priceChange)}
          onChangeText={(text) => setPriceChange(Number(text) || 0)}
          keyboardType="numeric"
          placeholder="Enter price change %"
          placeholderTextColor="#666"
        />
        <Text style={styles.value}>{priceChange.toFixed(1)}%</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Volatility Change (%)</Text>
        <TextInput
          style={styles.input}
          value={String(volatilityChange)}
          onChangeText={(text) => setVolatilityChange(Number(text) || 0)}
          keyboardType="numeric"
          placeholder="Enter volatility change %"
          placeholderTextColor="#666"
        />
        <Text style={styles.value}>{volatilityChange.toFixed(1)}%</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Days to Expiration</Text>
        <TextInput
          style={styles.input}
          value={String(daysToExpiration)}
          onChangeText={(text) => setDaysToExpiration(Number(text) || 1)}
          keyboardType="numeric"
          placeholder="Enter days to expiration"
          placeholderTextColor="#666"
        />
        <Text style={styles.value}>{Math.round(daysToExpiration)} days</Text>
      </View>

      {scenarioImpact && (
        <View style={styles.impactContainer}>
          <Text style={styles.impactTitle}>Scenario Impact</Text>
          <View style={styles.impactRow}>
            <Text style={styles.impactLabel}>Price Impact:</Text>
            <Text style={[styles.impactValue, { color: scenarioImpact.pricePL >= 0 ? '#00ff88' : '#ff4444' }]}>
              ${Math.round(scenarioImpact.pricePL)}
            </Text>
          </View>
          <View style={styles.impactRow}>
            <Text style={styles.impactLabel}>Volatility Impact:</Text>
            <Text style={[styles.impactValue, { color: scenarioImpact.volPL >= 0 ? '#00ff88' : '#ff4444' }]}>
              ${Math.round(scenarioImpact.volPL)}
            </Text>
          </View>
          <View style={styles.impactRow}>
            <Text style={styles.impactLabel}>Time Decay:</Text>
            <Text style={[styles.impactValue, { color: scenarioImpact.timePL >= 0 ? '#00ff88' : '#ff4444' }]}>
              ${Math.round(scenarioImpact.timePL)}
            </Text>
          </View>
          <View style={[styles.impactRow, styles.totalRow]}>
            <Text style={styles.impactLabel}>Total Impact:</Text>
            <Text style={[styles.impactValue, { color: scenarioImpact.totalPL >= 0 ? '#00ff88' : '#ff4444' }]}>
              ${Math.round(scenarioImpact.totalPL)}
            </Text>
          </View>
        </View>
      )}

      <TouchableOpacity 
        style={[styles.button, !currentStrategy.contracts.length && styles.buttonDisabled]}
        onPress={calculateScenario}
        disabled={!currentStrategy.contracts.length}
      >
        <Text style={styles.buttonText}>
          {currentStrategy.contracts.length ? 'Run Scenario' : 'Add contracts to analyze'}
        </Text>
      </TouchableOpacity>
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
  chartContainer: {
    backgroundColor: '#1a1a1a',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    marginBottom: 10,
    fontFamily: 'Inter_400Regular',
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 10,
    borderRadius: 5,
    fontFamily: 'Inter_400Regular',
    marginBottom: 5,
  },
  value: {
    color: '#00ff88',
    textAlign: 'center',
    marginTop: 5,
    fontFamily: 'Inter_500Medium',
  },
  impactContainer: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  impactTitle: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 10,
  },
  impactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  totalRow: {
    borderBottomWidth: 0,
    marginTop: 5,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  impactLabel: {
    color: '#fff',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  impactValue: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#00ff88',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#444',
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
});