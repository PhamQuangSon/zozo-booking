import { RestaurantCard } from "@/components/restaurant-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export default function RestaurantsPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Restaurants</h1>

      <div className="mb-8 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search restaurants..." className="pl-9" />
        </div>
        <Button>Filter</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <RestaurantCard
          id="1"
          name="Pasta Paradise"
          image="/placeholder.svg?height=200&width=300"
          cuisine="Italian"
          rating={4.8}
        />
        <RestaurantCard
          id="2"
          name="Sushi Sensation"
          image="/placeholder.svg?height=200&width=300"
          cuisine="Japanese"
          rating={4.6}
        />
        <RestaurantCard
          id="3"
          name="Burger Bliss"
          image="/placeholder.svg?height=200&width=300"
          cuisine="American"
          rating={4.5}
        />
        <RestaurantCard
          id="4"
          name="Taco Time"
          image="/placeholder.svg?height=200&width=300"
          cuisine="Mexican"
          rating={4.3}
        />
        <RestaurantCard
          id="5"
          name="Pizza Palace"
          image="/placeholder.svg?height=200&width=300"
          cuisine="Italian"
          rating={4.7}
        />
        <RestaurantCard
          id="6"
          name="Curry Corner"
          image="/placeholder.svg?height=200&width=300"
          cuisine="Indian"
          rating={4.4}
        />
      </div>
    </main>
  )
}

