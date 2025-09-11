// netlify/functions/ai-mediator.js
import fetch from "node-fetch"; // если Node <18, иначе можно убрать
// или удалить совсем для Node 18+ (Netlify уже поддерживает глобальный fetch)

// Генерация случайного RqUID
const generateRqUID = () =>
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15);

export async function handler(event) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
    };
  }

  try {
    const { partner1_message, partner2_message } = JSON.parse(event.body || "{}");

    if (!partner1_message || !partner2_message) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Both partner messages are required" }),
      };
    }

    console.log("Processing messages...");

    // ==== 1. Получаем токен GigaChat ====
    const gigachatApiKey = process.env.GIGACHAT_API_KEY || "ВАШ_КЛЮЧ";
    const rqUID = generateRqUID();

    const tokenResponse = await fetch(
      "https://ngw.devices.sberbank.ru:9443/api/v2/oauth",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${gigachatApiKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
          RqUID: rqUID,
        },
        body: "scope=GIGACHAT_API_PERS",
      }
    );

    if (!tokenResponse.ok) {
      const text = await tokenResponse.text();
      throw new Error(`GigaChat token error: ${tokenResponse.status} ${text}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    if (!accessToken) throw new Error("No access_token in GigaChat response");

    // ==== 2. Запрос к GigaChat API ====
    const systemPrompt = `Ты опытный семейный психолог и медиатор для пар.
Давай анализировать сообщения партнеров и давать мягкие рекомендации для улучшения общения.
Отвечай на русском языке.`;

    const userPrompt = `Сообщение партнера 1: "${partner1_message}"
Сообщение партнера 2: "${partner2_message}"
Проанализируй эти сообщения и дай рекомендации.`;

    const response = await fetch(
      "https://gigachat.devices.sberbank.ru/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "GigaChat:latest",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`GigaChat API error: ${response.status} ${text}`);
    }

    const data = await response.json();
    const recommendation = data.choices?.[0]?.message?.content || "AI не дал ответа";

    // ==== 3. Простейший анализ эмоций ====
    const analyzeEmotion = (text) => {
      const positive = ["счастлив", "рад", "любл", "хорош", "отличн", "замечательн", "благодар"];
      const negative = ["грустн", "злой", "расстроен", "больн", "плох", "ужасн", "злость", "обид"];
      const lower = text.toLowerCase();

      let emotion = "neutral";
      let intensity = 0;

      positive.forEach((w) => { if (lower.includes(w)) { emotion = "positive"; intensity++; } });
      negative.forEach((w) => { if (lower.includes(w)) { emotion = "negative"; intensity++; } });

      return { emotion, intensity };
    };

    const partner1_emotion = analyzeEmotion(partner1_message);
    const partner2_emotion = analyzeEmotion(partner2_message);

    const emotion_analysis = {
      partner1: partner1_emotion,
      partner2: partner2_emotion,
      overall_tone:
        partner1_emotion.emotion === partner2_emotion.emotion ? "aligned" : "conflicted",
    };

    return {
      statusCode: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ recommendation, emotion_analysis }),
    };
  } catch (error) {
    console.error("AI Mediator error:", error);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.message }),
    };
  }
}
