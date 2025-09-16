// Скрипт для диагностики проблем с GigaChat
// Запустите в консоли браузера для проверки

async function debugGigaChat() {
  console.log('🔍 Начинаем диагностику GigaChat...');
  
  const gigachatApiKey = 'NGQzNWJkMTgtMjhmMi00ODQzLTliZWEtZTllYzUwZmQ2MzUwOmYwZWE3NWI4LWM5ZTAtNDM1OC1iOWJjLWNmNGUzYjQwZmFiNA==';
  
  try {
    // Шаг 1: Тест получения токена
    console.log('🔐 Шаг 1: Получение токена...');
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

    console.log('📡 Ответ на токен:', {
      status: tokenResponse.status,
      statusText: tokenResponse.statusText,
      ok: tokenResponse.ok
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('❌ Ошибка получения токена:', errorText);
      return { success: false, step: 'token', error: errorText };
    }

    const tokenData = await tokenResponse.json();
    console.log('✅ Токен получен:', {
      hasToken: !!tokenData.access_token,
      expiresIn: tokenData.expires_in
    });

    // Шаг 2: Тест GigaChat API
    console.log('🤖 Шаг 2: Тест GigaChat API...');
    
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
            content: 'Ты семейный психолог. Отвечай кратко на русском языке.' 
          },
          { 
            role: 'user', 
            content: 'Партнер 1 говорит: "Я устал от работы". Партнер 2 говорит: "Ты никогда не помогаешь дома". Дай совет.' 
          }
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    console.log('📡 Ответ GigaChat API:', {
      status: chatResponse.status,
      statusText: chatResponse.statusText,
      ok: chatResponse.ok
    });

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text();
      console.error('❌ Ошибка GigaChat API:', errorText);
      return { success: false, step: 'api', error: errorText };
    }

    const chatData = await chatResponse.json();
    console.log('✅ Ответ получен:', {
      hasChoices: !!chatData.choices,
      choicesCount: chatData.choices?.length,
      recommendation: chatData.choices?.[0]?.message?.content
    });

    // Шаг 3: Тест Edge Function
    console.log('⚡ Шаг 3: Тест Edge Function...');
    
    const edgeFunctionResponse = await fetch(`${window.location.origin}/functions/v1/ai-mediator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')?.split('.')[1] || 'anon-key'}`
      },
      body: JSON.stringify({
        partner1_message: 'Я устал от работы',
        partner2_message: 'Ты никогда не помогаешь дома'
      })
    });

    console.log('📡 Edge Function ответ:', {
      status: edgeFunctionResponse.status,
      statusText: edgeFunctionResponse.statusText,
      ok: edgeFunctionResponse.ok
    });

    if (edgeFunctionResponse.ok) {
      const edgeData = await edgeFunctionResponse.json();
      console.log('✅ Edge Function работает:', edgeData);
      return { success: true, recommendation: edgeData.recommendation };
    } else {
      const errorText = await edgeFunctionResponse.text();
      console.error('❌ Edge Function ошибка:', errorText);
      return { success: false, step: 'edge-function', error: errorText };
    }

  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
    return { success: false, step: 'general', error: error.message };
  }
}

// Запуск диагностики
console.log('🚀 Запуск диагностики GigaChat...');
debugGigaChat().then(result => {
  console.log('🎯 Результат диагностики:', result);
  
  if (result.success) {
    console.log('✅ GigaChat работает корректно!');
  } else {
    console.log(`❌ Проблема на этапе: ${result.step}`);
    console.log(`💡 Ошибка: ${result.error}`);
  }
});