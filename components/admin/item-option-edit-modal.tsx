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
import type { MenuItem, MenuItemOption, OptionChoice, Restaurant } from "@prisma/client"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { itemOptionSchema, type ItemOptionFormValues } from "@/schemas/item-option-schema"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Trash2, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Extended ItemOption type with relations
type ItemOptionWithRelations = MenuItemOption & {
  menuItem: MenuItem & {
    restaurant: Restaurant
  }
  optionChoices: OptionChoice[]
}

interface ItemOptionEditModalProps {
  itemOption?: ItemOptionWithRelations | null
  menuItems: (MenuItem & { restaurant: Restaurant })[]
  open: boolean
  onOpenChange: (refresh: boolean) => void
  mode: "create" | "edit"
}

export function ItemOptionEditModal({
  itemOption,
  menuItems,
  open,
  onOpenChange,
  mode = "edit",
}: ItemOptionEditModalProps) {
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
    const uniqueRestaurants = Array.from(
      new Map(menuItems.map((item) => [item.restaurant.id, item.restaurant])).values(),
    )
    setRestaurants(uniqueRestaurants)
  }, [menuItems])

  const form = useForm<ItemOptionFormValues>({
    resolver: zodResolver(itemOptionSchema),
    defaultValues: {
      name: "",
      isRequired: false,
      menuItemId: 0,
      optionChoices: [{ name: "", priceAdjustment: 0 }],
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
        optionChoices: itemOption.optionChoices.map((choice) => ({
          id: choice.id,
          name: choice.name,
          priceAdjustment: Number(choice.priceAdjustment),
        })),
      })

      // Set selected restaurant
      const menuItem = menuItems.find((item) => item.id === itemOption.menuItemId)
      if (menuItem) {
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
        optionChoices: [{ name: "", priceAdjustment: 0 }],
      })
    }
  }, [itemOption, mode, form, menuItems, restaurants])

  // Filter menu items based on selected restaurant
  useEffect(() => {
    if (selectedRestaurantId) {
      setFilteredMenuItems(menuItems.filter((item) => item.restaurantId === selectedRestaurantId))
    } else {
      setFilteredMenuItems(menuItems)
    }
  }, [selectedRestaurantId, menuItems])

  const onSubmit = async (data: ItemOptionFormValues) => {
    setIsLoading(true)
    try {
      let result

      if (isCreating) {
        result = await createItemOption(data)
      } else if (itemOption) {
        result = await updateItemOption(itemOption.id, data)
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
                    <FormItem className="flex flex-row items-end space-x-2 space-y-0 rounded-md border p-4">
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
                      {restaurants.map((restaurant) => (
                        <SelectItem key={restaurant.id} value={restaurant.id.toString()}>
                          {restaurant.name}
                        </SelectItem>
                      ))}
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
                          {filteredMenuItems.map((item) => (
                            <SelectItem key={item.id} value={item.id.toString()}>
                              {item.name}
                            </SelectItem>
                          ))}
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
                      onClick={() => append({ name: "", priceAdjustment: 0 })}
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
                                  {...field}
                                  onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
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

