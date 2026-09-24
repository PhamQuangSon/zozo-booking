import { getRestaurants } from "@/actions/restaurant-actions";

import { BookingForm } from "./booking-form";

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ restaurantId?: string }>;
}) {
  const [{ restaurantId }, result] = await Promise.all([searchParams, getRestaurants()]);
  const restaurants = result.success ? result.data.map((r) => ({ id: r.id, name: r.name })) : [];

  return <BookingForm restaurants={restaurants} defaultRestaurantId={restaurantId} />;
}
