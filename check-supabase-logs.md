# 🔍 Как проверить логи Supabase Edge Function

## Шаги для диагностики:

### 1. Откройте Supabase Dashboard
1. Перейдите на https://supabase.com/dashboard
2. Выберите ваш проект `fhtvxziachtotvtjxsgp`
3. Войдите в аккаунт

### 2. Проверьте Edge Functions
1. В левом меню выберите **Edge Functions**
2. Найдите функцию `ai-mediator`
3. Нажмите на неё

### 3. Просмотрите логи
1. Перейдите на вкладку **Logs**
2. Посмотрите последние записи
3. Ищите ошибки (красные записи)

### 4. Проверьте переменные окружения
1. Перейдите в **Settings** → **Environment Variables**
2. Убедитесь, что есть переменная `GIGACHAT_API_KEY`
3. Значение должно быть: `NGQzNWJkMTgtMjhmMi00ODQzLTliZWEtZTllYzUwZmQ2MzUwOmYwZWE3NWI4LWM5ZTAtNDM1OC1iOWJjLWNmNGUzYjQwZmFiNA==`

## Возможные проблемы:

### ❌ Проблема 1: Функция не развернута
**Решение**: Функция развертывается автоматически, но может потребоваться время

### ❌ Проблема 2: Неправильный API ключ
**Решение**: Проверьте переменную окружения `GIGACHAT_API_KEY`

### ❌ Проблема 3: CORS ошибки
**Решение**: Проверьте заголовки CORS в функции

### ❌ Проблема 4: Таймаут
**Решение**: GigaChat может отвечать медленно, увеличьте таймаут

## Диагностические команды:

### В консоли браузера:
```javascript
// Проверка доступности функции
fetch('/functions/v1/ai-mediator', { method: 'OPTIONS' })
  .then(r => console.log('CORS OK:', r.status))
  .catch(e => console.error('CORS Error:', e));

// Тест с реальными данными
fetch('/functions/v1/ai-mediator', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    partner1_message: 'Тест 1',
    partner2_message: 'Тест 2'
  })
}).then(r => r.json()).then(console.log).catch(console.error);
```

## Что искать в логах:

1. **🔑 "GigaChat API key available: true"** - ключ загружен
2. **📨 "Messages received"** - сообщения получены
3. **🔐 "Requesting token"** - запрос токена
4. **✅ "Token data received"** - токен получен
5. **🤖 "Sending chat request"** - запрос к GigaChat
6. **✅ "Chat data received"** - ответ получен
7. **💡 "Recommendation received"** - рекомендация готова

## Если ничего не работает:

1. **Перезапустите функцию** в Supabase Dashboard
2. **Проверьте статус GigaChat API** на сайте Сбера
3. **Обновите API ключ** если он истек
4. **Проверьте квоты** на использование API