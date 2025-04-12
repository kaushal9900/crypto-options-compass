
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { OptionChain, OptionContract } from "@/services/optionsService";

type Option = {
  id: string;
  strike: number;
  type: "CALL" | "PUT";
  expiry: string;
  premium: number;
  change: number;
  volume: number;
  iv: number;
};

interface TopOptionsProps {
  className?: string;
  optionsData: OptionChain | null;
  isLoading?: boolean;
}

const TopOptions: React.FC<TopOptionsProps> = ({ 
  className, 
  optionsData, 
  isLoading = false 
}) => {
  // Process backend data to create top options list
  const processTopOptions = (): Option[] => {
    if (!optionsData) return [];
    
    const allOptions: OptionContract[] = [];
    
    // Handle both data structures - direct calls/puts or options_by_expiry
    if (optionsData.calls && optionsData.puts) {
      allOptions.push(...optionsData.calls, ...optionsData.puts);
    } else if (optionsData.options_by_expiry) {
      // Extract options from all expiry dates
      Object.keys(optionsData.options_by_expiry).forEach(expiryDate => {
        const expiryData = optionsData.options_by_expiry[expiryDate];
        if (expiryData.call) allOptions.push(...expiryData.call);
        if (expiryData.put) allOptions.push(...expiryData.put);
      });
    }
    
    // Map to the Option type format
    const mappedOptions = allOptions.map(contract => ({
      id: contract.symbol,
      strike: contract.strike_price,
      type: contract.option_type.toUpperCase() as "CALL" | "PUT",
      expiry: new Date(contract.expiry_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      premium: contract.mark_price,
      change: Math.random() * 20 - 10, // Mocking change as it's not in API
      volume: contract.volume,
      iv: contract.implied_volatility ? contract.implied_volatility * 100 : 0,
    }));
    
    // Sort by volume and take top 5
    return mappedOptions
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 5);
  };

  const topOptions = processTopOptions();

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Most Active Options</CardTitle>
        <Button variant="ghost" size="sm" className="text-xs">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <div className="rounded-md border">
            <div className="grid grid-cols-9 border-b px-4 py-2 text-xs font-medium text-muted-foreground">
              <div className="col-span-2">Strike</div>
              <div className="col-span-1">Type</div>
              <div className="col-span-1">Expiry</div>
              <div className="col-span-1 text-right">Premium</div>
              <div className="col-span-1 text-right">Change</div>
              <div className="col-span-1 text-right">Volume</div>
              <div className="col-span-1 text-right">IV</div>
              <div className="col-span-1"></div>
            </div>
            <div className="divide-y">
              {topOptions.length > 0 ? (
                topOptions.map((option) => (
                  <div
                    key={option.id}
                    className="grid grid-cols-9 items-center px-4 py-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="col-span-2 font-medium">${option.strike.toLocaleString()}</div>
                    <div className="col-span-1">
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-medium",
                          option.type === "CALL" ? "border-profit text-profit" : "border-loss text-loss"
                        )}
                      >
                        {option.type}
                      </Badge>
                    </div>
                    <div className="col-span-1 text-sm">{option.expiry}</div>
                    <div className="col-span-1 text-right font-medium">
                      ${option.premium.toFixed(2)}
                    </div>
                    <div
                      className={cn(
                        "col-span-1 text-right flex justify-end items-center",
                        option.change >= 0 ? "text-profit" : "text-loss"
                      )}
                    >
                      {option.change >= 0 ? (
                        <ArrowUpRight className="mr-1 h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="mr-1 h-3 w-3" />
                      )}
                      {Math.abs(option.change).toFixed(1)}%
                    </div>
                    <div className="col-span-1 text-right">{option.volume}</div>
                    <div className="col-span-1 text-right">{option.iv.toFixed(1)}%</div>
                    <div className="col-span-1 text-right">
                      <Button size="sm" variant="outline" className="h-7 w-16 text-xs">
                        Trade
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No active options found
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopOptions;
