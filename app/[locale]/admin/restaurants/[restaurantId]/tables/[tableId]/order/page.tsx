import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getRestaurantById } from "@/actions/restaurant-actions";
import { getTableDetails } from "@/actions/table-actions";
import { Button } from "@/components/ui/button";
import { WaiterPOS } from "@/components/admin/waiter-pos";

export default async function WaiterPOSPage({
  params,
}: {
  params: Promise<{ restaurantId: string; tableId: string }>;
}) {
  const { restaurantId, tableId } = await params;

  // Fetch restaurant details and menu
  const restaurantResult = await getRestaurantById(restaurantId);
  if (!restaurantResult.success || !restaurantResult.data) {
    notFound();
  }
  const restaurant = restaurantResult.data;

  // Fetch table details
  const tableResult = await getTableDetails(tableId);
  if (!tableResult.success || !tableResult.data) {
    notFound();
  }
  const table = tableResult.data;

  // Prepare all menu items for display
  const allMenuItems =
    restaurant.categories?.flatMap((category) =>
      category.items?.map((item) => ({
        ...item,
        categoryName: category.name,
        categoryId: category.id,
      })),
    ) || [];

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)]">
      <div className="flex items-center justify-between mb-4 px-4 pt-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/restaurants/${restaurantId}/tables`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tables
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Order for Table {table.number}</h1>
            <p className="text-sm text-muted-foreground">{restaurant.name}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <WaiterPOS 
          restaurantId={Number(restaurantId)}
          tableId={Number(tableId)}
          categories={restaurant.categories || []}
          allMenuItems={allMenuItems as any}
        />
      </div>
    </div>
  );
}
