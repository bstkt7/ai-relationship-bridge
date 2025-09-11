-- Простое исправление RLS политики
-- Выполните этот код в Supabase SQL Editor

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

-- Создаем функции для работы с кодами приглашения
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
