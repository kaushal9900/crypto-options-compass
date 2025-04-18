
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, Filter, Search, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAvailableAssets, getOptionChain, OptionChain as OptionChainType } from "@/services/optionsService";
import { useToast } from "@/components/ui/use-toast";

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const extractExpiryDate = (expiryTime: string): string => {
  const date = new Date(expiryTime);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

const OptionsChain: React.FC = () => {
  const [displayMode, setDisplayMode] = useState<"basic" | "advanced">("basic");
  const [selectedAsset, setSelectedAsset] = useState<string>("");
  const [availableAssets, setAvailableAssets] = useState<string[]>([]);
  const [expiryDates, setExpiryDates] = useState<{value: string, label: string}[]>([]);
  const [selectedExpiry, setSelectedExpiry] = useState<string>("");
  const [optionChain, setOptionChain] = useState<OptionChainType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filterITM, setFilterITM] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Fetch available assets on component mount
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const assets = await getAvailableAssets();
        setAvailableAssets(assets);
        if (assets.length > 0) {
          setSelectedAsset(assets[0]);
        }
      } catch (error) {
        console.error("Failed to fetch assets:", error);
        toast({
          title: "Error",
          description: "Failed to fetch available assets",
          variant: "destructive"
        });
      }
    };
    
    fetchAssets();
  }, [toast]);
  
  // Fetch option chain when selected asset changes
  useEffect(() => {
    if (!selectedAsset) return;
    
    const fetchOptionChain = async () => {
      setIsLoading(true);
      try {
        const data = await getOptionChain(selectedAsset);
        setOptionChain(data);
        
        // Extract and format expiry dates
        if (data.options_by_expiry) {
          const formattedDates = Object.keys(data.options_by_expiry).map(date => {
            const formattedDate = formatDate(date);
            const daysToExpiry = Math.ceil((new Date(date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
            return {
              value: date,
              label: `${formattedDate} (${daysToExpiry}d)`
            };
          });
          
          setExpiryDates(formattedDates);
          if (formattedDates.length > 0) {
            setSelectedExpiry(formattedDates[0].value);
          }
        }
      } catch (error) {
        console.error("Failed to fetch option chain:", error);
        toast({
          title: "Error",
          description: `Failed to fetch option chain for ${selectedAsset}`,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOptionChain();
  }, [selectedAsset, toast]);
  
  // Filter options by expiry date
  const filteredOptions = React.useMemo(() => {
    if (!optionChain || !selectedExpiry) return { calls: [], puts: [] };
    
    // Handle both data structures
    if (optionChain.options_by_expiry && optionChain.options_by_expiry[selectedExpiry]) {
      const expiryData = optionChain.options_by_expiry[selectedExpiry];
      return {
        calls: expiryData.call || [],
        puts: expiryData.put || []
      };
    }
    
    // Fallback to old structure if present
    if (optionChain.calls && optionChain.puts) {
      return {
        calls: optionChain.calls.filter(call => call.expiry_time === selectedExpiry),
        puts: optionChain.puts.filter(put => put.expiry_time === selectedExpiry)
      };
    }
    
    return { calls: [], puts: [] };
  }, [optionChain, selectedExpiry]);

  // Further filter options if filterITM is true
  const displayOptions = React.useMemo(() => {
    if (!optionChain || !filteredOptions.calls.length) return filteredOptions;
    
    if (filterITM) {
      const underlyingPrice = optionChain.underlying_price;
      return {
        calls: filteredOptions.calls.filter(call => call.strike_price <= underlyingPrice * 1.15),
        puts: filteredOptions.puts.filter(put => put.strike_price >= underlyingPrice * 0.85)
      };
    }
    
    return filteredOptions;
  }, [filteredOptions, optionChain, filterITM]);
  
  const handleRefresh = async () => {
    if (!selectedAsset) return;
    
    setIsLoading(true);
    try {
      const data = await getOptionChain(selectedAsset);
      setOptionChain(data);
      toast({
        title: "Success",
        description: "Option chain data refreshed",
      });
    } catch (error) {
      console.error("Failed to refresh option chain:", error);
      toast({
        title: "Error",
        description: "Failed to refresh option chain data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium">Options Chain</h1>
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setFilterITM(!filterITM)}
          >
            <Filter className="mr-2 h-4 w-4" />
            {filterITM ? "Show All" : "Show ITM Only"}
          </Button>
          <Button 
            size="sm" 
            variant="default" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {isLoading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">
              {selectedAsset && optionChain ? 
                `${selectedAsset} @ $${optionChain.underlying_price.toLocaleString()}` : 
                "Select an Asset"}
            </CardTitle>
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <Label htmlFor="asset-selector">Asset:</Label>
                <Select 
                  value={selectedAsset} 
                  onValueChange={setSelectedAsset}
                  disabled={availableAssets.length === 0}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAssets.map((asset) => (
                      <SelectItem key={asset} value={asset}>
                        {asset}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <Label htmlFor="expiry-selector">Expiration:</Label>
                <Select 
                  value={selectedExpiry} 
                  onValueChange={setSelectedExpiry}
                  disabled={expiryDates.length === 0}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {expiryDates.map((date) => (
                      <SelectItem key={date.value} value={date.value}>
                        {date.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Tabs value={displayMode} onValueChange={(v) => setDisplayMode(v as "basic" | "advanced")}>
                <TabsList>
                  <TabsTrigger value="basic">Basic View</TabsTrigger>
                  <TabsTrigger value="advanced">Greeks View</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-60 flex items-center justify-center">
              <p className="text-muted-foreground">Loading option chain data...</p>
            </div>
          ) : !optionChain ? (
            <div className="h-60 flex items-center justify-center">
              <p className="text-muted-foreground">Select an asset to view option chain</p>
            </div>
          ) : displayOptions.calls.length === 0 ? (
            <div className="h-60 flex items-center justify-center">
              <p className="text-muted-foreground">No option data available for the selected expiry date</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/20 text-xs font-medium text-muted-foreground">
                    <th colSpan={displayMode === "basic" ? 6 : 10} className="border-r border-border p-2 text-center">
                      CALLS
                    </th>
                    <th className="p-2 text-center">STRIKE</th>
                    <th colSpan={displayMode === "basic" ? 6 : 10} className="border-l border-border p-2 text-center">
                      PUTS
                    </th>
                  </tr>
                  <tr className="bg-muted/20 text-xs font-medium text-muted-foreground">
                    {/* CALLS */}
                    <th className="p-2 text-right">Bid</th>
                    <th className="p-2 text-right">Ask</th>
                    <th className="p-2 text-right">Last</th>
                    <th className="p-2 text-right">Change</th>
                    <th className="p-2 text-right">Vol</th>
                    <th className="p-2 text-right">IV</th>
                    
                    {displayMode === "advanced" && (
                      <>
                        <th className="p-2 text-right">Delta</th>
                        <th className="p-2 text-right">Gamma</th>
                        <th className="p-2 text-right">Theta</th>
                        <th className="p-2 text-right">Vega</th>
                      </>
                    )}
                    
                    {/* STRIKE */}
                    <th className="p-2 text-center font-bold">Price</th>
                    
                    {/* PUTS */}
                    <th className="p-2 text-right">Bid</th>
                    <th className="p-2 text-right">Ask</th>
                    <th className="p-2 text-right">Last</th>
                    <th className="p-2 text-right">Change</th>
                    <th className="p-2 text-right">Vol</th>
                    <th className="p-2 text-right">IV</th>
                    
                    {displayMode === "advanced" && (
                      <>
                        <th className="p-2 text-right">Delta</th>
                        <th className="p-2 text-right">Gamma</th>
                        <th className="p-2 text-right">Theta</th>
                        <th className="p-2 text-right">Vega</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {displayOptions.calls.map((call) => {
                    // Find corresponding put with same strike price
                    const matchingPut = displayOptions.puts.find(
                      (put) => put.strike_price === call.strike_price
                    );
                    
                    if (!matchingPut) return null;
                    
                    const isAtm = Math.abs(call.strike_price - optionChain.underlying_price) < optionChain.underlying_price * 0.01;
                    const isItm = call.strike_price < optionChain.underlying_price;
                    const isPutItm = matchingPut.strike_price > optionChain.underlying_price;
                    
                    return (
                      <tr 
                        key={call.symbol} 
                        className={cn(
                          "text-xs hover:bg-muted/30 transition-colors",
                          isAtm && "bg-muted/20"
                        )}
                      >
                        {/* CALLS */}
                        <td className={cn("p-2 text-right", isItm && "text-green-500 font-medium")}>${call.bid_price.toFixed(2)}</td>
                        <td className={cn("p-2 text-right", isItm && "text-green-500 font-medium")}>${call.ask_price.toFixed(2)}</td>
                        <td className={cn("p-2 text-right", isItm && "text-green-500 font-medium")}>${call.last_price.toFixed(2)}</td>
                        <td className="p-2 text-right font-medium text-green-500">
                          {/* Change data not provided in API */}
                          N/A
                        </td>
                        <td className="p-2 text-right">{call.volume}</td>
                        <td className="p-2 text-right">{(call.implied_volatility! * 100).toFixed(1)}%</td>
                        
                        {displayMode === "advanced" && (
                          <>
                            <td className="p-2 text-right">{call.delta.toFixed(2)}</td>
                            <td className="p-2 text-right">{call.gamma.toFixed(4)}</td>
                            <td className="p-2 text-right">{call.theta.toFixed(2)}</td>
                            <td className="p-2 text-right">{call.vega.toFixed(2)}</td>
                          </>
                        )}
                        
                        {/* STRIKE */}
                        <td className="p-2 text-center font-bold border-x border-border bg-muted/10">
                          ${call.strike_price.toLocaleString()}
                        </td>
                        
                        {/* PUTS */}
                        <td className={cn("p-2 text-right", isPutItm && "text-green-500 font-medium")}>${matchingPut.bid_price.toFixed(2)}</td>
                        <td className={cn("p-2 text-right", isPutItm && "text-green-500 font-medium")}>${matchingPut.ask_price.toFixed(2)}</td>
                        <td className={cn("p-2 text-right", isPutItm && "text-green-500 font-medium")}>${matchingPut.last_price.toFixed(2)}</td>
                        <td className="p-2 text-right font-medium text-red-500">
                          {/* Change data not provided in API */}
                          N/A
                        </td>
                        <td className="p-2 text-right">{matchingPut.volume}</td>
                        <td className="p-2 text-right">{(matchingPut.implied_volatility! * 100).toFixed(1)}%</td>
                        
                        {displayMode === "advanced" && (
                          <>
                            <td className="p-2 text-right">{matchingPut.delta.toFixed(2)}</td>
                            <td className="p-2 text-right">{matchingPut.gamma.toFixed(4)}</td>
                            <td className="p-2 text-right">{matchingPut.theta.toFixed(2)}</td>
                            <td className="p-2 text-right">{matchingPut.vega.toFixed(2)}</td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OptionsChain;
