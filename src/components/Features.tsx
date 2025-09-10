import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Heart, MessageCircle, BarChart3 } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Shield,
      title: "Полная конфиденциальность",
      description: "Ваши сообщения видит только AI. Партнёр получает мягкие рекомендации, а не ваши слова напрямую."
    },
    {
      icon: Heart,
      title: "Эмоциональный интеллект",
      description: "AI анализирует не только слова, но и эмоции, помогая понять истинные потребности каждого."
    },
    {
      icon: MessageCircle,
      title: "Мягкие советы",
      description: "Никаких резких суждений. Только деликатные рекомендации для улучшения взаимопонимания."
    },
    {
      icon: BarChart3,
      title: "Анализ динамики",
      description: "Отслеживайте прогресс ваших отношений и получайте персональные инсайты."
    }
  ];

  return (
    <section id="features" className="py-20 bg-soft-gray-light/30">
      <div className="container max-w-screen-xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Как работает <span className="bg-gradient-to-r from-sky-blue to-lavender bg-clip-text text-transparent">BridgeAI</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Простой и безопасный способ улучшить общение в отношениях
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-card transition-all duration-300 hover:scale-105">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-sky-blue to-lavender rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;