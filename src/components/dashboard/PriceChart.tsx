
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// Mock data
const data = [
  { date: "Apr 1", price: 47500 },
  { date: "Apr 2", price: 48200 },
  { date: "Apr 3", price: 48900 },
  { date: "Apr 4", price: 49100 },
  { date: "Apr 5", price: 48750 },
  { date: "Apr 6", price: 50100 },
  { date: "Apr 7", price: 51200 },
  { date: "Apr 8", price: 52500 },
  { date: "Apr 9", price: 53000 },
  { date: "Apr 10", price: 54200 },
  { date: "Apr 11", price: 53500 },
  { date: "Apr 12", price: 54800 },
];

interface PriceChartProps {
  symbol?: string;
  className?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded p-3 shadow-lg">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-lg font-medium text-foreground">
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }

  return null;
};

const PriceChart: React.FC<PriceChartProps> = ({ symbol = "BTC/USD", className }) => {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-medium">{symbol} Price</CardTitle>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold">$54,800</span>
            <span className="text-profit text-sm font-medium">+2.4%</span>
          </div>
        </div>
        <Tabs defaultValue="1D" className="w-auto">
          <TabsList className="grid grid-cols-5 h-8">
            <TabsTrigger value="1D">1D</TabsTrigger>
            <TabsTrigger value="1W">1W</TabsTrigger>
            <TabsTrigger value="1M">1M</TabsTrigger>
            <TabsTrigger value="3M">3M</TabsTrigger>
            <TabsTrigger value="1Y">1Y</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(139, 92, 246)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="rgb(139, 92, 246)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#8E9196', fontSize: 12 }}
              />
              <YAxis 
                orientation="right"
                tickFormatter={(value) => `$${value.toLocaleString()}`} 
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#8E9196', fontSize: 12 }}
              />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2D3748" />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="#8B5CF6" 
                fillOpacity={1}
                fill="url(#colorPrice)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceChart;
