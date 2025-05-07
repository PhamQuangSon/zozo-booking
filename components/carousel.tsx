"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  buttonAction?: () => void;
  welcomeText?: string;
}

interface CarouselProps {
  items: CarouselItem[];
  autoPlay?: boolean;
  interval?: number;
  className?: string;
}

export function Carousel({
  items,
  autoPlay = true,
  interval = 5000,
  className,
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === items.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? items.length - 1 : prevIndex - 1
    );
  };

  // const goToSlide = (index: number) => {
  //   setCurrentIndex(index);
  // };

  useEffect(() => {
    if (!autoPlay || isHovering) return;

    const slideInterval = setInterval(() => {
      // nextSlide();
      setCurrentIndex((prevIndex) =>
        prevIndex === items.length - 1 ? 0 : prevIndex + 1
      );
    }, interval);

    return () => clearInterval(slideInterval);
  }, [autoPlay, interval, isHovering, items.length]);

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="relative h-[500px] w-full">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="relative h-full w-full bg-black">
              <Image
                src={"/bannerBG1_1.jpg"}
                alt="Carousel food background"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover opacity-90"
                priority={index === 0}
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent"></div>

              <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto grid grid-cols-2 gap-4">
                  {/* Left side content */}
                  <div className="flex flex-col justify-center text-white p-8">
                    <p className="text-amber-500 font-medium mb-2">
                      {item.welcomeText || "WELCOME FRESHEAT"}
                    </p>
                    <h2 className="text-5xl font-bold mb-4 leading-tight">
                      {item.title}
                      <br />
                      {item.subtitle}
                    </h2>
                    {item.description && (
                      <p className="text-gray-200 mb-6 max-w-md">
                        {item.description}
                      </p>
                    )}
                    <Button
                      onClick={item.buttonAction}
                      className="bg-red-600 hover:bg-red-700 text-white w-fit"
                    >
                      {item.buttonText}
                    </Button>
                  </div>

                  {/* Right side is the image which is already the background */}
                  <div className="animate-float">
                    <div className="relative h-[600px] w-[500px]">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
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

      {/* Navigation arrows */}
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 p-2 rounded-full text-white hover:bg-black/50 transition-colors z-10"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 p-2 rounded-full text-white hover:bg-black/50 transition-colors z-10"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Indicators */}
      {/* <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
        {items.map((_, index) => (
          <button
            key={index}
            className={`h-2 w-8 rounded-full transition-colors ${
              index === currentIndex ? "bg-white" : "bg-white/50"
            }`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div> */}
    </div>
  );
}
