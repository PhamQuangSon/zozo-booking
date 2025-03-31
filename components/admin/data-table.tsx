"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"

export type ColumnDef<T> = {
  id: string
  header: string
  accessorKey: string | ((row: T) => any)
  cell?: (value: any, row: T) => React.ReactNode
  sortable?: boolean
}

interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  deleteAction?: (id: number) => Promise<{ success: boolean; error?: string }>
  editPath?: string // Path to edit page, e.g., "/admin/categories/edit/"
  onEdit?: (item: T) => void // Add this line
}

export function DataTable<T extends { id: number | string }>({
  data,
  columns,
  deleteAction,
  editPath,
  onEdit, // Add this line
}: DataTableProps<T>) {
  const router = useRouter()
  const [sortColumn, setSortColumn] = useState<string>(columns[0]?.id || "")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<T | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const sortedData = [...data].sort((a, b) => {
    const column = columns.find((col) => col.id === sortColumn)
    if (!column) return 0

    let aValue, bValue

    if (typeof column.accessorKey === "function") {
      aValue = column.accessorKey(a)
      bValue = column.accessorKey(b)
    } else {
      aValue = getNestedValue(a, column.accessorKey)
      bValue = getNestedValue(b, column.accessorKey)
    }

    // Handle undefined or null values
    if (aValue === undefined || aValue === null) aValue = ""
    if (bValue === undefined || bValue === null) bValue = ""

    // Compare based on type
    if (typeof aValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue))
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  const handleSort = (columnId: string) => {
    const column = columns.find((col) => col.id === columnId)
    if (!column?.sortable) return

    if (sortColumn === columnId) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(columnId)
      setSortDirection("asc")
    }
  }

  const handleEdit = (item: T) => {
    if (onEdit) {
      onEdit(item)
    } else if (editPath) {
      router.push(`${editPath}${item.id}`)
    }
  }

  const handleDeleteClick = (item: T) => {
    setItemToDelete(item)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!itemToDelete || !deleteAction) return

    setIsDeleting(true)
    try {
      const result = await deleteAction(Number(itemToDelete.id))

      if (result.success) {
        toast({
          title: "Deleted successfully",
          description: "The item has been deleted.",
        })
        setIsDeleteDialogOpen(false)
        router.refresh() // Refresh the page to update the data
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to delete the item.",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Helper function to get nested object values using dot notation
  function getNestedValue(obj: any, path: string): any {
    if (!path) return obj

    const keys = path.split(".")
    return keys.reduce((o, key) => (o && o[key] !== undefined ? o[key] : null), obj)
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  className={column.sortable ? "cursor-pointer" : undefined}
                  onClick={() => column.sortable && handleSort(column.id)}
                >
                  {column.header}
                  {column.sortable && sortColumn === column.id && (
                    <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                  )}
                </TableHead>
              ))}
              {(editPath || deleteAction) && <TableHead className="w-[100px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (editPath || deleteAction ? 1 : 0)} className="h-24 text-center">
                  No data found
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((column) => (
                    <TableCell key={`${row.id}-${column.id}`}>{renderCell(row, column)}</TableCell>
                  ))}
                  {editPath || onEdit ? (
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

                          <DropdownMenuItem onClick={() => handleEdit(row)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>

                          {deleteAction && (
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(row)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )

  function renderCell<T>(row: T, column: ColumnDef<T>) {
    let value

    if (typeof column.accessorKey === "function") {
      value = column.accessorKey(row)
    } else {
      value = getNestedValue(row, column.accessorKey)
    }

    if (column.cell) {
      return column.cell(value, row)
    }

    return value
  }
}

