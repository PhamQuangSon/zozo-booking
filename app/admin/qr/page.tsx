"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getRestaurants } from "@/actions/restaurant-actions"
import { getRestaurantTables } from "@/actions/table-actions"
import { useToast } from "@/hooks/use-toast"

export default function QRCodeGenerator() {
  const [restaurantId, setRestaurantId] = useState("")
  const [tableId, setTableId] = useState("")
  const [qrType, setQrType] = useState("table")
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [restaurants, setRestaurants] = useState<{ id: string; name: string }[]>([])
  const [tables, setTables] = useState<{ id: string; number: number }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  // Fetch restaurants on component mount
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const result = await getRestaurants()
        if (result.success && result.data) {
          setRestaurants(result.data.map((r) => ({ id: r.id.toString(), name: r.name })))
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to load restaurants",
            variant: "destructive"
          })
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
        setIsLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  // Fetch tables when restaurant is selected
  useEffect(() => {
    const fetchTables = async () => {
      if (!restaurantId) {
        setTables([]);
        return;
      }

      try {
        const { success, data, error } = await getRestaurantTables(restaurantId)
        if (success && data) {
          setTables(data.map(t => ({ id: t.id.toString(), number: t.number })));
        } else {
          toast({
            title: "Error",
            description: error || "Failed to fetch tables",
            variant: "destructive",
          })
        }
        
        setTableId(""); // Reset table selection
      } catch (error) {
        console.error("Error fetching tables:", error);
      }
    };

    fetchTables();
  }, [restaurantId]);

  const handleRestaurantChange = (value: string) => {
    setRestaurantId(value);
    setQrCodeUrl(""); // Reset QR code when restaurant changes
  };

  const generateQRCode = () => {
    // In a real app, this would call an API to generate a QR code
    // For now, we'll just create a placeholder URL
    if (qrType === "table" && restaurantId && tableId) {
      const selectedTable = tables.find(t => t.id === tableId);
      if (selectedTable) {
        setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://v0-next-js-zozo-booking.vercel.app/restaurants/${restaurantId}/${tableId}`);
      }
    } else if (qrType === "restaurant" && restaurantId) {
      setQrCodeUrl(
        `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://v0-next-js-zozo-booking.vercel.app/restaurant/${restaurantId}`,
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
                  <Select value={restaurantId} onValueChange={handleRestaurantChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoading ? "Loading restaurants..." : "Select restaurant"} />
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
                  <Label htmlFor="table-number">Table</Label>
                  <Select value={tableId} onValueChange={setTableId} disabled={!restaurantId || tables.length === 0}>
                    <SelectTrigger>
                      <SelectValue placeholder={!restaurantId ? "Select a restaurant first" : tables.length === 0 ? "Loading tables..." : "Select table"} />
                    </SelectTrigger>
                    <SelectContent>
                      {tables.map((table) => (
                        <SelectItem key={table.id} value={table.id}>
                          Table {table.number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={generateQRCode} disabled={!restaurantId || !tableId}>
                Generate QR Code
              </Button>
            </TabsContent>

            <TabsContent value="restaurant" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="restaurant">Restaurant</Label>
                <Select value={restaurantId} onValueChange={handleRestaurantChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoading ? "Loading restaurants..." : "Select restaurant"} />
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
