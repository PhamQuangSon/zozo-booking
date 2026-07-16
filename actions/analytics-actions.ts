'use server';

import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';

export async function getAnalyticsData(
  restaurantId: number,
  dateRange?: { from: string | Date; to: string | Date }
) {
  try {
    const fromDate = dateRange?.from ? new Date(dateRange.from) : subDays(new Date(), 30);
    const toDate = dateRange?.to ? new Date(dateRange.to) : new Date();

    const startDate = startOfDay(fromDate);
    const endDate = endOfDay(toDate);

    // 1. Revenue Metrics
    const orders = await prisma.order.findMany({
      where: {
        restaurantId,
        status: { in: ['COMPLETED', 'PAID'] },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        totalAmount: true,
        createdAt: true,
      },
    });

    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    const totalOrders = orders.length;

    // Group revenue by date for chart
    const revenueByDateMap = new Map<string, number>();
    orders.forEach((order) => {
      const dateStr = format(order.createdAt, 'MMM dd');
      const currentAmount = revenueByDateMap.get(dateStr) || 0;
      revenueByDateMap.set(dateStr, currentAmount + Number(order.totalAmount));
    });

    const revenueChartData = Array.from(revenueByDateMap.entries()).map(([date, revenue]) => ({
      date,
      revenue,
    }));

    // 2. Menu Analytics (Best Sellers)
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          restaurantId,
          status: { in: ['COMPLETED', 'PAID'] },
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
      include: {
        menuItem: true,
      },
    });

    const itemSalesMap = new Map<string, number>();
    orderItems.forEach((item) => {
      const itemName = item.menuItem.name;
      const currentQty = itemSalesMap.get(itemName) || 0;
      itemSalesMap.set(itemName, currentQty + item.quantity);
    });

    const bestSellersData = Array.from(itemSalesMap.entries())
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5); // Top 5

    // 3. Operational Performance (Peak Hours)
    const ordersPerHourMap = new Map<number, number>();
    orders.forEach((order) => {
      const hour = order.createdAt.getHours();
      const currentCount = ordersPerHourMap.get(hour) || 0;
      ordersPerHourMap.set(hour, currentCount + 1);
    });

    const peakHoursData = Array.from(ordersPerHourMap.entries())
      .map(([hour, count]) => ({
        hour: `${hour}:00`,
        orders: count,
      }))
      .sort((a, b) => parseInt(a.hour) - parseInt(b.hour)); // Sort by hour

    return {
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalOrders,
          averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        },
        charts: {
          revenueChartData,
          bestSellersData,
          peakHoursData,
        },
      },
    };
  } catch (error) {
    console.error('Failed to fetch analytics data:', error);
    return { success: false, error: 'Failed to load analytics data' };
  }
}
