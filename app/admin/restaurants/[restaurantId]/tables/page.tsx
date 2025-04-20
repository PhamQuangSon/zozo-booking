import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getRestaurantById } from "@/actions/restaurant-actions";
import { getTablesByRestaurantId } from "@/actions/table-actions";
import { TablesClient } from "@/components/admin/tables-client";
import { Button } from "@/components/ui/button";

export default async function TablesPage({
  params,
}: {
  params: { restaurantId: string };
}) {
  // Fetch restaurant details
  const restaurantResult = await getRestaurantById(params.restaurantId);
  if (!restaurantResult.success || !restaurantResult.data) {
    notFound();
  }
  const restaurant = restaurantResult.data;

  // Fetch tables
  const { data: tables = [], success } = await getTablesByRestaurantId(
    params.restaurantId
  );
  if (!success) {
    return <div>Failed to load Tables</div>;
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/admin/restaurants">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Restaurants
          </Link>
        </Button>
      </div>

      <TablesClient
        restaurantId={params.restaurantId}
        restaurantName={restaurant.name}
        initialTables={tables}
      />
    </div>
  );
}
