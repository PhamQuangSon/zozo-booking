import prisma from "@/lib/prisma";

import { BookingForm } from "./booking-form";

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ restaurantId?: string }>;
}) {
  const [{ restaurantId }, rawRestaurants] = await Promise.all([
    searchParams,
    prisma.restaurant.findMany({
      where: { tables: { some: {} } },
      select: { id: true, name: true },
    }),
  ]);

  return <BookingForm restaurants={rawRestaurants} defaultRestaurantId={restaurantId} />;
}
