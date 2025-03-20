"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

// In a real app, this would be fetched from the server
const mockCartItems = [
  {
    id: "1",
    name: "Bruschetta",
    price: 8.99,
    quantity: 1,
    options: ["Regular"],
    extras: ["Extra Cheese"],
  },
  {
    id: "4",
    name: "Spaghetti Carbonara",
    price: 15.99,
    quantity: 2,
    options: ["Large (+$2.00)"],
    extras: [],
  },
]

export function OrderCart() {
  const [cartItems, setCartItems] = useState(mockCartItems)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const removeItem = (id: string) => {
    setCartItems(cartItems.filter((item) => item.id !== id))
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      let itemPrice = item.price
      if (item.options.some((opt) => opt.includes("Large"))) {
        itemPrice += 2
      }
      if (item.extras.some((ext) => ext.includes("Extra Cheese"))) {
        itemPrice += 1.5
      }
      return total + itemPrice * item.quantity
    }, 0)
  }

  const subtotal = calculateSubtotal()
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + tax

  const handleSubmitOrder = () => {
    setIsSubmitting(true)

    // In a real app, this would send the order to the server
    setTimeout(() => {
      setIsSubmitting(false)
      setCartItems([])
      toast({
        title: "Order Submitted",
        description: "Your order has been sent to the kitchen!",
      })
    }, 1500)
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
                  {item.options.length > 0 && (
                    <div className="ml-6 text-sm text-muted-foreground">{item.options.join(", ")}</div>
                  )}
                  {item.extras.length > 0 && (
                    <div className="ml-6 text-sm text-muted-foreground">{item.extras.join(", ")}</div>
                  )}
                </div>
                <div className="flex items-start space-x-2">
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
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
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
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

