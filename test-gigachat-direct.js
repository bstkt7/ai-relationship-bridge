// Прямой тест GigaChat API
// Запустите в консоли браузера для проверки работы API

async function testGigaChatDirect() {
  console.log('🚀 Начинаем прямой тест GigaChat API...');
  
  const gigachatApiKey = 'NGQzNWJkMTgtMjhmMi00ODQzLTliZWEtZTllYzUwZmQ2MzUwOmYwZWE3NWI4LWM5ZTAtNDM1OC1iOWJjLWNmNGUzYjQwZmFiNA==';
  
  try {
    // Шаг 1: Получаем токен
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
      ok: tokenResponse.ok,
      headers: Object.fromEntries(tokenResponse.headers.entries())
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('❌ Ошибка получения токена:', errorText);
      return { success: false, step: 'token', error: errorText };
    }

    const tokenData = await tokenResponse.json();
    console.log('✅ Токен получен:', {
      hasToken: !!tokenData.access_token,
      expiresIn: tokenData.expires_in,
      tokenType: tokenData.token_type
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
            content: 'Партнер 1 говорит: "Я устал от работы". Партнер 2 говорит: "Ты никогда не помогаешь дома". Дай краткий совет для решения конфликта.' 
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    console.log('📡 Ответ GigaChat API:', {
      status: chatResponse.status,
      statusText: chatResponse.statusText,
      ok: chatResponse.ok,
      headers: Object.fromEntries(chatResponse.headers.entries())
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
      recommendation: chatData.choices?.[0]?.message?.content,
      usage: chatData.usage
    });

    // Шаг 3: Тест Edge Function
    console.log('⚡ Шаг 3: Тест Supabase Edge Function...');
    
    const edgeFunctionResponse = await fetch('https://fhtvxziachtotvtjxsgp.supabase.co/functions/v1/ai-mediator', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZodHZ4emlhY2h0b3R2dGp4c2dwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0OTgwNDgsImV4cCI6MjA3MzA3NDA0OH0.o0BfPTD6a97EHPebkWSLZCIiCJNRVrWpYzvT3cowbSM`
      },
      body: JSON.stringify({
        partner1_message: 'Я устал от работы',
        partner2_message: 'Ты никогда не помогаешь дома'
      })
    });

    console.log('📡 Edge Function ответ:', {
      status: edgeFunctionResponse.status,
      statusText: edgeFunctionResponse.statusText,
      ok: edgeFunctionResponse.ok,
      headers: Object.fromEntries(edgeFunctionResponse.headers.entries())
    });

    if (edgeFunctionResponse.ok) {
      const edgeData = await edgeFunctionResponse.json();
      console.log('✅ Edge Function работает:', edgeData);
      return { 
        success: true, 
        recommendation: edgeData.recommendation,
        emotion_analysis: edgeData.emotion_analysis 
      };
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

// Функция для проверки статуса GigaChat API ключа
async function checkApiKeyStatus() {
  console.log('🔍 Проверяем статус API ключа...');
  
  try {
    const response = await fetch('https://ngw.devices.sberbank.ru:9443/api/v2/oauth', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer NGQzNWJkMTgtMjhmMi00ODQzLTliZWEtZTllYzUwZmQ2MzUwOmYwZWE3NWI4LWM5ZTAtNDM1OC1iOWJjLWNmNGUzYjQwZmFiNA==`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'RqUID': crypto.randomUUID(),
      },
      body: 'scope=GIGACHAT_API_PERS',
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API ключ работает, токен получен');
      return true;
    } else {
      const error = await response.text();
      console.error('❌ API ключ не работает:', response.status, error);
      return false;
    }
  } catch (error) {
    console.error('❌ Ошибка проверки ключа:', error);
    return false;
  }
}

// Запуск всех тестов
console.log('🎯 Запуск полной диагностики GigaChat...');

// Сначала проверяем API ключ
checkApiKeyStatus().then(keyValid => {
  if (keyValid) {
    console.log('✅ API ключ валиден, продолжаем тест...');
    return testGigaChatDirect();
  } else {
    console.log('❌ API ключ не работает, тест остановлен');
    return { success: false, error: 'Invalid API key' };
  }
}).then(result => {
  console.log('🎯 Итоговый результат диагностики:', result);
  
  if (result.success) {
    console.log('🎉 GigaChat API работает корректно!');
    console.log('💡 Рекомендация:', result.recommendation);
  } else {
    console.log(`❌ Проблема на этапе: ${result.step}`);
    console.log(`💡 Ошибка: ${result.error}`);
    
    // Предложения по исправлению
    if (result.step === 'token') {
      console.log('🔧 Возможные решения:');
      console.log('- Проверьте правильность API ключа');
      console.log('- Убедитесь что API ключ не истек');
      console.log('- Проверьте доступ к интернету');
    } else if (result.step === 'api') {
      console.log('🔧 Возможные решения:');
      console.log('- Проверьте квоты на использование API');
      console.log('- Возможно превышен лимит запросов');
      console.log('- Проверьте статус сервиса GigaChat');
    } else if (result.step === 'edge-function') {
      console.log('🔧 Возможные решения:');
      console.log('- Проверьте развертывание Edge Function');
      console.log('- Убедитесь что переменная GIGACHAT_API_KEY установлена');
      console.log('- Проверьте логи Supabase');
    }
  }
});

// Экспорт функций для использования
window.testGigaChatDirect = testGigaChatDirect;
window.checkApiKeyStatus = checkApiKeyStatus;