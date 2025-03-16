export type OptionType = 'call' | 'put';

export interface OptionContract {
  id: string;
  type: OptionType;
  strike: number;
  expiration: string;
  premium: number;
  quantity: number;
}

export interface Strategy {
  id: string;
  name: string;
  description?: string;
  underlyingPrice: number;
  contracts: OptionContract[];
  createdAt: string;
  updatedAt: string;
}

export interface Greeks {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
}

export interface ScenarioAnalysis {
  priceChange: number;
  volatilityChange: number;
  daysToExpiration: number;
  expectedPL: number;
}

export interface SavedStrategy extends Strategy {
  scenarios: ScenarioAnalysis[];
}