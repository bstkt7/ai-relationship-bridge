# Окончательное исправление ошибок с кодами приглашения

## Проблемы
1. **406 (Not Acceptable)** - RLS политика блокирует запросы к таблице couples
2. **"к этому пользователю уже присоединился другой пользователь"** - неправильная логика проверки

## Решение

### Шаг 1: Применить SQL миграцию

Выполните код из файла `fix-rls-simple.sql` в Supabase SQL Editor:

```sql
-- Удаляем все существующие политики для таблицы couples
DROP POLICY IF EXISTS "Users can view their couples" ON public.couples;
DROP POLICY IF EXISTS "Users can view their couples or search by invite code" ON public.couples;

-- Создаем новую простую политику
CREATE POLICY "Allow all authenticated users to view couples" 
ON public.couples 
FOR SELECT 
TO authenticated
USING (true);

-- Проверяем, что partner2_id может быть NULL
ALTER TABLE public.couples ALTER COLUMN partner2_id DROP NOT NULL;

-- Удаляем проблемный UNIQUE constraint
ALTER TABLE public.couples DROP CONSTRAINT IF EXISTS couples_partner1_id_partner2_id_key;

-- Создаем функцию для работы с кодами приглашения
CREATE OR REPLACE FUNCTION public.join_couple_by_invite_code(
  invite_code_param TEXT,
  user_id_param UUID
)
RETURNS JSON AS $$
DECLARE
  couple_record RECORD;
BEGIN
  -- Находим пару по коду приглашения
  SELECT * INTO couple_record
  FROM public.couples
  WHERE invite_code = UPPER(invite_code_param);
  
  -- Проверяем, существует ли пара
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Код приглашения не найден'
    );
  END IF;
  
  -- Проверяем, не является ли пользователь уже партнером 1
  IF couple_record.partner1_id = user_id_param THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Вы не можете присоединиться к своему же коду'
    );
  END IF;
  
  -- Проверяем, есть ли уже второй партнер
  IF couple_record.partner2_id IS NOT NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'К этому коду уже присоединился другой пользователь'
    );
  END IF;
  
  -- Обновляем пару, добавляя второго партнера
  UPDATE public.couples
  SET 
    partner2_id = user_id_param,
    status = 'active',
    updated_at = now()
  WHERE id = couple_record.id;
  
  -- Возвращаем успех
  RETURN json_build_object(
    'success', true,
    'message', 'Вы успешно присоединились к паре',
    'couple_id', couple_record.id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Даем права на выполнение функции
GRANT EXECUTE ON FUNCTION public.join_couple_by_invite_code(TEXT, UUID) TO authenticated;
```

### Шаг 2: Что было исправлено в коде

1. **Исправлена RLS политика** - теперь все аутентифицированные пользователи могут видеть пары
2. **Исправлена логика проверки существующих пар** - убрана ошибка с `.single()`
3. **Добавлена проверка перед присоединением** - пользователь не может присоединиться к паре, если у него уже есть пара
4. **Улучшена обработка ошибок** - более понятные сообщения

### Шаг 3: Тестирование

После применения миграции:

1. **Создайте код приглашения** - должно работать без ошибок 406
2. **Попробуйте присоединиться по коду** - должно работать корректно
3. **Попробуйте создать второй код** - должно показать сообщение о существующей паре
4. **Попробуйте присоединиться к уже занятому коду** - должно показать правильное сообщение

## Результат

После применения этих исправлений:
- ✅ Ошибка 406 исчезнет
- ✅ Коды приглашения будут работать корректно
- ✅ Сообщения об ошибках будут понятными
- ✅ Пользователи не смогут создавать несколько пар
