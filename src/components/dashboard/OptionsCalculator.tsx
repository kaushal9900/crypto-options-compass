
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRightLeft, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

interface OptionsCalculatorProps {
  className?: string;
}

const OptionsCalculator: React.FC<OptionsCalculatorProps> = ({ className }) => {
  const [optionType, setOptionType] = useState<"call" | "put">("call");
  const [optionStyle, setOptionStyle] = useState<"american" | "european">("american");
  
  // In a real app, these would be calculated based on inputs
  const results = {
    premium: "$580.00",
    breakeven: "$55,580.00",
    maxProfit: "Unlimited",
    maxLoss: "$580.00",
    delta: "0.45",
    gamma: "0.0023",
    theta: "-32.15",
    vega: "28.67"
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <span>Options Calculator</span>
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2 lg:px-3"
          onClick={() => setOptionType(optionType === "call" ? "put" : "call")}
        >
          <ArrowRightLeft className="h-4 w-4 mr-2" />
          <span>{optionType === "call" ? "Switch to Put" : "Switch to Call"}</span>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="optionType">Option Type</Label>
              <Select
                value={optionType}
                onValueChange={(value) => setOptionType(value as "call" | "put")}
              >
                <SelectTrigger id="optionType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="put">Put</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="optionStyle">Option Style</Label>
              <Select
                value={optionStyle}
                onValueChange={(value) => setOptionStyle(value as "american" | "european")}
              >
                <SelectTrigger id="optionStyle">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="american">American</SelectItem>
                  <SelectItem value="european">European</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="spotPrice">Current Price</Label>
            <Input id="spotPrice" defaultValue="55000" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="strikePrice">Strike Price</Label>
            <Input id="strikePrice" defaultValue="55000" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiry">Days to Expiry</Label>
            <Input id="expiry" type="number" defaultValue="7" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="iv">Implied Volatility (%)</Label>
            <Input id="iv" type="number" defaultValue="65" />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <Button className={cn("w-full", optionType === "call" ? "bg-profit hover:bg-profit/90" : "bg-loss hover:bg-loss/90")}>
            Calculate {optionType === "call" ? "Call" : "Put"}
          </Button>
          <Button variant="outline" className="w-full">
            Reset
          </Button>
        </div>

        <div className="mt-6 rounded-md border p-4 bg-muted/20">
          <h4 className="font-semibold mb-3">Results</h4>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div className="text-muted-foreground">Premium:</div>
            <div className="text-right font-medium">{results.premium}</div>
            
            <div className="text-muted-foreground">Breakeven:</div>
            <div className="text-right font-medium">{results.breakeven}</div>
            
            <div className="text-muted-foreground">Max Profit:</div>
            <div className="text-right font-medium">{results.maxProfit}</div>
            
            <div className="text-muted-foreground">Max Loss:</div>
            <div className="text-right font-medium">{results.maxLoss}</div>
            
            <div className="col-span-2 my-1 border-t"></div>
            
            <div className="text-muted-foreground">Delta:</div>
            <div className="text-right font-medium">{results.delta}</div>
            
            <div className="text-muted-foreground">Gamma:</div>
            <div className="text-right font-medium">{results.gamma}</div>
            
            <div className="text-muted-foreground">Theta:</div>
            <div className="text-right font-medium">{results.theta}</div>
            
            <div className="text-muted-foreground">Vega:</div>
            <div className="text-right font-medium">{results.vega}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OptionsCalculator;
