"use server";

import prisma from "@/lib/prisma";
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";
import { attachUsersToOrders } from "@/lib/order-helpers";

export async function getDashboardMetrics(restaurantId?: number) {
  try {
    // 1. Get total revenue (COMPLETED or PAID)
    const revenueResult = await prisma.order.aggregate({
      where: {
        ...(restaurantId ? { restaurantId } : {}),
        status: {
          in: ["COMPLETED", "PAID"],
        },
      },
      _sum: {
        totalAmount: true,
      },
    });
    const revenue = Number(revenueResult._sum.totalAmount || 0);

    // 2. Get total orders today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const ordersCount = await prisma.order.count({
      where: {
        ...(restaurantId ? { restaurantId } : {}),
        createdAt: {
          gte: startOfToday,
        },
      },
    });

    // 3. Get active tables
    const activeTables = await prisma.table.count({
      where: {
        ...(restaurantId ? { restaurantId } : {}),
        status: "OCCUPIED",
      },
    });

    // 4. Get most popular item
    const popularItemResult = await prisma.orderItem.groupBy({
      by: ["menuItemId"],
      where: restaurantId ? { menuItem: { restaurantId } } : undefined,
      _count: {
        menuItemId: true,
      },
      orderBy: {
        _count: {
          menuItemId: "desc",
        },
      },
      take: 1,
    });

    let popularItem = "None";
    if (popularItemResult.length > 0) {
      const item = await prisma.menuItem.findUnique({
        where: { id: popularItemResult[0].menuItemId },
      });
      if (item) {
        popularItem = item.name;
      }
    }

    // 5. Get chart data (last 6 months revenue)
    const sixMonthsAgo = subMonths(new Date(), 5);
    const months = eachMonthOfInterval({
      start: startOfMonth(sixMonthsAgo),
      end: endOfMonth(new Date()),
    });

    const chartData = await Promise.all(
      months.map(async (monthDate) => {
        const start = startOfMonth(monthDate);
        const end = endOfMonth(monthDate);

        const monthRevenue = await prisma.order.aggregate({
          where: {
            ...(restaurantId ? { restaurantId } : {}),
            status: { in: ["COMPLETED", "PAID"] },
            createdAt: {
              gte: start,
              lte: end,
            },
          },
          _sum: {
            totalAmount: true,
          },
        });

        return {
          name: format(monthDate, "MMM"),
          total: Number(monthRevenue._sum.totalAmount || 0),
        };
      })
    );

    // 6. Get Recent Orders (Top 5)
    const recentOrders = await prisma.order.findMany({
      where: restaurantId ? { restaurantId } : undefined,
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        table: true,
      },
    });

    const recentOrdersWithUser = await attachUsersToOrders(recentOrders);

    // Safe serialization for decimal values
    const safeRecentOrders = recentOrdersWithUser.map(order => ({
      ...order,
      totalAmount: Number(order.totalAmount),
    }));

    return {
      success: true,
      data: {
        revenue,
        orders: ordersCount,
        activeTables,
        popularItem,
        chartData,
        recentOrders: safeRecentOrders,
      },
    };
  } catch (error) {
    console.error("Failed to fetch dashboard metrics:", error);
    return { success: false, error: "Failed to load dashboard metrics" };
  }
}
