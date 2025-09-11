import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Heart, 
  Settings, 
  BarChart3, 
  CreditCard, 
  Shield, 
  Bot, 
  Database,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import UsersManagement from '@/components/admin/UsersManagement';
import CouplesManagement from '@/components/admin/CouplesManagement';
import AISettings from '@/components/admin/AISettings';
import BalanceManagement from '@/components/admin/BalanceManagement';
import SystemSettings from '@/components/admin/SystemSettings';

interface AdminStats {
  totalUsers: number;
  totalCouples: number;
  activeCouples: number;
  totalConversations: number;
  todayConversations: number;
}

const Admin = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      // Проверяем, является ли пользователь админом
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Временно проверяем по email (в продакшене лучше использовать роли)
      const adminEmails = ['admin@bridgeai.com', 'beest@example.com']; // Добавьте ваши админские email
      const isAdminUser = adminEmails.includes(user.email || '');

      if (!isAdminUser) {
        toast({
          title: "Доступ запрещен",
          description: "У вас нет прав администратора",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }

      setIsAdmin(true);
      fetchAdminStats();
    } catch (error) {
      console.error('Error checking admin access:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось проверить права доступа",
        variant: "destructive",
      });
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdminStats = async () => {
    try {
      // Получаем общую статистику
      const [usersResult, couplesResult, conversationsResult, todayConversationsResult] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('couples').select('*', { count: 'exact', head: true }),
        supabase.from('conversations').select('*', { count: 'exact', head: true }),
        supabase.from('conversations').select('*', { count: 'exact', head: true })
          .gte('created_at', new Date().toISOString().split('T')[0])
      ]);

      const activeCouplesResult = await supabase
        .from('couples')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      setStats({
        totalUsers: usersResult.count || 0,
        totalCouples: couplesResult.count || 0,
        activeCouples: activeCouplesResult.count || 0,
        totalConversations: conversationsResult.count || 0,
        todayConversations: todayConversationsResult.count || 0,
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const adminSections = [
    { id: 'dashboard', name: 'Панель управления', icon: BarChart3 },
    { id: 'users', name: 'Пользователи', icon: Users },
    { id: 'couples', name: 'Пары', icon: Heart },
    { id: 'ai-settings', name: 'AI Настройки', icon: Bot },
    { id: 'balance', name: 'Балансы', icon: CreditCard },
    { id: 'system', name: 'Система', icon: Settings },
  ];

  const renderSidebar = () => (
    <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
      <div className="flex items-center justify-between h-16 px-6 border-b border-border">
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">BridgeAI Admin</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <nav className="mt-6 px-3">
        <div className="space-y-1">
          {adminSections.map((section) => {
            const Icon = section.icon;
            return (
              <Button
                key={section.id}
                variant={currentSection === section.id ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => {
                  setCurrentSection(section.id);
                  setSidebarOpen(false);
                }}
              >
                <Icon className="h-4 w-4 mr-3" />
                {section.name}
              </Button>
            );
          })}
        </div>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Выход
        </Button>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Панель управления</h1>
        <p className="text-muted-foreground">Обзор системы BridgeAI</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Пользователи</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Всего зарегистрировано</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Пары</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCouples}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeCouples} активных
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Разговоры</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalConversations}</div>
              <p className="text-xs text-muted-foreground">
                {stats.todayConversations} сегодня
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Активность</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalCouples > 0 ? Math.round((stats.activeCouples / stats.totalCouples) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Активных пар</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Быстрые действия</CardTitle>
            <CardDescription>Часто используемые функции</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full justify-start" 
              onClick={() => setCurrentSection('users')}
            >
              <Users className="h-4 w-4 mr-3" />
              Управление пользователями
            </Button>
            <Button 
              className="w-full justify-start" 
              onClick={() => setCurrentSection('couples')}
            >
              <Heart className="h-4 w-4 mr-3" />
              Управление парами
            </Button>
            <Button 
              className="w-full justify-start" 
              onClick={() => setCurrentSection('ai-settings')}
            >
              <Bot className="h-4 w-4 mr-3" />
              Настройки AI
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Система</CardTitle>
            <CardDescription>Статус сервисов</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">База данных</span>
              <Badge variant="default">Онлайн</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">AI Сервис</span>
              <Badge variant="default">Онлайн</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">API</span>
              <Badge variant="default">Онлайн</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentSection) {
      case 'dashboard':
        return renderDashboard();
      case 'users':
        return <UsersManagement />;
      case 'couples':
        return <CouplesManagement />;
      case 'ai-settings':
        return <AISettings />;
      case 'balance':
        return <BalanceManagement />;
      case 'system':
        return <SystemSettings />;
      default:
        return renderDashboard();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-lavender-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Проверка прав доступа...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-lavender-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        {renderSidebar()}

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:ml-0">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between p-4 bg-card border-b border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <span className="font-semibold">BridgeAI Admin</span>
            <div></div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            <div className="container mx-auto px-4 py-6 max-w-7xl">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Admin;
