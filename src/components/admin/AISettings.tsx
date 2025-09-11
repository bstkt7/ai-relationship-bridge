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
import { Bot, Key, Settings, TestTube, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

interface AISettings {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  enabled: boolean;
  rateLimit: number;
  customPrompt: string;
}

const AISettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AISettings>({
    apiKey: '',
    model: 'gpt-3.5-turbo',
    maxTokens: 1000,
    temperature: 0.7,
    enabled: true,
    rateLimit: 100,
    customPrompt: 'Ты - AI-посредник для пар. Помогай разрешать конфликты и улучшать общение между партнерами.',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // В реальном приложении здесь был бы запрос к API для загрузки настроек
      // Пока что используем значения по умолчанию
      console.log('Loading AI settings...');
    } catch (error) {
      console.error('Error loading AI settings:', error);
    }
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      // В реальном приложении здесь был бы запрос к API для сохранения настроек
      await new Promise(resolve => setTimeout(resolve, 1000)); // Симуляция запроса
      
      toast({
        title: "Настройки сохранены",
        description: "Настройки AI были успешно обновлены",
      });
    } catch (error) {
      console.error('Error saving AI settings:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить настройки",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testAIConnection = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      // В реальном приложении здесь был бы тестовый запрос к AI API
      await new Promise(resolve => setTimeout(resolve, 2000)); // Симуляция запроса
      
      setTestResult('success');
      toast({
        title: "Тест успешен",
        description: "AI API работает корректно",
      });
    } catch (error) {
      console.error('Error testing AI connection:', error);
      setTestResult('error');
      toast({
        title: "Ошибка теста",
        description: "Не удалось подключиться к AI API",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = (key: keyof AISettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Настройки AI</h1>
        <p className="text-muted-foreground">Управление настройками искусственного интеллекта</p>
      </div>

      {/* Статус AI */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Статус AI сервиса
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${settings.enabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div>
                <p className="font-medium">
                  {settings.enabled ? 'AI сервис активен' : 'AI сервис отключен'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {settings.enabled ? 'Готов к обработке запросов' : 'Не обрабатывает запросы'}
                </p>
              </div>
            </div>
            <Badge variant={settings.enabled ? 'default' : 'destructive'}>
              {settings.enabled ? 'Активен' : 'Отключен'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Основные настройки */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Основные настройки
          </CardTitle>
          <CardDescription>
            Конфигурация AI модели и параметров
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="apiKey">API ключ</Label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Input
                  id="apiKey"
                  type={showApiKey ? 'text' : 'password'}
                  value={settings.apiKey}
                  onChange={(e) => handleSettingChange('apiKey', e.target.value)}
                  placeholder="Введите API ключ..."
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button variant="outline" onClick={testAIConnection} disabled={isLoading}>
                <TestTube className="h-4 w-4 mr-2" />
                Тест
              </Button>
            </div>
            {testResult && (
              <Alert className={testResult === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                {testResult === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={testResult === 'success' ? 'text-green-800' : 'text-red-800'}>
                  {testResult === 'success' 
                    ? 'Подключение к AI API успешно установлено' 
                    : 'Ошибка подключения к AI API'
                  }
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Модель */}
          <div className="space-y-2">
            <Label htmlFor="model">Модель AI</Label>
            <Input
              id="model"
              value={settings.model}
              onChange={(e) => handleSettingChange('model', e.target.value)}
              placeholder="gpt-3.5-turbo"
            />
          </div>

          {/* Максимальные токены */}
          <div className="space-y-2">
            <Label htmlFor="maxTokens">Максимальные токены</Label>
            <Input
              id="maxTokens"
              type="number"
              value={settings.maxTokens}
              onChange={(e) => handleSettingChange('maxTokens', parseInt(e.target.value))}
              min="1"
              max="4000"
            />
          </div>

          {/* Температура */}
          <div className="space-y-2">
            <Label htmlFor="temperature">Температура (креативность)</Label>
            <Input
              id="temperature"
              type="number"
              step="0.1"
              min="0"
              max="2"
              value={settings.temperature}
              onChange={(e) => handleSettingChange('temperature', parseFloat(e.target.value))}
            />
            <p className="text-sm text-muted-foreground">
              0 = детерминированный, 2 = очень креативный
            </p>
          </div>

          {/* Лимит запросов */}
          <div className="space-y-2">
            <Label htmlFor="rateLimit">Лимит запросов в час</Label>
            <Input
              id="rateLimit"
              type="number"
              value={settings.rateLimit}
              onChange={(e) => handleSettingChange('rateLimit', parseInt(e.target.value))}
              min="1"
            />
          </div>

          {/* Включение/отключение */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enabled">Включить AI сервис</Label>
              <p className="text-sm text-muted-foreground">
                Разрешить обработку запросов через AI
              </p>
            </div>
            <Switch
              id="enabled"
              checked={settings.enabled}
              onCheckedChange={(value) => handleSettingChange('enabled', value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Кастомный промпт */}
      <Card>
        <CardHeader>
          <CardTitle>Кастомный промпт</CardTitle>
          <CardDescription>
            Настройка поведения AI для вашего приложения
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={settings.customPrompt}
            onChange={(e) => handleSettingChange('customPrompt', e.target.value)}
            placeholder="Введите кастомный промпт для AI..."
            className="min-h-[120px]"
          />
          <p className="text-sm text-muted-foreground mt-2">
            Этот промпт будет использоваться для всех запросов к AI
          </p>
        </CardContent>
      </Card>

      {/* Кнопки действий */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={loadSettings}>
          Сбросить
        </Button>
        <Button onClick={saveSettings} disabled={isLoading}>
          {isLoading ? 'Сохранение...' : 'Сохранить настройки'}
        </Button>
      </div>
    </div>
  );
};

export default AISettings;
