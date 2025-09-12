-- Add role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Create index for better performance on role queries
CREATE INDEX idx_profiles_role ON public.profiles(role);