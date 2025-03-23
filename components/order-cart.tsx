"use client"

import { useState, useEffect } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useCurrencyStore } from "@/lib/currency-store"
import { formatCurrency } from "@/lib/i18n"
import { createTableOrder } from "@/actions/table-actions"

interface OrderCartProps {
  restaurantId?: string
  tableId?: string
}

export function OrderCart({ restaurantId, tableId }: OrderCartProps) {
  const [cartItems, setCartItems] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { currency } = useCurrencyStore()

  // Load cart items from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCart = localStorage.getItem(`cart-${restaurantId}-${tableId}`)
      if (storedCart) {
        try {
          setCartItems(JSON.parse(storedCart))
        } catch (e) {
          console.error("Failed to parse stored cart:", e)
          // Clear invalid cart data
          localStorage.removeItem(`cart-${restaurantId}-${tableId}`)
        }
      }
    }
  }, [restaurantId, tableId])

  // Save cart items to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined" && restaurantId && tableId) {
      localStorage.setItem(`cart-${restaurantId}-${tableId}`, JSON.stringify(cartItems))
    }
  }, [cartItems, restaurantId, tableId])

  const addToCart = (item: any) => {
    setCartItems((prevItems) => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex((i) => i.id === item.id)

      if (existingItemIndex >= 0) {
        // Update existing item
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1,
        }
        return updatedItems
      } else {
        // Add new item
        return [...prevItems, { ...item, quantity: 1 }]
      }
    })
  }

  const removeItem = (id: string) => {
    setCartItems(cartItems.filter((item) => item.id !== id))
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
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

  const subtotal = calculateSubtotal()
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + tax

  const handleSubmitOrder = async () => {
    if (!restaurantId || !tableId || cartItems.length === 0) {
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
      const orderItems = cartItems.map((item) => ({
        menuItemId: Number.parseInt(item.id),
        quantity: item.quantity,
        notes: item.specialInstructions,
        choices: item.selectedOptions
          ? Object.entries(item.selectedOptions).map(([optionId, choice]: [string, any]) => ({
              optionId: Number.parseInt(optionId),
              choiceId: Number.parseInt(choice.id),
            }))
          : [],
      }))

      const result = await createTableOrder({
        restaurantId: Number.parseInt(restaurantId),
        tableId: Number.parseInt(tableId),
        items: orderItems,
      })

      if (result.success) {
        toast({
          title: "Order Submitted",
          description: "Your order has been sent to the kitchen!",
        })

        // Clear cart after successful order
        setCartItems([])
        localStorage.removeItem(`cart-${restaurantId}-${tableId}`)
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

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="mb-2 text-lg font-medium">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">Add items from the menu to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
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
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeItem(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {cartItems.length > 0 && (
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
          <Button className="w-full" onClick={handleSubmitOrder} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Place Order"}
          </Button>
        </div>
      )}
    </div>
  )
}

