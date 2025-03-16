import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Plus } from 'lucide-react-native';

interface Props {
  onAdd: (contract: any) => void;
  onRemove: (id: string) => void;
}

export default function OptionContractForm({ onAdd, onRemove }: Props) {
  const [contract, setContract] = useState({
    type: 'call',
    strike: '',
    expiration: '',
    premium: '',
    quantity: '1',
    position: 'buy', // New position field
  });

  const [date, setDate] = useState({
    day: new Date().getDate().toString(),
    month: (new Date().getMonth() + 1).toString(),
    year: new Date().getFullYear().toString(),
  });

  // Generate arrays for day, month, and year options
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => (currentYear + i).toString());

  const handleAdd = () => {
    const formattedDate = `${date.year}-${date.month.padStart(2, '0')}-${date.day.padStart(2, '0')}`;
    onAdd({
      type: contract.type,
      strike: parseFloat(contract.strike),
      expiration: formattedDate,
      premium: parseFloat(contract.premium),
      quantity: parseInt(contract.quantity, 10) * (contract.position === 'sell' ? -1 : 1), // Negative quantity for selling
    });
    setContract({
      type: 'call',
      strike: '',
      expiration: '',
      premium: '',
      quantity: '1',
      position: 'buy',
    });
  };

  const renderSelect = (value: string, onChange: (value: string) => void, options: string[]) => {
    if (Platform.OS === 'web') {
      return (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            backgroundColor: '#333',
            color: '#fff',
            padding: 10,
            borderRadius: 5,
            border: 'none',
            fontFamily: 'Inter_400Regular',
            width: '100%',
          }}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    return (
      <View style={styles.pickerContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.pickerOption,
              value === option && styles.pickerOptionSelected,
            ]}
            onPress={() => onChange(option)}
          >
            <Text
              style={[
                styles.pickerOptionText,
                value === option && styles.pickerOptionTextSelected,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Option Contract</Text>

      <View style={styles.row}>
        <TouchableOpacity
          style={[
            styles.positionButton,
            contract.position === 'buy' && styles.activePositionButton,
          ]}
          onPress={() => setContract({ ...contract, position: 'buy' })}
        >
          <Text style={[
            styles.positionButtonText,
            contract.position === 'buy' && styles.activePositionButtonText,
          ]}>Buy</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.positionButton,
            contract.position === 'sell' && styles.activePositionButton,
          ]}
          onPress={() => setContract({ ...contract, position: 'sell' })}
        >
          <Text style={[
            styles.positionButtonText,
            contract.position === 'sell' && styles.activePositionButtonText,
          ]}>Sell</Text>
        </TouchableOpacity>
      </View>
      
      <View style={[styles.row, styles.marginTop]}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            contract.type === 'call' && styles.activeTypeButton,
          ]}
          onPress={() => setContract({ ...contract, type: 'call' })}
        >
          <Text style={[
            styles.typeButtonText,
            contract.type === 'call' && styles.activeTypeButtonText,
          ]}>Call</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.typeButton,
            contract.type === 'put' && styles.activeTypeButton,
          ]}
          onPress={() => setContract({ ...contract, type: 'put' })}
        >
          <Text style={[
            styles.typeButtonText,
            contract.type === 'put' && styles.activeTypeButtonText,
          ]}>Put</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Strike Price</Text>
        <TextInput
          style={styles.input}
          value={contract.strike}
          onChangeText={(text) => setContract({ ...contract, strike: text })}
          keyboardType="numeric"
          placeholder="Enter strike price"
          placeholderTextColor="#666"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Expiration Date</Text>
        <View style={styles.datePickerContainer}>
          <View style={styles.datePickerColumn}>
            <Text style={styles.dateLabel}>Day</Text>
            {renderSelect(date.day, (value) => setDate({ ...date, day: value }), days)}
          </View>
          <View style={styles.datePickerColumn}>
            <Text style={styles.dateLabel}>Month</Text>
            {renderSelect(date.month, (value) => setDate({ ...date, month: value }), months)}
          </View>
          <View style={styles.datePickerColumn}>
            <Text style={styles.dateLabel}>Year</Text>
            {renderSelect(date.year, (value) => setDate({ ...date, year: value }), years)}
          </View>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Premium</Text>
        <TextInput
          style={styles.input}
          value={contract.premium}
          onChangeText={(text) => setContract({ ...contract, premium: text })}
          keyboardType="numeric"
          placeholder="Enter premium"
          placeholderTextColor="#666"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Quantity</Text>
        <TextInput
          style={styles.input}
          value={contract.quantity}
          onChangeText={(text) => setContract({ ...contract, quantity: text })}
          keyboardType="numeric"
          placeholder="Enter quantity"
          placeholderTextColor="#666"
        />
      </View>

      <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
        <Plus color="#000" size={24} />
        <Text style={styles.addButtonText}>Add Contract</Text>
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
  row: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  marginTop: {
    marginTop: 10,
  },
  positionButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  activePositionButton: {
    backgroundColor: '#00ff88',
  },
  positionButtonText: {
    color: '#fff',
    fontFamily: 'Inter_500Medium',
  },
  activePositionButtonText: {
    color: '#000',
  },
  typeButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  activeTypeButton: {
    backgroundColor: '#00ff88',
  },
  typeButtonText: {
    color: '#fff',
    fontFamily: 'Inter_500Medium',
  },
  activeTypeButtonText: {
    color: '#000',
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
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  datePickerColumn: {
    flex: 1,
    marginHorizontal: 5,
  },
  dateLabel: {
    color: '#666',
    fontSize: 12,
    marginBottom: 5,
    fontFamily: 'Inter_400Regular',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#333',
    borderRadius: 5,
    padding: 5,
  },
  pickerOption: {
    padding: 5,
    margin: 2,
    borderRadius: 3,
  },
  pickerOptionSelected: {
    backgroundColor: '#00ff88',
  },
  pickerOptionText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  pickerOptionTextSelected: {
    color: '#000',
  },
  addButton: {
    backgroundColor: '#00ff88',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  addButtonText: {
    color: '#000',
    marginLeft: 10,
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
});