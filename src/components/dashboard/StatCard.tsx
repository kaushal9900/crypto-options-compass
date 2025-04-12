
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  className?: string;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  className,
  isLoading = false,
}) => {
  const isPositive = change >= 0;

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {icon}
        </div>
        <div className="mt-2">
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <div className="flex items-baseline justify-between">
              <h4 className="text-2xl font-semibold">{value}</h4>
              <div
                className={cn(
                  "flex items-center text-xs font-medium",
                  isPositive ? "text-profit" : "text-loss"
                )}
              >
                {isPositive ? (
                  <ArrowUpIcon className="mr-1 h-3 w-3" />
                ) : (
                  <ArrowDownIcon className="mr-1 h-3 w-3" />
                )}
                {Math.abs(change).toFixed(1)}%
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
