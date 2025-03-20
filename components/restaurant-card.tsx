import Link from "next/link"
import Image from "next/image"
import { Star } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface RestaurantCardProps {
  id: string
  name: string
  image: string
  cuisine: string
  rating: number
}

export function RestaurantCard({ id, name, image, cuisine, rating }: RestaurantCardProps) {
  return (
    <Link href={`/restaurants/${id}`}>
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <div className="relative h-48 w-full">
          <Image src={image || "/placeholder.svg"} alt={name} fill className="object-cover" />
        </div>
        <CardContent className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xl font-semibold">{name}</h3>
            <Badge variant="outline">{cuisine}</Badge>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{rating.toFixed(1)}</span>
          </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/50 p-4">
          <span className="text-sm font-medium">View Menu</span>
        </CardFooter>
      </Card>
    </Link>
  )
}

