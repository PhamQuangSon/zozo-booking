"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, DotIcon as DragHandleDots2Icon } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { MenuItemEditModal } from "@/components/admin/menu-item-edit-modal"
import { ItemOptionEditModal } from "@/components/admin/item-option-edit-modal"
import { deleteMenuItem, updateMenuItemOrder } from "@/actions/menu-item-actions"
import { deleteItemOption } from "@/actions/item-option-actions"
import { useRouter } from "next/navigation"
import type { Restaurant, MenuItem, MenuItemOption, Category } from "@prisma/client"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { CSS } from "@dnd-kit/utilities"

type RestaurantWithRelations = Restaurant & {
  categories: (Category & {
    menuItems: (MenuItem & {
      itemOptions: MenuItemOption[]
    })[]
  })[]
}

type MenuItemWithRelations = MenuItem & {
  category: Category
  restaurant: Restaurant
  itemOptions: MenuItemOption[]
  formattedPrice?: string
}

type ItemOptionWithRelations = MenuItemOption & {
  menuItem: MenuItem & {
    restaurant: Restaurant
  }
  formattedPriceAdjustment?: string
  optionChoices: {
    id: number
    name: string
    priceAdjustment: number
    formattedPriceAdjustment?: string
  }[]
}

interface RestaurantMenuClientProps {
  restaurant: RestaurantWithRelations
  allMenuItems: MenuItemWithRelations[]
  allItemOptions: ItemOptionWithRelations[]
  restaurantId: number
}

export function RestaurantMenuClient({
  restaurant,
  allMenuItems,
  allItemOptions,
  restaurantId,
}: RestaurantMenuClientProps) {
  const { toast } = useToast()
  const router = useRouter()

  // State for menu items and options
  const [menuItems, setMenuItems] = useState<MenuItemWithRelations[]>([])
  const [itemOptions, setItemOptions] = useState<ItemOptionWithRelations[]>([])

  // State for modals
  const [menuItemModalOpen, setMenuItemModalOpen] = useState(false)
  const [itemOptionModalOpen, setItemOptionModalOpen] = useState(false)
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItemWithRelations | null>(null)
  const [selectedItemOption, setSelectedItemOption] = useState<ItemOptionWithRelations | null>(null)
  const [modalMode, setModalMode] = useState<"create" | "edit">("create")

  // State for active category and menu item
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null)
  const [activeMenuItemId, setActiveMenuItemId] = useState<number | null>(null)

  // Filter menu items and options for this restaurant
  useEffect(() => {
    // Filter menu items for this restaurant
    const filteredMenuItems = allMenuItems.filter((item) => item.restaurantId === restaurantId)
    setMenuItems(filteredMenuItems)

    // Filter item options for the filtered menu items
    const filteredItemOptions = allItemOptions.filter((option) =>
      filteredMenuItems.some((item) => item.id === option.menuItemId),
    )
    setItemOptions(filteredItemOptions)

    // Set active category if there are categories
    if (restaurant.categories && restaurant.categories.length > 0) {
      setActiveCategoryId(restaurant.categories[0].id)
    }
  }, [restaurant, allMenuItems, allItemOptions, restaurantId])

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Handle menu item modal
  const handleAddMenuItem = () => {
    setSelectedMenuItem(null)
    setModalMode("create")
    setMenuItemModalOpen(true)
  }

  const handleEditMenuItem = (menuItem: MenuItemWithRelations) => {
    setSelectedMenuItem(menuItem)
    setModalMode("edit")
    setMenuItemModalOpen(true)
  }

  const handleMenuItemModalClose = (refresh: boolean) => {
    setMenuItemModalOpen(false)
    if (refresh) {
      router.refresh()
    }
  }

  // Handle item option modal
  const handleAddItemOption = (menuItem: MenuItemWithRelations) => {
    setActiveMenuItemId(menuItem.id)
    setSelectedItemOption(null)
    setModalMode("create")
    setItemOptionModalOpen(true)
  }

  const handleEditItemOption = (itemOption: ItemOptionWithRelations) => {
    setSelectedItemOption(itemOption)
    setModalMode("edit")
    setItemOptionModalOpen(true)
  }

  const handleItemOptionModalClose = (refresh: boolean) => {
    setItemOptionModalOpen(false)
    if (refresh) {
      router.refresh()
    }
  }

  // Handle drag end for menu items
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    // Extract the IDs from the sortable item IDs (format: "item-{id}")
    const activeId = Number(active.id.toString().replace("item-", ""))
    const overId = Number(over.id.toString().replace("item-", ""))

    // Find the items in the current category items
    const activeIndex = categoryMenuItems.findIndex((item) => item.id === activeId)
    const overIndex = categoryMenuItems.findIndex((item) => item.id === overId)

    if (activeIndex !== -1 && overIndex !== -1) {
      // Update the local state first for immediate UI feedback
      const newItems = arrayMove(categoryMenuItems, activeIndex, overIndex)

      // Update the display order of the items
      const updatedItems = newItems.map((item, index) => ({
        ...item,
        displayOrder: index,
      }))

      // Update the menu items state
      const updatedMenuItems = [...menuItems]
      updatedItems.forEach((item) => {
        if (item.categoryId === activeCategoryId) {
          const updatedItem = updatedItems.find((updated) => updated.id === item.id)
          if (updatedItem) {
            item.displayOrder = updatedItem.displayOrder
          }
        }
      })
      setMenuItems(updatedMenuItems)

      // Save the new order to the server
      try {
        const updates = updatedItems.map((item) => ({
          id: item.id,
          displayOrder: item.displayOrder,
        }))

        const result = await updateMenuItemOrder(updates)

        if (!result.success) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update menu item order",
          })
        }
      } catch (error) {
        console.error("Error updating menu item order:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred while updating the order",
        })
      }
    }
  }

  // Handle delete
  const handleDeleteMenuItem = async (id: number) => {
    try {
      const result = await deleteMenuItem(id)
      if (result.success) {
        toast({
          title: "Menu item deleted",
          description: "The menu item has been deleted successfully.",
        })
        router.refresh()
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to delete menu item",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      })
    }
  }

  const handleDeleteItemOption = async (id: number) => {
    try {
      const result = await deleteItemOption(id)
      if (result.success) {
        toast({
          title: "Item option deleted",
          description: "The item option has been deleted successfully.",
        })
        router.refresh()
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to delete item option",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      })
    }
  }

  // Get categories for this restaurant
  const categories = restaurant.categories || []

  // Get menu items for active category
  const categoryMenuItems = activeCategoryId
    ? menuItems
        .filter((item) => item.categoryId === activeCategoryId)
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
    : []

  // Get item options for active menu item
  const menuItemOptions = activeMenuItemId
    ? itemOptions.filter((option) => option.menuItemId === activeMenuItemId).sort((a, b) => (a.id || 0) - (b.id || 0))
    : []

  // Sortable item component
  function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    }

    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        {children}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{restaurant.name} - Menu</h2>
        <Button onClick={handleAddMenuItem}>
          <Plus className="mr-2 h-4 w-4" />
          Add Menu Item
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Categories */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={`p-4 cursor-pointer hover:bg-accent ${
                    activeCategoryId === category.id ? "bg-accent" : ""
                  }`}
                  onClick={() => setActiveCategoryId(category.id)}
                >
                  <div className="font-medium">{category.name}</div>
                  <div className="text-sm text-muted-foreground">{category.menuItems?.length || 0} items</div>
                </div>
              ))}
              {categories.length === 0 && (
                <div className="p-4 text-center text-muted-foreground">No categories found</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <Card className="md:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Menu Items</CardTitle>
            {activeCategoryId && (
              <Button size="sm" onClick={handleAddMenuItem}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={categoryMenuItems.map((item) => `item-${item.id}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="divide-y">
                  {categoryMenuItems.map((item) => (
                    <SortableItem key={item.id} id={`item-${item.id}`}>
                      <div
                        className={`p-4 cursor-pointer hover:bg-accent ${
                          activeMenuItemId === item.id ? "bg-accent" : ""
                        }`}
                        onClick={() => setActiveMenuItemId(item.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <DragHandleDots2Icon className="h-5 w-5 text-muted-foreground cursor-grab" />
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {item.formattedPrice || `$${Number(item.price).toFixed(2)}`} •
                                {item.isAvailable ? " Available" : " Unavailable"}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditMenuItem(item)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteMenuItem(item.id)
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </SortableItem>
                  ))}
                  {categoryMenuItems.length === 0 && activeCategoryId && (
                    <div className="p-4 text-center text-muted-foreground">No menu items in this category</div>
                  )}
                  {!activeCategoryId && (
                    <div className="p-4 text-center text-muted-foreground">Select a category to view menu items</div>
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </CardContent>
        </Card>

        {/* Item Options */}
        <Card className="md:col-span-5">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Item Options</CardTitle>
            {activeMenuItemId && (
              <Button
                size="sm"
                onClick={() => {
                  const menuItem = menuItems.find((item) => item.id === activeMenuItemId)
                  if (menuItem) {
                    handleAddItemOption(menuItem)
                  }
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Option
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {menuItemOptions.map((option) => (
                <div key={option.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{option.name}</div>
                      <div className="text-sm text-muted-foreground">{option.isRequired ? "Required" : "Optional"}</div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEditItemOption(option)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteItemOption(option.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  {/* Option Choices */}
                  <div className="mt-2 space-y-1">
                    {option.optionChoices?.map((choice) => (
                      <div key={choice.id} className="text-sm pl-4 border-l-2 border-muted">
                        <span className="font-medium">{choice.name}</span>
                        {choice.priceAdjustment > 0 && (
                          <span className="text-muted-foreground">
                            {" "}
                            ({choice.formattedPriceAdjustment || `+$${Number(choice.priceAdjustment).toFixed(2)}`})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {menuItemOptions.length === 0 && activeMenuItemId && (
                <div className="p-4 text-center text-muted-foreground">No options for this menu item</div>
              )}
              {!activeMenuItemId && (
                <div className="p-4 text-center text-muted-foreground">Select a menu item to view options</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <MenuItemEditModal
        menuItem={selectedMenuItem}
        categories={categories}
        restaurants={[restaurant]}
        open={menuItemModalOpen}
        onOpenChange={handleMenuItemModalClose}
        mode={modalMode}
      />

      <ItemOptionEditModal
        itemOption={selectedItemOption}
        menuItems={menuItems}
        open={itemOptionModalOpen}
        onOpenChange={handleItemOptionModalClose}
        mode={modalMode}
      />
    </div>
  )
}

