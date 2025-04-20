"use client";

import { useEffect, useState } from "react";

import type { Restaurant } from "@/actions/restaurant-actions";
import { getRestaurants } from "@/actions/restaurant-actions";
import Loading from "@/app/loading";
import { RestaurantsClient } from "@/components/admin/restaurants-client";
import { useToast } from "@/hooks/use-toast";

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load restaurants
  const loadRestaurants = async () => {
    setIsLoading(true);
    try {
      const result = await getRestaurants();
      if (result.success) {
        setRestaurants(result.data);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load restaurants",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading restaurants:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurants();
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Restaurants</h1>
      <RestaurantsClient restaurants={restaurants} />
    </>
  );
}
