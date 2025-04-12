
import { api } from './api';
import { OptionContract } from './optionsService';

export interface StrategyDefinition {
  name: string;
  type: 'NEUTRAL' | 'BEARISH' | 'BULLISH' | 'VOLATILE';
  description: string;
}

export interface StrategyLeg {
  side: 'BUY' | 'SELL';
  ratio: number;
  selected: OptionContract;
}

export interface Strategy {
  definition_name: string;
  underlying_asset: string;
  underlying_price_at_construction: number;
  base_quantity: number;
  timestamp: string;
  estimated_cost: number;
  legs: StrategyLeg[];
}

export interface StrategyPayoff {
  payoff: { underlying_price: number; profit_loss: number }[];
  max_profit: number;
  max_loss: number;
  breakevens: number[];
}

// Fetch available strategy definitions
export async function getStrategyDefinitions(): Promise<StrategyDefinition[]> {
  return await api.get<StrategyDefinition[]>('/strategies/definitions');
}

// Construct a strategy
export async function constructStrategy(
  definitionName: string,
  asset: string,
  quantity: number
): Promise<Strategy> {
  return await api.post<Strategy>('/strategies/construct', {
    definition_name: definitionName,
    underlying_asset: asset,
    base_quantity: quantity,
  });
}

// Calculate strategy payoff
export async function calculatePayoff(
  strategy: Strategy,
  priceMin: number,
  priceMax: number,
  numPoints: number = 100
): Promise<StrategyPayoff> {
  return await api.post<StrategyPayoff>('/strategies/payoff', {
    strategy,
    price_min: priceMin,
    price_max: priceMax,
    num_points: numPoints,
  });
}
