"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus } from "lucide-react"

interface SelectionOption {
  id: number
  name: string
  description?: string | null
  is_active?: boolean
  display_order?: number
  [key: string]: any // Allow additional properties
}

interface MenuSelectorProps {
  title: string
  options: SelectionOption[]
  onSelect: (option: SelectionOption) => void
  onCreateNew: () => void
  createButtonText: string
}

export function MenuSelector({
  title,
  options,
  onSelect,
  onCreateNew,
  createButtonText
}: MenuSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{title}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select {title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4 pb-4">
            {options.length > 0 ? (
              options.map((option) => (
                <div
                  key={option.id}
                  onClick={() => {
                    onSelect(option)
                    setIsOpen(false)
                  }}
                  className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-accent"
                >
                  <div>
                    <h4 className="font-medium">{option.name}</h4>
                    {option.description && (
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <p className="text-sm text-muted-foreground mb-4">No items available</p>
                <Button onClick={onCreateNew}>
                  <Plus className="mr-2 h-4 w-4" />
                  {createButtonText}
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
        {options.length > 0 && (
          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">or create new</p>
            <Button onClick={onCreateNew}>
              <Plus className="mr-2 h-4 w-4" />
              {createButtonText}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}