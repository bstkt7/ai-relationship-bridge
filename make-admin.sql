-- Скрипт для назначения роли администратора
-- Замените 'YOUR_EMAIL@example.com' на ваш реальный email

-- Сначала найдите ваш user_id по email
-- SELECT id, email FROM auth.users WHERE email = 'YOUR_EMAIL@example.com';

-- Затем назначьте роль администратора
-- UPDATE public.profiles 
-- SET role = 'admin' 
-- WHERE user_id = (SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL@example.com');

-- Или если вы знаете ваш user_id напрямую:
-- UPDATE public.profiles SET role = 'admin' WHERE user_id = 'YOUR_USER_ID_HERE';

-- Проверьте результат:
-- SELECT p.user_id, p.first_name, p.last_name, p.role, u.email 
-- FROM public.profiles p 
-- JOIN auth.users u ON p.user_id = u.id 
-- WHERE p.role = 'admin';

-- ВРЕМЕННОЕ РЕШЕНИЕ: Назначить роль всем пользователям (только для разработки!)
-- UPDATE public.profiles SET role = 'admin' WHERE role IS NULL OR role = 'user';
