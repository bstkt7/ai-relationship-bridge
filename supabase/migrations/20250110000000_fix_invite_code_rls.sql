-- Fix RLS policy to allow searching for invite codes
-- This policy allows users to search for couples by invite_code even if they're not yet a member

CREATE POLICY "Users can search couples by invite code" 
ON public.couples 
FOR SELECT 
USING (invite_code IS NOT NULL);

-- Also create a function to safely find and join a couple by invite code
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
