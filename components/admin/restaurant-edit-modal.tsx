"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { createMenuItem, updateMenuItem } from "@/actions/menu-item-actions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { Category, MenuItem, Restaurant } from "@prisma/client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { menuItemSchema, type MenuItemFormValues } from "@/schemas/menu-item-schema"
import { ImageUpload } from "@/components/ui/image-upload"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RestaurantForm } from "@/components/restaurant-form"

// Extended MenuItem type with category and restaurant relations
type MenuItemWithRelations = MenuItem & {
  category: Category
  restaurant: Restaurant
}

interface RestaurantEditModalProps {
  restaurants: Restaurant[]
  open: boolean
  onOpenChange: (refresh: boolean) => void
  mode: "create" | "edit"
}

export function RestaurantEditModal({
  // menuItem,
  // categories,
  restaurants = [], // Add default empty array to prevent null/undefined errors
  open,
  onOpenChange,
  mode = "edit",
}: RestaurantEditModalProps) {
  const isCreating = mode === "create"
  const title = isCreating ? "Add Restaurant" : "Edit Restaurant"
  const description = isCreating ? "Fill in the details to create a new restaurant" : "Update restaurant details below"

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onOpenChange(false)}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <RestaurantForm
          initialData={restaurants}
          onOpenChange={() => {
             onOpenChange(true)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

