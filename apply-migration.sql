-- Apply migration for invite code fixes
-- Run this in Supabase SQL Editor

-- Fix RLS policy to allow searching for invite codes
-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view their couples" ON public.couples;

-- Create a more permissive policy that allows users to see couples where they are partners
-- OR where they are searching by invite code
CREATE POLICY "Users can view their couples or search by invite code" 
ON public.couples 
FOR SELECT 
USING (
  auth.uid() = partner1_id OR 
  auth.uid() = partner2_id OR 
  invite_code IS NOT NULL
);

-- Fix the couples table to allow partner2_id to be NULL initially
-- Drop the existing unique constraint
ALTER TABLE public.couples DROP CONSTRAINT IF EXISTS couples_partner1_id_partner2_id_key;

-- Make partner2_id nullable
ALTER TABLE public.couples ALTER COLUMN partner2_id DROP NOT NULL;

-- Create a new constraint that allows NULL partner2_id when status is 'pending'
-- and requires different IDs when status is 'active'
CREATE UNIQUE INDEX couples_partners_unique 
ON public.couples (partner1_id, partner2_id) 
WHERE status = 'active' AND partner2_id IS NOT NULL;

-- Create function to safely find and join a couple by invite code
CREATE OR REPLACE FUNCTION public.find_couple_by_invite_code(invite_code_param TEXT)
RETURNS TABLE (
  id UUID,
  partner1_id UUID,
  partner2_id UUID,
  invite_code TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.partner1_id,
    c.partner2_id,
    c.invite_code,
    c.status,
    c.created_at,
    c.updated_at
  FROM public.couples c
  WHERE c.invite_code = UPPER(invite_code_param);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.find_couple_by_invite_code(TEXT) TO authenticated;

-- Create function to join couple by invite code
CREATE OR REPLACE FUNCTION public.join_couple_by_invite_code(
  invite_code_param TEXT,
  user_id_param UUID
)
RETURNS JSON AS $$
DECLARE
  couple_record RECORD;
  result JSON;
BEGIN
  -- Find the couple by invite code
  SELECT * INTO couple_record
  FROM public.couples
  WHERE invite_code = UPPER(invite_code_param);
  
  -- Check if couple exists
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Код приглашения не найден'
    );
  END IF;
  
  -- Check if user is already partner1
  IF couple_record.partner1_id = user_id_param THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Вы не можете присоединиться к своему же коду'
    );
  END IF;
  
  -- Check if couple already has partner2
  IF couple_record.partner2_id IS NOT NULL AND couple_record.partner2_id != user_id_param THEN
    RETURN json_build_object(
      'success', false,
      'error', 'К этому коду уже присоединился другой пользователь'
    );
  END IF;
  
  -- Update the couple with partner2
  UPDATE public.couples
  SET 
    partner2_id = user_id_param,
    status = 'active',
    updated_at = now()
  WHERE id = couple_record.id;
  
  -- Return success
  RETURN json_build_object(
    'success', true,
    'message', 'Вы успешно присоединились к паре',
    'couple_id', couple_record.id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.join_couple_by_invite_code(TEXT, UUID) TO authenticated;
