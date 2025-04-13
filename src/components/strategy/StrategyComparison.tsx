
import React from "react";
import { Strategy, StrategyPayoff } from "@/services/strategyService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface StrategyComparisonProps {
  strategies: Array<{
    strategy: Strategy;
    payoff: StrategyPayoff;
  }>;
  onRemoveStrategy: (index: number) => void;
}

const StrategyComparison: React.FC<StrategyComparisonProps> = ({ strategies, onRemoveStrategy }) => {
  if (!strategies.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Strategy Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <p className="text-muted-foreground">No strategies to compare. Build and add strategies to see a comparison.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Strategy Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Strategy</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead>Max Profit</TableHead>
                <TableHead>Max Loss</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Breakevens</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {strategies.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.strategy.definition_name}</TableCell>
                  <TableCell>{item.strategy.underlying_asset}</TableCell>
                  <TableCell className="text-green-500">${item.payoff.max_profit.toFixed(2)}</TableCell>
                  <TableCell className="text-red-500">${Math.abs(item.payoff.max_loss).toFixed(2)}</TableCell>
                  <TableCell>${item.strategy.estimated_cost.toFixed(2)}</TableCell>
                  <TableCell>
                    {item.payoff.breakevens && item.payoff.breakevens.length > 0
                      ? item.payoff.breakevens.map((point, i) => (
                          <span key={i}>
                            ${point.toFixed(2)}
                            {i < item.payoff.breakevens.length - 1 ? ', ' : ''}
                          </span>
                        ))
                      : "None"}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onRemoveStrategy(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-100/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default StrategyComparison;

