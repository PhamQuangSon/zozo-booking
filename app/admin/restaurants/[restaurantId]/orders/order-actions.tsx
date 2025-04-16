"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { updateOrderItemStatus } from "@/actions/order-actions"
import { OrderStatus } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useReceiptPrinter } from "@/components/receipt-printer"
interface OrderActionsProps {
  order: {
    id: number
    status: OrderStatus
    table: {
      number: number
    } | null
    createdAt: Date
    orderItems: {
      quantity: number
      unitPrice: number
      menuItem: {
        name: string
      } | null
      orderItemChoices: {
        menuItemOption: {
          name: string
        } | null
        optionChoice: {
          name: string
        } | null
      }[] | null
      notes: string | null
    }[]
    totalAmount: number
  }
}

export function OrderActions({ order }: OrderActionsProps) {
  const router = useRouter()
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const { printReceipt } = useReceiptPrinter()

  // Status options based on current status
  const getAvailableStatuses = (currentStatus: OrderStatus): OrderStatus[] => {
    switch (currentStatus) {
      case "NEW":
        return ["PREPARING", "CANCELLED"]
      case "PREPARING":
        return ["COMPLETED", "CANCELLED"]
      case "COMPLETED":
        return []
      case "CANCELLED":
        return []
      default:
        return []
    }
  }

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    try {
      setLoading(true)
      const result = await updateOrderItemStatus(order.id, newStatus)
      if (result.success) {
        router.refresh()
      }
    } finally {
      setLoading(false)
      setShowStatusDialog(false)
    }
  }

  const handlePrintReceipt = () => {
    printReceipt({
      orderId: order.id,
      createdAt: order.createdAt,
      tableNumber: order.table?.number || "N/A",
      status: order.status,
      items: order.orderItems,
      totalAmount: order.totalAmount,
    })
  }

  return (
    <div className="flex justify-end gap-2 pt-2">
      <Button variant="outline" size="sm" onClick={handlePrintReceipt}>
        Print Receipt
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" disabled={loading}>
            Update Status
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {getAvailableStatuses(order.status).map((status) => (
            <DropdownMenuItem
              key={status}
              onClick={() => setShowStatusDialog(true)}
            >
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Order Status</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to update this order status? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {getAvailableStatuses(order.status).map((status) => (
              <AlertDialogAction
                key={status}
                onClick={() => handleStatusUpdate(status)}
                disabled={loading}
              >
                Update to {status.charAt(0) + status.slice(1).toLowerCase()}
              </AlertDialogAction>
            ))}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}