import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, await response.text());
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
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