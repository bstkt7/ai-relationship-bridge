import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Bell, 
  CreditCard, 
  Shield, 
  Database, 
  Mail, 
  Globe, 
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface SystemSettings {
  // Общие настройки
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  
  // Настройки регистрации
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  
  // Лимиты
  freeMessagesLimit: number;
  plusMessagesLimit: number;
  infinityMessagesLimit: number;
  
  // Уведомления
  emailNotifications: boolean;
  pushNotifications: boolean;
  adminNotifications: boolean;
  
  // Безопасность
  sessionTimeout: number;
  maxLoginAttempts: number;
  enableTwoFactor: boolean;
  
  // AI настройки
  aiEnabled: boolean;
  aiRateLimit: number;
  aiCostPerMessage: number;
}

const SystemSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'BridgeAI',
    siteDescription: 'AI-посредник для пар',
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    freeMessagesLimit: 5,
    plusMessagesLimit: 50,
    infinityMessagesLimit: 1000,
    emailNotifications: true,
    pushNotifications: true,
    adminNotifications: true,
    sessionTimeout: 24,
    maxLoginAttempts: 5,
    enableTwoFactor: false,
    aiEnabled: true,
    aiRateLimit: 100,
    aiCostPerMessage: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // В реальном приложении здесь был бы запрос к API для загрузки настроек
      console.log('Loading system settings...');
    } catch (error) {
      console.error('Error loading system settings:', error);
    }
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      // В реальном приложении здесь был бы запрос к API для сохранения настроек
      await new Promise(resolve => setTimeout(resolve, 1000)); // Симуляция запроса
      
      setHasChanges(false);
      toast({
        title: "Настройки сохранены",
        description: "Системные настройки были успешно обновлены",
      });
    } catch (error) {
      console.error('Error saving system settings:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить настройки",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const resetSettings = () => {
    loadSettings();
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Системные настройки</h1>
        <p className="text-muted-foreground">Управление настройками системы BridgeAI</p>
      </div>

      {/* Статус системы */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Статус системы
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${settings.maintenanceMode ? 'bg-red-500' : 'bg-green-500'}`}></div>
                <div>
                  <p className="font-medium">Режим обслуживания</p>
                  <p className="text-sm text-muted-foreground">
                    {settings.maintenanceMode ? 'Включен' : 'Отключен'}
                  </p>
                </div>
              </div>
              <Badge variant={settings.maintenanceMode ? 'destructive' : 'default'}>
                {settings.maintenanceMode ? 'Включен' : 'Отключен'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${settings.allowRegistration ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div>
                  <p className="font-medium">Регистрация</p>
                  <p className="text-sm text-muted-foreground">
                    {settings.allowRegistration ? 'Разрешена' : 'Запрещена'}
                  </p>
                </div>
              </div>
              <Badge variant={settings.allowRegistration ? 'default' : 'destructive'}>
                {settings.allowRegistration ? 'Разрешена' : 'Запрещена'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${settings.aiEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div>
                  <p className="font-medium">AI сервис</p>
                  <p className="text-sm text-muted-foreground">
                    {settings.aiEnabled ? 'Активен' : 'Отключен'}
                  </p>
                </div>
              </div>
              <Badge variant={settings.aiEnabled ? 'default' : 'destructive'}>
                {settings.aiEnabled ? 'Активен' : 'Отключен'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Общие настройки */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Общие настройки
          </CardTitle>
          <CardDescription>
            Основные настройки сайта и системы
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Название сайта</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => handleSettingChange('siteName', e.target.value)}
                placeholder="BridgeAI"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteDescription">Описание сайта</Label>
              <Input
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                placeholder="AI-посредник для пар"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="maintenanceMode">Режим обслуживания</Label>
                <p className="text-sm text-muted-foreground">
                  Временно отключить сайт для обслуживания
                </p>
              </div>
              <Switch
                id="maintenanceMode"
                checked={settings.maintenanceMode}
                onCheckedChange={(value) => handleSettingChange('maintenanceMode', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allowRegistration">Разрешить регистрацию</Label>
                <p className="text-sm text-muted-foreground">
                  Позволить новым пользователям регистрироваться
                </p>
              </div>
              <Switch
                id="allowRegistration"
                checked={settings.allowRegistration}
                onCheckedChange={(value) => handleSettingChange('allowRegistration', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="requireEmailVerification">Требовать подтверждение email</Label>
                <p className="text-sm text-muted-foreground">
                  Обязательное подтверждение email при регистрации
                </p>
              </div>
              <Switch
                id="requireEmailVerification"
                checked={settings.requireEmailVerification}
                onCheckedChange={(value) => handleSettingChange('requireEmailVerification', value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Лимиты сообщений */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Лимиты сообщений
          </CardTitle>
          <CardDescription>
            Настройка лимитов для разных тарифных планов
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="freeMessagesLimit">Бесплатный план</Label>
              <Input
                id="freeMessagesLimit"
                type="number"
                value={settings.freeMessagesLimit}
                onChange={(e) => handleSettingChange('freeMessagesLimit', parseInt(e.target.value))}
                min="1"
              />
              <p className="text-sm text-muted-foreground">сообщений в день</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="plusMessagesLimit">Plus план</Label>
              <Input
                id="plusMessagesLimit"
                type="number"
                value={settings.plusMessagesLimit}
                onChange={(e) => handleSettingChange('plusMessagesLimit', parseInt(e.target.value))}
                min="1"
              />
              <p className="text-sm text-muted-foreground">сообщений в день</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="infinityMessagesLimit">Infinity план</Label>
              <Input
                id="infinityMessagesLimit"
                type="number"
                value={settings.infinityMessagesLimit}
                onChange={(e) => handleSettingChange('infinityMessagesLimit', parseInt(e.target.value))}
                min="1"
              />
              <p className="text-sm text-muted-foreground">сообщений в день</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Настройки уведомлений */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Уведомления
          </CardTitle>
          <CardDescription>
            Настройка системы уведомлений
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailNotifications">Email уведомления</Label>
              <p className="text-sm text-muted-foreground">
                Отправлять уведомления на email
              </p>
            </div>
            <Switch
              id="emailNotifications"
              checked={settings.emailNotifications}
              onCheckedChange={(value) => handleSettingChange('emailNotifications', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="pushNotifications">Push уведомления</Label>
              <p className="text-sm text-muted-foreground">
                Отправлять push уведомления в браузере
              </p>
            </div>
            <Switch
              id="pushNotifications"
              checked={settings.pushNotifications}
              onCheckedChange={(value) => handleSettingChange('pushNotifications', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="adminNotifications">Уведомления администратора</Label>
              <p className="text-sm text-muted-foreground">
                Уведомлять администратора о важных событиях
              </p>
            </div>
            <Switch
              id="adminNotifications"
              checked={settings.adminNotifications}
              onCheckedChange={(value) => handleSettingChange('adminNotifications', value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Настройки безопасности */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Безопасность
          </CardTitle>
          <CardDescription>
            Настройки безопасности системы
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Таймаут сессии (часы)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                min="1"
                max="168"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxLoginAttempts">Максимум попыток входа</Label>
              <Input
                id="maxLoginAttempts"
                type="number"
                value={settings.maxLoginAttempts}
                onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
                min="1"
                max="10"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enableTwoFactor">Двухфакторная аутентификация</Label>
              <p className="text-sm text-muted-foreground">
                Требовать 2FA для администраторов
              </p>
            </div>
            <Switch
              id="enableTwoFactor"
              checked={settings.enableTwoFactor}
              onCheckedChange={(value) => handleSettingChange('enableTwoFactor', value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* AI настройки */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            AI настройки
          </CardTitle>
          <CardDescription>
            Настройки искусственного интеллекта
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="aiEnabled">Включить AI</Label>
              <p className="text-sm text-muted-foreground">
                Разрешить использование AI в системе
              </p>
            </div>
            <Switch
              id="aiEnabled"
              checked={settings.aiEnabled}
              onCheckedChange={(value) => handleSettingChange('aiEnabled', value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="aiRateLimit">Лимит запросов AI (в час)</Label>
              <Input
                id="aiRateLimit"
                type="number"
                value={settings.aiRateLimit}
                onChange={(e) => handleSettingChange('aiRateLimit', parseInt(e.target.value))}
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aiCostPerMessage">Стоимость за сообщение</Label>
              <Input
                id="aiCostPerMessage"
                type="number"
                value={settings.aiCostPerMessage}
                onChange={(e) => handleSettingChange('aiCostPerMessage', parseInt(e.target.value))}
                min="1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Предупреждение о изменениях */}
      {hasChanges && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            У вас есть несохраненные изменения. Не забудьте сохранить настройки.
          </AlertDescription>
        </Alert>
      )}

      {/* Кнопки действий */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={resetSettings} disabled={isLoading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Сбросить
        </Button>
        <Button onClick={saveSettings} disabled={isLoading || !hasChanges}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Сохранение...' : 'Сохранить настройки'}
        </Button>
      </div>
    </div>
  );
};

export default SystemSettings;
