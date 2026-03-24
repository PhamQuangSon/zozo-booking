"use client";

import { ShoppingCart } from "lucide-react";
import Image from "next/image";

import { formatCurrency } from "@/lib/i18n";
import { useCurrencyStore } from "@/store/currency-store";

type MenuItemData = {
  id: number | string;
  name: string;
  price: any;
  imageUrl?: string | null;
  categoryName?: string | null;
  description?: string | null;
};

interface MenuItemProps {
  items: MenuItemData[];
  showAddToCart: boolean;
  onItemClick?: (item: MenuItemData) => void;
}

export function MenuItem({ items = [], showAddToCart = false, onItemClick }: MenuItemProps) {
  const { currency } = useCurrencyStore();

  return (
    <>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onItemClick?.(item)}
          className="group flex w-full cursor-pointer gap-4 overflow-hidden p-4 text-left transition-all duration-300 hover:translate-y-[-5px] hover:shadow-md glass-card shadow-sm"
        >
          <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-full border-2 border-white shadow-md">
            <div className="absolute inset-0 bg-black/50 transition-colors duration-300 group-hover:bg-transparent" />
            <Image
              src={item.imageUrl || "/placeholder.svg?height=100&width=100"}
              alt={item.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div className="relative flex-1 p-4">
            <div className="mb-2 flex w-full flex-col sm:flex-row sm:items-start sm:justify-between">
              <h3 className="mr-2 font-medium transition-colors duration-300 group-hover:text-amber-500">
                {item.name}
              </h3>
              <p className="mt-1 text-xl font-bold text-amber-500 sm:mt-0 sm:text-2xl">
                {formatCurrency(Number(item.price), currency)}
              </p>
            </div>

            <p className="mb-2 text-sm text-gray-500">{item.categoryName}</p>
            <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>

            {showAddToCart && (
              <div className="absolute bottom-4 right-4 mt-auto flex h-8 w-8 items-center justify-center rounded-full bg-primary px-2 text-primary-foreground opacity-0 shadow-md transition-opacity duration-300 group-hover:opacity-100 hover:shadow-lg">
                <ShoppingCart className="h-4 w-4" />
              </div>
            )}
          </div>
        </button>
      ))}
    </>
  );
}
