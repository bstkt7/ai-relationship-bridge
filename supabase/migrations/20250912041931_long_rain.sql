/*
  # Исправление RLS политик для таблицы conversations

  1. Проблема
    - Партнеры не могут обновлять существующие разговоры
    - Сообщения не сохраняются в базе данных

  2. Решение
    - Добавляем политику UPDATE для conversations
    - Разрешаем партнерам обновлять разговоры своей пары
*/

-- Удаляем существующие политики для conversations
DROP POLICY IF EXISTS "Couple members can view conversations" ON public.conversations;
DROP POLICY IF EXISTS "Couple members can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Couple members can update conversations" ON public.conversations;

-- Создаем новые политики для conversations
CREATE POLICY "Couple members can view conversations" 
ON public.conversations 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.couples 
    WHERE couples.id = conversations.couple_id 
    AND (couples.partner1_id = auth.uid() OR couples.partner2_id = auth.uid())
  )
);

CREATE POLICY "Couple members can create conversations" 
ON public.conversations 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.couples 
    WHERE couples.id = conversations.couple_id 
    AND (couples.partner1_id = auth.uid() OR couples.partner2_id = auth.uid())
  )
);

-- ВАЖНО: Добавляем политику для UPDATE
CREATE POLICY "Couple members can update conversations" 
ON public.conversations 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.couples 
    WHERE couples.id = conversations.couple_id 
    AND (couples.partner1_id = auth.uid() OR couples.partner2_id = auth.uid())
  )
);

-- Также добавляем триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION public.update_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Добавляем колонку updated_at если её нет
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Создаем триггер
DROP TRIGGER IF EXISTS update_conversations_updated_at ON public.conversations;
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversations_updated_at();