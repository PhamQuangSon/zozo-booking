"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CarouselItem {
  id: number;
  title: string;
  subtitle: string;
  description?: string;
  image: string;
  discount?: string;
  buttonText: string;
  buttonLink?: string;
  buttonAction?: () => void;
  welcomeText?: string;
}

interface CarouselProps {
  items: CarouselItem[];
  autoPlay?: boolean;
  interval?: number;
  className?: string;
}

export function Carousel({ items, autoPlay = true, interval = 5000, className }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const announceRef = useRef<HTMLDivElement>(null);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (!autoPlay || isHovering) return;
    const id = setInterval(() => {
      setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
    }, interval);
    return () => clearInterval(id);
  }, [autoPlay, interval, isHovering, items.length]);

  const current = items[currentIndex];

  return (
    <section
      className={cn("relative overflow-hidden", className)}
      aria-roledescription="carousel"
      aria-label="Featured promotions"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Screen-reader live region — announces slide changes */}
      <div ref={announceRef} aria-live="polite" aria-atomic="true" className="sr-only">
        {`Slide ${currentIndex + 1} of ${items.length}: ${current.title} ${current.subtitle}`}
      </div>

      <div className="relative h-[400px] md:h-[500px] w-full">
        {items.map((item, index) => (
          <div
            key={item.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`Slide ${index + 1} of ${items.length}`}
            aria-hidden={index !== currentIndex}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="relative h-full w-full bg-black">
              <Image
                src="/bannerBG1_1.jpg"
                alt=""
                fill
                sizes="100vw"
                className="object-cover opacity-90"
                priority={index === 0}
                fetchPriority={index === 0 ? "high" : "auto"}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />

              <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col justify-center text-white p-6 md:p-8">
                    <p className="text-amber-500 font-medium mb-2 text-sm md:text-base">
                      {item.welcomeText || "WELCOME FRESHEAT"}
                    </p>
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                      {item.title}
                      <br />
                      {item.subtitle}
                    </h2>
                    {item.description && (
                      <p className="text-gray-200 mb-6 max-w-md text-sm md:text-base">
                        {item.description}
                      </p>
                    )}
                    {item.buttonLink ? (
                      <Button asChild className="bg-red-600 hover:bg-red-700 text-white w-fit">
                        <Link href={item.buttonLink}>{item.buttonText}</Link>
                      </Button>
                    ) : (
                      <Button
                        onClick={item.buttonAction}
                        className="bg-red-600 hover:bg-red-700 text-white w-fit"
                      >
                        {item.buttonText}
                      </Button>
                    )}
                  </div>

                  <div className="hidden md:block animate-float">
                    <div className="relative h-[600px] w-[500px]">
                      <Image
                        src={item.image}
                        alt={`${item.title} ${item.subtitle}`}
                        fill
                        sizes="50vw"
                        className="object-contain drop-shadow-2xl"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 p-2 rounded-full text-white hover:bg-black/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white transition-colors z-10"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 p-2 rounded-full text-white hover:bg-black/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white transition-colors z-10"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" aria-hidden="true" />
      </button>
    </section>
  );
}
