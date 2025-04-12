
import { api } from './api';

export interface OptionContract {
  symbol: string;
  strike_price: number;
  expiry_time: string;
  option_type: 'call' | 'put';
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
  underlying_asset?: string;
}

// Updated to match the actual API response structure
export interface OptionChain {
  asset: string;
  last_updated: string;
  underlying_price: number;
  options_by_expiry: {
    [date: string]: {
      call: OptionContract[];
      put: OptionContract[];
    }
  };
  // For backward compatibility with existing code
  calls?: OptionContract[];
  puts?: OptionContract[];
}

// Fetch available assets
export async function getAvailableAssets(): Promise<string[]> {
  const response = await api.get<{ assets: string[] }>('/options/assets');
  return response.assets;
}

// Fetch option chain for specific asset and normalize the data
export async function getOptionChain(asset: string): Promise<OptionChain> {
  const data = await api.get<OptionChain>(`/options/${asset}`);
  
  // Process the data to make it compatible with our UI
  // This extracts calls and puts from the first expiry date for backward compatibility
  if (data.options_by_expiry) {
    const firstExpiryDate = Object.keys(data.options_by_expiry)[0];
    if (firstExpiryDate) {
      data.calls = data.options_by_expiry[firstExpiryDate].call;
      data.puts = data.options_by_expiry[firstExpiryDate].put;
    } else {
      data.calls = [];
      data.puts = [];
    }
  }
  
  return data;
}
