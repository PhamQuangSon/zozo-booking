"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowRight, ChevronLeft, ShoppingCart, Users } from "lucide-react";

import Loading from "@/app/loading";
import { CustomerInfoForm } from "@/components/customer-info-form";
import { MenuCategory } from "@/components/menu-category";
import { MenuItemDetail } from "@/components/menu-item-detail";
import { OrderCart } from "@/components/order-cart";
import { ScrollingBanner } from "@/components/scrolling-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { useTableFullData } from "@/hooks/use-restaurant-data";
import { useRealTimeCart } from "@/hooks/use-real-time-cart";
import { useToast } from "@/hooks/use-toast";
import { useCartStore } from "@/store/cartStore";
import type { MenuItemWithRelations } from "@/types/menu-builder-types";

export default function TableOrderPage() {
  const params = useParams();
  const { data: session } = useSession();
  const { toast } = useToast();

  const restaurantId = params.restaurantId as string;
  const tableId = params.tableId as string;

  const [customerInfoSubmitted, setCustomerInfoSubmitted] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedMenuItem, setSelectedMenuItem] =
    useState<MenuItemWithRelations | null>(null);
  const [showItemDetail, setShowItemDetail] = useState(false);

  const {
    syncServerOrders,
    addToCart,
    setCollaborativeMode,
    collaborativeMode,
  } = useCartStore();

  // Use our real-time cart hook
  const { isConnected, otherUserCarts } = useRealTimeCart(
    restaurantId,
    tableId
  );

  // Fetch table data using TanStack Query
  const {
    data: tableData,
    isLoading,
    error,
  } = useTableFullData(restaurantId, tableId);

  // Extract data once it's loaded
  const restaurant = tableData?.restaurant;
  const table = tableData?.table;
  const orders = tableData?.orders;

  // Prepare all menu items for display
  const allItems = React.useMemo(() => {
    if (!restaurant?.categories) return [];

    const items: any[] = [];
    restaurant.categories.forEach((category) => {
      if (category.items && Array.isArray(category.items)) {
        category.items.forEach((item) => {
          items.push({
            ...item,
            categoryName: category.name,
            categoryId: category.id,
          });
        });
      }
    });

    return items;
  }, [restaurant]);

  // Sync server orders with cart state
  useEffect(() => {
    if (orders && Array.isArray(orders) && restaurantId && tableId) {
      syncServerOrders(restaurantId, tableId, orders);
    }
  }, [orders, restaurantId, tableId, syncServerOrders]);

  // Check if customer info is needed
  useEffect(() => {
    // If user is logged in, we don't need customer info
    if (session?.user) {
      setCustomerInfoSubmitted(true);
      return;
    }

    // Check if customer info is already in localStorage
    const savedName = localStorage.getItem("customerName");
    const savedEmail = localStorage.getItem("customerEmail");

    if (savedName && savedEmail) {
      setCustomerInfoSubmitted(true);
    } else {
      setShowCustomerForm(true);
    }
  }, [session]);

  // Sync other users' carts when they update
  useEffect(() => {
    if (collaborativeMode) {
      Object.entries(otherUserCarts).forEach(([userId, userData]) => {
        // Only process if we have cart data
        if (userData.cart && Array.isArray(userData.cart)) {
          useCartStore.getState().mergeExternalCart(userId, userData.cart);
        }
      });
    }
  }, [otherUserCarts, collaborativeMode]);

  const handleCustomerInfoSubmit = () => {
    setCustomerInfoSubmitted(true);
    setShowCustomerForm(false);
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  // Filter items by category
  const filteredItems =
    activeCategory === "all"
      ? allItems
      : allItems.filter(
          (item) =>
            item.categoryName?.toLowerCase() === activeCategory.toLowerCase()
        );

  // Handle menu item selection
  const handleMenuItemClick = (item: any) => {
    setSelectedMenuItem(item);
    setShowItemDetail(true);
  };

  // Handle adding item to cart
  const handleAddToCart = (
    item: any,
    options: any,
    quantity: number,
    specialInstructions: string
  ) => {
    addToCart({
      id: item.id.toString(),
      name: item.name,
      price: item.price,
      quantity: quantity,
      imageUrl: item.imageUrl,
      restaurantId: restaurantId,
      tableId: tableId,
      categoryName: item.categoryName,
      specialInstructions: specialInstructions,
      selectedOptions: options,
      userId: session?.user?.id,
      userName:
        session?.user?.name ||
        localStorage.getItem("customerName") ||
        "Anonymous",
    });

    setShowItemDetail(false);
    toast({
      title: "Added to cart",
      description: `${quantity}x ${item.name} added to your order`,
    });
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error || !tableData) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen bg-gradient-to-b from-white to-gray-50">
        <Card className="glass-card border-none shadow-lg">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Table not found or unavailable
            </p>
            <div className="flex justify-center mt-4">
              <Button
                asChild
                className="glass-button rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link href="/">
                  Browse Restaurants
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header Section */}
      <div className="bg-gradient-to-b from-amber-50 to-white py-6">
        <div className="container mx-auto px-4">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href={`/restaurants/${restaurantId}`}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Restaurant
            </Link>
          </Button>

          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-white shadow-lg">
              <Image
                src={
                  restaurant?.imageUrl ||
                  "/placeholder.svg?height=400&width=400" ||
                  "/placeholder.svg"
                }
                alt={restaurant?.name ?? "Restaurant Image"}
                fill
                className="object-cover animate animate-jump-in animate-duration-1000 animate-delay-300"
              />
            </div>

            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold animate animate-fade-up">
                {restaurant?.name}
              </h1>
              <p className="mt-2 text-muted-foreground max-w-md">
                {restaurant?.description}
              </p>
              <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-800 animate animate-fade-right">
                <span className="font-medium">Table {table?.number}</span>
              </div>

              {/* Collaborative mode toggle */}
              <div className="mt-4 flex items-center gap-2">
                <Switch
                  checked={collaborativeMode}
                  onCheckedChange={setCollaborativeMode}
                  id="collaborative-mode"
                />
                <label
                  htmlFor="collaborative-mode"
                  className="text-sm flex items-center gap-1"
                >
                  <Users className="h-4 w-4" />
                  Collaborative Mode{" "}
                  {isConnected ? "(Connected)" : "(Connecting...)"}
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCustomerForm && !customerInfoSubmitted ? (
        <div className="container mx-auto my-6 bg-white p-4 md:p-8 rounded-t-3xl shadow-lg w-96 h-[400px]">
          <CustomerInfoForm onSubmit={handleCustomerInfoSubmit} />
        </div>
      ) : (
        <div className="bg-gray-50 flex-grow py-8">
          {/* Food Menu Section */}
          <div className="container mx-auto bg-white p-4 md:p-8 glass-card border-none shadow-lg">
            <div className="flex justify-center items-center gap-2 mb-2">
              <span className="text-amber-500">🍔 FOOD MENU 🍕</span>
            </div>
            <h2 className="text-3xl font-bold mb-6 text-center animate animate-fade-up">
              {restaurant?.name} Menu
            </h2>

            <MenuCategory
              items={filteredItems}
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
              categories={restaurant?.categories || []}
              onItemClick={handleMenuItemClick}
            />
          </div>
        </div>
      )}

      {/* Menu Item Detail Dialog */}
      <Dialog open={showItemDetail} onOpenChange={setShowItemDetail}>
        <DialogContent className="w-full max-w-[90vw] max-h-[80vh] overflow-auto sm:max-w-md glass-card border-0 p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>{selectedMenuItem?.name}</DialogTitle>
          </DialogHeader>
          {selectedMenuItem && (
            <MenuItemDetail
              item={selectedMenuItem}
              onAddToCart={(options, quantity, specialInstructions) =>
                handleAddToCart(
                  selectedMenuItem,
                  options,
                  quantity,
                  specialInstructions
                )
              }
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Scrolling Text Banner */}
      <ScrollingBanner text="CHICKEN PIZZA   GRILLED CHICKEN   BURGER   CHICKEN PASTA" />

      {/* View Order Sheet */}
      <div className="fixed bottom-6 right-6 z-50 overflow-auto">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="lg" className="rounded-full shadow-lg">
              <ShoppingCart className="h-5 w-5 mr-2" />
              View Order
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full max-w-[90vw] max-h-[80vh] overflow-auto sm:max-w-md glass-card border-0 p-4 sm:p-6 m-6">
            <SheetHeader>
              <SheetTitle>Your Order</SheetTitle>
              <SheetDescription>
                Table {table?.number} at {restaurant?.name}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <OrderCart
                restaurantId={restaurantId}
                tableId={tableId}
                collaborativeMode={collaborativeMode}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </main>
  );
}
