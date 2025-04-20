"use client";

import { useState } from "react";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface OptionChoice {
  id: number;
  name: string;
  price_adjustment: number;
}

interface ItemOption {
  id: number;
  name: string;
  price_adjustment: number;
  is_required: boolean;
  menu_item: {
    id: number;
    name: string;
    menu_categories: {
      name: string;
      menu: {
        name: string;
        restaurant: {
          id: number;
          name: string;
        };
      };
    };
  };
  option_choices: OptionChoice[];
}

interface ItemOptionsTableProps {
  itemOptions: ItemOption[];
}

export function ItemOptionsTable({ itemOptions }: ItemOptionsTableProps) {
  const [sortColumn, setSortColumn] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const sortedItemOptions = [...itemOptions].sort((a, b) => {
    let aValue, bValue;

    switch (sortColumn) {
      case "name":
        aValue = a.name;
        bValue = b.name;
        break;
      case "menuItem":
        aValue = a.menu_item.name;
        bValue = b.menu_item.name;
        break;
      case "restaurant":
        aValue = a.menu_item.menu_categories.menu.restaurant.name;
        bValue = b.menu_item.menu_categories.menu.restaurant.name;
        break;
      case "required":
        aValue = a.is_required ? 1 : 0;
        bValue = b.is_required ? 1 : 0;
        break;
      case "choices":
        aValue = a.option_choices.length;
        bValue = b.option_choices.length;
        break;
      default:
        aValue = a.name;
        bValue = b.name;
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("name")}
            >
              Option Name{" "}
              {sortColumn === "name" && (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("menuItem")}
            >
              Menu Item{" "}
              {sortColumn === "menuItem" &&
                (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("restaurant")}
            >
              Restaurant{" "}
              {sortColumn === "restaurant" &&
                (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("required")}
            >
              Required{" "}
              {sortColumn === "required" &&
                (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("choices")}
            >
              Choices{" "}
              {sortColumn === "choices" &&
                (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedItemOptions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No item options found
              </TableCell>
            </TableRow>
          ) : (
            sortedItemOptions.map((option) => (
              <TableRow key={option.id}>
                <TableCell className="font-medium">{option.name}</TableCell>
                <TableCell>{option.menu_item.name}</TableCell>
                <TableCell>
                  {option.menu_item.menu_categories.menu.restaurant.name}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      option.is_required
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {option.is_required ? "Required" : "Optional"}
                  </span>
                </TableCell>
                <TableCell>{option.option_choices.length}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
