import { getRestaurantOrders } from "@/actions/order-actions";
import { CashierPOS } from "@/components/cashier-pos";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default async function POSPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const { restaurantId } = await params;
  
  const result = await getRestaurantOrders(restaurantId);

  if (!result.success || !result.data) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {result.error || "Failed to load active orders for POS"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-2rem)] flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Point of Sale (POS)</h2>
          <p className="text-muted-foreground">Manage active tables and payments</p>
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-muted/20 rounded-lg border">
        <CashierPOS initialOrders={result.data} />
      </div>
    </div>
  );
}
