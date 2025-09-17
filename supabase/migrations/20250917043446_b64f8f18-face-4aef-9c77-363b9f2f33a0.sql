-- Fix security issue: Restrict profile access to owner and partner only

-- First, drop the overly permissive policies
DROP POLICY IF EXISTS "Allow all authenticated users to view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;

-- Create a secure policy that only allows:
-- 1. Users to view their own profile
-- 2. Users to view their partner's profile (if they're in an active couple)
-- 3. Admins to view all profiles for moderation
CREATE POLICY "Users can view own profile and partner profile" 
ON public.profiles 
FOR SELECT 
USING (
  -- User can see their own profile
  auth.uid() = user_id
  OR 
  -- User can see their partner's profile
  EXISTS (
    SELECT 1 
    FROM public.couples 
    WHERE status = 'active'
    AND (
      (partner1_id = auth.uid() AND partner2_id = profiles.user_id)
      OR
      (partner2_id = auth.uid() AND partner1_id = profiles.user_id)
    )
  )
  OR
  -- Admins can see all profiles for moderation
  public.is_admin()
);