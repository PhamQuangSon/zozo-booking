import Image from "next/image"
import { Star } from "lucide-react"

const testimonials = [
  {
    id: "1",
    name: "Sarah Johnson",
    role: "Food Enthusiast",
    image: "/placeholder.svg?height=100&width=100",
    rating: 5,
    text: "Zozo Booking has completely transformed my dining experience. The QR code ordering system is so convenient, and I love being able to browse the full menu with photos before deciding.",
  },
  {
    id: "2",
    name: "Michael Chen",
    role: "Business Traveler",
    image: "/placeholder.svg?height=100&width=100",
    rating: 4,
    text: "As someone who travels frequently for work, finding good restaurants can be challenging. Zozo Booking makes it easy to discover local favorites and order without any language barriers.",
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    role: "Restaurant Owner",
    image: "/placeholder.svg?height=100&width=100",
    rating: 5,
    text: "Implementing Zozo Booking in our restaurant has increased our efficiency by 30%. Our customers love the digital menu, and our staff can focus more on providing excellent service.",
  },
]

export function Testimonials() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">What Our Users Say</h2>
          <p className="text-muted-foreground">Hear from our satisfied customers and restaurant partners</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="relative h-12 w-12 rounded-full overflow-hidden mr-4">
                  <Image
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold">{testimonial.name}</h3>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>

              <div className="flex mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>

              <p className="text-gray-600">{testimonial.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

