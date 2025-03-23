import Link from "next/link"
import { Button } from "@/components/ui/button"
import { RestaurantCard } from "@/components/restaurant-card"
import { getRestaurants } from "@/actions/restaurant-actions"

export default async function Home() {
  let restaurants = []
  let error = null

  try {
    const result = await getRestaurants()
    if (result.success) {
      restaurants = result.data
    } else {
      error = result.error
      console.error("Error fetching restaurants:", error)
    }
  } catch (e) {
    error = e instanceof Error ? e.message : "An unexpected error occurred"
    console.error("Exception fetching restaurants:", e)
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">Welcome to FoodOrder</h1>
        <p className="mb-6 text-lg text-muted-foreground">Order delicious food from your favorite restaurants</p>
        <div className="flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/restaurants">Browse Restaurants</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/auth/login">Admin Login</Link>
          </Button>
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-semibold">Featured Restaurants</h2>
        {error && (
          <div className="mb-4 rounded-md bg-destructive/10 p-4 text-destructive">
            <p>Error loading restaurants: {error}</p>
          </div>
        )}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {restaurants && restaurants.length > 0 ? (
            restaurants.slice(0, 3).map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                id={restaurant.id.toString()}
                name={restaurant.name}
                image={restaurant.image_url || "/placeholder.svg?height=200&width=300"}
                cuisine={restaurant.cuisine || "Various"}
                rating={4.5} // This should be calculated from reviews in a real app
              />
            ))
          ) : (
            <>
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
            </>
          )}
        </div>
      </section>
    </main>
  )
}

