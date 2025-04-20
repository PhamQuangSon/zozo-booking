import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable().optional(),
  restaurantId: z.number().int().positive("Restaurant is required"),
  displayOrder: z
    .number()
    .int()
    .nonnegative("Display order must be a positive number"),
  imageUrl: z.string().nullable().optional(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
