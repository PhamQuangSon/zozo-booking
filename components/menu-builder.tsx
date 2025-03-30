"use client"

import { useState } from "react"
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, GripVertical, Trash2, ChevronDown, ChevronRight } from "lucide-react"
import { MenuForm, CategoryForm, MenuItemForm, MenuItemOptionForm } from "@/components/menu-forms"
import { 
  updateMenuOrder, 
  updateCategoryOrder, 
  updateMenuItemOrder 
} from "@/actions/menu-actions"

interface MenuBuilderProps {
  restaurant: any
  onUpdate: () => void
  onDelete: (type: string, id: number) => void
}

export function MenuBuilder({ restaurant, onUpdate, onDelete }: MenuBuilderProps) {
  const [expandedMenus, setExpandedMenus] = useState<{ [key: number]: boolean }>({})
  const [expandedCategories, setExpandedCategories] = useState<{ [key: number]: boolean }>({})
  const [selectedMenuId, setSelectedMenuId] = useState<number | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)

  const toggleMenu = (menuId: number) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }))
  }

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
  }

  const reorder = (list: any[], startIndex: number, endIndex: number) => {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)
    return result
  }

  const handleDragEnd = async (result: any) => {
    const { destination, source, draggableId, type } = result

    if (!destination) return

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    try {
      let sourceList: any[] = []
      let items: any[] = []

      switch (type) {
        case 'menu':
          items = [...(restaurant.menus || [])]
          items = reorder(items, source.index, destination.index)
          // Update all affected items' display order
          await Promise.all(
            items.map((item, index) => updateMenuOrder(item.id, index))
          )
          break

        case 'category':
          const sourceMenuId = parseInt(source.droppableId.split('-')[1])
          const destMenuId = parseInt(destination.droppableId.split('-')[1])
          
          if (sourceMenuId === destMenuId) {
            // Reordering within the same menu
            const menu = restaurant.menus.find((m: any) => m.id === sourceMenuId)
            items = [...(menu.menu_categories || [])]
            items = reorder(items, source.index, destination.index)
            await Promise.all(
              items.map((item, index) => updateCategoryOrder(item.id, index))
            )
          }
          break

        case 'item':
          const sourceCategoryId = parseInt(source.droppableId.split('-')[1])
          const destCategoryId = parseInt(destination.droppableId.split('-')[1])
          
          if (sourceCategoryId === destCategoryId) {
            // Reordering within the same category
            const category = restaurant.menus
              .flatMap((m: any) => m.menu_categories)
              .find((c: any) => c.id === sourceCategoryId)
            items = [...(category.menu_items || [])]
            items = reorder(items, source.index, destination.index)
            await Promise.all(
              items.map((item, index) => updateMenuItemOrder(item.id, index))
            )
          }
          break
      }

      onUpdate()
    } catch (error) {
      console.error('Error updating order:', error)
    }
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Menu Structure</CardTitle>
          <MenuForm
            restaurantId={restaurant.id}
            onSuccess={onUpdate}
          />
        </CardHeader>
        <CardContent>
          <Droppable droppableId="menus" type="menu">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {restaurant.menus?.map((menu: any, index: number) => (
                  <Draggable
                    key={menu.id}
                    draggableId={`menu-${menu.id}`}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`rounded-lg border bg-card transition-colors ${
                          selectedMenuId === menu.id ? "border-primary" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-4">
                            <div {...provided.dragHandleProps}>
                              <GripVertical className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleMenu(menu.id)}
                              className="p-0"
                            >
                              {expandedMenus[menu.id] ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                            <div>
                              <h3 className="font-medium">{menu.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {menu.is_active ? "Active" : "Inactive"} • {menu.menu_categories?.length || 0} categories
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <CategoryForm
                              menuId={menu.id}
                              onSuccess={onUpdate}
                            />
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => onDelete("menu", menu.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Categories */}
                        {expandedMenus[menu.id] && (
                          <Droppable droppableId={`menu-${menu.id}-categories`} type="category">
                            {(provided) => (
                              <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="border-t divide-y"
                              >
                                {menu.menu_categories?.map((category: any, index: number) => (
                                  <Draggable
                                    key={category.id}
                                    draggableId={`category-${category.id}`}
                                    index={index}
                                  >
                                    {(provided) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className={`bg-accent/50 ${
                                          selectedCategoryId === category.id ? "bg-accent" : ""
                                        }`}
                                      >
                                        <div className="flex items-center justify-between p-4">
                                          <div className="flex items-center gap-4">
                                            <div {...provided.dragHandleProps}>
                                              <GripVertical className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => toggleCategory(category.id)}
                                              className="p-0"
                                            >
                                              {expandedCategories[category.id] ? (
                                                <ChevronDown className="h-4 w-4" />
                                              ) : (
                                                <ChevronRight className="h-4 w-4" />
                                              )}
                                            </Button>
                                            <div>
                                              <h4 className="font-medium">{category.name}</h4>
                                              <p className="text-sm text-muted-foreground">
                                                {category.menu_items?.length || 0} items
                                              </p>
                                            </div>
                                          </div>
                                          <div className="flex gap-2">
                                            <MenuItemForm
                                              categoryId={category.id}
                                              onSuccess={onUpdate}
                                            />
                                            <Button
                                              size="sm"
                                              variant="destructive"
                                              onClick={() => onDelete("category", category.id)}
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </div>

                                        {/* Menu Items */}
                                        {expandedCategories[category.id] && (
                                          <Droppable droppableId={`category-${category.id}-items`} type="item">
                                            {(provided) => (
                                              <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className="divide-y bg-background"
                                              >
                                                {category.menu_items?.map((item: any, index: number) => (
                                                  <Draggable
                                                    key={item.id}
                                                    draggableId={`item-${item.id}`}
                                                    index={index}
                                                  >
                                                    {(provided) => (
                                                      <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        className="flex items-center gap-4 p-4"
                                                      >
                                                        <div {...provided.dragHandleProps}>
                                                          <GripVertical className="h-5 w-5 text-muted-foreground" />
                                                        </div>
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
                                                          <MenuItemOptionForm
                                                            menuItemId={item.id}
                                                            onSuccess={onUpdate}
                                                          />
                                                          <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => onDelete("item", item.id)}
                                                          >
                                                            <Trash2 className="h-4 w-4" />
                                                          </Button>
                                                        </div>
                                                      </div>
                                                    )}
                                                  </Draggable>
                                                ))}
                                                {provided.placeholder}
                                              </div>
                                            )}
                                          </Droppable>
                                        )}
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </CardContent>
      </Card>
    </DragDropContext>
  )
}