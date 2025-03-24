"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Star, Clock, MapPin, ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MenuCategory } from "@/components/menu-category";
import { QrCodeButton } from "@/components/qr-code-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getRestaurantById } from "@/actions/restaurant-actions";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";

export default function RestaurantPage() {
  const params = useParams();
  const restaurantId = params.restaurantId as string;

  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchRestaurant = useCallback(async () => {
    try {
      setLoading(false);
      const { success, data, error } = await getRestaurantById(restaurantId);

      if (success && data) {
        setRestaurant(data);
      } else {
        toast({
          title: "Error",
          description: error || "Failed to fetch restaurant details",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching restaurant:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchRestaurant();
  }, [restaurantId, fetchRestaurant]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Restaurant Not Found</CardTitle>
            <CardDescription>
              The restaurant you're looking for doesn't exist
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/booking">Back to Booking</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-start">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" asChild className="mb-4">
                <Link href="/restaurants">
                  <ChevronLeft className="mr-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="">
              <CardTitle>{restaurant.name}</CardTitle>
              <CardDescription>{restaurant.address}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6 h-64 w-full overflow-hidden rounded-lg md:h-80">
            <Image
              src={restaurant.image_url || "/restaurant_scene.png"}
              alt={restaurant.name}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{restaurant.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-4">
                <Badge variant="outline">{restaurant.cuisine}</Badge>
                <div className="flex items-center text-sm">
                  <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{restaurant.rating?.toFixed(1) || "0.0"}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-1 h-4 w-4" />
                  <span>{restaurant.address}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-1 h-4 w-4" />
                  <span>{restaurant.hours}</span>
                </div>
              </div>
              <p className="mt-4 text-muted-foreground">
                {restaurant.description}
              </p>
            </div>
            <QrCodeButton restaurantId={restaurant.id} />
          </div>

          <Tabs defaultValue="menu" className="mt-8">
            <TabsList className="mb-6">
              <TabsTrigger value="menu">Menu</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="info">Info</TabsTrigger>
            </TabsList>
            <TabsContent value="menu">
              <div className="space-y-8">
                {restaurant.menus && restaurant.menus.length > 0 ? (
                  restaurant.menus.map((menu: { menu_categories: { id: string; name: string; menu_items: { id: number; name: string; description?: string; price: string; image_url?: string; menu_item_options: any[] }[] }[] }) =>
                    menu.menu_categories?.map((category: { id: string; name: string; menu_items: { id: number; name: string; description?: string; price: string; image_url?: string; menu_item_options: any[] }[] }) => (
                      <MenuCategory
                        key={category.id}
                        name={category.name}
                        items={category.menu_items.map((item: { id: number; name: string; description?: string; price: string; image_url?: string; menu_item_options: any[] }) => ({
                          id: item.id.toString(),
                          name: item.name,
                          description: item.description || "",
                          price: Number(item.price),
                          image:
                            item.image_url ||
                            "/placeholder.svg?height=100&width=100",
                          options: item.menu_item_options,
                        }))}
                      />
                    ))
                  )
                ) : (
                  <p className="text-muted-foreground">
                    No menu items available
                  </p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="reviews">
              <div className="space-y-4">
                <p>Reviews coming soon...</p>
              </div>
            </TabsContent>
            <TabsContent value="info">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Address</h3>
                  <p className="text-muted-foreground">{restaurant.address}</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Hours</h3>
                  <p className="text-muted-foreground">{restaurant.hours}</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Contact</h3>
                  <p className="text-muted-foreground">
                    Phone: {restaurant.phone}
                  </p>
                  <p className="text-muted-foreground">
                    Email: {restaurant.email}
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-4">
            <Button asChild>
              <Link href={`/booking?restaurant=${restaurantId}`}>
                Make a Reservation
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
