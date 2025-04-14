"use client"

import { useState } from "react"
import { Trash2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useCurrencyStore } from "@/store/currency-store"
import { formatCurrency } from "@/lib/i18n"
import { createTableOrder } from "@/actions/table-actions"
import { type CartItem, useCartStore } from "@/store/cartStore"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"

interface OrderCartProps {
  restaurantId: string
  tableId: string
}

export function OrderCart({ restaurantId, tableId }: OrderCartProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { currency } = useCurrencyStore()
  const { data: session } = useSession()
  const { cart, removeItem, markItemsAsSubmitted, getSubmittedItems, getPendingItems } = useCartStore()

  // Get pending and submitted items
  const pendingItems = restaurantId && tableId ? getPendingItems(restaurantId, tableId) : []
  const submittedItems = restaurantId && tableId ? getSubmittedItems(restaurantId, tableId) : []

  const calculateSubtotal = (items: CartItem[]) => {
    return items.reduce((total, item) => {
      let itemPrice = item.price

      // Add price for options if any
      if (item.selectedOptions) {
        Object.values(item.selectedOptions).forEach((option: any) => {
          if (option.priceAdjustment) {
            itemPrice += option.priceAdjustment
          }
        })
      }

      return total + itemPrice * item.quantity
    }, 0)
  }

  const pendingSubtotal = calculateSubtotal(pendingItems)
  const pendingTax = pendingSubtotal * 0.08 // 8% tax
  const pendingTotal = pendingSubtotal + pendingTax

  const submittedSubtotal = calculateSubtotal(submittedItems)
  const submittedTax = submittedSubtotal * 0.08 // 8% tax
  const submittedTotal = submittedSubtotal + submittedTax

  const handleSubmitOrder = async () => {
    if (!restaurantId || !tableId || pendingItems.length === 0) {
      toast({
        title: "Error",
        description: "Cannot submit empty order",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Format order items for the API
      const orderItems = pendingItems.map((item) => ({
        menuItemId: Number(item.id),
        quantity: item.quantity,
        notes: item.specialInstructions,
        choices: item.selectedOptions
          ? Object.entries(item.selectedOptions).map(([optionId, choice]: [string, any]) => {
              // Handle both single selection (radio) and multiple selection (checkbox) cases
              let choiceId

              if (choice.id) {
                // Single selection case (radio buttons)
                choiceId = Number(choice.id)
              } else if (typeof choice === "object") {
                // Multiple selection case (checkboxes)
                // Get the first choice ID from the object
                const firstChoiceId = Object.keys(choice)[0]
                choiceId = firstChoiceId ? Number(firstChoiceId) : 0
              } else {
                choiceId = 0 // Fallback
              }

              return {
                optionId: Number(optionId),
                choiceId: choiceId || 0, // Ensure we have a valid number
              }
            })
          : [],
      }))

      // Get customer info from localStorage if user is not authenticated
      let customerName, customerEmail
      if (!session?.user) {
        customerName = localStorage.getItem("customerName") || undefined
        customerEmail = localStorage.getItem("customerEmail") || undefined
      }

      const result = await createTableOrder({
        restaurantId: Number.parseInt(restaurantId),
        tableId: Number.parseInt(tableId),
        customerName,
        customerEmail,
        items: orderItems,
      })

      if (result.success) {
        toast({
          title: "Order Submitted",
          description: "Your order has been sent to the kitchen!",
        })

        // Mark items as submitted instead of removing them
        markItemsAsSubmitted(restaurantId, tableId, Number(result.data?.id))
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to submit order",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting order:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderCartItems = (items: CartItem[]) => {
    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="mb-2 text-lg font-medium">No items</p>
          <p className="text-sm text-muted-foreground">
            {items === pendingItems ? "Add items from the menu to get started" : "No orders have been submitted yet"}
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {items.map((item) => (
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
                      {option.priceAdjustment > 0 && `(+${formatCurrency(option.priceAdjustment, currency)})`}
                    </div>
                  ))}
                </div>
              )}

              {/* Display special instructions */}
              {item.specialInstructions && (
                <div className="ml-6 text-sm text-muted-foreground italic">"{item.specialInstructions}"</div>
              )}
            </div>
            <div className="flex items-start space-x-2">
              <span>{formatCurrency(item.price * item.quantity, currency)}</span>
              {/* Only show remove button for pending items */}
              {!item.submitted && (
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeItem(item.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderOrderSummary = (subtotal: number, tax: number, total: number, isSubmitted: boolean) => {
    if (subtotal === 0) return null

    return (
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
        {!isSubmitted && (
          <Button className="w-full" onClick={handleSubmitOrder} disabled={isSubmitting || pendingItems.length === 0}>
            {isSubmitting ? "Submitting..." : "Place Order"}
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="current" className="relative">
            Current Order
            {pendingItems.length > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                {pendingItems.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="submitted" className="relative">
            Submitted
            {submittedItems.length > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                {submittedItems.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="flex-1 overflow-auto">
          {renderCartItems(pendingItems)}
          {renderOrderSummary(pendingSubtotal, pendingTax, pendingTotal, false)}
        </TabsContent>

        <TabsContent value="submitted" className="flex-1 overflow-auto">
          {submittedItems.length > 0 && (
            <div className="bg-muted p-2 rounded-md mb-4 flex items-center text-sm">
              <Clock className="h-4 w-4 mr-2" />
              <span>These items have been sent to the kitchen</span>
            </div>
          )}
          {renderCartItems(submittedItems)}
          {renderOrderSummary(submittedSubtotal, submittedTax, submittedTotal, true)}
        </TabsContent>
      </Tabs>
    </div>
  )
}
