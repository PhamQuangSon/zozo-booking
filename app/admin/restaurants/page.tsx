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
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Restaurants</h2>
        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open)
            if (!open) setEditingRestaurant(null)
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Restaurant
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingRestaurant ? "Edit Restaurant" : "Add Restaurant"}</DialogTitle>
              <DialogDescription>
                {editingRestaurant
                  ? "Update restaurant details below"
                  : "Fill in the details to create a new restaurant"}
              </DialogDescription>
            </DialogHeader>
            <RestaurantForm
              initialData={editingRestaurant}
              onSuccess={() => {
                setIsAddDialogOpen(false)
                setEditingRestaurant(null)
                loadRestaurants()
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search restaurants..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Restaurants</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <p className="text-muted-foreground">Loading restaurants...</p>
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="flex justify-center py-8">
              <p className="text-muted-foreground">No restaurants found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRestaurants.map((restaurant) => (
                  <TableRow key={restaurant.id}>
                    <TableCell className="font-medium">{restaurant.name}</TableCell>
                    <TableCell>{restaurant.address || "—"}</TableCell>
                    <TableCell>{restaurant.phone || "—"}</TableCell>
                    <TableCell>{restaurant.email || "—"}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditRestaurant(restaurant)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => (window.location.href = `/admin/restaurants/${restaurant.id}/tables`)}
                          >
                            Manage Tables
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => (window.location.href = `/admin/restaurants/${restaurant.id}/menus`)}
                          >
                            Manage Menus
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteRestaurant(restaurant.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

