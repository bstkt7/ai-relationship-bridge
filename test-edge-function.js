// Тест Edge Function напрямую
// Запустите в консоли браузера

async function testEdgeFunction() {
  console.log('🧪 Тестирование Edge Function...');
  
  try {
    // Получаем текущий домен
    const baseUrl = window.location.origin;
    const functionUrl = `${baseUrl}/functions/v1/ai-mediator`;
    
    console.log('📍 Function URL:', functionUrl);
    
    // Получаем токен авторизации
    const authToken = localStorage.getItem('sb-fhtvxziachtotvtjxsgp-auth-token');
    console.log('🔑 Auth token available:', !!authToken);
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken || 'anon-key'}`,
      },
      body: JSON.stringify({
        partner1_message: 'Я очень устал на работе сегодня',
        partner2_message: 'А я весь день убиралась дома, тоже устала'
      })
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success! Response:', data);
      
      if (data.recommendation) {
        console.log('💡 AI Recommendation:', data.recommendation);
      }
      
      if (data.emotion_analysis) {
        console.log('😊 Emotion Analysis:', data.emotion_analysis);
      }
      
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      return { success: false, error: errorText, status: response.status };
    }
    
  } catch (error) {
    console.error('❌ Network error:', error);
    return { success: false, error: error.message };
  }
}

// Запуск теста
testEdgeFunction().then(result => {
  if (result.success) {
    console.log('🎉 Edge Function работает!');
  } else {
    console.log('💥 Edge Function не работает:', result.error);
  }
});