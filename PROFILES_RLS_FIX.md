# Исправление ошибки 406 для профилей партнеров

## 🐛 Проблема
После присоединения к паре возникала ошибка:
- `406 (Not Acceptable)` при загрузке профиля партнера
- `"Cannot coerce the result to a single JSON object"`
- Партнер не отображался в кабинете

## 🔍 Причина
RLS (Row Level Security) политика для таблицы `profiles` была слишком ограничительной и блокировала запросы к профилям других пользователей.

## ✅ Решение

### Шаг 1: Применить SQL миграцию

Выполните код из файла `fix-profiles-rls.sql` в Supabase SQL Editor:

```sql
-- Удаляем существующие политики для profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Создаем новые политики для profiles
CREATE POLICY "Allow all authenticated users to view profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Также убедимся, что политики для couples работают правильно
DROP POLICY IF EXISTS "Allow all authenticated users to view couples" ON public.couples;

CREATE POLICY "Allow all authenticated users to view couples" 
ON public.couples 
FOR SELECT 
TO authenticated
USING (true);
```

### Шаг 2: Исправления в коде

#### 1. Убрана ошибка с `.single()`
**Было**:
```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('user_id', partnerId)
  .single(); // ← Это вызывало ошибку
```

**Стало**:
```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('user_id', partnerId); // ← Убрали .single()

if (data && data.length > 0) {
  setPartnerProfile(data[0]);
} else {
  setPartnerProfile(null);
}
```

#### 2. Улучшена обработка состояний
Добавлены отдельные состояния для:
- Партнер не присоединился (`!partnerId`)
- Партнер присоединился, но профиль загружается (`!partnerProfile`)
- Профиль загружен успешно

#### 3. Лучшие сообщения об ошибках
- Информативные сообщения для каждого состояния
- Правильная обработка ошибок RLS

## 🎯 Результат

После применения исправлений:

### ✅ Что работает:
- Партнеры могут видеть профили друг друга
- Нет ошибок 406 при загрузке профилей
- Правильное отображение информации о партнере
- Корректная обработка состояний загрузки

### 🔒 Безопасность:
- Пользователи могут видеть профили других пользователей (необходимо для функционала пар)
- Пользователи могут редактировать только свои профили
- Пользователи могут создавать только свои профили

## 🧪 Тестирование

После применения миграции:

1. **Создайте пару** - должно работать без ошибок
2. **Присоединитесь к паре** - должно работать корректно
3. **Проверьте раздел "Партнер"** - должна отображаться информация о партнере
4. **Проверьте загрузку** - не должно быть ошибок 406

## 📝 Технические детали

### Измененные файлы:
- `fix-profiles-rls.sql` - новая миграция для RLS
- `src/components/dashboard/PartnerInfo.tsx` - исправлена логика загрузки

### Ключевые изменения:
1. RLS политика `USING (true)` для SELECT на profiles
2. Убрана `.single()` из запроса
3. Добавлена проверка `data.length > 0`
4. Улучшена обработка состояний загрузки
