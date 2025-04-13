"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { createItemOption, updateItemOption } from "@/actions/item-option-actions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { MenuItem, Restaurant } from "@prisma/client" // Keep base types if needed elsewhere
import type { ItemOptionEditModalProps } from "@/types/menu-builder-types" // Import shared props type
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { itemOptionSchema, type ItemOptionFormValues } from "@/schemas/item-option-schema"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Trash2, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"


// Convert string/number to valid number
const toValidNumber = (value: string | number | null | undefined): number => {
  if (value === null || value === undefined || value === "") return 0
  return typeof value === "number" ? value : Number(value)
}

export function ItemOptionEditModal({
  itemOption,
  menuItems = [], // Add default empty array to prevent null/undefined errors
  open,
  onOpenChange,
  mode = "edit",
}: ItemOptionEditModalProps) { // Using imported props type
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null)
  const [filteredMenuItems, setFilteredMenuItems] = useState<(MenuItem & { restaurant: Restaurant })[]>(menuItems)

  const isCreating = mode === "create"
  const title = isCreating ? "Add Item Option" : "Edit Item Option"
  const buttonText = isCreating ? "Create" : "Save changes"

  // Extract unique restaurants from menu items
  useEffect(() => {
    if (menuItems && menuItems.length > 0) {
      // Create a map to store unique restaurants by ID
      const restaurantMap = new Map<number, Restaurant>()

      // Populate the map with restaurants from menu items
      menuItems.forEach((item) => {
        if (item.restaurant && !restaurantMap.has(item.restaurant.id)) {
          restaurantMap.set(item.restaurant.id, item.restaurant)
        }
      })

      // Convert the map values to an array
      const uniqueRestaurants = Array.from(restaurantMap.values())
      setRestaurants(uniqueRestaurants)
    } else {
      setRestaurants([])
    }
  }, [menuItems])

  const newOptionChoice = {
    name: "",
    priceAdjustment: 0,
  }

  const form = useForm<ItemOptionFormValues>({
    resolver: zodResolver(itemOptionSchema),
    defaultValues: {
      name: "",
      isRequired: false,
      menuItemId: 0,
      optionChoices: [newOptionChoice],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "optionChoices",
  })

  // Update form data when itemOption changes
  useEffect(() => {
    if (itemOption && mode === "edit") {
      form.reset({
        name: itemOption.name,
        isRequired: itemOption.isRequired,
        menuItemId: itemOption.menuItemId,
        optionChoices: Array.isArray(itemOption.optionChoices)
          ? itemOption.optionChoices.map((choice) => ({
              id: choice.id,
              name: choice.name,
              priceAdjustment: toValidNumber(choice.priceAdjustment),
            }))
          : [],
      })

      // Set selected restaurant
      const menuItem = menuItems.find((item) => item.id === itemOption.menuItemId)
      if (menuItem && menuItem.restaurant) {
        setSelectedRestaurantId(menuItem.restaurantId)
      }
    } else if (mode === "create") {
      const defaultRestaurantId = restaurants[0]?.id || null
      setSelectedRestaurantId(defaultRestaurantId)

      const defaultMenuItem = defaultRestaurantId
        ? menuItems.find((item) => item.restaurantId === defaultRestaurantId)
        : null

      form.reset({
        name: "",
        isRequired: false,
        menuItemId: defaultMenuItem?.id || 0,
        optionChoices: [newOptionChoice],
      })
    }
  }, [itemOption, mode, form, menuItems, restaurants])

  // Filter menu items based on selected restaurant
  useEffect(() => {
    if (selectedRestaurantId && menuItems.length > 0) {
      setFilteredMenuItems(menuItems.filter((item) => item.restaurantId === selectedRestaurantId))
    } else {
      setFilteredMenuItems(menuItems)
    }
  }, [selectedRestaurantId, menuItems])

  const onSubmit = async (data: ItemOptionFormValues) => {
    setIsLoading(true)
    try {
      // Validate that we have at least one option choice with a name
      if (!data.optionChoices || data.optionChoices.length === 0 || !data.optionChoices[0].name) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "At least one option choice with a name is required",
        })
        setIsLoading(false)
        return
      }

      let result

      if (isCreating) {
        result = await createItemOption({
          ...data,
          optionChoices: data.optionChoices.map((choice) => ({
            ...choice,
            priceAdjustment: parseFloat(choice.priceAdjustment.toFixed(2)) || 0,
          })),
        })
      } else if (itemOption) {
        result = await updateItemOption(itemOption.id, {
          ...data,
          optionChoices: data.optionChoices.map((choice) => ({
            ...choice,
            priceAdjustment: parseFloat(choice.priceAdjustment.toFixed(2)) || 0,
          })),
        })
      }

      if (result?.success) {
        toast({
          title: isCreating ? "Item option created" : "Item option updated",
          description: isCreating
            ? "The item option has been created successfully."
            : "The item option has been updated successfully.",
        })
        onOpenChange(true) // Close modal and refresh data
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result?.error || (isCreating ? "Failed to create item option" : "Failed to update item option"),
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle restaurant change
  const handleRestaurantChange = (restaurantId: number) => {
    setSelectedRestaurantId(restaurantId)

    // Reset menu item if it doesn't belong to the selected restaurant
    const currentMenuItemId = form.getValues("menuItemId")
    const menuItemBelongsToRestaurant = menuItems.some(
      (item) => item.id === currentMenuItemId && item.restaurantId === restaurantId,
    )

    if (!menuItemBelongsToRestaurant) {
      const firstMenuItemForRestaurant = menuItems.find((item) => item.restaurantId === restaurantId)
      form.setValue("menuItemId", firstMenuItemForRestaurant?.id || 0)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onOpenChange(false)}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Option Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Option name" disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isRequired"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-end space-x-2 space-y-0 rounded-md p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                      </FormControl>
                      <FormLabel className="cursor-pointer">Required</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormItem>
                  <FormLabel>Restaurant</FormLabel>
                  <Select
                    value={selectedRestaurantId?.toString() || ""}
                    onValueChange={(value) => handleRestaurantChange(Number.parseInt(value))}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a restaurant" />
                    </SelectTrigger>
                    <SelectContent>
                      {restaurants.length > 0 ? (
                        restaurants.map((restaurant) => (
                          <SelectItem key={restaurant.id} value={restaurant.id.toString()}>
                            {restaurant.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-restaurants">No restaurants available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </FormItem>

                <FormField
                  control={form.control}
                  name="menuItemId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Menu Item</FormLabel>
                      <Select
                        value={field.value?.toString() || ""}
                        onValueChange={(value) => field.onChange(Number.parseInt(value))}
                        disabled={isLoading || filteredMenuItems.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                filteredMenuItems.length === 0 ? "No menu items available" : "Select a menu item"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredMenuItems.length > 0 ? (
                            filteredMenuItems.map((item) => (
                              <SelectItem key={item.id} value={item.id.toString()}>
                                {item.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-menu-items">No menu items available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex justify-between items-center">
                    <span>Option Choices</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append(newOptionChoice)}
                      disabled={isLoading}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Choice
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end border-b pb-4">
                      <div className="md:col-span-7">
                        <FormField
                          control={form.control}
                          name={`optionChoices.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Choice Name</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Choice name" disabled={isLoading} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="md:col-span-4">
                        <FormField
                          control={form.control}
                          name={`optionChoices.${index}.priceAdjustment`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price Adjustment</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value
                                    field.onChange(value === "" ? 0 : Number.parseFloat(value))
                                  }}
                                  disabled={isLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="md:col-span-1 flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => fields.length > 1 && remove(index)}
                          disabled={isLoading || fields.length <= 1}
                          className="h-10 w-10"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {form.formState.errors.optionChoices?.message && (
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.optionChoices.message}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : buttonText}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

