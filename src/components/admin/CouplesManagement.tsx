import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Search, Heart, Users, MessageCircle, Calendar, Eye, MoreHorizontal, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Couple {
  id: string;
  partner1_id: string;
  partner2_id: string | null;
  invite_code: string;
  status: string;
  created_at: string;
  updated_at: string;
  partner1_name?: string;
  partner2_name?: string;
  conversations_count?: number;
}

const CouplesManagement = () => {
  const { toast } = useToast();
  const [couples, setCouples] = useState<Couple[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCouple, setSelectedCouple] = useState<Couple | null>(null);

  useEffect(() => {
    fetchCouples();
  }, []);

  const fetchCouples = async () => {
    try {
      setIsLoading(true);
      
      // Получаем пары с информацией о партнерах
      const { data: couplesData, error: couplesError } = await supabase
        .from('couples')
        .select(`
          *,
          partner1:profiles!couples_partner1_id_fkey(first_name, last_name),
          partner2:profiles!couples_partner2_id_fkey(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (couplesError) throw couplesError;

      // Получаем количество разговоров для каждой пары
      const couplesWithStats = await Promise.all(
        (couplesData || []).map(async (couple) => {
          const { count: conversationsCount } = await supabase
            .from('conversations')
            .select('*', { count: 'exact', head: true })
            .eq('couple_id', couple.id);

          return {
            ...couple,
            partner1_name: couple.partner1 ? 
              `${couple.partner1.first_name} ${couple.partner1.last_name}` : 
              'Неизвестно',
            partner2_name: couple.partner2 ? 
              `${couple.partner2.first_name} ${couple.partner2.last_name}` : 
              'Не присоединился',
            conversations_count: conversationsCount || 0,
          };
        })
      );

      setCouples(couplesWithStats);
    } catch (error) {
      console.error('Error fetching couples:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список пар",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivateCouple = async (coupleId: string) => {
    try {
      const { error } = await supabase
        .from('couples')
        .update({ 
          status: 'inactive',
          updated_at: new Date().toISOString()
        })
        .eq('id', coupleId);

      if (error) throw error;

      toast({
        title: "Пара деактивирована",
        description: "Пара была успешно деактивирована",
      });
      fetchCouples();
    } catch (error) {
      console.error('Error deactivating couple:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось деактивировать пару",
        variant: "destructive",
      });
    }
  };

  const handleActivateCouple = async (coupleId: string) => {
    try {
      const { error } = await supabase
        .from('couples')
        .update({ 
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', coupleId);

      if (error) throw error;

      toast({
        title: "Пара активирована",
        description: "Пара была успешно активирована",
      });
      fetchCouples();
    } catch (error) {
      console.error('Error activating couple:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось активировать пару",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string, partner2_id: string | null) => {
    if (status === 'inactive') {
      return <Badge variant="destructive">Неактивна</Badge>;
    }
    if (partner2_id) {
      return <Badge variant="default">Активна</Badge>;
    }
    return <Badge variant="secondary">Ожидание</Badge>;
  };

  const filteredCouples = couples.filter(couple =>
    couple.invite_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    couple.partner1_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    couple.partner2_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Управление парами</CardTitle>
          <CardDescription>Загрузка списка пар...</CardDescription>
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
      <div>
        <h1 className="text-3xl font-bold">Управление парами</h1>
        <p className="text-muted-foreground">Просмотр и управление парами в системе</p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4 text-pink-600" />
              <div>
                <p className="text-sm font-medium">Всего пар</p>
                <p className="text-2xl font-bold">{couples.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Активных</p>
                <p className="text-2xl font-bold">
                  {couples.filter(c => c.status === 'active' && c.partner2_id).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">Ожидают</p>
                <p className="text-2xl font-bold">
                  {couples.filter(c => !c.partner2_id).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Разговоров</p>
                <p className="text-2xl font-bold">
                  {couples.reduce((sum, c) => sum + (c.conversations_count || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Список пар */}
      <Card>
        <CardHeader>
          <CardTitle>Список пар</CardTitle>
          <CardDescription>
            Найдено {filteredCouples.length} из {couples.length} пар
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по коду, имени партнера..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={fetchCouples}>
              Обновить
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Код приглашения</TableHead>
                  <TableHead>Партнер 1</TableHead>
                  <TableHead>Партнер 2</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Разговоры</TableHead>
                  <TableHead>Дата создания</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCouples.map((couple) => (
                  <TableRow key={couple.id}>
                    <TableCell>
                      <code className="bg-muted px-2 py-1 rounded text-sm">
                        {couple.invite_code}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{couple.partner1_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {couple.partner1_id.slice(0, 8)}...
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{couple.partner2_name}</p>
                        {couple.partner2_id && (
                          <p className="text-sm text-muted-foreground">
                            {couple.partner2_id.slice(0, 8)}...
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(couple.status, couple.partner2_id)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        <span>{couple.conversations_count}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(couple.created_at).toLocaleDateString('ru-RU')}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedCouple(couple)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Просмотр
                        </Button>
                        {couple.status === 'active' ? (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeactivateCouple(couple.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Деактивировать
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleActivateCouple(couple.id)}
                          >
                            Активировать
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CouplesManagement;
