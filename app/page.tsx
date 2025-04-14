import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { RestaurantCard } from "@/components/restaurant-card";
import { getRestaurants, Restaurant } from "@/actions/restaurant-actions";
import { Carousel } from "@/components/carousel";
import { ScrollingBanner } from "@/components/scrolling-banner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HowItWorks } from "@/components/how-it-works";
import { Testimonials } from "@/components/testimonials";
import { CTASection } from "@/components/cta-section";

// Carousel data
const carouselItems = [
  {
    id: 1,
    title: "CHICAGO DEEP",
    subtitle: "PIZZA KING",
    description:
      "Authentic deep dish pizza with premium toppings and our signature sauce",
    image: "/bannerThumb1_1.png",
    discount: "50% OFF",
    buttonText: "ORDER NOW",
    buttonLink: "/restaurants",
    welcomeText: "WELCOME FRESHEAT",
  },
  {
    id: 2,
    title: "GOURMET",
    subtitle: "BURGER HOUSE",
    description:
      "Juicy, flame-grilled burgers made with 100% premium beef and fresh ingredients",
    image: "/bannerThumb1_2.png",
    discount: "30% OFF",
    buttonText: "VIEW MENU",
    buttonLink: "/restaurants",
    welcomeText: "EXCLUSIVE OFFER",
  },
  {
    id: 3,
    title: "AUTHENTIC",
    subtitle: "PASTA PARADISE",
    description:
      "Hand-crafted Italian pasta made with traditional recipes and fresh ingredients",
    image: "/bannerThumb1_3.png",
    discount: "25% OFF",
    buttonText: "EXPLORE",
    buttonLink: "/restaurants",
    welcomeText: "NEW ARRIVAL",
  },
];

export default async function Home() {
  let restaurants: Restaurant[] = [];
  let error = null;

  try {
    const result = await getRestaurants();
    if (result.success) {
      restaurants = result.data || [];
    } else {
      error = result.error;
      console.error("Error fetching restaurants:", error);
    }
  } catch (e) {
    error = e instanceof Error ? e.message : "An unexpected error occurred";
    console.error("Exception fetching restaurants:", e);
  }

  return (
    <>
      {/* <SiteHeader /> */}

      <main className="flex flex-col min-h-screen">
        {/* Carousel Section */}
        {carouselItems.length > 0 && <Carousel items={carouselItems} />}

        {/* Scrolling Banner */}
        <ScrollingBanner text="PIZZA   BURGER   SUSHI   PASTA   DESSERT   DRINKS   ZOZO BOOKING" />
        <div className="bg-[url(/banner-bg.jpg)] bg-local">
          <div className="container mx-auto py-16">
            {/* How It Works */}
            <HowItWorks />

            {/* Featured Restaurants */}
            <section className="py-3">
              <div className="container mx-auto px-4">
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold mb-2 animate animate-fade-up">Restaurants</h2>
                  <p className="text-muted-foreground">
                    Discover our top-rated dining experiences
                  </p>
                </div>

                {error && (
                  <div className="mb-4 rounded-md bg-destructive/10 p-4 text-destructive">
                    <p>Error loading restaurants: {error}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {restaurants && restaurants.length > 0 ? (
                    restaurants.slice(0, 6).map((restaurant) => (
                      <RestaurantCard
                        key={restaurant.id}
                        id={restaurant.id.toString()}
                        name={restaurant.name}
                        image={
                          restaurant.imageUrl ||
                          "/placeholder.svg?height=200&width=300"
                        }
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
              </div>
            </section>
          </div>
        </div>

        {/* Testimonials */}
        <Testimonials />

        {/* CTA Section */}
        {/* <CTASection /> */}

        <SiteFooter />
      </main>
    </>
  );
}
