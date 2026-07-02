import { Star } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

export function Testimonials() {
  const t = useTranslations("Home");

  const testimonials = [
    {
      id: "1",
      name: "Sarah Johnson",
      role: t("testim_role_1"),
      image: "/menuThumb1_1.png",
      rating: 5,
      text: t("testim_text_1"),
    },
    {
      id: "2",
      name: "Michael Chen",
      role: t("testim_role_2"),
      image: "/menuThumb1_2.png",
      rating: 4,
      text: t("testim_text_2"),
    },
    {
      id: "3",
      name: "Emily Rodriguez",
      role: t("testim_role_3"),
      image: "/menuThumb1_3.png",
      rating: 5,
      text: t("testim_text_3"),
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-orange-400 mb-2 animate animate-fade-up">
            {t("testimonials_title")}
          </h2>
          <p className="text-muted-foreground">
            {t("testimonials_desc")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="p-5 relative overflow-hidden rounded-3xl bg-gradient-to-b from-white/80 to-white/20 backdrop-blur-sm border border-white/20 shadow-lg transition-all duration-300 hover:shadow-xl hover:translate-y-[-5px]"
            >
              <div className="flex items-center mb-4">
                <div className="relative h-12 w-12 rounded-full overflow-hidden mr-4">
                  <Image
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
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
  );
}
