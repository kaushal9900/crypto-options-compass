
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, Filter, Search } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data
const generateOptionsChainData = () => {
  const basePrice = 54800;
  const strikes = [];
  
  for (let i = -10; i <= 10; i++) {
    const strike = basePrice + i * 1000;
    strikes.push({
      strike,
      calls: {
        bid: Math.round((Math.random() * 500) + 100),
        ask: Math.round((Math.random() * 500) + 200),
        last: Math.round((Math.random() * 500) + 150),
        change: (Math.random() * 20) - 10,
        volume: Math.round(Math.random() * 100),
        iv: Math.round((Math.random() * 20) + 60),
        delta: (Math.random() * 0.5 + 0.25).toFixed(2),
        gamma: (Math.random() * 0.005).toFixed(4),
        theta: -(Math.random() * 50).toFixed(2),
        vega: (Math.random() * 30).toFixed(2),
      },
      puts: {
        bid: Math.round((Math.random() * 500) + 100),
        ask: Math.round((Math.random() * 500) + 200),
        last: Math.round((Math.random() * 500) + 150),
        change: (Math.random() * 20) - 10,
        volume: Math.round(Math.random() * 100),
        iv: Math.round((Math.random() * 20) + 60),
        delta: -(Math.random() * 0.5 + 0.25).toFixed(2),
        gamma: (Math.random() * 0.005).toFixed(4),
        theta: -(Math.random() * 50).toFixed(2),
        vega: (Math.random() * 30).toFixed(2),
      }
    });
  }
  
  return strikes;
};

const optionsChainData = generateOptionsChainData();

const expiryDates = [
  { value: "apr19", label: "Apr 19, 2025 (7d)" },
  { value: "apr26", label: "Apr 26, 2025 (14d)" },
  { value: "may03", label: "May 3, 2025 (21d)" },
  { value: "may17", label: "May 17, 2025 (35d)" },
  { value: "jun21", label: "Jun 21, 2025 (70d)" }
];

const OptionsChain: React.FC = () => {
  const [displayMode, setDisplayMode] = useState<"basic" | "advanced">("basic");
  const [expiry, setExpiry] = useState("apr19");
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Options Chain</h1>
        <div className="flex space-x-2">
          <Button size="sm" variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button size="sm" variant="default">Refresh</Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">BTC/USD Options</CardTitle>
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <Label htmlFor="search">Expiration:</Label>
                <Select value={expiry} onValueChange={setExpiry}>
                  <SelectTrigger className="w-[240px]">
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
                {optionsChainData.map((row, index) => (
                  <tr 
                    key={index} 
                    className={cn(
                      "text-xs hover:bg-muted/30 transition-colors",
                      row.strike === 54000 && "bg-muted/20"
                    )}
                  >
                    {/* CALLS */}
                    <td className="p-2 text-right">${row.calls.bid}</td>
                    <td className="p-2 text-right">${row.calls.ask}</td>
                    <td className="p-2 text-right">${row.calls.last}</td>
                    <td className={cn(
                      "p-2 text-right font-medium",
                      row.calls.change >= 0 ? "text-profit" : "text-loss"
                    )}>
                      {row.calls.change >= 0 ? "+" : ""}{row.calls.change.toFixed(1)}%
                    </td>
                    <td className="p-2 text-right">{row.calls.volume}</td>
                    <td className="p-2 text-right">{row.calls.iv}%</td>
                    
                    {displayMode === "advanced" && (
                      <>
                        <td className="p-2 text-right">{row.calls.delta}</td>
                        <td className="p-2 text-right">{row.calls.gamma}</td>
                        <td className="p-2 text-right">{row.calls.theta}</td>
                        <td className="p-2 text-right">{row.calls.vega}</td>
                      </>
                    )}
                    
                    {/* STRIKE */}
                    <td className="p-2 text-center font-bold border-x border-border bg-muted/10">
                      ${row.strike.toLocaleString()}
                    </td>
                    
                    {/* PUTS */}
                    <td className="p-2 text-right">${row.puts.bid}</td>
                    <td className="p-2 text-right">${row.puts.ask}</td>
                    <td className="p-2 text-right">${row.puts.last}</td>
                    <td className={cn(
                      "p-2 text-right font-medium",
                      row.puts.change >= 0 ? "text-profit" : "text-loss"
                    )}>
                      {row.puts.change >= 0 ? "+" : ""}{row.puts.change.toFixed(1)}%
                    </td>
                    <td className="p-2 text-right">{row.puts.volume}</td>
                    <td className="p-2 text-right">{row.puts.iv}%</td>
                    
                    {displayMode === "advanced" && (
                      <>
                        <td className="p-2 text-right">{row.puts.delta}</td>
                        <td className="p-2 text-right">{row.puts.gamma}</td>
                        <td className="p-2 text-right">{row.puts.theta}</td>
                        <td className="p-2 text-right">{row.puts.vega}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OptionsChain;
