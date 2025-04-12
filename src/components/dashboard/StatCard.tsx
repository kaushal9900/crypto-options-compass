
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, className }) => {
  const isPositive = change >= 0;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h4 className="text-2xl font-semibold mt-1">{value}</h4>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            {icon}
          </div>
        </div>
        <div className="flex items-center mt-4">
          <span
            className={cn(
              "flex items-center text-sm font-medium",
              isPositive ? "text-profit" : "text-loss"
            )}
          >
            {isPositive ? <ArrowUp className="mr-1 h-4 w-4" /> : <ArrowDown className="mr-1 h-4 w-4" />}
            {Math.abs(change)}%
          </span>
          <span className="text-xs text-muted-foreground ml-2">vs previous period</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
