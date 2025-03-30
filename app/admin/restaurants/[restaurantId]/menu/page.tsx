"use client"

import { useState, useEffect } from "react"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getRestaurantById } from "@/actions/restaurant-actions"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, Settings2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MenuForm, CategoryForm, MenuItemForm, MenuItemOptionForm, OptionChoiceForm } from "@/components/menu-forms"
import { deleteMenu, deleteCategory, deleteMenuItem } from "@/actions/menu-actions"
import { useToast } from "@/hooks/use-toast"


export default function RestaurantMenuPage({ params }: { params: { restaurantId: string } }) {
  type PrismaMenuItem = {
    id: number
    name: string
    description: string | null
    price: { toString(): string }
    image_url: string | null
    display_order: number
    is_available: boolean
    createdAt: Date
    updatedAt: Date
    category_id: number
  }

  type PrismaCategory = {
    id: number
    name: string
    description: string | null
    display_order: number
    menu_items: PrismaMenuItem[]
    menu_id: number
  }

  type PrismaMenu = {
    id: number
    name: string
    description: string | null
    is_active: boolean
    menu_categories: PrismaCategory[]
    restaurant_id: number
  }

  type PrismaRestaurant = {
    id: number
    name: string
    menus: PrismaMenu[]
  }

  const [restaurant, setRestaurant] = useState<PrismaRestaurant | null>(null)
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

  useEffect(() => {
    fetchData()
  }, [params.restaurantId])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!restaurant) {
    return notFound()
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
      }

      if (result?.success) {
        toast({ title: `${type} deleted successfully` })
        fetchData() // Refresh data
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

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 p-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Menu Management</h1>
          <MenuForm restaurantId={Number(params.restaurantId)} />
        </div>

        <Tabs defaultValue="menus">
          <TabsList className="mb-4">
            <TabsTrigger value="menus">Menu Structure</TabsTrigger>
            <TabsTrigger value="items">All Items</TabsTrigger>
          </TabsList>

          <TabsContent value="menus">
            <div className="grid gap-6">
              {restaurant.menus && restaurant.menus.length > 0 ? (
                restaurant.menus.map((menu) => (
                  <Card key={menu.id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div>
                        <CardTitle>{menu.name}</CardTitle>
                        <CardDescription>
                          {menu.is_active ? "Active" : "Inactive"} • {menu.menu_categories?.length || 0} categories
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <MenuForm
                          restaurantId={Number(params.restaurantId)}
                          initialData={menu}
                          onSuccess={fetchData}
                        />
                        <CategoryForm
                          menuId={menu.id}
                          onSuccess={fetchData}
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete('menu', menu.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Menu
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {menu.menu_categories && menu.menu_categories.length > 0 ? (
                        <div className="space-y-6">
                          {menu.menu_categories.map((category) => (
                            <div key={category.id} className="rounded-lg border bg-card">
                              <div className="flex items-center justify-between p-4">
                                <div>
                                  <h3 className="font-medium">{category.name}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {category.menu_items?.length || 0} items
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <CategoryForm
                                    menuId={menu.id}
                                    initialData={category}
                                    onSuccess={fetchData}
                                  />
                                  <MenuItemForm
                                    categoryId={category.id}
                                    onSuccess={fetchData}
                                  />
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDelete('category', category.id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Category
                                  </Button>
                                </div>
                              </div>
                              {category.menu_items && category.menu_items.length > 0 && (
                                <div className="border-t divide-y">
                                  {category.menu_items.map((item) => (
                                    <div key={item.id} className="flex items-center gap-4 p-4">
                                      <div className="relative h-12 w-12 overflow-hidden rounded-md">
                                        <img
                                          src={item.image_url || "/placeholder.svg?height=48&width=48"}
                                          alt={item.name}
                                          className="h-full w-full object-cover"
                                        />
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="font-medium">{item.name}</h4>
                                        <p className="text-sm text-muted-foreground">
                                          ${Number(item.price).toFixed(2)} • {item.is_available ? "Available" : "Unavailable"}
                                        </p>
                                      </div>
                                      <div className="flex gap-2">
                                        <MenuItemForm
                                          categoryId={category.id}
                                          initialData={item}
                                          onSuccess={fetchData}
                                        />
                                        <MenuItemOptionForm
                                          menuItemId={item.id}
                                          onSuccess={fetchData}
                                        />
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={() => handleDelete('item', item.id)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8">
                          <p className="mb-4 text-muted-foreground">No categories found</p>
                          <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create First Category
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center py-8">
                      <p className="mb-4 text-muted-foreground">No menus found</p>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create First Menu
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="items">
            <Card>
              <CardHeader>
                <CardTitle>Menu Items</CardTitle>
                <CardDescription>Manage your menu items</CardDescription>
              </CardHeader>
              <CardContent>
                {restaurant.menus && restaurant.menus.length > 0 ? (
                  <div className="space-y-4">
                    {restaurant.menus.flatMap(
                      (menu) =>
                        menu.menu_categories?.flatMap(
                          (category) =>
                            category.menu_items?.map((item) => (
                              <div key={item.id} className="flex items-center justify-between rounded-md border p-4">
                                <div className="flex items-center gap-4">
                                  <div className="relative h-12 w-12 overflow-hidden rounded-md">
                                    <img
                                      src={item.image_url || "/placeholder.svg?height=48&width=48"}
                                      alt={item.name}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                  <div>
                                    <h3 className="font-medium">{item.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                      {category.name} • ${Number(item.price).toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <MenuItemForm
                                    categoryId={category.id}
                                    initialData={item}
                                    onSuccess={fetchData}
                                  />
                                  <MenuItemOptionForm
                                    menuItemId={item.id}
                                    onSuccess={fetchData}
                                  />
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDelete('item', item.id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            )) || [],
                        ) || [],
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <p className="mb-4 text-muted-foreground">No menu items found</p>
                    {restaurant.menus.some(menu => menu.menu_categories?.length > 0) ? (
                      <div className="flex flex-col gap-4">
                        {restaurant.menus.map(menu =>
                          menu.menu_categories?.map(category => (
                            <div key={category.id} className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">{menu.name} - {category.name}:</span>
                              <MenuItemForm
                                categoryId={category.id}
                                onSuccess={fetchData}
                              />
                            </div>
                          ))
                        )}
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                          Please create a menu and category first
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

