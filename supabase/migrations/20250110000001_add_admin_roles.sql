-- Добавляем поле роли в таблицу profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator'));

-- Создаем индекс для быстрого поиска по ролям
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Обновляем RLS политики для ролей
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;

-- Политика для просмотра профилей (все могут видеть профили)
CREATE POLICY "Authenticated users can view all profiles"
ON public.profiles
FOR SELECT
USING (auth.role() = 'authenticated');

-- Политика для обновления собственного профиля
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- Политика для создания профиля
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Функция для проверки роли администратора
CREATE OR REPLACE FUNCTION public.is_admin(user_id_param UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE user_id = user_id_param 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для проверки роли модератора
CREATE OR REPLACE FUNCTION public.is_moderator(user_id_param UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE user_id = user_id_param 
    AND role IN ('admin', 'moderator')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Предоставляем права на выполнение функций
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_moderator(UUID) TO authenticated;

-- Комментарии для документации
COMMENT ON COLUMN public.profiles.role IS 'Роль пользователя: user, admin, moderator';
COMMENT ON FUNCTION public.is_admin(UUID) IS 'Проверяет, является ли пользователь администратором';
COMMENT ON FUNCTION public.is_moderator(UUID) IS 'Проверяет, является ли пользователь модератором или администратором';
