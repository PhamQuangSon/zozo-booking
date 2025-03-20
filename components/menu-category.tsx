"use client"
import Image from "next/image"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MenuItemDetail } from "@/components/menu-item-detail"
import { useCurrencyStore } from "@/lib/currency-store"
import { formatCurrency } from "@/lib/i18n"

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image: string
}

interface MenuCategoryProps {
  name: string
  items: MenuItem[]
}

export function MenuCategory({ name, items }: MenuCategoryProps) {
  const { currency } = useCurrencyStore()

  return (
    <div>
      <h2 className="mb-4 text-2xl font-semibold">{name}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex">
                <div className="relative h-24 w-24 flex-shrink-0">
                  <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col justify-between p-4">
                  <div>
                    <div className="flex items-start justify-between">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="link" className="h-auto p-0 text-left">
                            <h3 className="text-lg font-medium">{item.name}</h3>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>{item.name}</DialogTitle>
                          </DialogHeader>
                          <MenuItemDetail item={item} />
                        </DialogContent>
                      </Dialog>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Heart className="h-4 w-4" />
                        <span className="sr-only">Like</span>
                      </Button>
                    </div>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-medium">{formatCurrency(item.price, currency)}</span>
                    <Button size="sm">Add to Order</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

