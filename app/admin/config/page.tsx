"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

export default function RestaurantConfig() {
  const router = useRouter()
  const [defaultRestaurant, setDefaultRestaurant] = useState({
    id: "",
    name: "",
    address: "",
    phone: "",
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch the current default restaurant config
    const fetchDefaultRestaurant = async () => {
      try {
        const response = await fetch("/api/admin/default-restaurant")
        if (response.ok) {
          const data = await response.json()
          if (data.restaurant) {
            setDefaultRestaurant(data.restaurant)
          }
        }
      } catch (error) {
        console.error("Error fetching default restaurant:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDefaultRestaurant()
  }, [])

  const handleSave = async () => {
    try {
      const response = await fetch("/api/admin/default-restaurant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ restaurant: defaultRestaurant }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Default restaurant configuration saved successfully",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to save default restaurant configuration",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving default restaurant:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Default Restaurant Configuration</CardTitle>
          <CardDescription>Set the default restaurant for QR code reservations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="restaurant-id">Restaurant ID</Label>
              <Input
                id="restaurant-id"
                value={defaultRestaurant.id}
                onChange={(e) => setDefaultRestaurant({ ...defaultRestaurant, id: e.target.value })}
                placeholder="Enter restaurant ID"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="restaurant-name">Restaurant Name</Label>
              <Input
                id="restaurant-name"
                value={defaultRestaurant.name}
                onChange={(e) => setDefaultRestaurant({ ...defaultRestaurant, name: e.target.value })}
                placeholder="Enter restaurant name"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="restaurant-address">Address</Label>
              <Input
                id="restaurant-address"
                value={defaultRestaurant.address}
                onChange={(e) => setDefaultRestaurant({ ...defaultRestaurant, address: e.target.value })}
                placeholder="Enter restaurant address"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="restaurant-phone">Phone</Label>
              <Input
                id="restaurant-phone"
                value={defaultRestaurant.phone}
                onChange={(e) => setDefaultRestaurant({ ...defaultRestaurant, phone: e.target.value })}
                placeholder="Enter restaurant phone"
              />
            </div>
            <Button onClick={handleSave}>Save Configuration</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

