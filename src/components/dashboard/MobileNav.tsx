import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Heart, Users, MessageCircle, Lightbulb, CreditCard, LogOut } from 'lucide-react';

interface MobileNavProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
  onSignOut: () => void;
  userName?: string;
}

const MobileNav = ({ currentSection, onSectionChange, onSignOut, userName }: MobileNavProps) => {
  const [open, setOpen] = useState(false);

  const sections = [
    { id: 'status', label: 'Статус пары', icon: Users },
    { id: 'message', label: 'Сообщения', icon: MessageCircle },
    { id: 'recommendations', label: 'Рекомендации', icon: Lightbulb },
    { id: 'payment', label: 'Тарифы', icon: CreditCard },
  ];

  const handleSectionClick = (sectionId: string) => {
    onSectionChange(sectionId);
    setOpen(false);
  };

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center mb-6">
              <Heart className="h-6 w-6 text-primary mr-2" />
              <h2 className="text-lg font-bold text-primary">BridgeAI</h2>
            </div>

            {/* User Info */}
            <div className="mb-6 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Привет,</p>
              <p className="font-medium">{userName || 'друг'}!</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <Button
                    key={section.id}
                    variant={currentSection === section.id ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => handleSectionClick(section.id)}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {section.label}
                  </Button>
                );
              })}
            </nav>

            {/* Sign Out */}
            <div className="mt-auto pt-6 border-t">
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={onSignOut}
              >
                <LogOut className="h-4 w-4 mr-3" />
                Выход
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileNav;