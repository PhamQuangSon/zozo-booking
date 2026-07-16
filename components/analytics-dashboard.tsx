'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { getAnalyticsData } from '@/actions/analytics-actions';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/i18n';
import { useCurrencyStore } from '@/store/currency-store';
import { DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export interface AnalyticsData {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
  };
  charts: {
    revenueChartData: { date: string; revenue: number }[];
    bestSellersData: { name: string; sales: number }[];
    peakHoursData: { hour: string; orders: number }[];
  };
}

export function AnalyticsDashboard({ restaurantId }: { restaurantId: number }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ from?: string, to?: string }>({});
  const { currency } = useCurrencyStore();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const res = await getAnalyticsData(restaurantId, dateRange);
      if (res.success) {
        setData(res.data);
      }
      setLoading(false);
    }
    fetchData();
  }, [restaurantId, dateRange]);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading analytics...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">Failed to load analytics</div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        <Button variant="outline" onClick={() => setDateRange({})}>Last 30 Days</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 bg-gradient-to-br from-background to-muted/30 border-muted/50">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <div className="rounded-full bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-foreground">{formatCurrency(data.summary.totalRevenue, currency)}</div>
          </CardContent>
        </Card>
        
        <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 bg-gradient-to-br from-background to-muted/30 border-muted/50">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            <div className="rounded-full bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-foreground">{data.summary.totalOrders}</div>
          </CardContent>
        </Card>
        
        <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 bg-gradient-to-br from-background to-muted/30 border-muted/50">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Order Value</CardTitle>
            <div className="rounded-full bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-foreground">{formatCurrency(data.summary.averageOrderValue, currency)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Daily revenue over the selected period</CardDescription>
          </CardHeader>
          <CardContent className="pl-2 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.charts.revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Selling Items</CardTitle>
            <CardDescription>Best performing menu items</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.charts.bestSellersData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="sales"
                >
                  {data.charts.bestSellersData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 text-sm flex flex-wrap gap-2 justify-center">
              {data.charts.bestSellersData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                  {item.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Peak Operational Hours</CardTitle>
          <CardDescription>Order volume by hour of day</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.charts.peakHoursData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders" fill="#00C49F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
