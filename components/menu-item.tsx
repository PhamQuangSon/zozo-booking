"use client"

import { formatCurrency } from "@/lib/i18n";
import { useCurrencyStore } from "@/store/currency-store";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";

interface MenuItemProps {
  items: any[];
  showAddToCart: boolean;
  onItemClick?: (item: any) => void;
}

export function MenuItem({
  items = [],
  showAddToCart = false,
  onItemClick,
}: MenuItemProps) {
  const { currency } = useCurrencyStore();
  return (
    <>
      {items && items.map((item) => (
        <div
          key={item.id}
          onClick={() => onItemClick && onItemClick(item)}
          className="group flex glass-card overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-5px] p-4 gap-4 cursor-pointer"
        >
          {/* Image */}
          <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-full border-2 border-white shadow-md">
            <div className="absolute inset-0 bg-black/50 group-hover:bg-transparent transition-colors duration-300"></div>
            <Image
              src={item.imageUrl || "/placeholder.svg?height=100&width=100"}
              alt={item.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          {/* Content */}
          <div className="flex-1 p-4 relative">
            {/* Item Name and Price */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start w-full mb-2">
              <h3 className="font-medium group-hover:text-amber-500 transition-colors duration-300 mr-2">
                {item.name}
              </h3>
              <p className="font-bold text-xl sm:text-2xl text-amber-500 mt-1 sm:mt-0">
                {formatCurrency(Number(item.price), currency)}
              </p>
            </div>
            {/* Category */}
            <p className="text-sm text-gray-500 mb-2">{item.categoryName}</p>
            {/* Description */}
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {item.description}
            </p>
            {/* Add to Cart Button */}
            {showAddToCart && (
              <div className="mt-auto h-8 w-8 absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-2 rounded-full shadow-md hover:shadow-lg bg-primary flex items-center justify-center text-white">
                <ShoppingCart className="h-4 w-4" />
              </div>
            )}
          </div>
        </div>
      ))}
    </>
  );
}
