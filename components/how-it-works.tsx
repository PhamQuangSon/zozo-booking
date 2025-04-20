import { Check, Clock, QrCode } from "lucide-react";

const steps = [
  {
    icon: <QrCode className="h-10 w-10" />,
    title: "Scan QR Code",
    description: "Scan the QR code at your table to access the digital menu.",
  },
  {
    icon: <Clock className="h-10 w-10" />,
    title: "Place Order",
    description:
      "Select your items, customize as needed, and place your order.",
  },
  {
    icon: <Check className="h-10 w-10" />,
    title: "Enjoy Your Meal",
    description:
      "Sit back and relax while your food is prepared and served to your table.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-3">
      <div className="container mx-auto px-4 mb-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2 animate animate-fade-up">
            How It Works
          </h2>
          <p className="text-muted-foreground">
            Simple steps to order food with Zozo Booking
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center relative overflow-hidden rounded-3xl transition-all duration-300 hover:shadow-xl hover:translate-y-[-5px]"
            >
              <div className="flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 text-primary mb-4">
                {step.icon}
              </div>
              <div className="relative mb-4">
                <div className="text-2xl font-bold bg-primary text-white h-8 w-8 rounded-full flex items-center justify-center">
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className="absolute top-4 left-full w-full h-0.5 bg-gray-200 hidden lg:block" />
                )}
              </div>
              <h3 className="text-xl font-semibold mb-2 animate animate-fade-up">
                {step.title}
              </h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
