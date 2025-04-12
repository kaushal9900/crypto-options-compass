
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

type Option = {
  id: string;
  strike: number;
  type: "call" | "put";
  expiry: string;
  premium: number;
  change: number;
  volume: number;
  iv: number;
};

const mockOptions: Option[] = [
  {
    id: "1",
    strike: 55000,
    type: "call",
    expiry: "Apr 19",
    premium: 1250,
    change: 12.5,
    volume: 152,
    iv: 68.5,
  },
  {
    id: "2",
    strike: 50000,
    type: "put",
    expiry: "Apr 19",
    premium: 420,
    change: -8.2,
    volume: 98,
    iv: 72.3,
  },
  {
    id: "3",
    strike: 60000,
    type: "call",
    expiry: "Apr 26",
    premium: 780,
    change: 5.4,
    volume: 64,
    iv: 65.1,
  },
  {
    id: "4",
    strike: 52000,
    type: "put",
    expiry: "Apr 26",
    premium: 520,
    change: 3.8,
    volume: 43,
    iv: 69.8,
  },
  {
    id: "5",
    strike: 58000,
    type: "call",
    expiry: "May 03",
    premium: 930,
    change: -2.1,
    volume: 37,
    iv: 63.7,
  },
];

interface TopOptionsProps {
  className?: string;
}

const TopOptions: React.FC<TopOptionsProps> = ({ className }) => {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Most Active Options</CardTitle>
        <Button variant="ghost" size="sm" className="text-xs">
          View All
        </Button>
      </CardHeader>
      <CardContent>
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
            {mockOptions.map((option) => (
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
                      option.type === "call" ? "border-profit text-profit" : "border-loss text-loss"
                    )}
                  >
                    {option.type.toUpperCase()}
                  </Badge>
                </div>
                <div className="col-span-1 text-sm">{option.expiry}</div>
                <div className="col-span-1 text-right font-medium">
                  ${option.premium}
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
                  {Math.abs(option.change)}%
                </div>
                <div className="col-span-1 text-right">{option.volume}</div>
                <div className="col-span-1 text-right">{option.iv}%</div>
                <div className="col-span-1 text-right">
                  <Button size="sm" variant="outline" className="h-7 w-16 text-xs">
                    Trade
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopOptions;
