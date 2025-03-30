"use client"

import { useState, useEffect } from "react"
import { notFound } from "next/navigation"
import { getRestaurantById } from "@/actions/restaurant-actions"
import { deleteMenu, deleteCategory, deleteMenuItem, deleteMenuItemOption } from "@/actions/menu-actions"
import { useToast } from "@/hooks/use-toast"
import { MenuBuilder } from "@/components/menu-builder"

export default function RestaurantMenuPage({ params }: { params: { restaurantId: string } }) {
  const [restaurant, setRestaurant] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchData = async () => {
    try {
      const { success, data, error } = await getRestaurantById(params.restaurantId)
      if (!success || !data) {
        throw new Error(error || "Failed to load restaurant")
      }
      setRestaurant(data)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to load restaurant data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (type: string, id: number) => {
    try {
      let result;
      switch (type) {
        case 'menu':
          result = await deleteMenu(id);
          break;
        case 'category':
          result = await deleteCategory(id);
          break;
        case 'item':
          result = await deleteMenuItem(id);
          break;
        case 'option':
          result = await deleteMenuItemOption(id);
          break;
      }

      if (result?.success) {
        toast({ title: `${type} deleted successfully` })
        fetchData()
      } else {
        toast({
          title: "Error",
          description: result?.error || `Failed to delete ${type}`,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    fetchData()
  }, [params.restaurantId])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!restaurant) {
    return notFound()
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Menu Management</h1>
          <p className="text-muted-foreground mt-2">
            Drag and drop to organize your menu structure
          </p>
        </div>

        <MenuBuilder
          restaurant={restaurant}
          onUpdate={fetchData}
          onDelete={handleDelete}
        />
      </div>
    </div>
  )
}
