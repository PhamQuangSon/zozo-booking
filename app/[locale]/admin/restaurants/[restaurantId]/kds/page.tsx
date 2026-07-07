import { getKitchenOrders } from "@/actions/order-actions";
import { KitchenKDS } from "@/components/kitchen-kds";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default async function KDSPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const { restaurantId } = await params;
  
  const result = await getKitchenOrders(restaurantId);

  if (!result.success || !result.data) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {result.error || "Failed to load kitchen orders"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-2rem)] flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Kitchen Display System</h2>
          <p className="text-muted-foreground">Manage active orders and food preparation</p>
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-muted/20 rounded-lg border">
        <KitchenKDS initialOrders={result.data} />
      </div>
    </div>
  );
}
