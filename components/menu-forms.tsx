"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import {
  createMenu,
  createCategory,
  createMenuItem,
  createMenuItemOption,
  createOptionChoice,
  updateMenu,
  updateCategory,
  updateMenuItem,
  updateMenuItemOption,
  updateOptionChoice
} from "@/actions/menu-item-actions"

// Menu Form
interface MenuFormProps {
  restaurantId: number
  onSuccess?: () => void
  initialData?: any
}

export function MenuForm({ restaurantId, onSuccess, initialData }: MenuFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      is_active: formData.get("is_active") === "on",
      restaurant_id: restaurantId
    }

    try {
      const result = initialData
        ? await updateMenu(initialData.id, data)
        : await createMenu(data)

      if (result.success) {
        toast({ title: `Menu ${initialData ? "updated" : "created"} successfully` })
        setIsOpen(false)
        onSuccess?.()
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{initialData ? "Edit Menu" : "Add Menu"}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Menu" : "Create New Menu"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={initialData?.name}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={initialData?.description}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              name="is_active"
              defaultChecked={initialData?.is_active ?? true}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : initialData ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Category Form
interface CategoryFormProps {
  menuId: number
  onSuccess?: () => void
  initialData?: any
}

export function CategoryForm({ menuId, onSuccess, initialData }: CategoryFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      menu_id: menuId,
      display_order: parseInt(formData.get("display_order") as string) || 0
    }

    try {
      const result = initialData
        ? await updateCategory(initialData.id, data)
        : await createCategory(data)

      if (result.success) {
        toast({ title: `Category ${initialData ? "updated" : "created"} successfully` })
        setIsOpen(false)
        onSuccess?.()
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{initialData ? "Edit Category" : "Add Category"}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Category" : "Create New Category"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={initialData?.name}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={initialData?.description}
            />
          </div>
          <div>
            <Label htmlFor="display_order">Display Order</Label>
            <Input
              id="display_order"
              name="display_order"
              type="number"
              defaultValue={initialData?.display_order ?? 0}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : initialData ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Menu Item Form
interface MenuItemFormProps {
  categoryId: number
  onSuccess?: () => void
  initialData?: any
}

export function MenuItemForm({ categoryId, onSuccess, initialData }: MenuItemFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: parseFloat(formData.get("price") as string),
      image_url: formData.get("image_url") as string,
      category_id: categoryId,
      is_available: formData.get("is_available") === "on",
      display_order: parseInt(formData.get("display_order") as string) || 0
    }

    try {
      const result = initialData
        ? await updateMenuItem(initialData.id, data)
        : await createMenuItem(data)

      if (result.success) {
        toast({ title: `Menu item ${initialData ? "updated" : "created"} successfully` })
        setIsOpen(false)
        onSuccess?.()
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{initialData ? "Edit Item" : "Add Item"}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Menu Item" : "Create New Menu Item"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={initialData?.name}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={initialData?.description}
            />
          </div>
          <div>
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              defaultValue={initialData?.price}
              required
            />
          </div>
          <div>
            <Label htmlFor="image_url">Image URL</Label>
            <Input
              id="image_url"
              name="image_url"
              defaultValue={initialData?.image_url}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="is_available"
              name="is_available"
              defaultChecked={initialData?.is_available ?? true}
            />
            <Label htmlFor="is_available">Available</Label>
          </div>
          <div>
            <Label htmlFor="display_order">Display Order</Label>
            <Input
              id="display_order"
              name="display_order"
              type="number"
              defaultValue={initialData?.display_order ?? 0}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : initialData ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Menu Item Option Form
interface MenuItemOptionFormProps {
  menuItemId: number
  onSuccess?: () => void
  initialData?: any
}

export function MenuItemOptionForm({ menuItemId, onSuccess, initialData }: MenuItemOptionFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name") as string,
      price_adjustment: parseFloat(formData.get("price_adjustment") as string),
      is_required: formData.get("is_required") === "on",
      menu_item_id: menuItemId
    }

    try {
      const result = initialData
        ? await updateMenuItemOption(initialData.id, data)
        : await createMenuItemOption(data)

      if (result.success) {
        toast({ title: `Option ${initialData ? "updated" : "created"} successfully` })
        setIsOpen(false)
        onSuccess?.()
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{initialData ? "Edit Option" : "Add Option"}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Option" : "Create New Option"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={initialData?.name}
              required
            />
          </div>
          <div>
            <Label htmlFor="price_adjustment">Price Adjustment</Label>
            <Input
              id="price_adjustment"
              name="price_adjustment"
              type="number"
              step="0.01"
              defaultValue={initialData?.price_adjustment}
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="is_required"
              name="is_required"
              defaultChecked={initialData?.is_required ?? false}
            />
            <Label htmlFor="is_required">Required</Label>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : initialData ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Option Choice Form
interface OptionChoiceFormProps {
  optionId: number
  onSuccess?: () => void
  initialData?: any
}

export function OptionChoiceForm({ optionId, onSuccess, initialData }: OptionChoiceFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name") as string,
      price_adjustment: parseFloat(formData.get("price_adjustment") as string),
      option_id: optionId
    }

    try {
      const result = initialData
        ? await updateOptionChoice(initialData.id, data)
        : await createOptionChoice(data)

      if (result.success) {
        toast({ title: `Choice ${initialData ? "updated" : "created"} successfully` })
        setIsOpen(false)
        onSuccess?.()
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{initialData ? "Edit Choice" : "Add Choice"}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Choice" : "Create New Choice"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={initialData?.name}
              required
            />
          </div>
          <div>
            <Label htmlFor="price_adjustment">Price Adjustment</Label>
            <Input
              id="price_adjustment"
              name="price_adjustment"
              type="number"
              step="0.01"
              defaultValue={initialData?.price_adjustment}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : initialData ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}