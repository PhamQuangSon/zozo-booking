"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createTable, updateTable } from "@/actions/table-actions"
import { useToast } from "@/hooks/use-toast"

interface TableFormProps {
  restaurantId: number
  initialData?: any
  onSuccess: () => void
}

export function TableForm({ restaurantId, initialData, onSuccess }: TableFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    number: initialData?.number || "",
    capacity: initialData?.capacity || "4",
    status: initialData?.status || "AVAILABLE",
  })
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const tableData = {
        number: Number.parseInt(formData.number),
        capacity: Number.parseInt(formData.capacity),
        status: formData.status,
        restaurant_id: restaurantId,
      }

      const result = initialData ? await updateTable(initialData.id, tableData) : await createTable(tableData)

      if (result.success) {
        toast({
          title: "Success",
          description: initialData ? "Table updated successfully" : "Table created successfully",
        })
        onSuccess()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save table",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving table:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="number">Table Number *</Label>
          <Input
            id="number"
            name="number"
            type="number"
            min="1"
            value={formData.number}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="capacity">Capacity *</Label>
          <Input
            id="capacity"
            name="capacity"
            type="number"
            min="1"
            max="20"
            value={formData.capacity}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AVAILABLE">Available</SelectItem>
              <SelectItem value="OCCUPIED">Occupied</SelectItem>
              <SelectItem value="RESERVED">Reserved</SelectItem>
              <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : initialData ? "Update Table" : "Create Table"}
        </Button>
      </DialogFooter>
    </form>
  )
}

