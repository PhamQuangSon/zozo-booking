"use client"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, GripVertical, ChevronDown, ChevronRight } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { MenuItemEditModal } from "@/components/admin/menu-item-edit-modal"
import { ItemOptionEditModal } from "@/components/admin/item-option-edit-modal"
import { deleteMenuItem, updateMenuItemOrder } from "@/actions/menu-item-actions"
import { deleteItemOption } from "@/actions/item-option-actions"
import { useRouter } from "next/navigation"
import type { Restaurant, MenuItem, MenuItemOption, Category, OptionChoice } from "@prisma/client"
import Image from "next/image"
import type {
  RestaurantWithCategories, // Renamed from RestaurantWithRelations
  MenuItemWithRelations,
  ItemOptionWithRelations,
  RestaurantMenuClientProps, // Import props type
} from "@/types/menu-builder-types"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type UniqueIdentifier,
  type DragStartEvent,
  type DragEndEvent,
	defaultDropAnimationSideEffects,
	DropAnimation,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { CSS } from "@dnd-kit/utilities"
import { updateCategoryOrder } from "@/actions/order-actions"
import { updateCategoryDisplayOrder } from "@/actions/category-actions"

// Helper function to generate unique IDs for drag items
const generateItemId = (type: string, id: number) => `${type}-${id}`

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
  const [categories, setCategories] = useState<Category[]>([])

  // State for modals
  const [menuItemModalOpen, setMenuItemModalOpen] = useState(false)
  const [itemOptionModalOpen, setItemOptionModalOpen] = useState(false)
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItemWithRelations | null>(null)
  const [selectedItemOption, setSelectedItemOption] = useState<ItemOptionWithRelations | null>(null)
  const [modalMode, setModalMode] = useState<"create" | "edit">("create")

  // State for expanded categories and items
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({})
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [selectedMenuItemId, setSelectedMenuItemId] = useState<number | null>(null)

  // Drag and drop state
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const [activeItem, setActiveItem] = useState<any | null>(null)

	const dropAnimation: DropAnimation = {
		sideEffects: defaultDropAnimationSideEffects({
			styles: {
				active: {
					opacity: '0.5',
				},
			},
		}),
	};
	
  // Filter menu items and options for this restaurant
  useEffect(() => {
    try {
      // Set categories
      const restaurantCategories = restaurant.categories || []
      setCategories(restaurantCategories)

      // Initialize expanded state for all categories
      const initialExpandedState: Record<number, boolean> = {}
      restaurantCategories.forEach((category) => {
        initialExpandedState[category.id] = true
      })
      setExpandedCategories(initialExpandedState)

      // Filter menu items for this restaurant
      const filteredMenuItems = Array.isArray(allMenuItems)
        ? allMenuItems.filter((item) => item && item.restaurantId === Number(restaurantId))
        : []
      setMenuItems(filteredMenuItems)

      // Filter item options for the filtered menu items
      const filteredItemOptions = Array.isArray(allItemOptions)
        ? allItemOptions.filter(
            (option) => option && filteredMenuItems.some((item) => item && item.id === option.menuItemId),
          )
        : []
      setItemOptions(filteredItemOptions)

      // Set first category as selected if there are categories
      if (restaurantCategories.length > 0) {
        setSelectedCategoryId(restaurantCategories[0].id)
      }
    } catch (error) {
      console.error("Error processing menu data:", error)
    }
  }, [restaurant, allMenuItems, allItemOptions, restaurantId])

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Toggle category expansion
  const toggleCategoryExpansion = (categoryId: number) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }))
  }

  // Handle menu item modal
  const handleAddMenuItem = (categoryId: number) => {
    setSelectedCategoryId(categoryId)
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
    setSelectedMenuItemId(menuItem.id)
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

  // Drag and drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id)

    // Find the item being dragged
    if (typeof active.id === "string") {
      const [type, idStr] = active.id.toString().split("-")
      const id = Number.parseInt(idStr)

      if (type === "item") {
        const item = menuItems.find((item) => item.id === id)
        setActiveItem({ type, item })
      } else if (type === "category") {
				const category = categories.find((category) => category.id === id)
				setActiveItem({ type, item: category })
			}
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
		console.log(active, over)
		
    if (!over) {
      setActiveId(null)
      setActiveItem(null)
      return
    }

		// Handle category reordering
		if (active.id.toString().startsWith("category-") && over.id.toString().startsWith("category-")) {
			const activeId = Number.parseInt(active.id.toString().split("-")[1])
			const overId = Number.parseInt(over.id.toString().split("-")[1])

			if (activeId !== overId) {
				try {
          const result = await updateCategoryDisplayOrder(activeId, overId)

          if (result.success) {
            toast({
              title: "Order updated",
              description: "Category order has been updated successfully.",
            })
            router.refresh()
          } else {
            toast({
              variant: "destructive",
              title: "Error",
              description: result.error || "Failed to update category order",
            })
          }
				} catch (error) {
					console.error("Error updating order:", error)
					toast({
						variant: "destructive",
						title: "Error",
						description: "Failed to update category order",
					})
				}
			}
		}

    // Handle menu item reordering
    if (active.id.toString().startsWith("item-") && over.id.toString().startsWith("item-")) {
      const activeId = Number.parseInt(active.id.toString().split("-")[1])
      const overId = Number.parseInt(over.id.toString().split("-")[1])

      if (activeId !== overId) {
        try {
          const result = await updateMenuItemOrder(activeId, overId)

          if (result.success) {
            toast({
              title: "Order updated",
              description: "Menu item order has been updated successfully.",
            })
            router.refresh()
          } else {
            toast({
              variant: "destructive",
              title: "Error",
              description: result.error || "Failed to update menu item order",
            })
          }
        } catch (error) {
          console.error("Error updating order:", error)
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update item order",
          })
        }
      }
    }

    setActiveId(null)
    setActiveItem(null)
  }

  // Sortable item components
  const SortableCategory = ({ category }: { category: Category }) => {
		const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: generateItemId("category", category.id),
    })

		const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    }

    const isExpanded = expandedCategories[category.id] || false
    const categoryItems = menuItems.filter((item) => item.categoryId === category.id)

    return (
      <div className="border-b last:border-b-0">
        <div ref={setNodeRef} style={style}  className="flex items-center justify-between p-4 hover:bg-gray-50">
          <div className="flex items-center gap-2">
						<div {...attributes} {...listeners} className="cursor-grab">
              <GripVertical className="h-5 w-5 text-gray-400" />
            </div>
            <button onClick={() => toggleCategoryExpansion(category.id)} className="flex items-center gap-2">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
              <span className="font-medium">{category.name}</span>
            </button>
            <span className="text-sm text-gray-500">• {categoryItems.length} items</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => handleAddMenuItem(category.id)}>
              Add Item
            </Button>
            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isExpanded && (
            <SortableContext
              items={categoryItems.map((category) => generateItemId("category", category.id))}
              strategy={verticalListSortingStrategy} 
            >
              <div className="pl-8">
                {categoryItems.map((item) => (
                  <SortableMenuItem key={item.id} item={item} />
                ))}
              </div>
            </SortableContext>
        )}
      </div>
    )
  }

  const SortableMenuItem = ({ item }: { item: MenuItemWithRelations }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: generateItemId("item", item.id),
    })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    }

    const itemOptions = allItemOptions.filter((option) => option.menuItemId === item.id)
    const isExpanded = selectedMenuItemId === item.id

    return (
      <div className="border-b last:border-b-0">
        <div ref={setNodeRef} style={style} className="flex items-center justify-between p-4 hover:bg-gray-50">
          <div className="flex items-center gap-3">
            <div {...attributes} {...listeners} className="cursor-grab">
              <GripVertical className="h-5 w-5 text-gray-400" />
            </div>
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setSelectedMenuItemId(isExpanded ? null : item.id)}
            >
              {item.imageUrl ? (
                <div className="relative h-10 w-10 rounded-md overflow-hidden">
                  <Image src={item.imageUrl || "/placeholder.svg"} alt={item.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 100vw" />
                </div>
              ) : (
                <div className="h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center">
                  <span className="text-xs text-gray-500">No img</span>
                </div>
              )}
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-gray-500">
                  ${Number(item.price).toFixed(2)} • {item.isAvailable ? "Available" : "Unavailable"}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => handleAddItemOption(item)}>
              Add Option
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleEditMenuItem(item)}>
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => handleDeleteMenuItem(item.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isExpanded && (
						<div className="pl-12 bg-gray-50">
						{itemOptions.map((option) => (
							<SortableItemOption key={option.id} option={option} />
						))}
						{itemOptions.length === 0 && (
							<div className="p-4 text-center text-gray-500 text-sm">No options for this item</div>
						)}
					</div>
        )}
      </div>
    )
  }

  const SortableItemOption = ({ option }: { option: ItemOptionWithRelations }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: generateItemId("option", option.id),
    })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    }

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-gray-100"
      >
        <div className="flex items-center gap-3">
          <div {...attributes} {...listeners} className="cursor-grab">
            <GripVertical className="h-5 w-5 text-gray-400" />
          </div>
          <div>
            <div className="font-medium">{option.name}</div>
            <div className="text-sm text-gray-500">{option.isRequired ? "Required" : "Optional"}</div>

            {/* Option Choices */}
            {Array.isArray(option.optionChoices) && option.optionChoices.length > 0 && (
              <div className="mt-2 space-y-1">
                {option.optionChoices.map((choice) => (
                  <div key={choice.id} className="text-sm pl-4 border-l-2 border-gray-200">
                    <span className="font-medium">{choice.name}</span>
                    {Number(choice.priceAdjustment) > 0 && (
                      <span className="text-gray-500"> (+${Number(choice.priceAdjustment).toFixed(2)})</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleEditItemOption(option)}>
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => handleDeleteItemOption(option.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

	// Drag Preview Components (Ensure types match imported ones)
	const CategoryDragPreview = ({ category }: { category: Category }) => (
		<div className="p-4 bg-white border rounded-md shadow-lg">
			<div className="font-medium">{category.name}</div>
		</div>
	)
	
	const MenuItemDragPreview = ({ item }: { item: MenuItemWithRelations }) => (
	<div className="p-4 bg-white border rounded-md shadow-lg">
		<div className="flex items-center gap-3">
			{item.imageUrl && (
				<div className="relative h-10 w-10 rounded-md overflow-hidden">
					<Image
						src={item.imageUrl || "/placeholder.svg"}
						alt={item.name}
						fill
						className="object-cover"
					/>
				</div>
			)}
			<div>
				<div className="font-medium">{item.name}</div>
				<div className="text-sm text-gray-500">${Number(item.price).toFixed(2)}</div>
			</div>
		</div>
	</div>
	)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Menu Management</h1>
        <p className="text-gray-500">Drag and drop to organize your menu structure</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 flex items-center justify-between border-b">
            <h2 className="text-lg font-semibold">Menu Structure</h2>
            <Button>Add Menu</Button>
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            modifiers={[restrictToVerticalAxis]}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
						<div>
							{categories.map((category) => (
								<SortableCategory key={category.id} category={category} />
							))}
							{categories.length === 0 && (
								<div className="p-8 text-center text-gray-500">No categories found. Add a category to get started.</div>
							)}
						</div>
            <DragOverlay dropAnimation={dropAnimation}>
              {activeId && activeItem?.type === "item" && activeItem.item && <MenuItemDragPreview item={activeItem.item} />}
              {activeId && activeItem?.type === "category" && activeItem.item && <CategoryDragPreview category={activeItem.item} />}
            </DragOverlay>						
					</DndContext>
        </CardContent>
      </Card>

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

export default RestaurantMenuClient

