"use client"

import { useState } from "react"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TableEditModal } from "@/components/admin/table-edit-modal"
import { deleteTable } from "@/actions/table-actions"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { DataTable, type ColumnDef } from "@/components/admin/data-table"
import { Table } from "@prisma/client"

interface TablesClientProps {
  restaurantId: string
  restaurantName: string
  initialTables: Table[]
}

export function TablesClient({ restaurantId, restaurantName, initialTables }: TablesClientProps) {
  const [tables, setTables] = useState<Table[]>(initialTables)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Filter tables based on search query
  const filteredTables = tables.filter((table) => table.number.toString().includes(searchQuery))

  // Handle edit table
  const handleEditTable = (table: Table) => {
    setEditingTable(table)
    setIsAddDialogOpen(true)
  }

  // Handle successful table creation/update
  const handleTableSuccess = (updatedTable: Table) => {
    setIsAddDialogOpen(false)
    setEditingTable(null)

    if (updatedTable) {
      // If it's an edit, update the table in the list
      if (tables.some((t) => t.id === updatedTable.id)) {
        setTables(tables.map((t) => (t.id === updatedTable.id ? updatedTable : t)))
      }
      // If it's a new table, add it to the list
      else {
        setTables([...tables, updatedTable])
      }
    }

    router.refresh()
  }

  // Define columns for the DataTable
  const columns: ColumnDef<Table>[] = [
    {
      id: "number",
      header: "Table Number",
      accessorKey: "number",
      cell: (value) => <span className="font-medium">Table {value}</span>,
      sortable: true,
    },
    {
      id: "capacity",
      header: "Capacity",
      accessorKey: "capacity",
      cell: (value) => <span>{value} people</span>,
      sortable: true,
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      cell: (value) => {
        const getStatusColor = (status: string) => {
          switch (status) {
            case "AVAILABLE":
              return "bg-green-500 text-white"
            case "OCCUPIED":
              return "bg-red-500 text-white"
            case "RESERVED":
              return "bg-amber-500 text-white"
            case "MAINTENANCE":
              return "bg-gray-500 text-white"
            default:
              return "bg-gray-500 text-white"
          }
        }

        return <Badge className={getStatusColor(value)}>{value}</Badge>
      },
      sortable: true,
    },
  ]

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Tables for {restaurantName}</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Table
        </Button>
      </div>

      <div className="flex items-center gap-4 mt-4">
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

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>All Tables</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable data={filteredTables} columns={columns} deleteAction={deleteTable} onEdit={handleEditTable} />
        </CardContent>
      </Card>

      <TableEditModal
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        restaurantId={Number(restaurantId)}
        initialData={editingTable}
        onSuccess={handleTableSuccess}
      />
    </>
  )
}
