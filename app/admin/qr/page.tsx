"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function QRCodeGenerator() {
  const [restaurantId, setRestaurantId] = useState("")
  const [tableNumber, setTableNumber] = useState("")
  const [qrType, setQrType] = useState("table")
  const [qrCodeUrl, setQrCodeUrl] = useState("")

  // Mock restaurants - in a real app this would come from an API
  const restaurants = [
    { id: "1", name: "Main Restaurant" },
    { id: "2", name: "Downtown Branch" },
    { id: "3", name: "Seaside Location" },
  ]

  const generateQRCode = () => {
    // In a real app, this would call an API to generate a QR code
    // For now, we'll just create a placeholder URL
    if (qrType === "table" && restaurantId && tableNumber) {
      setQrCodeUrl(
        `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://127.0.2.2:3000/booking?restaurant=${restaurantId}&table=${tableNumber}`,
      )
    } else if (qrType === "restaurant" && restaurantId) {
      setQrCodeUrl(
        `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://127.0.2.2:3000/booking?restaurant=${restaurantId}`,
      )
    }
  }

  const downloadQRCode = () => {
    // In a real app, this would download the QR code
    window.open(qrCodeUrl, "_blank")
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>QR Code Generator</CardTitle>
          <CardDescription>Generate QR codes for restaurant tables or general booking</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="table" onValueChange={(value) => setQrType(value)}>
            <TabsList className="mb-4">
              <TabsTrigger value="table">Table QR Code</TabsTrigger>
              <TabsTrigger value="restaurant">Restaurant QR Code</TabsTrigger>
            </TabsList>

            <TabsContent value="table" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="restaurant">Restaurant</Label>
                  <Select value={restaurantId} onValueChange={setRestaurantId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select restaurant" />
                    </SelectTrigger>
                    <SelectContent>
                      {restaurants.map((restaurant) => (
                        <SelectItem key={restaurant.id} value={restaurant.id}>
                          {restaurant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="table-number">Table Number</Label>
                  <Input
                    id="table-number"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="Enter table number"
                  />
                </div>
              </div>

              <Button onClick={generateQRCode} disabled={!restaurantId || !tableNumber}>
                Generate QR Code
              </Button>
            </TabsContent>

            <TabsContent value="restaurant" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="restaurant">Restaurant</Label>
                <Select value={restaurantId} onValueChange={setRestaurantId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select restaurant" />
                  </SelectTrigger>
                  <SelectContent>
                    {restaurants.map((restaurant) => (
                      <SelectItem key={restaurant.id} value={restaurant.id}>
                        {restaurant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={generateQRCode} disabled={!restaurantId}>
                Generate QR Code
              </Button>
            </TabsContent>
          </Tabs>

          {qrCodeUrl && (
            <div className="mt-8 flex flex-col items-center">
              <div className="border p-4 rounded-lg mb-4">
                <img src={qrCodeUrl || "/placeholder.svg"} alt="QR Code" className="w-48 h-48" />
              </div>
              <Button onClick={downloadQRCode}>Download QR Code</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

