import { z } from "zod";

export const optionChoiceSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Name is required"),
  priceAdjustment: z.number().default(0),
});

export const itemOptionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  isRequired: z.boolean().default(false),
  menuItemId: z.number().int().positive("Menu item is required"),
  optionChoices: z
    .array(optionChoiceSchema)
    .min(1, "At least one option choice is required"),
});

export type ItemOptionFormValues = z.infer<typeof itemOptionSchema>;
export type OptionChoiceFormValues = z.infer<typeof optionChoiceSchema>;
