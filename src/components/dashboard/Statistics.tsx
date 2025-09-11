import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Calendar, TrendingUp, Heart, Clock, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface StatisticsProps {
  coupleId: string;
  currentPlan: string;
  messagesUsed: number;
  messagesLimit: number;
}

interface ConversationStats {
  total_conversations: number;
  this_month: number;
  this_week: number;
  today: number;
}

const Statistics = ({ coupleId, currentPlan, messagesUsed, messagesLimit }: StatisticsProps) => {
  const [stats, setStats] = useState<ConversationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, [coupleId]);

  const fetchStatistics = async () => {
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Общее количество разговоров
      const { count: total } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('couple_id', coupleId);

      // Разговоры сегодня
      const { count: today } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('couple_id', coupleId)
        .gte('created_at', startOfDay.toISOString());

      // Разговоры на этой неделе
      const { count: thisWeek } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('couple_id', coupleId)
        .gte('created_at', startOfWeek.toISOString());

      // Разговоры в этом месяце
      const { count: thisMonth } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('couple_id', coupleId)
        .gte('created_at', startOfMonth.toISOString());

      setStats({
        total_conversations: total || 0,
        this_month: thisMonth || 0,
        this_week: thisWeek || 0,
        today: today || 0,
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getUsagePercentage = () => {
    return Math.round((messagesUsed / messagesLimit) * 100);
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'bg-green-100 text-green-800';
      case 'bridge_plus': return 'bg-blue-100 text-blue-800';
      case 'bridge_infinity': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanName = (plan: string) => {
    switch (plan) {
      case 'free': return 'Бесплатный';
      case 'bridge_plus': return 'Bridge Plus';
      case 'bridge_infinity': return 'Bridge Infinity';
      default: return 'Неизвестный';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Статистика
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Общая статистика */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Статистика разговоров
          </CardTitle>
          <CardDescription>
            Активность вашей пары в BridgeAI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <MessageCircle className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats?.total_conversations || 0}</p>
              <p className="text-sm text-muted-foreground">Всего разговоров</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Calendar className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats?.this_month || 0}</p>
              <p className="text-sm text-muted-foreground">В этом месяце</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats?.this_week || 0}</p>
              <p className="text-sm text-muted-foreground">На этой неделе</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Target className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats?.today || 0}</p>
              <p className="text-sm text-muted-foreground">Сегодня</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Использование лимитов */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Использование лимитов
          </CardTitle>
          <CardDescription>
            Ваш текущий тарифный план и использование
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Тарифный план:</span>
              <Badge className={getPlanColor(currentPlan)}>
                {getPlanName(currentPlan)}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {messagesUsed} / {messagesLimit} сообщений
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Использовано сообщений</span>
              <span>{getUsagePercentage()}%</span>
            </div>
            <Progress value={getUsagePercentage()} className="h-2" />
          </div>

          {getUsagePercentage() >= 80 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Вы использовали {getUsagePercentage()}% от лимита сообщений. 
                {currentPlan === 'free' && ' Рассмотрите возможность обновления тарифа.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Statistics;
