
import React from "react";
import { Strategy, StrategyPayoff } from "@/services/strategyService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { HelpCircle, ArrowUpCircle, ArrowDownCircle, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface RiskAnalysisDashboardProps {
  strategy: Strategy | null;
  payoff: StrategyPayoff | null;
}

const RiskMetric: React.FC<{
  title: string;
  value: string | number;
  description: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  progressValue?: number;
  progressColor?: string;
}> = ({ title, value, description, icon, trend, progressValue, progressColor }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
          <div className="cursor-help" title={description}>
            <HelpCircle className="h-3 w-3 text-muted-foreground/70" />
          </div>
        </div>
        {icon}
      </div>
      <div className="flex items-center justify-between">
        <div className="text-lg font-bold">{value}</div>
        {trend && (
          <div 
            className={cn(
              "flex items-center text-xs",
              trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : ""
            )}
          >
            {trend === "up" ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : trend === "down" ? (
              <TrendingDown className="h-3 w-3 mr-1" />
            ) : null}
            <span>
              {trend === "up" ? "Low Risk" : trend === "down" ? "High Risk" : "Moderate"}
            </span>
          </div>
        )}
      </div>
      {progressValue !== undefined && (
        <Progress value={progressValue} className={progressColor} />
      )}
    </div>
  );
};

const RiskAnalysisDashboard: React.FC<RiskAnalysisDashboardProps> = ({ strategy, payoff }) => {
  if (!strategy || !payoff) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Risk Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <p className="text-muted-foreground">Build a strategy to see risk analysis</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate risk metrics
  const profitLossRatio = Math.abs(payoff.max_profit / payoff.max_loss);
  const riskRewardScore = Math.min(Math.max(profitLossRatio * 100 / 3, 0), 100); // Scale it to 0-100
  
  // Calculate probability of profit (simplified calculation for demo purposes)
  // In a real implementation, this would use a more sophisticated model
  const breakevens = payoff.breakevens || [];
  const probabilityOfProfit = breakevens.length > 1 ? 55 : breakevens.length === 1 ? 45 : 35;
  
  // Calculate overall risk score (simplified)
  const maxLossPercentage = Math.abs(payoff.max_loss) / strategy.estimated_cost * 100;
  const riskScore = Math.min(Math.max(100 - (maxLossPercentage / 2), 0), 100); // Simplified risk score

  // Calculate Greeks exposure (synthetic data for demo)
  const deltaExposure = strategy.legs.reduce((sum, leg) => {
    const direction = leg.side === "BUY" ? 1 : -1;
    return sum + (leg.selected.delta || 0) * direction * leg.ratio;
  }, 0);
  
  const gammaExposure = strategy.legs.reduce((sum, leg) => {
    const direction = leg.side === "BUY" ? 1 : -1;
    return sum + (leg.selected.gamma || 0) * direction * leg.ratio;
  }, 0);
  
  const thetaExposure = strategy.legs.reduce((sum, leg) => {
    const direction = leg.side === "BUY" ? 1 : -1;
    return sum + (leg.selected.theta || 0) * direction * leg.ratio;
  }, 0);
  
  const vegaExposure = strategy.legs.reduce((sum, leg) => {
    const direction = leg.side === "BUY" ? 1 : -1;
    return sum + (leg.selected.vega || 0) * direction * leg.ratio;
  }, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Risk Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Risk summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-muted/30 p-4 rounded-md">
            <div className="space-y-2">
              <h3 className="font-medium text-sm">Overall Risk Score</h3>
              <div className="flex justify-between items-center mb-1">
                <span className="text-2xl font-bold">{Math.round(riskScore)}/100</span>
                {riskScore > 70 ? (
                  <ArrowUpCircle className="h-5 w-5 text-green-500" />
                ) : riskScore < 30 ? (
                  <ArrowDownCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <div className="h-5 w-5 rounded-full bg-amber-500/30 flex items-center justify-center">
                    <span className="text-amber-500 text-xs">!</span>
                  </div>
                )}
              </div>
              <Progress 
                value={riskScore} 
                className={cn(
                  riskScore > 70 ? "bg-green-500/20" : 
                  riskScore < 30 ? "bg-red-500/20" : 
                  "bg-amber-500/20"
                )}
              />
              <p className="text-xs text-muted-foreground pt-2">
                {riskScore > 70 
                  ? "Lower risk with good potential reward" 
                  : riskScore < 30 
                  ? "High risk strategy, potential for significant losses" 
                  : "Moderate risk with average reward potential"}
              </p>
            </div>
          </div>
          
          <div className="bg-muted/30 p-4 rounded-md">
            <RiskMetric 
              title="Risk/Reward Ratio" 
              value={profitLossRatio.toFixed(2)}
              description="Ratio of maximum profit to maximum loss"
              trend={profitLossRatio > 1.5 ? "up" : profitLossRatio < 0.7 ? "down" : "neutral"}
              progressValue={riskRewardScore}
              progressColor={profitLossRatio > 1.5 ? "bg-green-500/20" : profitLossRatio < 0.7 ? "bg-red-500/20" : "bg-amber-500/20"}
            />
          </div>
          
          <div className="bg-muted/30 p-4 rounded-md">
            <RiskMetric 
              title="Probability of Profit" 
              value={`~${probabilityOfProfit}%`}
              description="Estimated chance of this strategy being profitable"
              trend={probabilityOfProfit > 60 ? "up" : probabilityOfProfit < 40 ? "down" : "neutral"}
              progressValue={probabilityOfProfit}
              progressColor={probabilityOfProfit > 60 ? "bg-green-500/20" : probabilityOfProfit < 40 ? "bg-red-500/20" : "bg-amber-500/20"}
            />
          </div>
        </div>
        
        <Separator />
        
        {/* Greek exposures */}
        <div>
          <h3 className="font-medium text-sm mb-4">Greek Exposures</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted/20 p-3 rounded-md">
              <RiskMetric 
                title="Delta Exposure" 
                value={deltaExposure.toFixed(2)}
                description="Sensitivity to price changes in underlying asset"
              />
            </div>
            
            <div className="bg-muted/20 p-3 rounded-md">
              <RiskMetric 
                title="Gamma Exposure" 
                value={gammaExposure.toFixed(4)}
                description="Rate of change in delta relative to price movement"
              />
            </div>
            
            <div className="bg-muted/20 p-3 rounded-md">
              <RiskMetric 
                title="Theta Exposure" 
                value={thetaExposure.toFixed(2)}
                description="Time decay - daily value loss due to time"
              />
            </div>
            
            <div className="bg-muted/20 p-3 rounded-md">
              <RiskMetric 
                title="Vega Exposure" 
                value={vegaExposure.toFixed(2)}
                description="Sensitivity to changes in implied volatility"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskAnalysisDashboard;
