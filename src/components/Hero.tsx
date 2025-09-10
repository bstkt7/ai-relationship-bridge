import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-bridge.jpg";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-sky-blue-light/20 to-lavender-light/30 py-20 md:py-32">
      <div className="container max-w-screen-xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 bg-lavender-light rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-lavender" />
              <span className="text-sm font-medium text-lavender-dark">
                Цифровой посредник для пар
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              <span className="bg-gradient-to-r from-sky-blue to-lavender bg-clip-text text-transparent">
                BridgeAI
              </span>
              <br />
              <span className="text-foreground">
                твой мост от ссор к пониманию
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0">
              Говори честно, услышь мягко. Искусственный интеллект поможет найти общий язык, анализируя ваши мысли и эмоции с заботой и пониманием.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button variant="hero" size="lg" className="text-lg px-8" onClick={() => window.location.href = '/auth'}>
                Попробовать бесплатно
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button variant="soft" size="lg" className="text-lg px-8" onClick={() => window.location.href = '#features'}>
                Узнать больше
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mt-4">
              Бесплатно • 5 сообщений в день • Без регистрации
            </p>
          </div>
          
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-card bg-gradient-card">
              <img 
                src={heroImage} 
                alt="Два человека соединены светящимся AI-мостом" 
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-sky-blue/10 to-transparent"></div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-lavender to-sky-blue rounded-full opacity-20 blur-xl animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-sky-blue to-lavender rounded-full opacity-30 blur-lg animate-pulse delay-1000"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;