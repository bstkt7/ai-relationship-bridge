import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Settings, Bell, Shield, Eye, EyeOff, MessageSquare, Users } from 'lucide-react';

interface CoupleSettingsProps {
  couple: {
    id: string;
    status: string;
  };
  onSettingsUpdate: () => void;
}

const CoupleSettings = ({ couple, onSettingsUpdate }: CoupleSettingsProps) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    privacyMode: false,
    autoSave: true,
    reminderEnabled: true,
    weeklyReport: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      // Здесь можно добавить сохранение настроек в базу данных
      // Пока что просто симулируем сохранение
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Настройки сохранены",
        description: "Ваши настройки были успешно обновлены",
      });
      
      onSettingsUpdate();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить настройки",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Настройки пары
        </CardTitle>
        <CardDescription>
          Управляйте настройками вашей пары и уведомлениями
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Уведомления */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Уведомления
          </h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Push-уведомления</Label>
                <p className="text-sm text-muted-foreground">
                  Получать уведомления о новых сообщениях
                </p>
              </div>
              <Switch
                id="notifications"
                checked={settings.notifications}
                onCheckedChange={(value) => handleSettingChange('notifications', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailAlerts">Email-уведомления</Label>
                <p className="text-sm text-muted-foreground">
                  Получать уведомления на email
                </p>
              </div>
              <Switch
                id="emailAlerts"
                checked={settings.emailAlerts}
                onCheckedChange={(value) => handleSettingChange('emailAlerts', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="reminderEnabled">Напоминания</Label>
                <p className="text-sm text-muted-foreground">
                  Напоминать о необходимости общения
                </p>
              </div>
              <Switch
                id="reminderEnabled"
                checked={settings.reminderEnabled}
                onCheckedChange={(value) => handleSettingChange('reminderEnabled', value)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Приватность */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Приватность
          </h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="privacyMode">Режим приватности</Label>
                <p className="text-sm text-muted-foreground">
                  Скрыть детали разговоров от внешних пользователей
                </p>
              </div>
              <Switch
                id="privacyMode"
                checked={settings.privacyMode}
                onCheckedChange={(value) => handleSettingChange('privacyMode', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoSave">Автосохранение</Label>
                <p className="text-sm text-muted-foreground">
                  Автоматически сохранять черновики сообщений
                </p>
              </div>
              <Switch
                id="autoSave"
                checked={settings.autoSave}
                onCheckedChange={(value) => handleSettingChange('autoSave', value)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Отчеты */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Отчеты и аналитика
          </h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weeklyReport">Еженедельные отчеты</Label>
                <p className="text-sm text-muted-foreground">
                  Получать еженедельные отчеты о активности пары
                </p>
              </div>
              <Switch
                id="weeklyReport"
                checked={settings.weeklyReport}
                onCheckedChange={(value) => handleSettingChange('weeklyReport', value)}
              />
            </div>
          </div>
        </div>

        {/* Статус пары */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">Статус пары</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {couple.status === 'active' 
              ? 'Ваша пара активна и готова к общению' 
              : 'Пара неактивна или ожидает второго участника'
            }
          </p>
        </div>

        {/* Кнопка сохранения */}
        <div className="flex justify-end pt-4">
          <Button 
            onClick={saveSettings} 
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            {isSaving ? 'Сохранение...' : 'Сохранить настройки'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CoupleSettings;
