import prisma from "@/lib/prisma";

export async function attachUsersToOrders<T extends { userId: string | null }>(
  orders: T[]
): Promise<(T & { user: { name: string | null; email: string | null } | null })[]> {
  // Extract unique user IDs
  const orderUserIds = orders
    .map((order) => order.userId)
    .filter((id): id is string => id !== null);

  // Deduplicate user IDs
  const uniqueUserIds = [...new Set(orderUserIds)];

  // Fetch all needed users in a single query
  const users =
    uniqueUserIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: uniqueUserIds } },
          select: { id: true, name: true, email: true },
        })
      : [];

  // Create a lookup map for faster access
  const userMap = new Map(users.map((user) => [user.id, user]));

  return orders.map((order) => {
    if (order.userId) {
      const user = userMap.get(order.userId);
      return {
        ...order,
        user: user ? { name: user.name, email: user.email } : null,
      };
    }
    return { ...order, user: null };
  });
}
