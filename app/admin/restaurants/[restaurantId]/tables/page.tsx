"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Plus, Search, Edit, Trash2, MoreHorizontal, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TableForm } from "@/components/table-form"
import { getRestaurantById } from "@/actions/restaurant-actions"
import { getRestaurantTables, deleteTable } from "@/actions/table-actions"
import { useToast } from "@/hooks/use-toast"

export default function TablesPage() {
  const params = useParams()
  const router = useRouter()
  const restaurantId = params.restaurantId as string
  const [restaurant, setRestaurant] = useState<any>(null)
  const [tables, setTables] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingTable, setEditingTable] = useState<any>(null)
  const { toast } = useToast()

  // Load restaurant details
  const loadRestaurant = async () => {
    try {
      const result = await getRestaurantById(restaurantId)
      if (result.success) {
        setRestaurant(result.data)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load restaurant details",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading restaurant:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  // Load tables
  const loadTables = async () => {
    setIsLoading(true)
    try {
      const result = await getRestaurantTables(restaurantId)
      if (result.success) {
        setTables(result.data)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load tables",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading tables:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadRestaurant()
    loadTables()
  }, [restaurantId])

  // Filter tables based on search query
  const filteredTables = tables.filter((table) => table.number.toString().includes(searchQuery))

  // Handle table deletion
  const handleDeleteTable = async (id: number) => {
    if (confirm("Are you sure you want to delete this table? This action cannot be undone.")) {
      try {
        const result = await deleteTable(id)
        if (result.success) {
          toast({
            title: "Success",
            description: "Table deleted successfully",
          })
          loadTables()
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to delete table",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error deleting table:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
      }
    }
  }

  // Handle edit table
  const handleEditTable = (table: any) => {
    setEditingTable(table)
    setIsAddDialogOpen(true)
  }

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "success"
      case "OCCUPIED":
        return "destructive"
      case "RESERVED":
        return "warning"
      case "MAINTENANCE":
        return "secondary"
      default:
        return "default"
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push("/admin/restaurants")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Tables for {restaurant?.name || "Restaurant"}</h2>
        </div>
        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open)
            if (!open) setEditingTable(null)
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Table
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingTable ? "Edit Table" : "Add Table"}</DialogTitle>
              <DialogDescription>
                {editingTable ? "Update table details below" : "Fill in the details to create a new table"}
              </DialogDescription>
            </DialogHeader>
            <TableForm
              restaurantId={Number.parseInt(restaurantId)}
              initialData={editingTable}
              onSuccess={() => {
                setIsAddDialogOpen(false)
                setEditingTable(null)
                loadTables()
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tables by number..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tables</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <p className="text-muted-foreground">Loading tables...</p>
            </div>
          ) : filteredTables.length === 0 ? (
            <div className="flex justify-center py-8">
              <p className="text-muted-foreground">No tables found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Table Number</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTables.map((table) => (
                  <TableRow key={table.id}>
                    <TableCell className="font-medium">Table {table.number}</TableCell>
                    <TableCell>{table.capacity} people</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(table.status)}>{table.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditTable(table)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.open(`/table/${restaurantId}/${table.id}`, "_blank")}>
                            View Table Menu
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteTable(table.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

