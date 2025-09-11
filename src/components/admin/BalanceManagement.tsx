import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Search, CreditCard, Plus, Minus, History, Eye, Calendar, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface BalanceTransaction {
  id: string;
  couple_id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  created_at: string;
  couple_code?: string;
  partner1_name?: string;
  partner2_name?: string;
}

interface CoupleBalance {
  couple_id: string;
  invite_code: string;
  partner1_name: string;
  partner2_name: string;
  current_balance: number;
  total_earned: number;
  total_spent: number;
  last_transaction: string;
}

const BalanceManagement = () => {
  const { toast } = useToast();
  const [couples, setCouples] = useState<CoupleBalance[]>([]);
  const [transactions, setTransactions] = useState<BalanceTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCouple, setSelectedCouple] = useState<string>('');
  const [showAddBalance, setShowAddBalance] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceDescription, setBalanceDescription] = useState('');

  useEffect(() => {
    fetchBalances();
    fetchTransactions();
  }, []);

  const fetchBalances = async () => {
    try {
      // Получаем пары с информацией о балансах
      const { data: couplesData, error: couplesError } = await supabase
        .from('couples')
        .select(`
          id,
          invite_code,
          partner1:profiles!couples_partner1_id_fkey(first_name, last_name),
          partner2:profiles!couples_partner2_id_fkey(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (couplesError) throw couplesError;

      // Симулируем данные о балансах (в реальном приложении это было бы в отдельной таблице)
      const couplesWithBalances = (couplesData || []).map(couple => ({
        couple_id: couple.id,
        invite_code: couple.invite_code,
        partner1_name: couple.partner1 ? 
          `${couple.partner1.first_name} ${couple.partner1.last_name}` : 
          'Неизвестно',
        partner2_name: couple.partner2 ? 
          `${couple.partner2.first_name} ${couple.partner2.last_name}` : 
          'Не присоединился',
        current_balance: Math.floor(Math.random() * 1000), // Симуляция
        total_earned: Math.floor(Math.random() * 2000), // Симуляция
        total_spent: Math.floor(Math.random() * 1000), // Симуляция
        last_transaction: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      }));

      setCouples(couplesWithBalances);
    } catch (error) {
      console.error('Error fetching balances:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные о балансах",
        variant: "destructive",
      });
    }
  };

  const fetchTransactions = async () => {
    try {
      // Симулируем данные о транзакциях
      const mockTransactions: BalanceTransaction[] = [
        {
          id: '1',
          couple_id: 'couple-1',
          amount: 100,
          type: 'credit',
          description: 'Пополнение баланса',
          created_at: new Date().toISOString(),
          couple_code: 'ABC12345',
          partner1_name: 'Иван Иванов',
          partner2_name: 'Мария Петрова',
        },
        {
          id: '2',
          couple_id: 'couple-1',
          amount: 50,
          type: 'debit',
          description: 'Списание за AI консультацию',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          couple_code: 'ABC12345',
          partner1_name: 'Иван Иванов',
          partner2_name: 'Мария Петрова',
        },
      ];

      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBalance = async () => {
    if (!selectedCouple || !balanceAmount) {
      toast({
        title: "Ошибка",
        description: "Выберите пару и введите сумму",
        variant: "destructive",
      });
      return;
    }

    try {
      // В реальном приложении здесь был бы запрос к API для добавления баланса
      await new Promise(resolve => setTimeout(resolve, 1000)); // Симуляция
      
      toast({
        title: "Баланс пополнен",
        description: `Добавлено ${balanceAmount} кредитов`,
      });

      setBalanceAmount('');
      setBalanceDescription('');
      setShowAddBalance(false);
      fetchBalances();
      fetchTransactions();
    } catch (error) {
      console.error('Error adding balance:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось пополнить баланс",
        variant: "destructive",
      });
    }
  };

  const filteredCouples = couples.filter(couple =>
    couple.invite_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    couple.partner1_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    couple.partner2_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalBalance = couples.reduce((sum, couple) => sum + couple.current_balance, 0);
  const totalEarned = couples.reduce((sum, couple) => sum + couple.total_earned, 0);
  const totalSpent = couples.reduce((sum, couple) => sum + couple.total_spent, 0);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Управление балансами</CardTitle>
          <CardDescription>Загрузка данных о балансах...</CardDescription>
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
        <h1 className="text-3xl font-bold">Управление балансами</h1>
        <p className="text-muted-foreground">Управление балансами и транзакциями пар</p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Общий баланс</p>
                <p className="text-2xl font-bold">{totalBalance}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Plus className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Всего заработано</p>
                <p className="text-2xl font-bold">{totalEarned}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Minus className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium">Всего потрачено</p>
                <p className="text-2xl font-bold">{totalSpent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Активных пар</p>
                <p className="text-2xl font-bold">{couples.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Пополнение баланса */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Пополнение баланса
          </CardTitle>
          <CardDescription>
            Добавление кредитов на баланс пары
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="couple">Выберите пару</Label>
              <select
                id="couple"
                value={selectedCouple}
                onChange={(e) => setSelectedCouple(e.target.value)}
                className="w-full p-2 border border-input rounded-md"
              >
                <option value="">Выберите пару...</option>
                {couples.map(couple => (
                  <option key={couple.couple_id} value={couple.couple_id}>
                    {couple.invite_code} - {couple.partner1_name} & {couple.partner2_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Сумма</Label>
              <Input
                id="amount"
                type="number"
                value={balanceAmount}
                onChange={(e) => setBalanceAmount(e.target.value)}
                placeholder="Введите сумму..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Input
                id="description"
                value={balanceDescription}
                onChange={(e) => setBalanceDescription(e.target.value)}
                placeholder="Описание транзакции..."
              />
            </div>
          </div>
          <Button onClick={handleAddBalance} disabled={!selectedCouple || !balanceAmount}>
            <Plus className="h-4 w-4 mr-2" />
            Пополнить баланс
          </Button>
        </CardContent>
      </Card>

      {/* Список балансов */}
      <Card>
        <CardHeader>
          <CardTitle>Балансы пар</CardTitle>
          <CardDescription>
            Текущие балансы всех пар в системе
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по коду или имени партнера..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={fetchBalances}>
              Обновить
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Код пары</TableHead>
                  <TableHead>Партнеры</TableHead>
                  <TableHead>Текущий баланс</TableHead>
                  <TableHead>Заработано</TableHead>
                  <TableHead>Потрачено</TableHead>
                  <TableHead>Последняя транзакция</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCouples.map((couple) => (
                  <TableRow key={couple.couple_id}>
                    <TableCell>
                      <code className="bg-muted px-2 py-1 rounded text-sm">
                        {couple.invite_code}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{couple.partner1_name}</p>
                        <p className="text-sm text-muted-foreground">{couple.partner2_name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={couple.current_balance > 0 ? 'default' : 'secondary'}>
                        {couple.current_balance} кредитов
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-green-600 font-medium">
                        +{couple.total_earned}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-red-600 font-medium">
                        -{couple.total_spent}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(couple.last_transaction).toLocaleDateString('ru-RU')}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedCouple(couple.couple_id);
                            setShowAddBalance(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Пополнить
                        </Button>
                        <Button size="sm" variant="ghost">
                          <History className="h-4 w-4 mr-1" />
                          История
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* История транзакций */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            История транзакций
          </CardTitle>
          <CardDescription>
            Последние транзакции в системе
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата</TableHead>
                  <TableHead>Пара</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Описание</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {new Date(transaction.created_at).toLocaleDateString('ru-RU')}
                    </TableCell>
                    <TableCell>
                      <div>
                        <code className="bg-muted px-2 py-1 rounded text-sm">
                          {transaction.couple_code}
                        </code>
                        <p className="text-sm text-muted-foreground">
                          {transaction.partner1_name} & {transaction.partner2_name}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={transaction.type === 'credit' ? 'default' : 'destructive'}>
                        {transaction.type === 'credit' ? 'Пополнение' : 'Списание'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${
                        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'}{transaction.amount}
                      </span>
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
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

export default BalanceManagement;
