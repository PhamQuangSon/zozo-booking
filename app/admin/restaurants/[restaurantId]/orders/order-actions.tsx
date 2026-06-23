"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { updateOrderStatus } from "@/actions/order-actions";
import { useReceiptPrinter } from "@/components/receipt-printer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { OrderWithRelations } from "@/types/menu-builder-types";
import type { OrderStatus } from "@prisma/client";

interface OrderActionsProps {
  order: OrderWithRelations;
}

export function OrderActions({ order }: OrderActionsProps) {
  const router = useRouter();
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const { printReceipt } = useReceiptPrinter();

  // Status options based on current status
  const getAvailableStatuses = (currentStatus: OrderStatus): OrderStatus[] => {
    switch (currentStatus) {
      case "NEW":
        return ["PREPARING", "CANCELLED"];
      case "PREPARING":
        return ["COMPLETED", "CANCELLED"];
      case "COMPLETED":
        return [];
      case "CANCELLED":
        return [];
      default:
        return [];
    }
  };

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    try {
      setLoading(true);
      const result = await updateOrderStatus(order.id, newStatus);
      if (result.success) {
        router.refresh();
      }
    } finally {
      setLoading(false);
      setShowStatusDialog(false);
      setSelectedStatus(null);
    }
  };

  const handlePrintReceipt = () => {
    printReceipt(order);
  };

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
              onClick={() => {
                setSelectedStatus(status);
                setShowStatusDialog(true);
              }}
            >
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={showStatusDialog}
        onOpenChange={(open) => {
          setShowStatusDialog(open);
          if (!open) setSelectedStatus(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Order Status</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to update this order status to{" "}
              <span className="font-semibold text-foreground">
                {selectedStatus ? selectedStatus.charAt(0) + selectedStatus.slice(1).toLowerCase() : ""}
              </span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedStatus(null)}>Cancel</AlertDialogCancel>
            {selectedStatus && (
              <AlertDialogAction
                onClick={() => handleStatusUpdate(selectedStatus)}
                disabled={loading}
              >
                Update to {selectedStatus.charAt(0) + selectedStatus.slice(1).toLowerCase()}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
