
import React from "react";
import { Strategy, StrategyPayoff } from "@/services/strategyService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PayoffTableProps {
  strategy: Strategy | null;
  payoff: StrategyPayoff | null;
  quantity: string;
}

const PayoffTable: React.FC<PayoffTableProps> = ({ strategy, payoff, quantity }) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!strategy) {
    return (
      <div className="h-80 flex items-center justify-center">
        <p className="text-muted-foreground">Build a strategy to see the payoff table</p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Side</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Strike</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Delta</TableHead>
              <TableHead>Gamma</TableHead>
              <TableHead>Theta</TableHead>
              <TableHead>Vega</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {strategy.legs.map((leg, index) => (
              <TableRow key={index}>
                <TableCell className={leg.side === 'BUY' ? 'text-green-500' : 'text-red-500'}>
                  {leg.side}
                </TableCell>
                <TableCell>{leg.selected.option_type}</TableCell>
                <TableCell>${leg.selected.strike_price.toLocaleString()}</TableCell>
                <TableCell>{formatDate(leg.selected.expiry_time)}</TableCell>
                <TableCell>${leg.selected.mark_price.toFixed(2)}</TableCell>
                <TableCell>{(leg.ratio * parseFloat(quantity)).toFixed(1)}</TableCell>
                <TableCell>{leg.selected.delta?.toFixed(2) || "N/A"}</TableCell>
                <TableCell>{leg.selected.gamma?.toFixed(4) || "N/A"}</TableCell>
                <TableCell>{leg.selected.theta?.toFixed(2) || "N/A"}</TableCell>
                <TableCell>{leg.selected.vega?.toFixed(2) || "N/A"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {payoff && (
        <div className="mt-6 border-t pt-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-muted/30 p-3 rounded-md">
              <div className="text-xs text-muted-foreground">Max Profit</div>
              <div className="text-green-500 font-medium">${payoff.max_profit.toFixed(2)}</div>
            </div>
            <div className="bg-muted/30 p-3 rounded-md">
              <div className="text-xs text-muted-foreground">Max Loss</div>
              <div className="text-red-500 font-medium">${Math.abs(payoff.max_loss).toFixed(2)}</div>
            </div>
            <div className="bg-muted/30 p-3 rounded-md">
              <div className="text-xs text-muted-foreground">Breakeven Points</div>
              <div className="font-medium">
                {payoff.breakevens && payoff.breakevens.length > 0 ? (
                  payoff.breakevens.map((point, i) => (
                    <span key={i}>
                      ${point.toLocaleString()}
                      {i < payoff.breakevens.length - 1 ? ', ' : ''}
                    </span>
                  ))
                ) : (
                  "None"
                )}
              </div>
            </div>
          </div>
          
          {/* Add full payoff data table */}
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-3">Full Payoff Data</h3>
            <div className="max-h-[300px] overflow-y-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Price</TableHead>
                    <TableHead>Profit/Loss</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payoff.payoff.map((point, index) => (
                    <TableRow key={index}>
                      <TableCell>${point.underlying_price.toFixed(2)}</TableCell>
                      <TableCell className={point.profit_loss >= 0 ? 'text-green-500' : 'text-red-500'}>
                        ${point.profit_loss.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayoffTable;
