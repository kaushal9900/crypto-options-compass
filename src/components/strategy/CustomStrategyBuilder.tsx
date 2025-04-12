
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { getOptionChain, OptionContract } from "@/services/optionsService";
import { Plus, X, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface CustomStrategyBuilderProps {
  assets: string[];
  selectedAsset: string;
  onAssetChange: (asset: string) => void;
  onBuildCustomStrategy: (selectedOptions: CustomStrategyOption[]) => void;
}

export interface CustomStrategyOption {
  option: OptionContract;
  side: 'BUY' | 'SELL';
  quantity: number;
}

const CustomStrategyBuilder: React.FC<CustomStrategyBuilderProps> = ({
  assets,
  selectedAsset,
  onAssetChange,
  onBuildCustomStrategy
}) => {
  const [optionChain, setOptionChain] = useState<{
    calls: OptionContract[];
    puts: OptionContract[];
  }>({ calls: [], puts: [] });
  const [selectedOptions, setSelectedOptions] = useState<CustomStrategyOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("calls");
  const [expiryDates, setExpiryDates] = useState<{value: string, label: string}[]>([]);
  const [selectedExpiry, setSelectedExpiry] = useState<string>("");
  const { toast } = useToast();

  // Fetch option chain when asset changes
  useEffect(() => {
    if (!selectedAsset) return;
    
    const fetchOptionChain = async () => {
      setIsLoading(true);
      try {
        const data = await getOptionChain(selectedAsset);
        
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
            
            // Set option chain for the first expiry date
            if (data.options_by_expiry[formattedDates[0].value]) {
              setOptionChain({
                calls: data.options_by_expiry[formattedDates[0].value].call || [],
                puts: data.options_by_expiry[formattedDates[0].value].put || []
              });
            }
          }
        }
        
        toast({
          title: "Option chain loaded",
          description: `Option chain for ${selectedAsset} loaded successfully`
        });
      } catch (error) {
        console.error("Failed to fetch option chain:", error);
        toast({
          title: "Error",
          description: "Failed to fetch option chain",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOptionChain();
  }, [selectedAsset, toast]);
  
  // Update option chain when expiry date changes
  useEffect(() => {
    if (!selectedExpiry || !selectedAsset) return;
    
    const updateOptionChainByExpiry = async () => {
      setIsLoading(true);
      try {
        const data = await getOptionChain(selectedAsset);
        
        if (data.options_by_expiry && data.options_by_expiry[selectedExpiry]) {
          setOptionChain({
            calls: data.options_by_expiry[selectedExpiry].call || [],
            puts: data.options_by_expiry[selectedExpiry].put || []
          });
        }
      } catch (error) {
        console.error("Failed to update option chain:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    updateOptionChainByExpiry();
  }, [selectedExpiry, selectedAsset]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const addOptionToStrategy = (option: OptionContract, side: 'BUY' | 'SELL') => {
    setSelectedOptions([...selectedOptions, {
      option,
      side,
      quantity: 1
    }]);
  };

  const removeOptionFromStrategy = (index: number) => {
    const newOptions = [...selectedOptions];
    newOptions.splice(index, 1);
    setSelectedOptions(newOptions);
  };

  const updateOptionQuantity = (index: number, quantity: number) => {
    const newOptions = [...selectedOptions];
    newOptions[index].quantity = quantity;
    setSelectedOptions(newOptions);
  };

  const handleBuildStrategy = () => {
    if (selectedOptions.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one option",
        variant: "destructive"
      });
      return;
    }
    onBuildCustomStrategy(selectedOptions);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Custom Strategy Builder</h2>
        <div className="flex space-x-2">
          <Select
            value={selectedAsset}
            onValueChange={onAssetChange}
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
          
          {expiryDates.length > 0 && (
            <Select 
              value={selectedExpiry} 
              onValueChange={setSelectedExpiry}
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
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Selected Options</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedOptions.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No options selected. Add options from the option chain below.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Side</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Strike</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedOptions.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className={item.side === 'BUY' ? 'text-green-500' : 'text-red-500'}>
                      {item.side}
                    </TableCell>
                    <TableCell>{item.option.option_type}</TableCell>
                    <TableCell>${item.option.strike_price.toLocaleString()}</TableCell>
                    <TableCell>
                      {new Date(item.option.expiry_time).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={item.quantity}
                        onChange={(e) => updateOptionQuantity(index, parseFloat(e.target.value))}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeOptionFromStrategy(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          <div className="mt-4 flex justify-end">
            <Button 
              onClick={handleBuildStrategy}
              disabled={selectedOptions.length === 0}
            >
              Build Custom Strategy
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Option Chain</CardTitle>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="calls">Calls</TabsTrigger>
              <TabsTrigger value="puts">Puts</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-6">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p>Loading option chain...</p>
            </div>
          ) : optionChain.calls.length === 0 && optionChain.puts.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No option chain data available for {selectedAsset}.
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Strike</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Mark</TableHead>
                    <TableHead>Delta</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(activeTab === "calls" ? optionChain.calls : optionChain.puts).map((option, index) => (
                    <TableRow key={index}>
                      <TableCell>${option.strike_price.toLocaleString()}</TableCell>
                      <TableCell>
                        {new Date(option.expiry_time).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>${option.mark_price.toFixed(2)}</TableCell>
                      <TableCell>{option.delta?.toFixed(2) || "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-green-500"
                            onClick={() => addOptionToStrategy(option, 'BUY')}
                          >
                            <Plus className="h-3 w-3 mr-1" /> Buy
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-500"
                            onClick={() => addOptionToStrategy(option, 'SELL')}
                          >
                            <Plus className="h-3 w-3 mr-1" /> Sell
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomStrategyBuilder;
