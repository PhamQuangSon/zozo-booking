import Image from "next/image";
import { getTranslations } from "next-intl/server";

import type { Restaurant } from "@/actions/restaurant-actions";
import { getRestaurants } from "@/actions/restaurant-actions";
import { Carousel } from "@/components/carousel";
import { HowItWorks } from "@/components/how-it-works";
import { RestaurantCard } from "@/components/restaurant-card";
import { ScrollingBanner } from "@/components/scrolling-banner";
import { SiteFooter } from "@/components/site-footer";
import { Testimonials } from "@/components/testimonials";

// The carousel items will be generated inside the component so they can be translated.

export default async function Home() {
  const t = await getTranslations("Home");
  
  const carouselItems = [
    {
      id: 1,
      title: t("carousel_title_1"),
      subtitle: t("carousel_subtitle_1"),
      description: t("carousel_desc_1"),
      image: "/bannerThumb1_1.png",
      discount: "50% OFF",
      buttonText: t("carousel_btn_1"),
      buttonLink: "/restaurants",
      welcomeText: t("carousel_welcome_1"),
    },
    {
      id: 2,
      title: t("carousel_title_2"),
      subtitle: t("carousel_subtitle_2"),
      description: t("carousel_desc_2"),
      image: "/bannerThumb1_2.png",
      discount: "30% OFF",
      buttonText: t("carousel_btn_2"),
      buttonLink: "/restaurants",
      welcomeText: t("carousel_welcome_2"),
    },
    {
      id: 3,
      title: t("carousel_title_3"),
      subtitle: t("carousel_subtitle_3"),
      description: t("carousel_desc_3"),
      image: "/bannerThumb1_3.png",
      discount: "25% OFF",
      buttonText: t("carousel_btn_3"),
      buttonLink: "/restaurants",
      welcomeText: t("carousel_welcome_3"),
    },
  ];

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
        <ScrollingBanner text={t("scrolling_banner")} />
        <div className="relative w-full overflow-hidden">
          {/* Background Image */}
          <Image
            src="/banner-bg.jpg"
            alt="Banner"
            fill
            priority
            fetchPriority="high"
            className="object-cover -z-10"
            sizes="100vw"
          />

          <div className="container mx-auto py-16">
            {/* How It Works */}
            <HowItWorks />

            {/* Featured Restaurants */}
            <section className="py-3">
              <div className="container mx-auto px-4">
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold mb-2 text-orange-400 animate animate-fade-up">
                    {t('restaurants_title')}
                  </h2>
                  <p className="text-muted-foreground">{t('restaurants_description')}</p>
                </div>

                {error && (
                  <div className="mb-4 rounded-md bg-destructive/10 p-4 text-destructive">
                    <p>{t('restaurants_error')} {error}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {restaurants && restaurants.length > 0 ? (
                    restaurants.slice(0, 6).map((restaurant) => (
                      <RestaurantCard
                        key={restaurant.id}
                        id={restaurant.id.toString()}
                        name={restaurant.name}
                        image={restaurant.imageUrl || "/placeholder.svg?height=200&width=300"}
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
