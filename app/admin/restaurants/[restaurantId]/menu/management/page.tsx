"use client"

import { useState, useEffect } from "react"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getRestaurantById } from "@/actions/restaurant-actions"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { 
//   MenuForm, 
//   CategoryForm, 
//   MenuItemForm, 
//   MenuItemOptionForm, 
//   OptionChoiceForm 
// } from "@/components/menu-forms"
import { useToast } from "@/hooks/use-toast"

export default function MenuManagementPage({ params }: { params: { restaurantId: string } }) {
  interface OptionChoice {
    id: number
    name: string
    price_adjustment: number | { toString(): string }
  }

  interface MenuItemOption {
    id: number
    name: string
    price_adjustment: number | { toString(): string }
    is_required: boolean
    option_choices?: OptionChoice[]
  }

  interface MenuItem {
    id: number
    name: string
    description: string | null
    price: number | { toString(): string }
    image_url: string | null
    display_order: number
    is_available: boolean
    menu_item_options?: MenuItemOption[]
  }

  interface MenuCategory {
    id: number
    name: string
    description: string | null
    display_order: number
    menu_items?: MenuItem[]
  }

  interface Menu {
    id: number
    name: string
    description: string | null
    is_active: boolean
    menu_categories?: MenuCategory[]
  }

  interface Restaurant {
    id: number
    name: string
    menus?: Menu[]
  }

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(null)
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null)
  const [selectedOption, setSelectedOption] = useState<MenuItemOption | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchData = async () => {
    try {
      const { success, data, error } = await getRestaurantById(params.restaurantId)
      if (!success || !data) {
        throw new Error(error || "Failed to load restaurant")
      }
      const restaurantData = data as Restaurant;
      setRestaurant(restaurantData)
      
      // Set initial selections
      const firstMenu = restaurantData.menus?.[0];
      setSelectedMenu(firstMenu || null);
      
      const firstCategory = firstMenu?.menu_categories?.[0];
      setSelectedCategory(firstCategory || null);
      
      const firstMenuItem = firstCategory?.menu_items?.[0];
      setSelectedMenuItem(firstMenuItem || null);
      
      const firstOption = firstMenuItem?.menu_item_options?.[0];
      setSelectedOption(firstOption || null);
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

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Menu Management</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage your restaurant&apos;s menu structure
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Menus Column */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Menus</CardTitle>
                {/* <MenuForm
                  restaurantId={Number(params.restaurantId)}
                  onSuccess={() => {
                    fetchData()
                    toast({ title: "Menu created successfully" })
                  }}
                /> */}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {restaurant.menus?.map((menu: Menu) => (
                  <div 
                    key={menu.id} 
                    className={`p-3 rounded-lg cursor-pointer hover:bg-accent ${
                      selectedMenu?.id === menu.id ? 'bg-accent' : ''
                    }`}
                    onClick={() => {
                      setSelectedMenu(menu)
                      const firstCategory = menu.menu_categories?.[0] || null
                      setSelectedCategory(firstCategory)
                      setSelectedMenuItem(null)
                      setSelectedOption(null)
                    }}
                  >
                    <div className="font-medium">{menu.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {menu.menu_categories?.length || 0} categories
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Categories Column */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Categories</CardTitle>
                {/* {selectedMenu && (
                  <CategoryForm
                    menuId={selectedMenu.id}
                    onSuccess={() => {
                      fetchData()
                      toast({ title: "Category created successfully" })
                    }}
                  />
                )} */}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedMenu?.menu_categories?.map((category: MenuCategory) => (
                  <div
                    key={category.id}
                    className={`p-3 rounded-lg cursor-pointer hover:bg-accent ${
                      selectedCategory?.id === category.id ? 'bg-accent' : ''
                    }`}
                    onClick={() => {
                      setSelectedCategory(category)
                      const firstMenuItem = category.menu_items?.[0] || null
                      setSelectedMenuItem(firstMenuItem)
                      setSelectedOption(null)
                    }}
                  >
                    <div className="font-medium">{category.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {category.menu_items?.length || 0} items
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Menu Items Column */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Menu Items</CardTitle>
                {selectedCategory && (
                  // <MenuItemForm
                  //   categoryId={selectedCategory.id}
                  //   onSuccess={() => {
                  //     fetchData()
                  //     toast({ title: "Menu item created successfully" })
                  //   }}
                  // />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedCategory?.menu_items?.map((item: MenuItem) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg cursor-pointer hover:bg-accent ${
                      selectedMenuItem?.id === item.id ? 'bg-accent' : ''
                    }`}
                    onClick={() => {
                      setSelectedMenuItem(item)
                      const firstOption = item.menu_item_options?.[0] || null
                      setSelectedOption(firstOption)
                    }}
                  >
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      ${Number(item.price).toFixed(2)} • {item.menu_item_options?.length || 0} options
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Options Column */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Options & Choices</CardTitle>
                {/* {selectedMenuItem && (
                  <MenuItemOptionForm
                    menuItemId={selectedMenuItem.id}
                    onSuccess={() => {
                      fetchData()
                      toast({ title: "Option created successfully" })
                    }}
                  />
                )} */}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {selectedMenuItem?.menu_item_options?.map((option: MenuItemOption) => (
                  <div
                    key={option.id}
                    className={`p-3 rounded-lg cursor-pointer hover:bg-accent ${
                      selectedOption?.id === option.id ? 'bg-accent' : ''
                    }`}
                    onClick={() => setSelectedOption(option)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{option.name}</div>
                      {/* {selectedOption?.id === option.id && (
                        <OptionChoiceForm
                          optionId={option.id}
                          onSuccess={() => {
                            fetchData()
                            toast({ title: "Choice created successfully" })
                          }}
                        />
                      )} */}
                    </div>
                    <div className="space-y-2">
                      {option.option_choices?.map((choice: OptionChoice) => (
                        <div
                          key={choice.id}
                          className="text-sm p-2 bg-background rounded border"
                        >
                          {choice.name}
                          {Number(choice.price_adjustment) > 0 && (
                            <span className="text-muted-foreground">
                              {" "}(+${Number(choice.price_adjustment).toFixed(2)})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}