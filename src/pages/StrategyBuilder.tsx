
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { getAvailableAssets } from "@/services/optionsService";
import { getStrategyDefinitions, constructStrategy, calculatePayoff, StrategyDefinition, Strategy, StrategyPayoff } from "@/services/strategyService";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

const StrategyBuilder: React.FC = () => {
  const [assets, setAssets] = useState<string[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<string>("");
  const [strategies, setStrategies] = useState<StrategyDefinition[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("1");
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [payoff, setPayoff] = useState<StrategyPayoff | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  // Fetch assets and strategy definitions on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assetsData, strategiesData] = await Promise.all([
          getAvailableAssets(),
          getStrategyDefinitions()
        ]);
        
        setAssets(assetsData);
        if (assetsData.length > 0) {
          setSelectedAsset(assetsData[0]);
        }
        
        setStrategies(strategiesData);
        if (strategiesData.length > 0) {
          setSelectedStrategy(strategiesData[0].name);
        }
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch assets or strategy definitions",
          variant: "destructive"
        });
      }
    };
    
    fetchData();
  }, [toast]);

  const handleConstructStrategy = async () => {
    if (!selectedAsset || !selectedStrategy) {
      toast({
        title: "Error",
        description: "Please select both an asset and a strategy",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const constructedStrategy = await constructStrategy(
        selectedStrategy,
        selectedAsset,
        parseFloat(quantity)
      );
      
      setStrategy(constructedStrategy);
      
      // Calculate payoff for the constructed strategy
      const underlyingPrice = constructedStrategy.underlying_price_at_construction;
      const priceRange = underlyingPrice * 0.15; // 15% price range
      
      const payoffData = await calculatePayoff(
        constructedStrategy,
        underlyingPrice - priceRange,
        underlyingPrice + priceRange,
        100
      );
      
      setPayoff(payoffData);
      
      toast({
        title: "Success",
        description: "Strategy constructed successfully"
      });
    } catch (error: any) {
      console.error("Failed to construct strategy:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to construct strategy",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Strategy Builder</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Build Strategy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="asset">Select Asset</Label>
                <Select
                  value={selectedAsset}
                  onValueChange={setSelectedAsset}
                  disabled={assets.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an asset" />
                  </SelectTrigger>
                  <SelectContent>
                    {assets.map(asset => (
                      <SelectItem key={asset} value={asset}>
                        {asset}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="strategy">Select Strategy</Label>
                <Select
                  value={selectedStrategy}
                  onValueChange={setSelectedStrategy}
                  disabled={strategies.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    {strategies.map(strategy => (
                      <SelectItem key={strategy.name} value={strategy.name}>
                        {strategy.name} ({strategy.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              
              <div className="pt-4">
                <Button 
                  className="w-full" 
                  onClick={handleConstructStrategy}
                  disabled={isLoading || !selectedAsset || !selectedStrategy}
                >
                  {isLoading ? "Building Strategy..." : "Build Strategy"}
                </Button>
              </div>
              
              {strategy && (
                <div className="mt-6 border-t pt-4">
                  <h4 className="font-semibold mb-2">Strategy Summary</h4>
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Strategy:</span>
                      <span>{strategy.definition_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Asset:</span>
                      <span>{strategy.underlying_asset}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price:</span>
                      <span>${strategy.underlying_price_at_construction.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Est. Cost:</span>
                      <span className={cn(
                        "font-medium",
                        strategy.estimated_cost < 0 ? "text-profit" : "text-loss"
                      )}>
                        {strategy.estimated_cost < 0 ? "Credit: " : "Debit: "}
                        ${Math.abs(strategy.estimated_cost).toFixed(2)}
                      </span>
                    </div>
                    {payoff && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Max Profit:</span>
                          <span className="text-profit">${payoff.max_profit.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Max Loss:</span>
                          <span className="text-loss">${Math.abs(payoff.max_loss).toFixed(2)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Strategy Payoff</CardTitle>
          </CardHeader>
          <CardContent>
            {!payoff ? (
              <div className="h-64 flex items-center justify-center">
                <p className="text-muted-foreground">Build a strategy to see the payoff chart</p>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={payoff.payoff}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorPayoff" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="rgb(139, 92, 246)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="rgb(139, 92, 246)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="underlying_price" 
                      tickFormatter={(value) => `$${value.toLocaleString()}`}
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
                    <Tooltip 
                      formatter={(value: any) => [`$${parseFloat(value).toFixed(2)}`, 'Profit/Loss']}
                      labelFormatter={(value) => `Price: $${parseFloat(value).toFixed(2)}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="profit_loss" 
                      stroke="#8B5CF6" 
                      fill="url(#colorPayoff)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
            
            {strategy && (
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Strategy Legs</h4>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Side</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Strike</TableHead>
                        <TableHead>Expiry</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Ratio</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {strategy.legs.map((leg, index) => (
                        <TableRow key={index}>
                          <TableCell className={leg.side === 'BUY' ? 'text-profit' : 'text-loss'}>
                            {leg.side}
                          </TableCell>
                          <TableCell>{leg.selected.option_type}</TableCell>
                          <TableCell>${leg.selected.strike_price.toLocaleString()}</TableCell>
                          <TableCell>{formatDate(leg.selected.expiry_time)}</TableCell>
                          <TableCell>${leg.selected.mark_price.toFixed(2)}</TableCell>
                          <TableCell>{leg.ratio}x</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StrategyBuilder;
