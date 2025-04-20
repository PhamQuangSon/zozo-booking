"use client";

import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/i18n";
import type { OrderWithRelations } from "@/types/menu-builder-types";

export function useReceiptPrinter() {
  const { toast } = useToast();

  const printReceipt = (order: OrderWithRelations) => {
    // Create a new window for the receipt
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast({
        title: "Error",
        description:
          "Unable to open print window. Please check your popup blocker settings.",
        variant: "destructive",
      });
      return;
    }

    // Format the table number properly (ensure it's displayed as a base-10 number)
    const tableNumber =
      typeof order.table?.number === "number"
        ? Number.parseInt(order.table?.number.toString(), 10)
        : order.table?.number;

    // Get formatted date
    const orderDate =
      order.createdAt instanceof Date
        ? order.createdAt.toLocaleString()
        : new Date(order.createdAt).toLocaleString();

    // Build the receipt HTML
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - Order #${order.id}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            max-width: 300px;
          }
          .receipt-header {
            text-align: center;
            margin-bottom: 20px;
          }
          .receipt-header h1 {
            font-size: 18px;
            margin: 0;
          }
          .receipt-header p {
            margin: 5px 0;
            font-size: 14px;
          }
          .receipt-items {
            margin-bottom: 20px;
          }
          .item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;
          }
          .item-details {
            flex: 1;
          }
          .item-price {
            text-align: right;
            min-width: 60px;
          }
          .totals {
            border-top: 1px dashed #000;
            padding-top: 10px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
          }
          .grand-total {
            font-weight: bold;
            font-size: 16px;
            margin-top: 5px;
          }
          .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 12px;
          }
          @media print {
            body {
              width: 100%;
              max-width: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt-header">
          <h1>Order Receipt</h1>
          <p>Order #${order.id}</p>
          <p>Date: ${orderDate}</p>
          <p>Table: ${tableNumber}</p>
          <p>Status: ${order.status}</p>
        </div>
        
        <div class="receipt-items">
          ${order.orderItems
            .map(
              (item) => `
            <div class="item">
              <div class="item-details">
                ${item.quantity}x ${item.menuItem?.name || "Unknown Item"}
                ${
                  item.orderItemChoices && item.orderItemChoices.length > 0
                    ? `<div style="padding-left: 10px; font-size: 12px;">
                    ${item.orderItemChoices
                      .map(
                        (choice) =>
                          `${choice.menuItemOption?.name}: ${choice.optionChoice?.name}`
                      )
                      .join("<br>")}
                  </div>`
                    : ""
                }
                ${item.notes ? `<div style="font-style: italic; font-size: 12px;">Note: ${item.notes}</div>` : ""}
              </div>
              <div class="item-price">
                ${formatCurrency(Number(item.unitPrice) * item.quantity)}
              </div>
            </div>
          `
            )
            .join("")}
        </div>
        
        <div class="totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>${formatCurrency(Number(order.totalAmount) * 0.92)}</span>
          </div>
          <div class="total-row">
            <span>Tax (8%):</span>
            <span>${formatCurrency(Number(order.totalAmount) * 0.08)}</span>
          </div>
          <div class="total-row grand-total">
            <span>Total:</span>
            <span>${formatCurrency(Number(order.totalAmount))}</span>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for your order!</p>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;

    // Write the HTML to the new window and print
    printWindow.document.open();
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
  };

  return { printReceipt };
}
