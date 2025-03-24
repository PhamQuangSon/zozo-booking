"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useCurrencyStore } from "@/lib/currency-store";
import { formatCurrency } from "@/lib/i18n";
import { createTableOrder } from "@/actions/table-actions";
import { CartItem, useCartStore } from "@/store/cartStore";

interface OrderCartProps {
  restaurantId?: string;
  tableId?: string;
}

export function OrderCart({ restaurantId, tableId }: OrderCartProps) {
  const { toast } = useToast();
  const { currency } = useCurrencyStore();
  const { cart, removeItem } = useCartStore(); // Access removeItem from the store

  // Filter cart items by restaurantId and tableId
  const filteredCart = cart.filter(
    (item: CartItem) => item.restaurantId === restaurantId && item.tableId === tableId
  );

  const calculateSubtotal = () => {
    return filteredCart.reduce((total, item) => {
      let itemPrice = item.price;

      // Add price for options if any
      if (item.selectedOptions) {
        Object.values(item.selectedOptions).forEach((option: any) => {
          if (option.priceAdjustment) {
            itemPrice += option.priceAdjustment;
          }
        });
      }

      return total + itemPrice * item.quantity;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  const handleSubmitOrder = async () => {
    if (!restaurantId || !tableId || filteredCart.length === 0) {
      toast({
        title: "Error",
        description: "Cannot submit empty order",
        variant: "destructive",
      });
      return;
    }

    try {
      // Format order items for the API
      const orderItems = filteredCart.map((item) => ({
        menuItemId: Number.parseInt(item.id),
        quantity: item.quantity,
        notes: item.specialInstructions,
        choices: item.selectedOptions
          ? Object.entries(item.selectedOptions).map(([optionId, choice]: [string, any]) => ({
              optionId: Number.parseInt(optionId),
              choiceId: Number.parseInt(choice.id),
            }))
          : [],
      }));

      const result = await createTableOrder({
        restaurantId: Number.parseInt(restaurantId),
        tableId: Number.parseInt(tableId),
        items: orderItems,
      });

      if (result.success) {
        toast({
          title: "Order Submitted",
          description: "Your order has been sent to the kitchen!",
        });

        // Clear cart after successful order
        useCartStore.setState((state) => ({
          cart: state.cart.filter(
            (item) => item.restaurantId !== restaurantId || item.tableId !== tableId
          ),
        }));
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to submit order",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        {filteredCart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="mb-2 text-lg font-medium">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">Add items from the menu to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCart.map((item) => (
              <div key={item.id} className="flex justify-between">
                <div>
                  <div className="flex items-center">
                    <span className="mr-2 font-medium">{item.quantity}x</span>
                    <span>{item.name}</span>
                  </div>

                  {/* Display selected options */}
                  {item.selectedOptions && Object.entries(item.selectedOptions).length > 0 && (
                    <div className="ml-6 text-sm text-muted-foreground">
                      {Object.entries(item.selectedOptions).map(([optionId, option]: [string, any]) => (
                        <div key={optionId}>
                          {option.name}{" "}
                          {option.priceAdjustment > 0 &&
                            `(+${formatCurrency(option.priceAdjustment, currency)})`}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Display special instructions */}
                  {item.specialInstructions && (
                    <div className="ml-6 text-sm text-muted-foreground italic">
                      "{item.specialInstructions}"
                    </div>
                  )}
                </div>
                <div className="flex items-start space-x-2">
                  <span>{formatCurrency(item.price * item.quantity, currency)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => removeItem(item.id)} // Call removeItem here
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {filteredCart.length > 0 && (
        <div className="mt-6 space-y-4">
          <Separator />
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal, currency)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (8%)</span>
              <span>{formatCurrency(tax, currency)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>{formatCurrency(total, currency)}</span>
            </div>
          </div>
          <Button className="w-full" onClick={handleSubmitOrder}>
            Place Order
          </Button>
        </div>
      )}
    </div>
  );
}