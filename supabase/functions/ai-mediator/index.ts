import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Функция для генерации уникального RqUID
function generateRqUID(): string {
  return crypto.randomUUID();
}

// Функция анализа эмоций (базовая)
function analyzeEmotion(text: string): string {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('злой') || lowerText.includes('достал') || lowerText.includes('упрек')) {
    return 'раздражение';
  } else if (lowerText.includes('грустн') || lowerText.includes('печал')) {
    return 'грусть';
  } else if (lowerText.includes('радост') || lowerText.includes('счастлив')) {
    return 'радость';
  } else if (lowerText.includes('страх') || lowerText.includes('боюсь')) {
    return 'страх';
  }
  
  return 'нейтрально';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 AI Mediator function called');
    
    // Получаем API ключ GigaChat
    const gigachatApiKey = Deno.env.get('GIGACHAT_API_KEY');
    console.log('🔑 GigaChat API key available:', !!gigachatApiKey);
    
    if (!gigachatApiKey) {
      console.error('❌ GIGACHAT_API_KEY not found in environment variables');
      return new Response(
        JSON.stringify({ 
          error: 'GIGACHAT_API_KEY not configured',
          recommendation: 'Извините, ИИ-медиатор временно недоступен. Попробуйте решить конфликт самостоятельно.' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Парсим сообщения от партнеров
    const { partner1_message, partner2_message } = await req.json();
    console.log('📨 Messages received:', { partner1_message, partner2_message });

    if (!partner1_message || !partner2_message) {
      return new Response(
        JSON.stringify({ 
          error: 'Both partner messages are required',
          recommendation: 'Дождитесь сообщения от партнера для получения рекомендации.' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Шаг 1: Получаем токен доступа от GigaChat
    console.log('🔐 Requesting token from GigaChat...');
    const rqUID = generateRqUID();
    
    const tokenResponse = await fetch('https://ngw.devices.sberbank.ru:9443/api/v2/oauth', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${gigachatApiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'RqUID': rqUID,
      },
      body: 'scope=GIGACHAT_API_PERS',
    });

    if (!tokenResponse.ok) {
      console.error('❌ Token request failed:', tokenResponse.status, await tokenResponse.text());
      return new Response(
        JSON.stringify({ 
          error: 'Failed to get GigaChat token',
          recommendation: 'ИИ-медиатор временно недоступен. Постарайтесь выслушать друг друга и найти компромисс.' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const tokenData = await tokenResponse.json();
    console.log('✅ Token data received:', { hasToken: !!tokenData.access_token });

    // Шаг 2: Отправляем запрос к GigaChat API
    console.log('🤖 Sending chat request to GigaChat...');
    
    const chatResponse = await fetch('https://gigachat.devices.sberbank.ru/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        model: 'GigaChat:latest',
        messages: [
          {
            role: 'system',
            content: `Ты опытный семейный психолог и медиатор. Твоя задача - помочь паре решить конфликт, проанализировав сообщения обеих сторон. 

Правила:
- Отвечай только на русском языке
- Будь объективным и деликатным
- Предложи конкретные шаги для решения конфликта
- Помоги понять позицию каждой стороны
- Ответ должен быть кратким (максимум 150 слов)
- Не принимай ничью сторону, будь нейтральным медиатором`
          },
          {
            role: 'user',
            content: `Партнер 1 говорит: "${partner1_message}"

Партнер 2 отвечает: "${partner2_message}"

Проанализируй ситуацию и дай совет, как лучше решить этот конфликт.`
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!chatResponse.ok) {
      console.error('❌ Chat request failed:', chatResponse.status, await chatResponse.text());
      return new Response(
        JSON.stringify({ 
          error: 'Failed to get GigaChat response',
          recommendation: 'ИИ-медиатор временно недоступен. Рекомендую открыто поговорить друг с другом о ваших чувствах.' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const chatData = await chatResponse.json();
    console.log('✅ Chat data received:', { hasChoices: !!chatData.choices });

    const recommendation = chatData.choices?.[0]?.message?.content || 'Попробуйте выслушать друг друга и найти компромисс.';
    console.log('💡 Recommendation received:', recommendation);

    // Анализируем эмоции
    const partner1Emotion = analyzeEmotion(partner1_message);
    const partner2Emotion = analyzeEmotion(partner2_message);

    const emotionAnalysis = {
      partner1_emotion: partner1Emotion,
      partner2_emotion: partner2Emotion,
      overall_tone: partner1Emotion === 'раздражение' || partner2Emotion === 'раздражение' ? 'напряженный' : 'спокойный'
    };

    return new Response(
      JSON.stringify({
        recommendation,
        emotion_analysis: emotionAnalysis,
        success: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Critical error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        recommendation: 'Произошла техническая ошибка. Постарайтесь решить конфликт, выслушав друг друга.' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});