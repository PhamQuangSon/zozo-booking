"use client";

import { useEffect, useState } from "react";
import { PlusCircle } from "lucide-react";

import { deleteItemOption } from "@/actions/item-option-actions";
import { type ColumnDef, DataTable } from "@/components/admin/data-table";
import { ItemOptionEditModal } from "@/components/admin/item-option-edit-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  ItemOptionWithRelations,
  MenuItemWithRelations,
} from "@/types/menu-builder-types";

// Define props interface
interface ItemOptionsClientProps {
  itemOptions: ItemOptionWithRelations[];
}

export function ItemOptionsClient({
  itemOptions = [],
}: ItemOptionsClientProps) {
  // Use the interface
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItemOption, setSelectedItemOption] =
    useState<ItemOptionWithRelations | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItemWithRelations[]>([]);

  // Fetch menu items on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get unique menu items from item options
        const uniqueMenuItems = new Map();

        itemOptions.forEach((option) => {
          if (option.menuItem) {
            uniqueMenuItems.set(option.menuItem.id, option.menuItem);
          }
        });

        setMenuItems(Array.from(uniqueMenuItems.values()));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [itemOptions]);

  const filteredItemOptions = itemOptions.filter(
    (option) =>
      option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (option.menuItemName?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (option.restaurantName?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      )
  );

  const columns: ColumnDef<ItemOptionWithRelations>[] = [
    {
      id: "name",
      header: "Name",
      accessorKey: "name",
      sortable: true,
    },
    {
      id: "menuItem",
      header: "Menu Item",
      accessorKey: "menuItemName", // Use pre-formatted menu item name
      sortable: true,
    },
    {
      id: "restaurant",
      header: "Restaurant",
      accessorKey: "restaurantName", // Use pre-formatted restaurant name
      sortable: true,
    },
    {
      id: "required",
      header: "Required",
      accessorKey: "isRequired",
      cell: (value) => (value ? "Yes" : "No"),
      sortable: true,
    },
    {
      id: "choices",
      header: "Choices",
      accessorKey: "choicesCount", // Use pre-calculated choices count
      sortable: true,
    },
  ];

  const handleAddItemOption = () => {
    setSelectedItemOption(null);
    setIsModalOpen(true);
  };

  const handleEditItemOption = (itemOption: ItemOptionWithRelations) => {
    setSelectedItemOption(itemOption);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search item options..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={handleAddItemOption}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Item Option
        </Button>
      </div>

      <DataTable
        data={filteredItemOptions}
        columns={columns}
        deleteAction={deleteItemOption}
        onEdit={handleEditItemOption}
      />

      <ItemOptionEditModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        itemOption={selectedItemOption}
        menuItems={menuItems}
        mode={selectedItemOption ? "edit" : "create"}
      />
    </div>
  );
}
