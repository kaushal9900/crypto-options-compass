
import React from "react";
import { Strategy, StrategyPayoff } from "@/services/strategyService";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid,
  ReferenceLine
} from "recharts";
import { Button } from "@/components/ui/button";
import { ZoomOut } from "lucide-react";

interface PayoffGraphProps {
  strategy: Strategy | null;
  payoff: StrategyPayoff | null;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-md p-3 shadow-md">
        <p className="text-sm font-medium mb-1">${parseFloat(label || "0").toLocaleString()} {payload[0].payload?.underlying_asset}</p>
        <p className={`text-sm ${payload[0].value >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          Profit/Loss: ${payload[0].value.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

const PayoffGraph: React.FC<PayoffGraphProps> = ({ strategy, payoff }) => {
  if (!payoff) {
    return (
      <div className="h-80 flex items-center justify-center">
        <p className="text-muted-foreground">Build a strategy to see the payoff chart</p>
      </div>
    );
  }

  // Add asset symbol to the payoff data for tooltip display
  const enhancedPayoffData = payoff.payoff.map(point => ({
    ...point,
    underlying_asset: strategy?.underlying_asset
  }));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {strategy && (
            <div>
              <span className="text-sm font-medium">{strategy.definition_name}</span>
              <span className="text-xs text-muted-foreground ml-2">
                ({strategy.underlying_asset} @ ${strategy.underlying_price_at_construction.toLocaleString()})
              </span>
            </div>
          )}
        </div>
        <Button variant="outline" size="sm">
          <ZoomOut className="h-4 w-4 mr-1" />
          Zoom Out
        </Button>
      </div>
    
      <div className="h-80 bg-card/50 rounded-md border p-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={enhancedPayoffData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgb(34, 197, 94)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="rgb(34, 197, 94)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgb(239, 68, 68)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="rgb(239, 68, 68)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="underlying_price" 
              tickFormatter={(value) => `${strategy?.underlying_asset || ''} $${value.toLocaleString()}`}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#8E9196', fontSize: 12 }}
            />
            <YAxis 
              tickFormatter={(value) => `$${value.toLocaleString()}`} 
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#8E9196', fontSize: 12 }}
            />
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2D3748" />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#8E9196" strokeWidth={1} />
            {strategy && (
              <ReferenceLine 
                x={strategy.underlying_price_at_construction} 
                stroke="#8E9196" 
                strokeDasharray="3 3" 
                label={{
                  value: `Current: $${strategy.underlying_price_at_construction.toFixed(2)}`,
                  position: 'top',
                  fill: '#8E9196',
                  fontSize: 12
                }}
              />
            )}
            <Area 
              type="monotone" 
              dataKey="profit_loss" 
              stroke="#8B5CF6" 
              strokeWidth={2}
              fill="url(#colorProfit)"
              activeDot={{ r: 6 }}
              fillOpacity={1}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PayoffGraph;
