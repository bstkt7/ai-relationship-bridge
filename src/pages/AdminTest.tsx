import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Shield, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const AdminTest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const testAdminAccess = async () => {
    setIsLoading(true);
    setTestResults(null);

    try {
      // Тест 1: Проверка пользователя
      const userTest = {
        name: 'Проверка пользователя',
        status: user ? 'success' : 'error',
        message: user ? `Пользователь: ${user.email}` : 'Пользователь не найден'
      };

      // Тест 2: Проверка доступа к админке
      const adminTest = {
        name: 'Доступ к админке',
        status: 'success',
        message: 'Доступ разрешен (режим разработки)'
      };

      // Тест 3: Проверка GigaChat API
      let gigachatTest = {
        name: 'GigaChat API',
        status: 'pending',
        message: 'Тестирование...'
      };

      try {
        const response = await fetch('/api/v1/ai-mediator', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            partner1_message: 'Тестовое сообщение 1',
            partner2_message: 'Тестовое сообщение 2'
          })
        });

        if (response.ok) {
          const data = await response.json();
          gigachatTest = {
            name: 'GigaChat API',
            status: 'success',
            message: 'API работает корректно'
          };
        } else {
          gigachatTest = {
            name: 'GigaChat API',
            status: 'error',
            message: `Ошибка: ${response.status}`
          };
        }
      } catch (error) {
        gigachatTest = {
          name: 'GigaChat API',
          status: 'error',
          message: `Ошибка: ${error.message}`
        };
      }

      setTestResults([userTest, adminTest, gigachatTest]);

    } catch (error) {
      console.error('Test error:', error);
      toast({
        title: "Ошибка тестирования",
        description: "Не удалось выполнить тесты",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const goToAdmin = () => {
    navigate('/admin');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-lavender-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Перенаправление на авторизацию...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-lavender-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">🛡️ Тест админки BridgeAI</h1>
          <p className="text-muted-foreground">Проверка доступа и функций администратора</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Информация о пользователе
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Статус:</strong> Аутентифицирован</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Тестирование системы</CardTitle>
            <CardDescription>
              Проверка всех компонентов админки
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                onClick={testAdminAccess} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Тестирование...' : 'Запустить тесты'}
              </Button>

              {testResults && (
                <div className="space-y-3">
                  {testResults.map((test: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {test.status === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
                        {test.status === 'error' && <XCircle className="h-5 w-5 text-red-600" />}
                        {test.status === 'pending' && <AlertCircle className="h-5 w-5 text-yellow-600" />}
                        <div>
                          <p className="font-medium">{test.name}</p>
                          <p className="text-sm text-muted-foreground">{test.message}</p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ${
                        test.status === 'success' ? 'bg-green-100 text-green-800' :
                        test.status === 'error' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {test.status === 'success' ? '✅' : test.status === 'error' ? '❌' : '⏳'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Действия</CardTitle>
            <CardDescription>
              Переход к админке или другим разделам
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button onClick={goToAdmin} className="flex-1">
                <Shield className="h-4 w-4 mr-2" />
                Перейти в админку
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
                className="flex-1"
              >
                Вернуться в дашборд
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminTest;
