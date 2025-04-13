import React, { useState } from "react";
import { Strategy, StrategyPayoff } from "@/services/strategyService";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid,
  ReferenceLine,
  LineChart,
  Line,
  BarChart,
  Bar
} from "recharts";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ZoomIn, ZoomOut, ChevronDown } from "lucide-react";

interface PayoffGraphProps {
  strategy: Strategy | null;
  payoff: StrategyPayoff | null;
  comparisonPayoffs?: Array<{
    strategy: Strategy;
    payoff: StrategyPayoff;
  }>;
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
        {payload.map((entry, index) => (
          <p 
            key={index}
            className={`text-sm ${entry.value >= 0 ? 'text-green-500' : 'text-red-500'}`}
          >
            {entry.name}: ${entry.value.toFixed(2)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const PayoffGraph: React.FC<PayoffGraphProps> = ({ strategy, payoff, comparisonPayoffs = [] }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [chartType, setChartType] = useState<"area" | "line" | "bar">("area");
  
  const hasData = payoff !== null || (comparisonPayoffs && comparisonPayoffs.length > 0);

  if (!hasData) {
    return (
      <div className="h-80 flex items-center justify-center">
        <p className="text-muted-foreground">Build a strategy to see the payoff chart</p>
      </div>
    );
  }

  const basePayoff = payoff || (comparisonPayoffs.length > 0 ? comparisonPayoffs[0].payoff : null);
  if (!basePayoff) return null;
  
  const enhancedPayoffData = basePayoff.payoff.map(point => ({
    ...point,
    underlying_asset: strategy?.underlying_asset || (comparisonPayoffs[0]?.strategy.underlying_asset || ''),
    ...(strategy && { [strategy.definition_name || 'Current']: point.profit_loss })
  }));

  if (comparisonPayoffs && comparisonPayoffs.length > 0) {
    enhancedPayoffData.forEach((point, index) => {
      comparisonPayoffs.forEach(item => {
        if (item.payoff.payoff[index]) {
          point[item.strategy.definition_name] = item.payoff.payoff[index].profit_loss;
        }
      });
    });
  }

  const zoomedData = () => {
    if (zoomLevel === 1) return enhancedPayoffData;
    
    const midpoint = Math.floor(enhancedPayoffData.length / 2);
    const rangeSize = Math.floor(enhancedPayoffData.length / (2 * zoomLevel));
    
    return enhancedPayoffData.slice(
      Math.max(0, midpoint - rangeSize),
      Math.min(enhancedPayoffData.length, midpoint + rangeSize)
    );
  };

  const zoomIn = () => {
    if (zoomLevel < 4) setZoomLevel(prev => prev + 0.5);
  };

  const zoomOut = () => {
    if (zoomLevel > 1) setZoomLevel(prev => prev - 0.5);
  };

  const getStrategyColor = (index: number) => {
    const colors = ['#8B5CF6', '#EC4899', '#F97316', '#10B981', '#3B82F6', '#F59E0B'];
    return colors[index % colors.length];
  };

  const renderChartContent = () => {
    const data = zoomedData();

    const chartProps = {
      data,
      margin: { top: 10, right: 30, left: 0, bottom: 0 }
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2D3748" />
            <XAxis 
              dataKey="underlying_price" 
              tickFormatter={(value) => `${data[0]?.underlying_asset || ''} $${value.toLocaleString()}`}
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
            {strategy && (
              <Line 
                type="monotone" 
                dataKey={strategy.definition_name || 'Current'} 
                stroke="#8B5CF6" 
                strokeWidth={2}
                dot={false}
              />
            )}
            {comparisonPayoffs.map((item, index) => (
              <Line 
                key={index}
                type="monotone" 
                dataKey={item.strategy.definition_name} 
                stroke={getStrategyColor(index + 1)} 
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        );
          
      case 'bar':
        return (
          <BarChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2D3748" />
            <XAxis 
              dataKey="underlying_price" 
              tickFormatter={(value) => `${data[0]?.underlying_asset || ''} $${value.toLocaleString()}`}
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
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#8E9196" strokeWidth={1} />
            {strategy && (
              <Bar dataKey={strategy.definition_name || 'Current'} fill="#8B5CF6" />
            )}
            {comparisonPayoffs.map((item, index) => (
              <Bar 
                key={index}
                dataKey={item.strategy.definition_name} 
                fill={getStrategyColor(index + 1)} 
              />
            ))}
          </BarChart>
        );
          
      default: // area
        return (
          <AreaChart {...chartProps}>
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
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2D3748" />
            <XAxis 
              dataKey="underlying_price" 
              tickFormatter={(value) => `${data[0]?.underlying_asset || ''} $${value.toLocaleString()}`}
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
            {strategy && (
              <Area 
                type="monotone" 
                dataKey={strategy.definition_name || 'Current'} 
                stroke="#8B5CF6" 
                strokeWidth={2}
                fill="url(#colorProfit)"
                activeDot={{ r: 6 }}
                fillOpacity={1}
              />
            )}
            {comparisonPayoffs.map((item, index) => (
              <Area 
                key={index}
                type="monotone" 
                dataKey={item.strategy.definition_name} 
                stroke={getStrategyColor(index + 1)} 
                strokeWidth={2}
                fill={getStrategyColor(index + 1)}
                fillOpacity={0.3}
              />
            ))}
          </AreaChart>
        );
    }
  };

  const displayStrategy = strategy || (comparisonPayoffs.length > 0 ? comparisonPayoffs[0].strategy : null);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {displayStrategy && (
            <div>
              <span className="text-sm font-medium">{displayStrategy.definition_name}</span>
              <span className="text-xs text-muted-foreground ml-2">
                ({displayStrategy.underlying_asset} @ ${displayStrategy.underlying_price_at_construction.toLocaleString()})
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Select value={chartType} onValueChange={(value) => setChartType(value as "area" | "line" | "bar")}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Chart Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="area">Area Chart</SelectItem>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-r-none"
              onClick={zoomIn}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-l-none"
              onClick={zoomOut}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    
      <div className="h-80 bg-card/50 rounded-md border p-4">
        <ResponsiveContainer width="100%" height="100%">
          {renderChartContent()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PayoffGraph;
