"use client"

import { useState } from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react'

interface Category {
  id: number
  name: string
  description: string | null
  menu: {
    name: string
    restaurant: {
      id: number
      name: string
    }
  }
  display_order: number
}

interface CategoryTableProps {
  categories: Category[]
}

export function CategoryTable({ categories }: CategoryTableProps) {
  const [sortColumn, setSortColumn] = useState<string>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const sortedCategories = [...categories].sort((a, b) => {
    let aValue, bValue

    switch (sortColumn) {
      case "name":
        aValue = a.name
        bValue = b.name
        break
      case "restaurant":
        aValue = a.menu.restaurant.name
        bValue = b.menu.restaurant.name
        break
      case "menu":
        aValue = a.menu.name
        bValue = b.menu.name
        break
      case "order":
        aValue = a.display_order
        bValue = b.display_order
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
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleSort("name")}
            >
              Name {sortColumn === "name" && (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleSort("restaurant")}
            >
              Restaurant {sortColumn === "restaurant" && (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleSort("menu")}
            >
              Menu {sortColumn === "menu" && (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleSort("order")}
            >
              Display Order {sortColumn === "order" && (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCategories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No categories found
              </TableCell>
            </TableRow>
          ) : (
            sortedCategories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>{category.menu.restaurant.name}</TableCell>
                <TableCell>{category.menu.name}</TableCell>
                <TableCell>{category.display_order}</TableCell>
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
