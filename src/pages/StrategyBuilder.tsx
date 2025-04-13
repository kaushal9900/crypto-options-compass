
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAvailableAssets, OptionContract } from "@/services/optionsService";
import { getStrategyDefinitions, constructStrategy, calculatePayoff, StrategyDefinition, Strategy, StrategyPayoff } from "@/services/strategyService";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Search, Filter, Plus, Minus, Save, PlusCircle, Layers } from "lucide-react";
import PayoffGraph from "@/components/strategy/PayoffGraph";
import PayoffTable from "@/components/strategy/PayoffTable";
import CustomStrategyBuilder, { CustomStrategyOption } from "@/components/strategy/CustomStrategyBuilder";
import StrategyComparison from "@/components/strategy/StrategyComparison";
import RiskAnalysisDashboard from "@/components/strategy/RiskAnalysisDashboard";

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
  const [isCustomStrategy, setIsCustomStrategy] = useState<boolean>(false);
  const [mainView, setMainView] = useState<"builder" | "comparison" | "risk">("builder");
  const [comparisonStrategies, setComparisonStrategies] = useState<Array<{strategy: Strategy, payoff: StrategyPayoff}>>([]);
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
    if (!selectedAsset || (!selectedStrategy && !isCustomStrategy)) {
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

  const handleBuildCustomStrategy = async (selectedOptions: CustomStrategyOption[]) => {
    // This function will now be called for logging purposes only
    toast({
      title: "Custom Strategy",
      description: `Processing ${selectedOptions.length} options for custom strategy`
    });
  };
  
  const handleCustomStrategyBuilt = (constructedStrategy: Strategy, payoffData: StrategyPayoff) => {
    // Update state with the custom strategy and payoff data
    setStrategy(constructedStrategy);
    setPayoff(payoffData);
    
    // Switch to builder view if not already there
    setMainView("builder");
    
    // Switch to graph tab to show the payoff
    setActiveTab("graph");
    
    // Disable custom strategy mode since we now have results
    setIsCustomStrategy(false);
  };

  const handleAddToComparison = () => {
    if (strategy && payoff) {
      const exists = comparisonStrategies.some(
        item => item.strategy.definition_name === strategy.definition_name
      );
      
      if (!exists) {
        setComparisonStrategies(prev => [...prev, { strategy, payoff }]);
        toast({
          title: "Added to Comparison",
          description: `${strategy.definition_name} added to comparison`
        });
      } else {
        toast({
          title: "Already Added",
          description: "This strategy is already in your comparison"
        });
      }
    }
  };

  const handleRemoveFromComparison = (index: number) => {
    setComparisonStrategies(prev => prev.filter((_, i) => i !== index));
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
          <div className="flex space-x-2">
            <Button 
              variant={mainView === "builder" ? "default" : "outline"}
              size="sm" 
              onClick={() => setMainView("builder")}
              className="flex items-center"
            >
              <Layers className="h-4 w-4 mr-1" />
              Builder
            </Button>
            <Button 
              variant={mainView === "comparison" ? "default" : "outline"}
              size="sm" 
              onClick={() => setMainView("comparison")}
              className="flex items-center"
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              Compare ({comparisonStrategies.length})
            </Button>
            <Button 
              variant={mainView === "risk" ? "default" : "outline"}
              size="sm" 
              onClick={() => setMainView("risk")}
              className="flex items-center"
            >
              <Save className="h-4 w-4 mr-1" />
              Risk
            </Button>
          </div>
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
          
          {!isCustomStrategy && (
            <Button 
              size="sm" 
              onClick={handleConstructStrategy}
              disabled={isLoading || !selectedAsset || !selectedStrategy}
            >
              {isLoading ? "Building..." : "Build Strategy"}
            </Button>
          )}
        </div>
      </div>
      
      {mainView === "builder" && (
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
                
                {/* Add the Custom Strategy option at the top */}
                <div 
                  className={cn(
                    "rounded-md p-2 cursor-pointer border bg-secondary",
                    isCustomStrategy ? "border-primary" : "border-border hover:bg-secondary/70"
                  )}
                  onClick={() => {
                    setIsCustomStrategy(true);
                    setSelectedStrategy("");
                  }}
                >
                  <div className="font-medium text-sm">Custom Strategy</div>
                  <div className="text-xs text-muted-foreground">
                    Build your own strategy with selected options
                  </div>
                </div>
                
                {/* Strategy list */}
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {filteredStrategies.map((strategy) => (
                    <div 
                      key={strategy.name}
                      className={cn(
                        "rounded-md p-2 cursor-pointer border",
                        selectedStrategy === strategy.name && !isCustomStrategy
                          ? "border-primary bg-primary/10" 
                          : "border-border hover:bg-muted/50"
                      )}
                      onClick={() => {
                        setSelectedStrategy(strategy.name);
                        setIsCustomStrategy(false);
                      }}
                    >
                      <div className="font-medium text-sm">{strategy.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {strategy.type}
                      </div>
                    </div>
                  ))}
                </div>
                
                {!isCustomStrategy && (
                  <div className="pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <div className="flex">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="rounded-r-none"
                          onClick={() => setQuantity(prev => (Math.max(0.1, parseFloat(prev) - 0.1)).toFixed(1))}
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
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-9">
            {isCustomStrategy ? (
              <CustomStrategyBuilder 
                assets={assets}
                selectedAsset={selectedAsset}
                onAssetChange={setSelectedAsset}
                onBuildCustomStrategy={handleBuildCustomStrategy}
                onCustomStrategyBuilt={handleCustomStrategyBuilt}
              />
            ) : (
              <>
                <CardHeader className="pb-3 border-b">
                  <div className="flex justify-between items-center">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList>
                        <TabsTrigger value="graph">Payoff Graph</TabsTrigger>
                        <TabsTrigger value="table">Payoff Table</TabsTrigger>
                      </TabsList>
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
                        {strategy && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="ml-2" 
                            onClick={handleAddToComparison}
                          >
                            <PlusCircle className="h-3 w-3 mr-1" />
                            Add to Compare
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-6">
                  {/* Render content based on activeTab state */}
                  {activeTab === "graph" && (
                    <PayoffGraph 
                      strategy={strategy} 
                      payoff={payoff}
                    />
                  )}
                  
                  {activeTab === "table" && (
                    <PayoffTable strategy={strategy} payoff={payoff} quantity={quantity} />
                  )}
                </CardContent>
              </>
            )}
          </Card>
        </div>
      )}

      {mainView === "comparison" && (
        <div className="space-y-6">
          <StrategyComparison 
            strategies={comparisonStrategies}
            onRemoveStrategy={handleRemoveFromComparison}
          />
          {comparisonStrategies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Comparison Chart</CardTitle>
              </CardHeader>
              <CardContent>
                <PayoffGraph 
                  strategy={strategy}
                  payoff={payoff}
                  comparisonPayoffs={comparisonStrategies}
                />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {mainView === "risk" && (
        <RiskAnalysisDashboard strategy={strategy} payoff={payoff} />
      )}
    </div>
  );
};

export default StrategyBuilder;
