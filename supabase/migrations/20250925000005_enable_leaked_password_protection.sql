-- =====================================================
-- ZIGNAL - Enable Leaked Password Protection
-- Created: 2025-09-25
-- Description: Enable leaked password protection in Supabase Auth
-- Migration: 20250925000005_enable_leaked_password_protection.sql
-- =====================================================

-- Note: Leaked password protection is typically enabled through Supabase Dashboard
-- Auth Settings > Password-based logins > Leaked password protection
-- This migration provides documentation and any supporting functions

-- =====================================================
-- DOCUMENTATION AND INSTRUCTIONS
-- =====================================================

COMMENT ON SCHEMA auth IS 'Enable leaked password protection in Supabase Dashboard: Auth > Password-based logins';

-- =====================================================
-- PASSWORD VALIDATION FUNCTION (HELPER)
-- =====================================================

-- Create a helper function that can be used for additional password validation
CREATE OR REPLACE FUNCTION public.validate_password_strength(password_text TEXT)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    score INTEGER := 0;
    feedback TEXT[] := ARRAY[]::TEXT[];
    length_check BOOLEAN;
    uppercase_check BOOLEAN;
    lowercase_check BOOLEAN;
    number_check BOOLEAN;
    special_char_check BOOLEAN;
BEGIN
    -- Initialize result
    result := jsonb_build_object('valid', false, 'score', 0, 'feedback', '[]'::jsonb);

    -- Check password length (minimum 8 characters)
    length_check := length(password_text) >= 8;
    IF length_check THEN
        score := score + 1;
    ELSE
        feedback := array_append(feedback, 'Password must be at least 8 characters long');
    END IF;

    -- Check for uppercase letter
    uppercase_check := password_text ~ '[A-Z]';
    IF uppercase_check THEN
        score := score + 1;
    ELSE
        feedback := array_append(feedback, 'Password must contain at least one uppercase letter');
    END IF;

    -- Check for lowercase letter
    lowercase_check := password_text ~ '[a-z]';
    IF lowercase_check THEN
        score := score + 1;
    ELSE
        feedback := array_append(feedback, 'Password must contain at least one lowercase letter');
    END IF;

    -- Check for number
    number_check := password_text ~ '[0-9]';
    IF number_check THEN
        score := score + 1;
    ELSE
        feedback := array_append(feedback, 'Password must contain at least one number');
    END IF;

    -- Check for special character
    special_char_check := password_text ~ '[^A-Za-z0-9]';
    IF special_char_check THEN
        score := score + 1;
    ELSE
        feedback := array_append(feedback, 'Password must contain at least one special character');
    END IF;

    -- Build result
    result := jsonb_build_object(
        'valid', score >= 4,
        'score', score,
        'max_score', 5,
        'feedback', to_jsonb(feedback),
        'checks', jsonb_build_object(
            'length', length_check,
            'uppercase', uppercase_check,
            'lowercase', lowercase_check,
            'number', number_check,
            'special_char', special_char_check
        )
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.validate_password_strength(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_password_strength(TEXT) TO service_role;

-- =====================================================
-- SECURITY EVENT LOGGING FOR AUTH EVENTS
-- =====================================================

-- Function to log security events related to auth
CREATE OR REPLACE FUNCTION public.log_auth_security_event(
    event_type TEXT,
    user_identifier TEXT DEFAULT NULL,
    additional_data JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    -- Insert security event if security_events table exists
    INSERT INTO public.security_events (
        event_type,
        user_id,
        metadata,
        created_at
    )
    VALUES (
        event_type,
        COALESCE(user_identifier::UUID, auth.uid()),
        COALESCE(additional_data, '{}'::jsonb),
        NOW()
    );
EXCEPTION
    WHEN undefined_table THEN
        -- If security_events table doesn't exist, ignore silently
        NULL;
    WHEN OTHERS THEN
        -- Raise a warning for any other unexpected errors
        RAISE WARNING 'Unexpected error in log_auth_security_event: %, SQLSTATE: %', SQLERRM, SQLSTATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.log_auth_security_event(TEXT, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_auth_security_event(TEXT, TEXT, JSONB) TO service_role;

-- =====================================================
-- MANUAL CONFIGURATION INSTRUCTIONS
-- =====================================================

-- Create a documentation table for configuration instructions
CREATE TABLE IF NOT EXISTS public.security_configuration_instructions (
    id SERIAL PRIMARY KEY,
    feature TEXT NOT NULL,
    instruction TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'not_applicable')),
    priority INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert leaked password protection instruction
INSERT INTO public.security_configuration_instructions (feature, instruction, priority)
VALUES (
    'Leaked Password Protection',
    'Enable leaked password protection in Supabase Dashboard: Authentication > Settings > Password-based logins > Enable "Check for leaked passwords"',
    1
) ON CONFLICT DO NOTHING;

-- Insert other security recommendations
INSERT INTO public.security_configuration_instructions (feature, instruction, priority)
VALUES
(
    'Password Strength',
    'Configure minimum password requirements in Supabase Dashboard: Authentication > Settings > Password-based logins',
    2
),
(
    'Rate Limiting',
    'Enable rate limiting for authentication endpoints in Supabase Dashboard: Authentication > Settings > Rate limiting',
    3
),
(
    'Session Management',
    'Configure session timeout settings in Supabase Dashboard: Authentication > Settings > Sessions',
    4
),
(
    'Email Templates',
    'Customize authentication email templates in Supabase Dashboard: Authentication > Templates',
    5
) ON CONFLICT DO NOTHING;

-- Enable RLS on the instructions table
ALTER TABLE public.security_configuration_instructions ENABLE ROW LEVEL SECURITY;

-- Allow admins to view and manage security instructions
CREATE POLICY "Admins can manage security instructions" ON public.security_configuration_instructions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE (up.user_id::text = auth.uid()::text OR up.clerk_user_id = auth.uid()::text)
            AND up.is_admin = true
        )
    );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.security_configuration_instructions TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.security_configuration_instructions_id_seq TO authenticated;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

COMMENT ON TABLE public.security_configuration_instructions IS 'Security configuration instructions - Enable leaked password protection manually in Supabase Dashboard';

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_security_configuration_instructions_updated_at ON public.security_configuration_instructions;
CREATE TRIGGER update_security_configuration_instructions_updated_at
    BEFORE UPDATE ON public.security_configuration_instructions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();