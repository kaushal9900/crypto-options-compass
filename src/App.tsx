
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import OptionsChain from "./pages/OptionsChain";
import StrategyBuilder from "./pages/StrategyBuilder";
import NotFound from "./pages/NotFound";
import React, { useState, useEffect } from "react";
import { Strategy, StrategyPayoff } from "@/services/strategyService";

// Create a context for storing strategies
export const StrategyContext = React.createContext<{
  comparisonStrategies: Array<{strategy: Strategy, payoff: StrategyPayoff}>;
  setComparisonStrategies: React.Dispatch<React.SetStateAction<Array<{strategy: Strategy, payoff: StrategyPayoff}>>>;
}>({
  comparisonStrategies: [],
  setComparisonStrategies: () => {},
});

const queryClient = new QueryClient();

const App = () => {
  const [comparisonStrategies, setComparisonStrategies] = useState<Array<{strategy: Strategy, payoff: StrategyPayoff}>>([]);

  // Load strategies from localStorage on component mount
  useEffect(() => {
    try {
      const savedStrategies = localStorage.getItem('comparisonStrategies');
      if (savedStrategies) {
        setComparisonStrategies(JSON.parse(savedStrategies));
      }
    } catch (error) {
      console.error("Error loading strategies from localStorage:", error);
    }
  }, []);

  // Save strategies to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('comparisonStrategies', JSON.stringify(comparisonStrategies));
    } catch (error) {
      console.error("Error saving strategies to localStorage:", error);
    }
  }, [comparisonStrategies]);

  return (
    <QueryClientProvider client={queryClient}>
      <StrategyContext.Provider value={{ comparisonStrategies, setComparisonStrategies }}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout><Dashboard /></Layout>} />
              <Route path="/options" element={<Layout><OptionsChain /></Layout>} />
              <Route path="/strategy" element={<Layout><StrategyBuilder /></Layout>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </StrategyContext.Provider>
    </QueryClientProvider>
  );
};

export default App;
