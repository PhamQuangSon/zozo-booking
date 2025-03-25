"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCurrencyStore } from "@/store/currencyStore"
import { formatCurrency } from "@/lib/i18n"

interface DashboardCardsProps {
  revenue: number
  orders: number
  activeTables: number
  popularItem: string
}

export function DashboardCards({ revenue, orders, activeTables, popularItem }: DashboardCardsProps) {
  const { currency } = useCurrencyStore()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(revenue, currency)}</div>
          <p className="text-xs text-muted-foreground">+20.1% from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{orders}</div>
          <p className="text-xs text-muted-foreground">+12.2% from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Tables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeTables}</div>
          <p className="text-xs text-muted-foreground">+2 from last hour</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Popular Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{popularItem}</div>
          <p className="text-xs text-muted-foreground">+19% from last week</p>
        </CardContent>
      </Card>
    </div>
  )
}

