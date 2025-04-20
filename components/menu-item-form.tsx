"use client";

import { useState } from "react";
import type React from "react";

import { ImageUpload } from "@/components/image-upload";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { convertCurrency } from "@/lib/i18n";
import { useCurrencyStore } from "@/store/currency-store";

interface MenuItemFormProps {
  restaurantId: string;
  menus: Array<{ id: number; name: string; menu_categories: any[] }>;
  initialData?: any;
  onSuccess: () => void;
}

export function MenuItemForm({
  restaurantId,
  menus,
  initialData,
  onSuccess,
}: MenuItemFormProps) {
  const { toast } = useToast();
  const { currency } = useCurrencyStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price?.toString() || "",
    image_url: initialData?.image_url || "",
    menuId: initialData?.menuId?.toString() || "",
    categoryId: initialData?.categoryId?.toString() || "",
    is_available: initialData?.is_available ?? true,
  });

  const [selectedCategories, setSelectedCategories] = useState<any[]>([]);

  // Update available categories when menu changes
  const handleMenuChange = (menuId: string) => {
    const menu = menus.find((m) => m.id.toString() === menuId);
    setSelectedCategories(menu?.menu_categories || []);
    setFormData((prev) => ({
      ...prev,
      menuId,
      categoryId: "", // Reset category when menu changes
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (value: string) => {
    setFormData((prev) => ({ ...prev, image_url: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Convert price to USD for storage if not already in USD
      const priceInUSD =
        currency === "USD"
          ? Number.parseFloat(formData.price)
          : convertCurrency(Number.parseFloat(formData.price), currency, "USD");

      // In a real app, you would call your API here
      console.log({
        name: formData.name,
        description: formData.description,
        price: priceInUSD,
        image_url: formData.image_url,
        category_id: Number.parseInt(formData.categoryId),
        is_available: formData.is_available,
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Success",
        description: initialData
          ? "Menu item updated successfully"
          : "Menu item created successfully",
      });

      onSuccess();
    } catch (error) {
      console.error("Error saving menu item:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="menuId">Menu *</Label>
            <Select
              value={formData.menuId}
              onValueChange={handleMenuChange}
              required
            >
              <SelectTrigger id="menuId">
                <SelectValue placeholder="Select menu" />
              </SelectTrigger>
              <SelectContent>
                {menus.map((menu) => (
                  <SelectItem key={menu.id} value={menu.id.toString()}>
                    {menu.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">Category *</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, categoryId: value }))
              }
              disabled={!formData.menuId || selectedCategories.length === 0}
              required
            >
              <SelectTrigger id="categoryId">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {selectedCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Item Name *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <ImageUpload
          value={formData.image_url}
          onChange={handleImageChange}
          label="Item Image"
        />

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price ({currency}) *</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : initialData
              ? "Update Item"
              : "Create Item"}
        </Button>
      </DialogFooter>
    </form>
  );
}
