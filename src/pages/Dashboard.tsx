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
import { Heart, LogOut, Users, MessageCircle, Lightbulb } from 'lucide-react';

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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [couple, setCouple] = useState<Couple | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [myMessage, setMyMessage] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPartner1, setIsPartner1] = useState(false);

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
    try {
      const { data } = await supabase.rpc('generate_invite_code');
      const newInviteCode = data;

      const { error } = await supabase
        .from('couples')
        .insert({
          partner1_id: user?.id,
          partner2_id: user?.id, // Temporary, will be updated when partner joins
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
    if (!inviteCode.trim()) return;

    try {
      const { data: existingCouple } = await supabase
        .from('couples')
        .select('*')
        .eq('invite_code', inviteCode.toUpperCase())
        .single();

      if (!existingCouple) {
        toast({
          title: "Код не найден",
          description: "Проверьте правильность кода приглашения",
          variant: "destructive",
        });
        return;
      }

      if (existingCouple.partner1_id === user?.id) {
        toast({
          title: "Это ваш собственный код",
          description: "Вы не можете присоединиться к своему же коду",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('couples')
        .update({
          partner2_id: user?.id,
          status: 'active'
        })
        .eq('id', existingCouple.id);

      if (error) throw error;

      toast({
        title: "Успешно!",
        description: "Вы присоединились к паре",
      });

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

  if (!profile) {
    return <div className="min-h-screen bg-gradient-to-br from-sky-50 to-lavender-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Загрузка...</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-lavender-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <Heart className="h-8 w-8 text-primary mr-2" />
            <h1 className="text-2xl font-bold text-primary">BridgeAI</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-muted-foreground">
              Привет, {profile.first_name || 'друг'}!
            </span>
            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Выход
            </Button>
          </div>
        </div>

        {!couple ? (
          /* No couple setup */
          <div className="max-w-2xl mx-auto">
            <Card className="mb-6">
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
          </div>
        ) : (
          /* Main dashboard */
          <div className="max-w-4xl mx-auto grid gap-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Статус пары
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Код пары: <span className="font-mono font-bold">{couple.invite_code}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Статус: <span className={`font-semibold ${couple.status === 'active' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {couple.status === 'active' ? 'Активна' : 'Ожидание партнера'}
                      </span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Message Input */}
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

            {/* AI Recommendations */}
            {conversations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2" />
                    Советы от AI
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {conversations.map((conv) => (
                    <div key={conv.id} className="border rounded-lg p-4 space-y-3">
                      {conv.ai_recommendation ? (
                        <div className="bg-sky-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-primary mb-2">Рекомендация AI:</h4>
                          <p className="text-sm">{conv.ai_recommendation}</p>
                        </div>
                      ) : (
                        <div className="bg-yellow-50 p-4 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            {conv.partner1_message && conv.partner2_message 
                              ? "AI анализирует ваши сообщения..." 
                              : "Ожидание сообщения от партнера..."}
                          </p>
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {new Date(conv.created_at).toLocaleString('ru-RU')}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;