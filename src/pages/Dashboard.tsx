import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { LogOut, Users, MessageCircle, Lightbulb, CreditCard, Copy, Check } from 'lucide-react';
import PaymentSection from '@/components/dashboard/PaymentSection';
import ConversationCard from '@/components/dashboard/ConversationCard';
import MobileNav from '@/components/dashboard/MobileNav';

interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
}

interface Couple {
  id: string;
  invite_code: string;
  status: string;
  partner1_id: string;
  partner2_id: string;
}

interface Conversation {
  id: string;
  partner1_message: string;
  partner2_message: string;
  ai_recommendation: string;
  emotion_analysis: any;
  created_at: string;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [couple, setCouple] = useState<Couple | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [myMessage, setMyMessage] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPartner1, setIsPartner1] = useState(false);
  const [currentSection, setCurrentSection] = useState('status');
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchUserData();
  }, [user, navigate]);

  const fetchUserData = async () => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);
      }

      // Fetch couple information
      const { data: coupleData } = await supabase
        .from('couples')
        .select('*')
        .or(`partner1_id.eq.${user?.id},partner2_id.eq.${user?.id}`)
        .single();

      if (coupleData) {
        setCouple(coupleData);
        setIsPartner1(coupleData.partner1_id === user?.id);
        fetchConversations(coupleData.id);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchConversations = async (coupleId: string) => {
    try {
      const { data } = await supabase
        .from('conversations')
        .select('*')
        .eq('couple_id', coupleId)
        .order('created_at', { ascending: false });

      if (data) {
        setConversations(data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const generateInviteCode = async () => {
    if (!user?.id) return;

    try {
      // Check if user already has a couple
      const { data: existingCouple } = await supabase
        .from('couples')
        .select('*')
        .or(`partner1_id.eq.${user.id},partner2_id.eq.${user.id}`)
        .single();

      if (existingCouple) {
        toast({
          title: "У вас уже есть пара",
          description: `Ваш код приглашения: ${existingCouple.invite_code}`,
          variant: "destructive",
        });
        return;
      }

      const { data } = await supabase.rpc('generate_invite_code');
      const newInviteCode = data;

      const { error } = await supabase
        .from('couples')
        .insert({
          partner1_id: user.id,
          partner2_id: user.id, // Temporary, will be updated when partner joins
          invite_code: newInviteCode,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Код приглашения создан!",
        description: `Поделитесь кодом с партнером: ${newInviteCode}`,
      });

      fetchUserData();
    } catch (error) {
      console.error('Error creating invite:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать код приглашения",
        variant: "destructive",
      });
    }
  };

  const joinCouple = async () => {
    if (!inviteCode.trim() || !user?.id) return;

    try {
      const { data, error } = await supabase.rpc('join_couple_by_invite_code', {
        invite_code_param: inviteCode.trim(),
        user_id_param: user.id
      });

      if (error) throw error;

      if (!data.success) {
        toast({
          title: "Ошибка",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Успешно!",
        description: data.message,
      });

      setInviteCode(''); // Clear the input
      fetchUserData();
    } catch (error) {
      console.error('Error joining couple:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось присоединиться к паре",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async () => {
    if (!myMessage.trim() || !couple) return;

    setLoading(true);
    try {
      // Get latest conversation to check if partner has sent a message
      const { data: latestConv } = await supabase
        .from('conversations')
        .select('*')
        .eq('couple_id', couple.id)
        .order('created_at', { ascending: false })
        .limit(1);

      let conversationId;
      const messageField = isPartner1 ? 'partner1_message' : 'partner2_message';
      const otherMessageField = isPartner1 ? 'partner2_message' : 'partner1_message';

      if (latestConv && latestConv.length > 0 && !latestConv[0][messageField] && latestConv[0][otherMessageField]) {
        // Update existing conversation
        conversationId = latestConv[0].id;
        await supabase
          .from('conversations')
          .update({ [messageField]: myMessage })
          .eq('id', conversationId);
      } else {
        // Create new conversation
        const { data: newConv } = await supabase
          .from('conversations')
          .insert({
            couple_id: couple.id,
            [messageField]: myMessage
          })
          .select()
          .single();
        
        conversationId = newConv?.id;
      }

      // Check if both messages are present, then call AI
      const { data: updatedConv } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (updatedConv && updatedConv.partner1_message && updatedConv.partner2_message && !updatedConv.ai_recommendation) {
        // Call AI function
        const { data: aiResponse } = await supabase.functions.invoke('ai-mediator', {
          body: {
            partner1_message: updatedConv.partner1_message,
            partner2_message: updatedConv.partner2_message
          }
        });

        if (aiResponse) {
          await supabase
            .from('conversations')
            .update({
              ai_recommendation: aiResponse.recommendation,
              emotion_analysis: aiResponse.emotion_analysis
            })
            .eq('id', conversationId);
        }
      }

      setMyMessage('');
      fetchConversations(couple.id);
      
      toast({
        title: "Сообщение отправлено",
        description: "Ваше сообщение было отправлено AI",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось отправить сообщение",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

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

  if (!profile) {
    return <div className="min-h-screen bg-gradient-to-br from-sky-50 to-lavender-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Загрузка...</p>
      </div>
    </div>;
  }

  const renderDesktopSidebar = () => (
    <div className="hidden md:block w-64 bg-card border-r border-border p-6">
      <div className="space-y-4">
        <div className="flex items-center mb-6">
          <img 
            src="/lovable-uploads/a82b8ac7-60ed-4cd5-8df5-0ad981eaf185.png" 
            alt="BridgeAI Logo" 
            className="w-6 h-6 object-contain mr-2"
          />
          <h2 className="text-lg font-bold text-primary">BridgeAI</h2>
        </div>
        
        <div className="mb-6 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">Привет,</p>
          <p className="font-medium">{profile?.first_name || 'друг'}!</p>
        </div>

        <nav className="space-y-2">
          <Button
            variant={currentSection === 'status' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentSection('status')}
          >
            <Users className="h-4 w-4 mr-3" />
            Статус пары
          </Button>
          <Button
            variant={currentSection === 'message' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentSection('message')}
          >
            <MessageCircle className="h-4 w-4 mr-3" />
            Сообщения
          </Button>
          <Button
            variant={currentSection === 'recommendations' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentSection('recommendations')}
          >
            <Lightbulb className="h-4 w-4 mr-3" />
            Рекомендации
          </Button>
          <Button
            variant={currentSection === 'payment' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentSection('payment')}
          >
            <CreditCard className="h-4 w-4 mr-3" />
            Тарифы
          </Button>
        </nav>

        <div className="mt-auto pt-6 border-t">
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
    </div>
  );

  const renderSectionContent = () => {
    if (!couple) {
      return (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Подключение к партнеру
            </CardTitle>
            <CardDescription>
              Создайте код приглашения или присоединитесь к существующей паре
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Button onClick={generateInviteCode} className="w-full">
                Создать код приглашения
              </Button>
              <p className="text-sm text-muted-foreground mt-2 text-center">
                Создайте код и поделитесь им с партнером
              </p>
            </div>

            <div className="text-center">
              <span className="text-muted-foreground">или</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-code">Код приглашения партнера</Label>
              <div className="flex space-x-2">
                <Input
                  id="invite-code"
                  placeholder="Введите код"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="uppercase"
                />
                <Button onClick={joinCouple} disabled={!inviteCode.trim()}>
                  Присоединиться
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    switch (currentSection) {
      case 'status':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Статус пары
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    Код пары: <span className="font-mono font-bold">{couple.invite_code}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Статус: <span className={`font-semibold ${couple.status === 'active' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {couple.status === 'active' ? 'Активна' : 'Ожидание партнера'}
                    </span>
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyInviteCode(couple.invite_code)}
                  className="ml-4"
                >
                  {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'message':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="h-5 w-5 mr-2" />
                Поделиться мыслями
              </CardTitle>
              <CardDescription>
                Напишите о ваших чувствах. Только AI увидит ваше сообщение.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Поделитесь своими мыслями и чувствами..."
                value={myMessage}
                onChange={(e) => setMyMessage(e.target.value)}
                className="min-h-[120px]"
              />
              <Button 
                onClick={sendMessage} 
                disabled={!myMessage.trim() || loading}
                className="w-full"
              >
                {loading ? "Отправка..." : "Отправить AI"}
              </Button>
            </CardContent>
          </Card>
        );

      case 'recommendations':
        return conversations.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="h-5 w-5 mr-2" />
                Советы от AI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {conversations.map((conv) => (
                <ConversationCard key={conv.id} conversation={conv} />
              ))}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="h-5 w-5 mr-2" />
                Советы от AI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Пока нет рекомендаций. Отправьте сообщение, чтобы получить советы от AI.
              </p>
            </CardContent>
          </Card>
        );

      case 'payment':
        return <PaymentSection currentPlan="free" messagesUsed={2} messagesLimit={5} />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-blue-light/20 to-lavender-light/20">
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        {renderDesktopSidebar()}
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/a82b8ac7-60ed-4cd5-8df5-0ad981eaf185.png" 
                alt="BridgeAI Logo" 
                className="w-6 h-6 object-contain mr-2"
              />
              <h1 className="text-lg font-bold text-primary">BridgeAI</h1>
            </div>
            <MobileNav
              currentSection={currentSection}
              onSectionChange={setCurrentSection}
              onSignOut={handleSignOut}
              userName={profile?.first_name}
            />
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto">
            <div className="container mx-auto px-4 py-6 max-w-4xl">
              {renderSectionContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;