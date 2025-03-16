import { OptionContract } from '@/types/options';

const DAYS_PER_YEAR = 365;

export const calculateOptionPrice = (
  type: 'call' | 'put',
  strike: number,
  underlyingPrice: number,
  timeToExpiry: number,
  volatility: number,
  riskFreeRate: number = 0.05
): number => {
  // Prevent division by zero or negative time
  if (timeToExpiry <= 0) return calculateIntrinsicValue(type, strike, underlyingPrice);
  
  const sigma = volatility;
  const t = timeToExpiry;
  const r = riskFreeRate;
  const S = underlyingPrice;
  const K = strike;

  const d1 = (Math.log(S / K) + (r + sigma * sigma / 2) * t) / (sigma * Math.sqrt(t));
  const d2 = d1 - sigma * Math.sqrt(t);

  if (type === 'call') {
    return S * normalCDF(d1) - K * Math.exp(-r * t) * normalCDF(d2);
  } else {
    return K * Math.exp(-r * t) * normalCDF(-d2) - S * normalCDF(-d1);
  }
};

const calculateIntrinsicValue = (type: 'call' | 'put', strike: number, underlyingPrice: number): number => {
  if (type === 'call') {
    return Math.max(0, underlyingPrice - strike);
  } else {
    return Math.max(0, strike - underlyingPrice);
  }
};

export const calculateGreeks = (
  type: 'call' | 'put',
  strike: number,
  underlyingPrice: number,
  timeToExpiry: number,
  volatility: number,
  riskFreeRate: number = 0.05
) => {
  // Prevent calculations with invalid inputs
  if (timeToExpiry <= 0 || volatility <= 0 || underlyingPrice <= 0) {
    return {
      delta: 0,
      gamma: 0,
      theta: 0,
      vega: 0,
      rho: 0
    };
  }

  const S = underlyingPrice;
  const K = strike;
  const t = timeToExpiry;
  const r = riskFreeRate;
  const sigma = volatility;

  const d1 = (Math.log(S / K) + (r + sigma * sigma / 2) * t) / (sigma * Math.sqrt(t));
  const d2 = d1 - sigma * Math.sqrt(t);
  const phiD1 = Math.exp(-d1 * d1 / 2) / Math.sqrt(2 * Math.PI);

  // Delta calculation
  const delta = type === 'call' ? normalCDF(d1) : normalCDF(d1) - 1;

  // Gamma calculation (same for calls and puts)
  const gamma = phiD1 / (S * sigma * Math.sqrt(t));

  // Theta calculation (time decay)
  const theta = type === 'call'
    ? (-S * sigma * phiD1 / (2 * Math.sqrt(t)) - r * K * Math.exp(-r * t) * normalCDF(d2))
    : (-S * sigma * phiD1 / (2 * Math.sqrt(t)) + r * K * Math.exp(-r * t) * normalCDF(-d2));

  // Vega calculation (sensitivity to volatility)
  const vega = S * Math.sqrt(t) * phiD1;

  // Rho calculation (sensitivity to interest rate)
  const rho = type === 'call'
    ? K * t * Math.exp(-r * t) * normalCDF(d2)
    : -K * t * Math.exp(-r * t) * normalCDF(-d2);

  return {
    delta,
    gamma,
    theta: theta / DAYS_PER_YEAR, // Convert to daily theta
    vega: vega / 100, // Convert to 1% volatility change
    rho: rho / 100 // Convert to 1% rate change
  };
};

// Cumulative normal distribution function
function normalCDF(x: number): number {
  let t = 1 / (1 + 0.2316419 * Math.abs(x));
  let d = 0.3989423 * Math.exp(-x * x / 2);
  let probability = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - probability : probability;
}

export const calculateTotalPL = (
  contracts: OptionContract[],
  currentPrice: number,
  volatility: number,
  daysToExpiry: number
): number => {
  if (!contracts.length) return 0;

  // Calculate total P/L for all contracts
  const totalPL = contracts.reduce((total, contract) => {
    // Calculate current option price
    const currentOptionPrice = calculateOptionPrice(
      contract.type,
      contract.strike,
      currentPrice,
      daysToExpiry / DAYS_PER_YEAR,
      volatility
    );

    // Calculate P&L: (Current Price - Entry Price) * Quantity * Contract Multiplier
    // For short positions (negative quantity), the P&L is reversed
    const contractPL = (currentOptionPrice - contract.premium) * contract.quantity * 100;

    return total + contractPL;
  }, 0);

  // Ensure consistent orientation - negative values for losses, positive for gains
  return totalPL;
};

// New function to calculate scenario impact
export const calculateScenarioImpact = (
  contracts: OptionContract[],
  basePrice: number,
  baseVol: number,
  baseDays: number,
  priceChange: number,
  volChange: number,
  newDays: number
): {
  pricePL: number;
  volPL: number;
  timePL: number;
  totalPL: number;
} => {
  // Base P&L
  const basePL = calculateTotalPL(contracts, basePrice, baseVol, baseDays);

  // P&L with only price change
  const priceOnlyPL = calculateTotalPL(
    contracts,
    basePrice * (1 + priceChange / 100),
    baseVol,
    baseDays
  );

  // P&L with only volatility change
  const volOnlyPL = calculateTotalPL(
    contracts,
    basePrice,
    baseVol * (1 + volChange / 100),
    baseDays
  );

  // P&L with only time change
  const timeOnlyPL = calculateTotalPL(
    contracts,
    basePrice,
    baseVol,
    newDays
  );

  // Total P&L with all changes
  const totalPL = calculateTotalPL(
    contracts,
    basePrice * (1 + priceChange / 100),
    baseVol * (1 + volChange / 100),
    newDays
  );

  // Calculate the differences to get individual impacts
  return {
    pricePL: priceOnlyPL - basePL,
    volPL: volOnlyPL - basePL,
    timePL: timeOnlyPL - basePL,
    totalPL: totalPL - basePL,
  };
};