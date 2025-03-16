import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { Save, Trash2 } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = React.useState(true);
  const [showGreeks, setShowGreeks] = React.useState(true);
  const [autoSave, setAutoSave] = React.useState(true);

  const clearAllData = async () => {
    try {
      await AsyncStorage.clear();
      // You might want to add a confirmation dialog here
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.section}>
        <View style={styles.setting}>
          <Text style={styles.settingText}>Dark Mode</Text>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#666', true: '#00ff88' }}
            thumbColor={darkMode ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.setting}>
          <Text style={styles.settingText}>Show Greeks</Text>
          <Switch
            value={showGreeks}
            onValueChange={setShowGreeks}
            trackColor={{ false: '#666', true: '#00ff88' }}
            thumbColor={showGreeks ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.setting}>
          <Text style={styles.settingText}>Auto-save Strategies</Text>
          <Switch
            value={autoSave}
            onValueChange={setAutoSave}
            trackColor={{ false: '#666', true: '#00ff88' }}
            thumbColor={autoSave ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.button} onPress={clearAllData}>
          <Trash2 color="#ff4444" size={24} />
          <Text style={[styles.buttonText, { color: '#ff4444' }]}>
            Clear All Data
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.exportButton]}>
          <Save color="#000" size={24} />
          <Text style={[styles.buttonText, { color: '#000' }]}>
            Export Strategies
          </Text>
        </TouchableOpacity>
      </View>
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
  section: {
    backgroundColor: '#222',
    padding: 20,
    borderRadius: 10,
    margin: 10,
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  settingText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
    backgroundColor: '#333',
  },
  exportButton: {
    backgroundColor: '#00ff88',
  },
  buttonText: {
    marginLeft: 10,
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
});