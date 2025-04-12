
import React from "react";
import { CircleDollarSign, TrendingUp, Activity, BarChart3 } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import PriceChart from "@/components/dashboard/PriceChart";
import TopOptions from "@/components/dashboard/TopOptions";
import OptionsCalculator from "@/components/dashboard/OptionsCalculator";

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="BTC Price"
          value="$54,800"
          change={2.4}
          icon={<CircleDollarSign className="h-5 w-5 text-primary" />}
        />
        <StatCard
          title="Total Trading Volume"
          value="$12.5M"
          change={5.2}
          icon={<Activity className="h-5 w-5 text-primary" />}
        />
        <StatCard
          title="Active Options"
          value="1,248"
          change={-3.8}
          icon={<BarChart3 className="h-5 w-5 text-primary" />}
        />
        <StatCard
          title="30-Day ROI"
          value="18.2%"
          change={12.5}
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PriceChart className="lg:col-span-2" />
        <OptionsCalculator />
      </div>

      <TopOptions />
    </div>
  );
};

export default Dashboard;
