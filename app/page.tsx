import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { RestaurantCard } from "@/components/restaurant-card"

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <section className="mb-12 text-center">
              <div className="relative h-48 w-full">
                <Image src={"/placeholder-logo.png?height=200&width=300"} alt="zozo" fill className="w-48 object-cover" />
              </div>
        <h1 className="mb-4 text-4xl font-bold">Welcome to zozo booking</h1>
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <RestaurantCard
            id="1"
            name="Pasta Paradise"
            image="/restaurant_scene.png?height=200&width=300"
            cuisine="Italian"
            rating={4.8}
          />
          <RestaurantCard
            id="2"
            name="Sushi Sensation"
            image="/restaurant_scene.png?height=200&width=300"
            cuisine="Japanese"
            rating={4.6}
          />
          <RestaurantCard
            id="3"
            name="Burger Bliss"
            image="/restaurant_scene.png?height=200&width=300"
            cuisine="American"
            rating={4.5}
          />
        </div>
      </section>
    </main>
  )
}

