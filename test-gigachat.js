// Простой тест GigaChat API
const gigachatApiKey = 'NGQzNWJkMTgtMjhmMi00ODQzLTliZWEtZTllYzUwZmQ2MzUwOmYwZWE3NWI4LWM5ZTAtNDM1OC1iOWJjLWNmNGUzYjQwZmFiNA==';

async function testGigaChat() {
  try {
    console.log('🔑 Получение токена доступа...');
    
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

    console.log('📡 Ответ на запрос токена:', {
      status: tokenResponse.status,
      statusText: tokenResponse.statusText,
      headers: Object.fromEntries(tokenResponse.headers.entries())
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('❌ Ошибка получения токена:', errorText);
      return;
    }

    const tokenData = await tokenResponse.json();
    console.log('✅ Токен получен:', { 
      hasToken: !!tokenData.access_token,
      expiresIn: tokenData.expires_in 
    });

    if (!tokenData.access_token) {
      console.error('❌ Токен не найден в ответе:', tokenData);
      return;
    }

    console.log('🤖 Отправка запроса к GigaChat...');
    
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
          { role: 'user', content: 'Привет! Это тестовое сообщение.' }
        ],
        max_tokens: 100,
        temperature: 0.7,
      }),
    });

    console.log('📡 Ответ от GigaChat:', {
      status: chatResponse.status,
      statusText: chatResponse.statusText,
      headers: Object.fromEntries(chatResponse.headers.entries())
    });

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text();
      console.error('❌ Ошибка GigaChat API:', errorText);
      return;
    }

    const chatData = await chatResponse.json();
    console.log('✅ Ответ от GigaChat получен:', {
      hasChoices: !!chatData.choices,
      choicesCount: chatData.choices?.length,
      usage: chatData.usage
    });

    if (chatData.choices && chatData.choices.length > 0) {
      console.log('💬 Ответ GigaChat:', chatData.choices[0].message.content);
    }

  } catch (error) {
    console.error('❌ Общая ошибка:', error);
  }
}

// Запуск теста
testGigaChat();
