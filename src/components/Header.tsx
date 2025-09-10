import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-xl items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-8 h-8 bg-gradient-to-r from-sky-blue to-lavender rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-sky-blue to-lavender bg-clip-text text-transparent">
              BridgeAI
            </span>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Как работает
          </a>
          <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Тарифы
          </a>
          <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            О сервисе
          </a>
        </nav>

        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={() => window.location.href = '/auth'}>
            Войти
          </Button>
          <Button variant="hero" size="sm" onClick={() => window.location.href = '/auth'}>
            Попробовать бесплатно
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;