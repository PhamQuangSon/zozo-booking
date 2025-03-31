import { z } from "zod"

export const menuItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable().optional(),
  price: z.number().min(0, "Price must be a positive number"),
  categoryId: z.number().int().positive("Category is required"),
  restaurantId: z.number().int().positive("Restaurant is required"),
  isAvailable: z.boolean().default(true),
  displayOrder: z.number().int().nonnegative("Display order must be a positive number"),
  imageUrl: z.string().nullable().optional(),
})

export type MenuItemFormValues = z.infer<typeof menuItemSchema>

