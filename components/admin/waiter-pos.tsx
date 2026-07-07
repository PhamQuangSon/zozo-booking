"use client";

import { useState } from "react";
import { Plus, Minus, Search, ShoppingCart, Trash2, Send } from "lucide-react";
import { useRouter } from "next/navigation";

import { createTableOrder } from "@/actions/table-actions";
import { MenuItemDetail } from "@/components/menu-item-detail";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Category, MenuItem } from "@prisma/client";

interface WaiterPOSProps {
  restaurantId: number;
  tableId: number;
  categories: (Category & { items: MenuItem[] })[];
  allMenuItems: (MenuItem & { categoryName: string; categoryId: number })[];
}

type CartItem = {
  id: string;
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  choices?: Array<{
    optionId: number;
    choiceId: number;
  }>;
  choicesText?: string;
};

export function WaiterPOS({ restaurantId, tableId, categories, allMenuItems }: WaiterPOSProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const [showItemDetail, setShowItemDetail] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<any | null>(null);

  // Filter items
  const filteredItems = allMenuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === null || item.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleItemClick = (item: any) => {
    setSelectedMenuItem(item);
    setShowItemDetail(true);
  };

  const handleAddToCart = (options: Record<string, any>, quantity: number, specialInstructions: string) => {
    if (!selectedMenuItem) return;

    const choices = Object.entries(options).map(([optionId, choice]) => ({
      optionId: Number(optionId),
      choiceId: Number(choice.id),
    }));

    const choicesText = Object.values(options)
      .map((c) => c.name)
      .join(", ");

    let itemTotal = Number(selectedMenuItem.price);
    Object.values(options).forEach((choice) => {
      itemTotal += choice.priceAdjustment || 0;
    });

    setCart((prev) => [
      ...prev,
      {
        id: `item-${selectedMenuItem.id}-${Date.now()}`,
        menuItemId: selectedMenuItem.id,
        name: selectedMenuItem.name,
        price: itemTotal,
        quantity,
        notes: specialInstructions,
        choices,
        choicesText,
      },
    ]);

    setShowItemDetail(false);
    setSelectedMenuItem(null);
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === cartItemId) {
          const newQty = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    
    setIsSubmitting(true);
    try {
      const orderData = {
        restaurantId,
        tableId,
        items: cart.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          notes: item.notes,
          choices: item.choices,
        })),
        notes: "Ordered by Waiter",
      };

      const result = await createTableOrder(orderData);

      if (result.success) {
        toast({
          title: "Order Sent to Kitchen",
          description: `Order successfully placed for Table ${tableId}.`,
        });
        setCart([]); // Clear cart on success
        router.push(`/admin/restaurants/${restaurantId}/tables`); // Redirect back to tables
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Order Failed",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Refactored Cart Content to be used in both Desktop Pane and Mobile Sheet
  const CartContent = () => (
    <div className="flex flex-col h-full bg-background border-l-0 lg:border-l">
      <CardHeader className="border-b bg-muted/10 py-4 shrink-0">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Current Order
          </div>
          {totalItems > 0 && (
            <Badge variant="secondary" className="text-lg px-2 py-0">
              {totalItems} items
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <ScrollArea className="flex-1 p-4 h-full">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-muted-foreground pt-12">
            <ShoppingCart className="h-12 w-12 opacity-20 mb-4" />
            <p>No items added yet</p>
            <p className="text-sm">Click menu items to add them</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex flex-col gap-2 p-3 bg-muted/20 rounded-lg border">
                <div className="flex justify-between items-start">
                  <span className="font-semibold">{item.name}</span>
                  <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
                
                {item.choicesText && (
                  <div className="text-sm text-muted-foreground -mt-1">
                    {item.choicesText}
                  </div>
                )}
                {item.notes && (
                  <div className="text-sm text-amber-600 bg-amber-50 p-1.5 rounded -mt-1 italic">
                    {item.notes}
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1 bg-background rounded-md border">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 rounded-r-none"
                      onClick={() => updateQuantity(item.id, -1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center font-medium tabular-nums">{item.quantity}</span>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 rounded-l-none"
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t bg-muted/5 mt-auto shrink-0 pb-20 lg:pb-4">
        <div className="flex justify-between items-center mb-4 text-lg">
          <span className="font-medium">Total</span>
          <span className="font-bold text-2xl text-primary tabular-nums">${cartTotal.toFixed(2)}</span>
        </div>
        
        <Button 
          className="w-full h-14 text-lg font-bold shadow-lg" 
          size="lg"
          disabled={cart.length === 0 || isSubmitting}
          onClick={handlePlaceOrder}
        >
          <Send className="mr-2 h-5 w-5" />
          {isSubmitting ? "Sending..." : "Send to Kitchen"}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)] overflow-hidden">
      
      {/* Left Pane: Menu Selection */}
      <div className="lg:col-span-2 flex flex-col lg:border-r h-full overflow-hidden">
        
        {/* Top Bar: Search and Categories */}
        <div className="p-4 border-b bg-muted/10">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search menu items..."
              className="pl-9 h-12 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <ScrollArea className="w-full whitespace-nowrap pb-2">
            <div className="flex gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
                className="rounded-full"
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className="rounded-full"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Menu Grid */}
        <ScrollArea className="flex-1 p-4 bg-muted/5">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <Card 
                key={item.id} 
                className="cursor-pointer hover:border-primary/50 transition-colors shadow-sm overflow-hidden flex flex-col h-32"
                onClick={() => handleItemClick(item)}
              >
                <CardContent className="p-4 flex flex-col h-full justify-between">
                  <div>
                    <h3 className="font-semibold line-clamp-2 leading-tight">{item.name}</h3>
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <span className="font-bold text-primary">${Number(item.price).toFixed(2)}</span>
                    <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Right Pane: Order Cart (Desktop) */}
      <div className="hidden lg:flex flex-col h-full bg-background border-l">
        <CartContent />
      </div>
      
      {/* Floating Action Button & Sheet for Order Cart (Mobile) */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="lg" className="rounded-full shadow-xl h-14 px-6 text-base font-semibold">
              <ShoppingCart className="h-5 w-5 mr-2" />
              View Order
              {totalItems > 0 && (
                <Badge variant="secondary" className="ml-2 h-6 px-2 bg-white text-primary">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[90vh] p-0 flex flex-col sm:max-w-none">
            <CartContent />
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Menu Item Detail Dialog */}
      <Dialog open={showItemDetail} onOpenChange={setShowItemDetail}>
        <DialogContent className="w-full max-w-[90vw] max-h-[80vh] overflow-auto sm:max-w-md glass-card border-0 p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>{selectedMenuItem?.name}</DialogTitle>
          </DialogHeader>
          {selectedMenuItem && (
            <MenuItemDetail
              item={selectedMenuItem}
              onAddToCart={handleAddToCart}
            />
          )}
        </DialogContent>
      </Dialog>
      
    </div>
  );
}
