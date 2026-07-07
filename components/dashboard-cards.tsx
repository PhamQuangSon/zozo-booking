"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/i18n";
import { useCurrencyStore } from "@/store/currency-store";
import { DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react";

interface DashboardCardsProps {
  revenue: number;
  orders: number;
  activeTables: number;
  popularItem: string;
}

export function DashboardCards({
  revenue,
  orders,
  activeTables,
  popularItem,
}: DashboardCardsProps) {
  const { currency } = useCurrencyStore();

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 bg-gradient-to-br from-background to-muted/30 border-muted/50">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          <div className="rounded-full bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
            <DollarSign className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight text-foreground">{formatCurrency(revenue, currency)}</div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center">
            <TrendingUp className="mr-1 h-3 w-3 text-emerald-500" />
            <span className="text-emerald-500 font-medium">+20.1%</span>
            <span className="ml-1">from last month</span>
          </p>
        </CardContent>
      </Card>

      <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 bg-gradient-to-br from-background to-muted/30 border-muted/50">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Orders</CardTitle>
          <div className="rounded-full bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
            <ShoppingCart className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight text-foreground">+{orders}</div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center">
            <TrendingUp className="mr-1 h-3 w-3 text-emerald-500" />
            <span className="text-emerald-500 font-medium">+12.2%</span>
            <span className="ml-1">from last month</span>
          </p>
        </CardContent>
      </Card>

      <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 bg-gradient-to-br from-background to-muted/30 border-muted/50">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Active Tables</CardTitle>
          <div className="rounded-full bg-violet-100 p-2 text-violet-600 dark:bg-violet-900/50 dark:text-violet-400">
            <Users className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight text-foreground">{activeTables}</div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center">
            <TrendingUp className="mr-1 h-3 w-3 text-violet-500" />
            <span className="text-violet-500 font-medium">+2</span>
            <span className="ml-1">from last hour</span>
          </p>
        </CardContent>
      </Card>

      <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 bg-gradient-to-br from-background to-muted/30 border-muted/50">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Popular Item</CardTitle>
          <div className="rounded-full bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400">
            <TrendingUp className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold tracking-tight text-foreground truncate mt-2">{popularItem}</div>
          <p className="text-xs text-muted-foreground mt-2">
            Most ordered today
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
