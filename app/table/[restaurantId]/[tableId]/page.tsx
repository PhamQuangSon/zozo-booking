"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"

export default function TablePage() {
  const params = useParams()
  const router = useRouter()
  const restaurantId = params.restaurantId as string
  const tableId = params.tableId as string

  const [restaurant, setRestaurant] = useState<any>(null)
  const [table, setTable] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch restaurant
        const restaurantResponse = await fetch(`/api/admin/restaurants/${restaurantId}`)

        if (!restaurantResponse.ok) {
          toast({
            title: "Error",
            description: "Failed to fetch restaurant details",
            variant: "destructive",
          })
          return
        }

        const restaurantData = await restaurantResponse.json()
        setRestaurant(restaurantData.restaurant)

        // Fetch table
        const tableResponse = await fetch(`/api/admin/tables/${tableId}`)

        if (!tableResponse.ok) {
          toast({
            title: "Error",
            description: "Failed to fetch table details",
            variant: "destructive",
          })
          return
        }

        const tableData = await tableResponse.json()
        setTable(tableData.table)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (restaurantId && tableId) {
      fetchData()
    }
  }, [restaurantId, tableId])

  const handleBookTable = () => {
    router.push(`/booking?restaurant=${restaurantId}&table=${tableId}`)
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (!restaurant || !table) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Table Not Found</CardTitle>
            <CardDescription>The table you're looking for doesn't exist</CardDescription>
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
          <CardTitle>
            {restaurant.name} - Table {table.table_number}
          </CardTitle>
          <CardDescription>{restaurant.address}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">Capacity</p>
              <p>
                {table.capacity} {table.capacity === 1 ? "person" : "people"}
              </p>
            </div>

            <Button onClick={handleBookTable}>Book This Table</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

