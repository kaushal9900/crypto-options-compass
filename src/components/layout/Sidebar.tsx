
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  LineChart,
  LayoutGrid,
  Layers,
} from "lucide-react";

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutGrid,
  },
  {
    title: "Options Chain",
    href: "/options",
    icon: Layers,
  },
  {
    title: "Strategy Builder",
    href: "/strategy",
    icon: BarChart3,
  },
  {
    title: "Charts",
    href: "/charts",
    icon: LineChart,
  },
];

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="hidden md:flex h-screen w-52 flex-col border-r border-border/40 bg-sidebar">
      <div className="flex flex-col flex-grow p-3 space-y-4">
        <div className="py-2">
          <h2 className="text-xs font-semibold text-muted-foreground px-2">
            NAVIGATION
          </h2>
        </div>
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium",
                location.pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className={cn("mr-2 h-4 w-4")} />
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
