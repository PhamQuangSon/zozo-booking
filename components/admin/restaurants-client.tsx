"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";

import type { Restaurant } from "@/actions/restaurant-actions";
import { deleteRestaurant } from "@/actions/restaurant-actions";
import { RestaurantEditModal } from "@/components/admin//restaurant-edit-modal";
import { type ColumnDef, DataTable } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RestaurantsClientProps {
  restaurants: Restaurant[];
}

export function RestaurantsClient({
  restaurants = [],
}: RestaurantsClientProps) {
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter categories based on search query
  const filteredRestaurants = restaurants.filter(
    (restaurant) =>
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (restaurant.description &&
        restaurant.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      (restaurant.address &&
        restaurant.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const columns: ColumnDef<Restaurant>[] = [
    {
      id: "name",
      header: "Name",
      accessorKey: "name",
      sortable: true,
    },
    {
      id: "image",
      header: "Image",
      accessorKey: "imageUrl",
      cell: (value) =>
        value ? (
          <div className="relative w-12 h-12">
            <Image
              src={value || "/placeholder.svg"}
              alt="Menu item"
              fill
              className="object-cover rounded-md"
            />
          </div>
        ) : (
          <div className="text-gray-400">No image</div>
        ),
      sortable: false,
    },
    {
      id: "address",
      header: "Address",
      accessorKey: "address",
      sortable: true,
    },
    {
      id: "phone",
      header: "Phone",
      accessorKey: "phone",
      sortable: true,
    },
    {
      id: "email",
      header: "email",
      accessorKey: "email",
      sortable: true,
    },
  ];

  const handleAddRestaurant = () => {
    setSelectedRestaurant(null);
    setIsModalOpen(true);
  };

  const handleEditRestaurant = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setIsModalOpen(true);
  };

  // Handle modal close with refresh
  const handleModalClose = (refresh: boolean) => {
    setIsModalOpen(false);
    if (refresh) {
      router.refresh();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search restaurant..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={handleAddRestaurant}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Restaurant
        </Button>
      </div>

      <DataTable
        data={filteredRestaurants}
        columns={columns}
        deleteAction={deleteRestaurant}
        onEdit={handleEditRestaurant}
      />

      <RestaurantEditModal
        open={isModalOpen}
        onOpenChange={handleModalClose}
        restaurants={selectedRestaurant}
        mode={selectedRestaurant ? "edit" : "create"}
      />
    </div>
  );
}
