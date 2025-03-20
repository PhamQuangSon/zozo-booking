"use client"

import { useState } from "react"
import { QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface QrCodeButtonProps {
  restaurantId: string
}

export function QrCodeButton({ restaurantId }: QrCodeButtonProps) {
  const [tableNumber, setTableNumber] = useState<string>("")

  // In a real app, this would generate a QR code for the specific table
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://example.com/table/${restaurantId}/${tableNumber}`)}`

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <QrCode className="mr-2 h-4 w-4" />
          Table QR Code
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Table QR Code</DialogTitle>
          <DialogDescription>Scan this QR code to place an order from your table.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="table-number">Select Table Number</Label>
            <Select value={tableNumber} onValueChange={setTableNumber}>
              <SelectTrigger id="table-number">
                <SelectValue placeholder="Select table" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 20 }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    Table {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {tableNumber && (
            <div className="flex flex-col items-center space-y-2">
              <div className="overflow-hidden rounded-lg border p-1">
                <img
                  src={qrCodeUrl || "/placeholder.svg"}
                  alt={`QR Code for Table ${tableNumber}`}
                  width={200}
                  height={200}
                />
              </div>
              <p className="text-sm text-muted-foreground">Table {tableNumber}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

