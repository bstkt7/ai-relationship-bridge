-- Исправление RLS политики для таблицы profiles
-- Выполните этот код в Supabase SQL Editor

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
