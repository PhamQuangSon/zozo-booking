"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Edit, MoreHorizontal, Trash2 } from "lucide-react"
import { formatCurrency } from "@/lib/i18n"

interface MenuItem {
  id: number
  name: string
  description: string | null
  price: number
  is_available: boolean
  menu_categories: {
    name: string
    menu: {
      name: string
      restaurant: {
        id: number
        name: string
      }
    }
  }
  display_order: number
}

interface MenuItemsTableProps {
  menuItems: MenuItem[]
}

export function MenuItemsTable({ menuItems }: MenuItemsTableProps) {
  const [sortColumn, setSortColumn] = useState<string>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const sortedMenuItems = [...menuItems].sort((a, b) => {
    let aValue, bValue

    switch (sortColumn) {
      case "name":
        aValue = a.name
        bValue = b.name
        break
      case "restaurant":
        aValue = a.menu_categories.menu.restaurant.name
        bValue = b.menu_categories.menu.restaurant.name
        break
      case "category":
        aValue = a.menu_categories.name
        bValue = b.menu_categories.name
        break
      case "price":
        aValue = a.price
        bValue = b.price
        break
      case "available":
        aValue = a.is_available ? 1 : 0
        bValue = b.is_available ? 1 : 0
        break
      default:
        aValue = a.name
        bValue = b.name
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
              Name {sortColumn === "name" && (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("restaurant")}>
              Restaurant {sortColumn === "restaurant" && (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("category")}>
              Category {sortColumn === "category" && (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("price")}>
              Price {sortColumn === "price" && (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("available")}>
              Available {sortColumn === "available" && (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedMenuItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No menu items found
              </TableCell>
            </TableRow>
          ) : (
            sortedMenuItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.menu_categories.menu.restaurant.name}</TableCell>
                <TableCell>{item.menu_categories.name}</TableCell>
                <TableCell>{formatCurrency(item.price, "USD")}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      item.is_available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.is_available ? "Yes" : "No"}
                  </span>
                </TableCell>
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
  )
}

