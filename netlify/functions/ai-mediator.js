// netlify/functions/ai-mediator.js
import fetch from "node-fetch";

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
    };
  }

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  try {
    const { partner1_message, partner2_message } = JSON.parse(event.body);

    if (!partner1_message || !partner2_message) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Both partner messages are required" }),
      };
    }

    console.log("Processing messages...");

    // === 1. Получаем токен GigaChat ===
    const rqUID = crypto.randomUUID();

    // ⚠️ токен бери из переменных окружения Netlify (в настройках site > Environment Variables)
    const gigachatApiKey =
      process.env.GIGACHAT_API_KEY ||
      "NGQzNWJk...ВАШ_КЛЮЧ...";

    const tokenResponse = await fetch("https://ngw.devices.sberbank.ru:9443/api/v2/oauth", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${gigachatApiKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        RqUID: rqUID,
      },
      body: "scope=GIGACHAT_API_PERS",
    });

    if (!tokenResponse.ok) {
      throw new Error(`GigaChat token error: ${tokenResponse.status} ${await tokenResponse.text()}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    if (!accessToken) throw new Error("No access_token in GigaChat response");

    // === 2. Запрос к GigaChat API ===
    const systemPrompt = `Ты опытный семейный психолог... (тот же текст из Supabase версии)`;

    const userPrompt = `Сообщение партнера 1: "${partner1_message}"\n
Сообщение партнера 2: "${partner2_message}"\n
Проанализируй и дай рекомендации.`;

    const response = await fetch("https://gigachat.devices.sberbank.ru/api/v1/chat/completions", {
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
    });

    if (!response.ok) {
      throw new Error(`GigaChat API error: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    const recommendation = data.choices?.[0]?.message?.content || "AI не дал ответа";

    // === 3. Эмоции (простейший анализ) ===
    const analyzeEmotion = (text) => {
      const positiveWords = ["счастлив", "рад", "любл", "хорош", "отличн", "замечательн", "благодар"];
      const negativeWords = ["грустн", "злой", "расстроен", "больн", "плох", "ужасн", "злость", "обид"];
      const lower = text.toLowerCase();

      let emotion = "neutral";
      let intensity = 0;

      for (const w of positiveWords) if (lower.includes(w)) { emotion = "positive"; intensity++; }
      for (const w of negativeWords) if (lower.includes(w)) { emotion = "negative"; intensity++; }

      return { emotion, intensity };
    };

    const partner1_emotion = analyzeEmotion(partner1_message);
    const partner2_emotion = analyzeEmotion(partner2_message);

    const emotion_analysis = {
      partner1: partner1_emotion,
      partner2: partner2_emotion,
      overall_tone: partner1_emotion.emotion === partner2_emotion.emotion ? "aligned" : "conflicted",
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.message }),
    };
  }
}
