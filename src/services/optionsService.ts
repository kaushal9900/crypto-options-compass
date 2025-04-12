
import { api } from './api';

export interface OptionContract {
  symbol: string;
  strike_price: number;
  expiry_time: string;
  option_type: 'CALL' | 'PUT';
  last_price: number;
  bid_price: number;
  ask_price: number;
  volume: number;
  open_interest: number;
  implied_volatility?: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  mark_price: number;
}

export interface OptionChain {
  asset: string;
  last_updated: string;
  underlying_price: number;
  calls: OptionContract[];
  puts: OptionContract[];
}

// Fetch available assets
export async function getAvailableAssets(): Promise<string[]> {
  const response = await api.get<{ assets: string[] }>('/options/assets');
  return response.assets;
}

// Fetch option chain for specific asset
export async function getOptionChain(asset: string): Promise<OptionChain> {
  return await api.get<OptionChain>(`/options/${asset}`);
}
