
import React, { useState, useEffect } from "react";
import { CircleDollarSign, TrendingUp, Activity, BarChart3 } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import PriceChart from "@/components/dashboard/PriceChart";
import TopOptions from "@/components/dashboard/TopOptions";
import OptionsCalculator from "@/components/dashboard/OptionsCalculator";
import { getOptionChain } from "@/services/optionsService";
import { useToast } from "@/components/ui/use-toast";

const Dashboard: React.FC = () => {
  const [btcData, setBtcData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBTCData = async () => {
      try {
        const data = await getOptionChain('BTC');
        setBtcData(data);
      } catch (error) {
        console.error("Failed to fetch BTC data:", error);
        toast({
          title: "Error",
          description: "Failed to load market data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBTCData();
  }, [toast]);

  // Calculate some statistics from the options data
  const calculateStats = () => {
    if (!btcData) return {
      price: "$0",
      change: 0,
      volume: "$0M",
      volumeChange: 0,
      activeOptions: 0,
      activeChange: 0,
      roi: "0%",
      roiChange: 0
    };

    // Get total volume across all calls and puts
    const totalVolume = [...btcData.calls, ...btcData.puts].reduce(
      (sum, option) => sum + option.volume * option.mark_price, 
      0
    );
    
    // Count options with volume > 0
    const activeOptionsCount = [...btcData.calls, ...btcData.puts].filter(
      option => option.volume > 0
    ).length;

    return {
      price: `$${btcData.underlying_price.toLocaleString()}`,
      change: 2.4, // Mock change data
      volume: `$${(totalVolume / 1000000).toFixed(1)}M`,
      volumeChange: 5.2, // Mock change data
      activeOptions: activeOptionsCount,
      activeChange: -3.8, // Mock change data
      roi: "18.2%", // Mock ROI data
      roiChange: 12.5 // Mock ROI change data
    };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="BTC Price"
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
        <StatCard
          title="Active Options"
          value={stats.activeOptions.toString()}
          change={stats.activeChange}
          icon={<BarChart3 className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
        <StatCard
          title="30-Day ROI"
          value={stats.roi}
          change={stats.roiChange}
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PriceChart 
          className="lg:col-span-2" 
          btcPrice={btcData?.underlying_price} 
          isLoading={isLoading} 
        />
        <OptionsCalculator initialPrice={btcData?.underlying_price} />
      </div>

      <TopOptions optionsData={btcData} isLoading={isLoading} />
    </div>
  );
};

export default Dashboard;
