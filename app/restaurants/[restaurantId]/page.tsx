"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"

export default function RestaurantPage() {
  const params = useParams()
  const restaurantId = params.id as string

  const [restaurant, setRestaurant] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/admin/restaurants/${restaurantId}`)

        if (response.ok) {
          const data = await response.json()
          setRestaurant(data.restaurant)
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch restaurant details",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching restaurant:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (restaurantId) {
      fetchRestaurant()
    }
  }, [restaurantId])

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (!restaurant) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Restaurant Not Found</CardTitle>
            <CardDescription>The restaurant you're looking for doesn't exist</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/booking">Back to Booking</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>{restaurant.name}</CardTitle>
          <CardDescription>{restaurant.address}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">Phone</p>
              <p>{restaurant.phone}</p>
            </div>

            <Button asChild>
              <Link href={`/booking?restaurant=${restaurantId}`}>Make a Reservation</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

