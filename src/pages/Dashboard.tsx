
import React, { useState, useEffect } from "react";
import { CircleDollarSign, Activity } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import PriceChart from "@/components/dashboard/PriceChart";
import TopOptions from "@/components/dashboard/TopOptions";
import { getOptionChain } from "@/services/optionsService";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Dashboard: React.FC = () => {
  const [assetData, setAssetData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedAsset, setSelectedAsset] = useState<string>("BTC");
  const { toast } = useToast();

  useEffect(() => {
    const fetchAssetData = async () => {
      try {
        setIsLoading(true);
        const data = await getOptionChain(selectedAsset);
        setAssetData(data);
      } catch (error) {
        console.error(`Failed to fetch ${selectedAsset} data:`, error);
        toast({
          title: "Error",
          description: "Failed to load market data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssetData();
  }, [toast, selectedAsset]);

  // Calculate some statistics from the options data
  const calculateStats = () => {
    if (!assetData) return {
      price: "$0",
      change: 0,
      volume: "$0M",
      volumeChange: 0,
    };
    
    // Get all available option contracts from all expiry dates
    const allOptions = [];
    
    if (assetData.options_by_expiry) {
      // Extract options from all expiry dates
      Object.keys(assetData.options_by_expiry).forEach(expiry => {
        const expiryData = assetData.options_by_expiry[expiry];
        if (expiryData.call && Array.isArray(expiryData.call)) {
          allOptions.push(...expiryData.call);
        }
        if (expiryData.put && Array.isArray(expiryData.put)) {
          allOptions.push(...expiryData.put);
        }
      });
    } else if (assetData.calls && assetData.puts) {
      // Fallback to old structure
      allOptions.push(...assetData.calls, ...assetData.puts);
    }
    
    // Calculate total volume
    const totalVolume = allOptions.reduce(
      (sum, option) => sum + (option.volume * option.mark_price), 
      0
    );

    return {
      price: `$${assetData.underlying_price.toLocaleString()}`,
      change: 2.4, // Mock change data
      volume: `$${(totalVolume / 1000000).toFixed(1)}M`,
      volumeChange: 5.2, // Mock change data
    };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium">Market Overview</h1>
        <Select
          value={selectedAsset}
          onValueChange={setSelectedAsset}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Select asset" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="BTC">BTC</SelectItem>
            <SelectItem value="ETH">ETH</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title={`${selectedAsset} Price`}
          value={stats.price}
          change={stats.change}
          icon={<CircleDollarSign className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
        <StatCard
          title="Total Trading Volume"
          value={stats.volume}
          change={stats.volumeChange}
          icon={<Activity className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <PriceChart 
          symbol={`${selectedAsset}/USD`}
          btcPrice={assetData?.underlying_price} 
          isLoading={isLoading} 
        />
      </div>

      <TopOptions optionsData={assetData} isLoading={isLoading} />
    </div>
  );
};

export default Dashboard;
