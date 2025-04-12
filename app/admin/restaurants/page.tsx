"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RestaurantForm } from "@/components/restaurant-form"
import { getRestaurants, deleteRestaurant } from "@/actions/restaurant-actions"
import { useToast } from "@/hooks/use-toast"
import { RestaurantsClient } from "@/components/admin/restaurants-client"

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRestaurant, setEditingRestaurant] = useState<any>(null)
  const { toast } = useToast()

  // Load restaurants
  const loadRestaurants = async () => {
    setIsLoading(true)
    try {
      const result = await getRestaurants()
      if (result.success) {
        setRestaurants(result.data)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load restaurants",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading restaurants:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadRestaurants()
  }, [])

  // Filter restaurants based on search query
  const filteredRestaurants = restaurants.filter(
    (restaurant) =>
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (restaurant.description && restaurant.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (restaurant.address && restaurant.address.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  // Handle restaurant deletion
  const handleDeleteRestaurant = async (id: number) => {
    if (confirm("Are you sure you want to delete this restaurant? This action cannot be undone.")) {
      try {
        const result = await deleteRestaurant(id)
        if (result.success) {
          toast({
            title: "Success",
            description: "Restaurant deleted successfully",
          })
          loadRestaurants()
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to delete restaurant",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error deleting restaurant:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
      }
    }
  }

  // Handle edit restaurant
  const handleEditRestaurant = (restaurant: any) => {
    setEditingRestaurant(restaurant)
    setIsAddDialogOpen(true)
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Restaurants</h1>
      <RestaurantsClient restaurants={restaurants} />
    </>
  )
}

