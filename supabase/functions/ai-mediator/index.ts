import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const gigachatApiKey = Deno.env.get('GIGACHAT_API_KEY') || 'NGQzNWJkMTgtMjhmMi00ODQzLTliZWEtZTllYzUwZmQ2MzUwOmYwZWE3NWI4LWM5ZTAtNDM1OC1iOWJjLWNmNGUzYjQwZmFiNA==';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { partner1_message, partner2_message } = await req.json();

    if (!partner1_message || !partner2_message) {
      return new Response(
        JSON.stringify({ error: 'Both partner messages are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Processing messages from both partners...');

    const systemPrompt = `Ты опытный семейный психолог и медиатор для пар. Твоя задача - анализировать сообщения партнеров и давать мягкие, конструктивные рекомендации для улучшения общения.

Принципы работы:
- Будь эмпатичным и понимающим
- Не вынось суждений и не обвиняй
- Фокусируйся на решениях, а не на проблемах
- Предлагай конкретные шаги для улучшения понимания
- Используй теплый, поддерживающий тон
- Отвечай на русском языке

Анализируй эмоции, потребности и предлагай пути к взаимопониманию.`;

    const userPrompt = `Сообщение партнера 1: "${partner1_message}"

Сообщение партнера 2: "${partner2_message}"

Проанализируй эти сообщения и дай рекомендации для улучшения понимания между партнерами.`;

    // Получаем токен доступа для GigaChat
    const rqUID = crypto.randomUUID();
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
      const errorText = await tokenResponse.text();
      console.error('GigaChat token error:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorText,
        rqUID: rqUID
      });
      throw new Error(`GigaChat token error: ${tokenResponse.status} - ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('GigaChat token received successfully');
    
    if (!tokenData.access_token) {
      console.error('No access token in response:', tokenData);
      throw new Error('No access token received from GigaChat');
    }
    
    const accessToken = tokenData.access_token;

    // Отправляем запрос к GigaChat API
    const response = await fetch('https://gigachat.devices.sberbank.ru/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        model: 'GigaChat:latest',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GigaChat API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`GigaChat API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('GigaChat API response received:', { 
      choices: data.choices?.length,
      usage: data.usage 
    });
    
    if (!data.choices || data.choices.length === 0) {
      console.error('No choices in GigaChat response:', data);
      throw new Error('No response choices from GigaChat');
    }
    
    const recommendation = data.choices[0].message.content;

    // Simple emotion analysis based on keywords
    const analyzeEmotion = (text: string) => {
      const positiveWords = ['счастлив', 'рад', 'любл', 'хорош', 'отличн', 'замечательн', 'благодар'];
      const negativeWords = ['грустн', 'злой', 'расстроен', 'больн', 'плох', 'ужасн', 'злость', 'обид'];
      const neutralWords = ['думаю', 'считаю', 'возможно', 'наверн', 'кажется'];

      const lowerText = text.toLowerCase();
      let emotion = 'neutral';
      let intensity = 0;

      positiveWords.forEach(word => {
        if (lowerText.includes(word)) {
          emotion = 'positive';
          intensity += 1;
        }
      });

      negativeWords.forEach(word => {
        if (lowerText.includes(word)) {
          emotion = 'negative';
          intensity += 1;
        }
      });

      return { emotion, intensity };
    };

    const partner1_emotion = analyzeEmotion(partner1_message);
    const partner2_emotion = analyzeEmotion(partner2_message);

    const emotion_analysis = {
      partner1: partner1_emotion,
      partner2: partner2_emotion,
      overall_tone: partner1_emotion.emotion === partner2_emotion.emotion ? 'aligned' : 'conflicted'
    };

    console.log('AI recommendation generated successfully');

    return new Response(
      JSON.stringify({ 
        recommendation, 
        emotion_analysis 
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in ai-mediator function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});