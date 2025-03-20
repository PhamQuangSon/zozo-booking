import Link from "next/link"
import Image from "next/image"
import { Star, Clock, MapPin, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MenuCategory } from "@/components/menu-category"
import { QrCodeButton } from "@/components/qr-code-button"

export default function RestaurantPage({ params }: { params: { id: string } }) {
  // In a real app, you would fetch the restaurant data based on the ID
  const restaurant = {
    id: params.id,
    name: "Pasta Paradise",
    image: "/restaurant_scene.png?height=400&width=800",
    cuisine: "Italian",
    rating: 4.8,
    address: "123 Main St, Anytown, USA",
    hours: "10:00 AM - 10:00 PM",
    description: "Authentic Italian cuisine with a modern twist. Our pasta is made fresh daily.",
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/restaurants">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Restaurants
          </Link>
        </Button>

        <div className="relative mb-6 h-64 w-full overflow-hidden rounded-lg md:h-80">
          <Image src={restaurant.image || "/restaurant_scene.png"} alt={restaurant.name} fill className="object-cover" />
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{restaurant.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-4">
              <Badge variant="outline">{restaurant.cuisine}</Badge>
              <div className="flex items-center text-sm">
                <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{restaurant.rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="mr-1 h-4 w-4" />
                <span>{restaurant.address}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="mr-1 h-4 w-4" />
                <span>{restaurant.hours}</span>
              </div>
            </div>
            <p className="mt-4 text-muted-foreground">{restaurant.description}</p>
          </div>
          <QrCodeButton restaurantId={restaurant.id} />
        </div>
      </div>

      <Tabs defaultValue="menu" className="mt-8">
        <TabsList className="mb-6">
          <TabsTrigger value="menu">Menu</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="info">Info</TabsTrigger>
        </TabsList>
        <TabsContent value="menu">
          <div className="space-y-8">
            <MenuCategory
              name="Appetizers"
              items={[
                {
                  id: "1",
                  name: "Bruschetta",
                  description: "Toasted bread topped with tomatoes, garlic, and basil",
                  price: 8.99,
                  image: "/restaurant_scene.png?height=100&width=100",
                },
                {
                  id: "2",
                  name: "Calamari",
                  description: "Fried squid served with marinara sauce",
                  price: 10.99,
                  image: "/restaurant_scene.png?height=100&width=100",
                },
                {
                  id: "3",
                  name: "Caprese Salad",
                  description: "Fresh mozzarella, tomatoes, and basil drizzled with balsamic glaze",
                  price: 9.99,
                  image: "/restaurant_scene.png?height=100&width=100",
                },
              ]}
            />
            <MenuCategory
              name="Pasta"
              items={[
                {
                  id: "4",
                  name: "Spaghetti Carbonara",
                  description: "Spaghetti with pancetta, eggs, Parmesan, and black pepper",
                  price: 15.99,
                  image: "/restaurant_scene.png?height=100&width=100",
                },
                {
                  id: "5",
                  name: "Fettuccine Alfredo",
                  description: "Fettuccine pasta in a rich, creamy Parmesan sauce",
                  price: 14.99,
                  image: "/restaurant_scene.png?height=100&width=100",
                },
                {
                  id: "6",
                  name: "Lasagna",
                  description: "Layers of pasta, meat sauce, and cheese baked to perfection",
                  price: 16.99,
                  image: "/restaurant_scene.png?height=100&width=100",
                },
              ]}
            />
            <MenuCategory
              name="Main Courses"
              items={[
                {
                  id: "7",
                  name: "Chicken Parmesan",
                  description: "Breaded chicken topped with marinara and mozzarella, served with pasta",
                  price: 18.99,
                  image: "/restaurant_scene.png?height=100&width=100",
                },
                {
                  id: "8",
                  name: "Eggplant Parmesan",
                  description: "Breaded eggplant topped with marinara and mozzarella, served with pasta",
                  price: 16.99,
                  image: "/restaurant_scene.png?height=100&width=100",
                },
                {
                  id: "9",
                  name: "Grilled Salmon",
                  description: "Salmon fillet grilled with lemon and herbs, served with vegetables",
                  price: 22.99,
                  image: "/restaurant_scene.png?height=100&width=100",
                },
              ]}
            />
          </div>
        </TabsContent>
        <TabsContent value="reviews">
          <div className="space-y-4">
            <p>Reviews coming soon...</p>
          </div>
        </TabsContent>
        <TabsContent value="info">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Address</h3>
              <p className="text-muted-foreground">{restaurant.address}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium">Hours</h3>
              <p className="text-muted-foreground">{restaurant.hours}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium">Contact</h3>
              <p className="text-muted-foreground">Phone: (555) 123-4567</p>
              <p className="text-muted-foreground">Email: info@pastaparadise.com</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  )
}

