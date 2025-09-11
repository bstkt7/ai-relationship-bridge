import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Copy, RefreshCw, Trash2, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface InviteCodeManagementProps {
  couple: {
    id: string;
    invite_code: string;
    status: string;
    partner1_id: string;
    partner2_id: string | null;
    created_at: string;
    updated_at: string;
  };
  isPartner1: boolean;
  onCoupleUpdate: () => void;
}

const InviteCodeManagement = ({ couple, isPartner1, onCoupleUpdate }: InviteCodeManagementProps) => {
  const { toast } = useToast();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const copyInviteCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      toast({
        title: "Код скопирован!",
        description: "Код приглашения скопирован в буфер обмена",
      });
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось скопировать код",
        variant: "destructive",
      });
    }
  };

  const regenerateInviteCode = async () => {
    if (!isPartner1) {
      toast({
        title: "Нет доступа",
        description: "Только создатель пары может пересоздать код",
        variant: "destructive",
      });
      return;
    }

    setIsRegenerating(true);
    try {
      const { data: newCode } = await supabase.rpc('generate_invite_code');
      
      const { error } = await supabase
        .from('couples')
        .update({ 
          invite_code: newCode,
          updated_at: new Date().toISOString()
        })
        .eq('id', couple.id);

      if (error) throw error;

      toast({
        title: "Код обновлен!",
        description: `Новый код: ${newCode}`,
      });

      onCoupleUpdate();
    } catch (error) {
      console.error('Error regenerating code:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось пересоздать код",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const deactivateCouple = async () => {
    setIsDeactivating(true);
    try {
      const { error } = await supabase
        .from('couples')
        .update({ 
          status: 'inactive',
          updated_at: new Date().toISOString()
        })
        .eq('id', couple.id);

      if (error) throw error;

      toast({
        title: "Пара деактивирована",
        description: "Ваша пара была деактивирована",
      });

      onCoupleUpdate();
    } catch (error) {
      console.error('Error deactivating couple:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось деактивировать пару",
        variant: "destructive",
      });
    } finally {
      setIsDeactivating(false);
    }
  };

  const getStatusInfo = () => {
    if (couple.status === 'inactive') {
      return {
        icon: <AlertCircle className="h-4 w-4" />,
        text: "Деактивирована",
        variant: "destructive" as const,
        description: "Пара была деактивирована"
      };
    }
    
    if (couple.partner2_id) {
      return {
        icon: <CheckCircle className="h-4 w-4" />,
        text: "Активна",
        variant: "default" as const,
        description: "Оба партнера подключены"
      };
    }
    
    return {
      icon: <Clock className="h-4 w-4" />,
      text: "Ожидание партнера",
      variant: "secondary" as const,
      description: "Ожидается присоединение второго партнера"
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Управление кодом приглашения
        </CardTitle>
        <CardDescription>
          Управляйте кодом приглашения и статусом вашей пары
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Статус пары */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            {statusInfo.icon}
            <div>
              <p className="font-medium">Статус пары</p>
              <p className="text-sm text-muted-foreground">{statusInfo.description}</p>
            </div>
          </div>
          <Badge variant={statusInfo.variant}>
            {statusInfo.text}
          </Badge>
        </div>

        {/* Код приглашения */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Код приглашения</label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyInviteCode(couple.invite_code)}
                disabled={copiedCode}
              >
                {copiedCode ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              {isPartner1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={regenerateInviteCode}
                  disabled={isRegenerating}
                >
                  <RefreshCw className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                </Button>
              )}
            </div>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <code className="text-lg font-mono font-bold">{couple.invite_code}</code>
          </div>
        </div>

        {/* Информация о создании */}
        <div className="text-sm text-muted-foreground">
          <p>Создано: {new Date(couple.created_at).toLocaleDateString('ru-RU')}</p>
          <p>Обновлено: {new Date(couple.updated_at).toLocaleDateString('ru-RU')}</p>
        </div>

        {/* Предупреждение о пересоздании кода */}
        {isPartner1 && couple.partner2_id && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Пересоздание кода отключит текущего партнера. Убедитесь, что партнер готов к новому коду.
            </AlertDescription>
          </Alert>
        )}

        {/* Действия */}
        <div className="flex gap-2 pt-4 border-t">
          {isPartner1 && couple.status !== 'inactive' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={deactivateCouple}
              disabled={isDeactivating}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeactivating ? 'Деактивация...' : 'Деактивировать пару'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InviteCodeManagement;
