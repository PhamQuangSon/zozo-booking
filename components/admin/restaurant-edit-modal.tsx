"use client";

import type { Restaurant } from "@/actions/restaurant-actions";
import { RestaurantForm } from "@/components/restaurant-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RestaurantEditModalProps {
  restaurants: Restaurant | null;
  open: boolean;
  onOpenChange: (refresh: boolean) => void;
  mode: "create" | "edit";
}

export function RestaurantEditModal({
  // menuItem,
  // categories,
  restaurants = null, // Add default empty array to prevent null/undefined errors
  open,
  onOpenChange,
  mode = "edit",
}: RestaurantEditModalProps) {
  const isCreating = mode === "create";
  const title = isCreating ? "Add Restaurant" : "Edit Restaurant";
  const description = isCreating
    ? "Fill in the details to create a new restaurant"
    : "Update restaurant details below";

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
            onOpenChange(true);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
