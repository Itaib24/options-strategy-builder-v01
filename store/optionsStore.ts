import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OptionContract, Strategy, ScenarioAnalysis } from '@/types/options';
import { format } from 'date-fns';

interface OptionsState {
  currentStrategy: Strategy;
  savedStrategies: Strategy[];
  scenarios: ScenarioAnalysis[];
  addContract: (contract: Omit<OptionContract, 'id'>) => void;
  removeContract: (id: string) => void;
  updateContract: (id: string, updates: Partial<OptionContract>) => void;
  saveStrategy: (name: string, description?: string) => Promise<void>;
  loadStrategy: (id: string) => Promise<void>;
  addScenario: (scenario: ScenarioAnalysis) => void;
  clearScenarios: () => void;
  rollStrategy: (strategyId: string, newExpiration: string, strikeAdjustment: number) => Promise<void>;
}

const useOptionsStore = create<OptionsState>((set, get) => ({
  currentStrategy: {
    id: 'current',
    name: 'New Strategy',
    underlyingPrice: 100,
    contracts: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  savedStrategies: [],
  scenarios: [],

  addContract: (contract) => {
    set((state) => ({
      currentStrategy: {
        ...state.currentStrategy,
        contracts: [
          ...state.currentStrategy.contracts,
          {
            ...contract,
            id: Math.random().toString(36).substr(2, 9),
          },
        ],
        updatedAt: new Date().toISOString(),
      },
    }));
  },

  removeContract: (id) => {
    set((state) => ({
      currentStrategy: {
        ...state.currentStrategy,
        contracts: state.currentStrategy.contracts.filter((c) => c.id !== id),
        updatedAt: new Date().toISOString(),
      },
    }));
  },

  updateContract: (id, updates) => {
    set((state) => ({
      currentStrategy: {
        ...state.currentStrategy,
        contracts: state.currentStrategy.contracts.map((c) =>
          c.id === id ? { ...c, ...updates } : c
        ),
        updatedAt: new Date().toISOString(),
      },
    }));
  },

  saveStrategy: async (name, description) => {
    const { currentStrategy, savedStrategies } = get();
    const newStrategy = {
      ...currentStrategy,
      id: Math.random().toString(36).substr(2, 9),
      name,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedStrategies = [...savedStrategies, newStrategy];
    await AsyncStorage.setItem('savedStrategies', JSON.stringify(updatedStrategies));
    set({ savedStrategies: updatedStrategies });
  },

  loadStrategy: async (id) => {
    const { savedStrategies } = get();
    const strategy = savedStrategies.find((s) => s.id === id);
    if (strategy) {
      set({ currentStrategy: { ...strategy } });
    }
  },

  addScenario: (scenario) => {
    set((state) => ({
      scenarios: [...state.scenarios, scenario],
    }));
  },

  clearScenarios: () => {
    set({ scenarios: [] });
  },

  rollStrategy: async (strategyId: string, newExpiration: string, strikeAdjustment: number) => {
    const { savedStrategies } = get();
    const strategy = savedStrategies.find((s) => s.id === strategyId);
    
    if (!strategy) return;

    const rolledStrategy: Strategy = {
      ...strategy,
      id: Math.random().toString(36).substr(2, 9),
      name: `${strategy.name} (Rolled to ${format(new Date(newExpiration), 'MMM yyyy')})`,
      contracts: strategy.contracts.map((contract) => ({
        ...contract,
        id: Math.random().toString(36).substr(2, 9),
        expiration: newExpiration,
        strike: contract.strike + strikeAdjustment,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedStrategies = [...savedStrategies, rolledStrategy];
    await AsyncStorage.setItem('savedStrategies', JSON.stringify(updatedStrategies));
    set({ savedStrategies: updatedStrategies });
  },
}));

export default useOptionsStore;