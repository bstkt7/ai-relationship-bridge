import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Sparkles, Infinity, Heart } from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      name: "Free",
      price: "0₽",
      period: "навсегда",
      description: "Попробуйте BridgeAI бесплатно",
      icon: Heart,
      features: [
        "5 сообщений в день",
        "Базовые советы от AI",
        "Индикатор эмоций",
        "История за 7 дней"
      ],
      buttonText: "Начать бесплатно",
      buttonVariant: "soft" as const,
      popular: false
    },
    {
      name: "Bridge+",
      price: "490₽",
      period: "в месяц",
      description: "Для активных пар",
      icon: Sparkles,
      features: [
        "Безлимитные сообщения",
        "Расширенные советы AI",
        "Подробный анализ эмоций",
        "Полная история сообщений",
        "Персональные рекомендации",
        "Поддержка 24/7"
      ],
      buttonText: "Выбрать Bridge+",
      buttonVariant: "hero" as const,
      popular: true
    },
    {
      name: "Bridge∞",
      price: "990₹",
      period: "в месяц",
      description: "Максимальные возможности",
      icon: Infinity,
      features: [
        "Всё из Bridge+",
        "Анализ динамики отношений",
        "Еженедельные отчёты",
        "Геймификация (очки близости)",
        "Задания от AI",
        "Приоритетная поддержка",
        "Экспорт данных"
      ],
      buttonText: "Выбрать Bridge∞",
      buttonVariant: "hero" as const,
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-20">
      <div className="container max-w-screen-xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Выберите свой <span className="bg-gradient-to-r from-sky-blue to-lavender bg-clip-text text-transparent">тариф</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Начните бесплатно или выберите план для полного доступа к возможностям BridgeAI
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-card transition-all duration-300 hover:scale-105 ${
                plan.popular ? 'ring-2 ring-sky-blue shadow-card' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-sky-blue to-lavender text-white px-4 py-1 rounded-full text-sm font-medium">
                    Популярный
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  plan.popular 
                    ? 'bg-gradient-to-r from-sky-blue to-lavender' 
                    : 'bg-lavender-light'
                }`}>
                  <plan.icon className={`w-6 h-6 ${plan.popular ? 'text-white' : 'text-lavender'}`} />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold">
                  {plan.price}
                  <span className="text-sm font-normal text-muted-foreground">/{plan.period}</span>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <Check className="w-4 h-4 text-sky-blue flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button variant={plan.buttonVariant} className="w-full mt-6">
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;