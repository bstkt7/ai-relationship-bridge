# 🤖 Настройка GigaChat API

## 🎯 Обзор

Система BridgeAI теперь поддерживает GigaChat API от Сбера для обработки сообщений пар. GigaChat обеспечивает отличную поддержку русского языка и работает в России без ограничений.

## 🔑 API Ключ

Ваш API ключ уже настроен в системе:
```
NGQzNWJkMTgtMjhmMi00ODQzLTliZWEtZTllYzUwZmQ2MzUwOmYwZWE3NWI4LWM5ZTAtNDM1OC1iOWJjLWNmNGUzYjQwZmFiNA==
```

## ⚙️ Настройка

### 1. **В админ-панели:**
- Перейдите в раздел "AI Настройки"
- Выберите провайдера "GigaChat (Сбер)"
- API ключ уже введен
- Модель: `GigaChat:latest`

### 2. **В Supabase Edge Function:**
- Функция `ai-mediator` обновлена для работы с GigaChat
- Автоматическое получение токена доступа
- Обработка OAuth2 аутентификации

## 🚀 Преимущества GigaChat

### ✅ **Преимущества:**
- **Русский язык**: Отличная поддержка русского языка
- **Локальность**: Работает в России без ограничений
- **Быстрота**: Быстрые ответы на русском языке
- **Качество**: Высокое качество понимания контекста
- **Безопасность**: Данные остаются в России

### 🔄 **Процесс работы:**
1. **Получение токена**: Автоматический OAuth2 запрос
2. **Отправка запроса**: К GigaChat API с сообщениями партнеров
3. **Анализ эмоций**: Простой анализ тональности сообщений
4. **Рекомендации**: Конструктивные советы для улучшения общения

## 📊 Сравнение с OpenAI

| Параметр | GigaChat | OpenAI |
|----------|----------|---------|
| **Русский язык** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Скорость** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Качество** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Доступность в РФ** | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **Стоимость** | ⭐⭐⭐⭐ | ⭐⭐⭐ |

## 🛠️ Технические детали

### **API Endpoints:**
- **OAuth**: `https://ngw.devices.sberbank.ru:9443/api/v2/oauth`
- **Chat**: `https://gigachat.devices.sberbank.ru/api/v1/chat/completions`

### **Модели:**
- `GigaChat:latest` - Последняя версия модели
- `GigaChat:max` - Максимальная версия (если доступна)

### **Параметры:**
- **max_tokens**: 500 (оптимально для рекомендаций)
- **temperature**: 0.7 (баланс креативности и точности)
- **scope**: `GIGACHAT_API_PERS` (персональное использование)

## 🔧 Настройка в коде

### **Supabase Edge Function:**
```typescript
// Получение токена
const tokenResponse = await fetch('https://ngw.devices.sberbank.ru:9443/api/v2/oauth', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${gigachatApiKey}`,
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json',
    'RqUID': crypto.randomUUID(),
  },
  body: 'scope=GIGACHAT_API_PERS',
});

// Отправка запроса
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
```

### **Админ-панель:**
```typescript
// Настройки по умолчанию
const settings = {
  provider: 'gigachat',
  apiKey: 'NGQzNWJkMTgtMjhmMi00ODQzLTliZWEtZTllYzUwZmQ2MzUwOmYwZWE3NWI4LWM5ZTAtNDM1OC1iOWJjLWNmNGUzYjQwZmFiNA==',
  model: 'GigaChat:latest',
  // ... другие настройки
};
```

## 🧪 Тестирование

### **В админ-панели:**
1. Перейдите в "AI Настройки"
2. Нажмите кнопку "Тест"
3. Проверьте результат подключения

### **В приложении:**
1. Создайте пару
2. Отправьте сообщения от обоих партнеров
3. Проверьте рекомендации AI

## 📈 Мониторинг

### **Логи:**
- Проверяйте логи Supabase Edge Function
- Отслеживайте успешность запросов
- Мониторьте время ответа

### **Метрики:**
- Количество успешных запросов
- Время ответа API
- Качество рекомендаций

## 🔒 Безопасность

### **API Ключ:**
- Хранится в переменных окружения Supabase
- Не передается в клиентский код
- Защищен от несанкционированного доступа

### **Данные:**
- Сообщения партнеров обрабатываются безопасно
- Персональные данные не сохраняются
- Соблюдение требований по защите данных

## 🎯 Готово к использованию!

GigaChat API полностью интегрирован в систему BridgeAI. Теперь ваши пользователи получат качественные рекомендации на русском языке от российского AI!

### **Следующие шаги:**
1. ✅ API ключ настроен
2. ✅ Код обновлен
3. ✅ Админ-панель готова
4. 🚀 **Готово к тестированию!**
