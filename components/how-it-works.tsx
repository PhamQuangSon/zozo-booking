import { Check, Clock, QrCode } from "lucide-react";
import { useTranslations } from "next-intl";

export function HowItWorks() {
  const t = useTranslations("Home");

  const steps = [
    {
      icon: <QrCode className="h-10 w-10" />,
      title: t("how_it_works_step1"),
      description: t("how_it_works_desc1"),
    },
    {
      icon: <Clock className="h-10 w-10" />,
      title: t("how_it_works_step2"),
      description: t("how_it_works_desc2"),
    },
    {
      icon: <Check className="h-10 w-10" />,
      title: t("how_it_works_step3"),
      description: t("how_it_works_desc3"),
    },
  ];

  return (
    <section className="py-3">
      <div className="container mx-auto px-4 mb-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-orange-400 mb-2 animate animate-fade-up">
            {t("how_it_works_title")}
          </h2>
          <p className="text-muted-foreground">{t("how_it_works_subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center relative overflow-hidden rounded-3xl transition-all duration-300 hover:shadow-xl hover:translate-y-[-5px]"
            >
              <div className="flex items-center justify-center h-20 w-20 rounded-full bg-orange/10 text-orange-400 mb-4">
                {step.icon}
              </div>
              <div className="relative mb-4">
                <div className="text-2xl font-bold bg-orange text-orange-400 h-8 w-8 rounded-full flex items-center justify-center">
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className="absolute top-4 left-full w-full h-0.5 bg-orange/10 text-orange-400 hidden lg:block" />
                )}
              </div>
              <h3 className="text-xl font-semibold text-orange-400 mb-2 animate animate-fade-up">
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
