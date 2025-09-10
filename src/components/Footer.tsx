import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-soft-gray-light/50 border-t border-border/40">
      <div className="container max-w-screen-xl py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-sky-blue to-lavender rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-sky-blue to-lavender bg-clip-text text-transparent">
                BridgeAI
              </span>
            </div>
            <p className="text-muted-foreground max-w-md">
              Цифровой посредник для пар. Помогаем строить крепкие отношения через понимание и доверие.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Сервис</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">О сервисе</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Как работает</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Тарифы</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Поддержка</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Помощь</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Контакты</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Политика конфиденциальности</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Условия использования</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border/40 mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© 2024 BridgeAI. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;