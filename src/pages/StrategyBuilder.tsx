
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import { getAvailableAssets } from "@/services/optionsService";
import { getStrategyDefinitions, constructStrategy, calculatePayoff, StrategyDefinition, Strategy, StrategyPayoff } from "@/services/strategyService";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Search, Filter, Plus, Minus, ZoomOut } from "lucide-react";

const StrategyBuilder: React.FC = () => {
  const [assets, setAssets] = useState<string[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<string>("");
  const [strategies, setStrategies] = useState<StrategyDefinition[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("1");
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [payoff, setPayoff] = useState<StrategyPayoff | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("graph");
  const [strategyType, setStrategyType] = useState<string>("all");
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

  const filteredStrategies = strategies.filter(strategy => {
    if (strategyType === "all") return true;
    return strategy.type.toLowerCase() === strategyType.toLowerCase();
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium">Strategy Builder</h1>
        <div className="flex space-x-2">
          <Select
            value={selectedAsset}
            onValueChange={setSelectedAsset}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select asset" />
            </SelectTrigger>
            <SelectContent>
              {assets.map(asset => (
                <SelectItem key={asset} value={asset}>
                  {asset}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            size="sm" 
            onClick={handleConstructStrategy}
            disabled={isLoading || !selectedAsset || !selectedStrategy}
          >
            {isLoading ? "Building..." : "Build Strategy"}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Select Strategy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex space-x-1 mb-4">
                <Button 
                  size="sm" 
                  variant={strategyType === "all" ? "default" : "outline"}
                  onClick={() => setStrategyType("all")}
                  className="text-xs"
                >
                  All
                </Button>
                <Button 
                  size="sm" 
                  variant={strategyType === "bullish" ? "default" : "outline"}
                  onClick={() => setStrategyType("bullish")}
                  className="text-xs"
                >
                  Bullish
                </Button>
                <Button 
                  size="sm" 
                  variant={strategyType === "bearish" ? "default" : "outline"}
                  onClick={() => setStrategyType("bearish")}
                  className="text-xs"
                >
                  Bearish
                </Button>
                <Button 
                  size="sm" 
                  variant={strategyType === "neutral" ? "default" : "outline"}
                  onClick={() => setStrategyType("neutral")}
                  className="text-xs"
                >
                  Neutral
                </Button>
              </div>
              
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search strategies..."
                  className="pl-8"
                />
              </div>
              
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredStrategies.map((strategy) => (
                  <div 
                    key={strategy.name}
                    className={cn(
                      "rounded-md p-2 cursor-pointer border",
                      selectedStrategy === strategy.name 
                        ? "border-primary bg-primary/10" 
                        : "border-border hover:bg-muted/50"
                    )}
                    onClick={() => setSelectedStrategy(strategy.name)}
                  >
                    <div className="font-medium text-sm">{strategy.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {strategy.type}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <div className="flex">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-r-none"
                      onClick={() => setQuantity(prev => (parseFloat(prev) - 0.1).toFixed(1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      id="quantity"
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="rounded-none text-center"
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-l-none"
                      onClick={() => setQuantity(prev => (parseFloat(prev) + 0.1).toFixed(1))}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-9">
          <CardHeader className="pb-3 border-b">
            <div className="flex justify-between items-center">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList>
                  <TabsTrigger value="graph">Payoff Graph</TabsTrigger>
                  <TabsTrigger value="table">Payoff Table</TabsTrigger>
                </TabsList>
              
                {/* The TabsContent components need to be inside the Tabs component */}
                <div className="hidden">
                  {/* This is just a placeholder to make React happy */}
                  {/* The actual content will be rendered outside based on activeTab state */}
                </div>
              </Tabs>
              
              {payoff && (
                <div className="flex items-center space-x-4">
                  <div className="text-xs space-x-2">
                    <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                    <span>Max Profit: ${payoff.max_profit.toFixed(2)}</span>
                  </div>
                  <div className="text-xs space-x-2">
                    <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
                    <span>Max Loss: ${Math.abs(payoff.max_loss).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            {/* Render content based on activeTab state */}
            {activeTab === "graph" && (
              <div className="mt-0">
                {!payoff ? (
                  <div className="h-80 flex items-center justify-center">
                    <p className="text-muted-foreground">Build a strategy to see the payoff chart</p>
                  </div>
                ) : (
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
                          data={payoff.payoff}
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
                          <ReferenceLine y={0} stroke="#8E9196" strokeWidth={1} />
                          {strategy && (
                            <ReferenceLine 
                              x={strategy.underlying_price_at_construction} 
                              stroke="#8E9196" 
                              strokeDasharray="3 3" 
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
                )}
              </div>
            )}
            
            {activeTab === "table" && (
              <div className="mt-0">
                {!strategy ? (
                  <div className="h-80 flex items-center justify-center">
                    <p className="text-muted-foreground">Build a strategy to see the payoff table</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Side</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Strike</TableHead>
                          <TableHead>Expiry</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Delta</TableHead>
                          <TableHead>Gamma</TableHead>
                          <TableHead>Theta</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {strategy.legs.map((leg, index) => (
                          <TableRow key={index}>
                            <TableCell className={leg.side === 'BUY' ? 'text-green-500' : 'text-red-500'}>
                              {leg.side}
                            </TableCell>
                            <TableCell>{leg.selected.option_type}</TableCell>
                            <TableCell>${leg.selected.strike_price.toLocaleString()}</TableCell>
                            <TableCell>{formatDate(leg.selected.expiry_time)}</TableCell>
                            <TableCell>${leg.selected.mark_price.toFixed(2)}</TableCell>
                            <TableCell>{(leg.ratio * parseFloat(quantity)).toFixed(1)}</TableCell>
                            <TableCell>{leg.selected.delta.toFixed(2)}</TableCell>
                            <TableCell>{leg.selected.gamma.toFixed(4)}</TableCell>
                            <TableCell>{leg.selected.theta.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                
                {payoff && (
                  <div className="mt-6 border-t pt-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-muted/30 p-3 rounded-md">
                        <div className="text-xs text-muted-foreground">Max Profit</div>
                        <div className="text-green-500 font-medium">${payoff.max_profit.toFixed(2)}</div>
                      </div>
                      <div className="bg-muted/30 p-3 rounded-md">
                        <div className="text-xs text-muted-foreground">Max Loss</div>
                        <div className="text-red-500 font-medium">${Math.abs(payoff.max_loss).toFixed(2)}</div>
                      </div>
                      <div className="bg-muted/30 p-3 rounded-md">
                        <div className="text-xs text-muted-foreground">Breakeven Points</div>
                        <div className="font-medium">
                          {payoff.breakevens.map((point, i) => (
                            <span key={i}>
                              ${point.toLocaleString()}
                              {i < payoff.breakevens.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StrategyBuilder;
