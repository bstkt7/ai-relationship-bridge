import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Crown, Zap, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentSectionProps {
  currentPlan?: string;
  messagesUsed?: number;
  messagesLimit?: number;
}

const PaymentSection = ({ currentPlan = 'free', messagesUsed = 0, messagesLimit = 5 }: PaymentSectionProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      name: 'Базовый',
      price: '0',
      period: 'навсегда',
      description: 'Для знакомства с сервисом',
      features: ['5 сообщений в день', 'Базовые рекомендации AI', 'Создание пары'],
      current: currentPlan === 'free',
      popular: false,
    },
    {
      name: 'Премиум',
      price: '799',
      period: 'в месяц',
      description: 'Полный доступ ко всем функциям',
      features: ['Безлимитные сообщения', 'Детальный анализ эмоций', 'Персональные рекомендации', 'Статистика отношений', 'Приоритетная поддержка'],
      current: currentPlan === 'premium',
      popular: true,
    },
  ];

  const handleUpgrade = async (planName: string) => {
    if (planName === 'Базовый') return;
    
    setLoading(true);
    try {
      // Here would be Stripe integration
      toast({
        title: "Скоро!",
        description: "Функция оплаты будет доступна в ближайшее время",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Что-то пошло не так",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          Тарифные планы
        </CardTitle>
        <CardDescription>
          Выберите подходящий план для ваших потребностей
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Usage */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Использовано сегодня</span>
            <span className="text-sm text-muted-foreground">{messagesUsed} из {messagesLimit}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${Math.min((messagesUsed / messagesLimit) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${
                plan.current 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-2 left-4 bg-primary text-primary-foreground">
                  <Crown className="h-3 w-3 mr-1" />
                  Популярный
                </Badge>
              )}
              
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-lg">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>
                
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold">₽{plan.price}</span>
                  <span className="text-sm text-muted-foreground ml-1">/{plan.period}</span>
                </div>
                
                <ul className="space-y-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button
                  onClick={() => handleUpgrade(plan.name)}
                  disabled={plan.current || loading}
                  className="w-full"
                  variant={plan.current ? "secondary" : "default"}
                >
                  {plan.current ? (
                    "Текущий план"
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Выбрать план
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentSection;