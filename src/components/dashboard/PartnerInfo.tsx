import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { User, Calendar, MessageCircle, Heart, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PartnerInfoProps {
  couple: {
    id: string;
    partner1_id: string;
    partner2_id: string | null;
    status: string;
    created_at: string;
  };
  currentUserId: string;
}

interface PartnerProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  created_at: string;
}

const PartnerInfo = ({ couple, currentUserId }: PartnerInfoProps) => {
  const { toast } = useToast();
  const [partnerProfile, setPartnerProfile] = useState<PartnerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isPartner1 = couple.partner1_id === currentUserId;
  // Партнер - это тот, кто НЕ является текущим пользователем
  const partnerId = isPartner1 ? couple.partner2_id : couple.partner1_id;

  useEffect(() => {
    if (partnerId) {
      fetchPartnerProfile();
    } else {
      setIsLoading(false);
    }
  }, [partnerId]);

  const fetchPartnerProfile = async () => {
    if (!partnerId) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', partnerId)
        .single();

      if (error) throw error;

      setPartnerProfile(data);
    } catch (error) {
      console.error('Error fetching partner profile:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить информацию о партнере",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPartnerInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getTimeTogether = () => {
    const createdDate = new Date(couple.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 день";
    if (diffDays < 7) return `${diffDays} дня`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} недель`;
    return `${Math.floor(diffDays / 30)} месяцев`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Информация о партнере
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!partnerId || !partnerProfile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Информация о партнере
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Партнер еще не присоединился к паре
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Поделитесь кодом приглашения, чтобы партнер мог присоединиться
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Информация о партнере
        </CardTitle>
        <CardDescription>
          Данные о вашем партнере в паре
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Аватар и основная информация */}
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={partnerProfile.avatar_url} />
            <AvatarFallback className="text-lg">
              {getPartnerInitials(partnerProfile.first_name, partnerProfile.last_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold">
                {partnerProfile.first_name} {partnerProfile.last_name}
              </h3>
              {!isPartner1 && (
                <Badge variant="outline" className="text-xs">
                  <Crown className="h-3 w-3 mr-1" />
                  Создатель пары
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              В паре {getTimeTogether()}
            </p>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <Calendar className="h-5 w-5 text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Присоединился</p>
            <p className="font-semibold">
              {new Date(partnerProfile.created_at).toLocaleDateString('ru-RU')}
            </p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <MessageCircle className="h-5 w-5 text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Статус</p>
            <p className="font-semibold">
              {couple.status === 'active' && couple.partner2_id ? 'Активен' : 'Неактивен'}
            </p>
          </div>
        </div>

        {/* Дополнительная информация */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">ID пользователя:</span>
            <code className="text-xs bg-muted px-2 py-1 rounded">
              {partnerProfile.user_id.slice(0, 8)}...
            </code>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Роль в паре:</span>
            <span>{!isPartner1 ? 'Создатель пары' : 'Участник пары'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PartnerInfo;
