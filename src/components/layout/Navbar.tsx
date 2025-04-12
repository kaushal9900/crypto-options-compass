
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const Navbar: React.FC = () => {
  return (
    <div className="border-b border-border/40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white">C</span>
          </div>
          <span>CryptoOptions</span>
        </div>

        <div className="flex items-center ml-10 space-x-1">
          <Tabs defaultValue="options" className="w-full">
            <TabsList className="bg-transparent">
              <TabsTrigger value="options" asChild>
                <Link to="/options" className="text-sm font-medium">Options Chain</Link>
              </TabsTrigger>
              <TabsTrigger value="strategy" asChild>
                <Link to="/strategy" className="text-sm font-medium">Strategy Builder</Link>
              </TabsTrigger>
              <TabsTrigger value="charts" asChild>
                <Link to="/charts" className="text-sm font-medium">Charts</Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search markets..."
              className="w-full bg-background pl-8 focus-visible:ring-primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
