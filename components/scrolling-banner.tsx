"use client";

import { useEffect, useRef, useState } from "react";

interface ScrollingBannerProps {
  text?: string;
  speed?: number;
  className?: string;
  repeat?: number;
}

export function ScrollingBanner({
  text = "CHICKEN PIZZA   GRILLED CHICKEN   BURGER   CHICKEN PASTA",
  speed = 50,
  className = "",
  repeat = 10,
}: ScrollingBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }

    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const animationDuration = containerWidth / speed;

  return (
    <div
      ref={containerRef}
      className={`hidden md:block bg-gray-100 py-4 overflow-hidden whitespace-nowrap ${className}`}
    >
      <div
        className="inline-block"
        style={{
          animation: `marquee ${animationDuration}s linear infinite`,
        }}
      >
        {Array(repeat)
          .fill(0)
          .map((_, i) => (
            <span key={i} className="text-3xl text-gray-300 font-bold mx-4">
              {text} &nbsp;
            </span>
          ))}
      </div>
    </div>
  );
}
