-- =====================================================
-- ZIGNAL - Fix Security Status View
-- Created: 2025-09-14
-- Description: Replace SECURITY DEFINER view with secure invoker-based approach
-- =====================================================

-- Drop the existing view first
DROP VIEW IF EXISTS public.security_status_report;

-- Create a private schema for helper functions (if not exists)
CREATE SCHEMA IF NOT EXISTS private;

-- Create a minimal SECURITY DEFINER function that returns the security status data
CREATE OR REPLACE FUNCTION private.get_security_status_report()
RETURNS TABLE(
  category TEXT,
  item TEXT,
  status TEXT,
  description TEXT
) LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$
  SELECT 
    'Database Functions'::TEXT as category,
    p.proname::TEXT as item,
    CASE 
      WHEN p.prosecdef AND (
        (p.proconfig IS NOT NULL AND 'search_path=' = ANY(p.proconfig)) OR 
        (p.proconfig IS NOT NULL AND 'search_path=""' = ANY(p.proconfig)) OR
        (p.proconfig IS NOT NULL AND array_to_string(p.proconfig, ',') LIKE '%search_path=%')
      ) THEN 'SECURE'::TEXT
      ELSE 'NEEDS_FIX'::TEXT
    END as status,
    CASE 
      WHEN p.prosecdef AND (
        (p.proconfig IS NOT NULL AND 'search_path=' = ANY(p.proconfig)) OR 
        (p.proconfig IS NOT NULL AND 'search_path=""' = ANY(p.proconfig)) OR
        (p.proconfig IS NOT NULL AND array_to_string(p.proconfig, ',') LIKE '%search_path=%')
      ) THEN 'All security settings properly configured'::TEXT
      ELSE 'Function needs SECURITY DEFINER SET search_path = "" setting'::TEXT
    END as description
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  AND p.proname IN (
    'update_updated_at_column',
    'handle_new_user', 
    'calculate_portfolio_value',
    'update_portfolio_holding',
    'calculate_win_rate',
    'get_dashboard_stats',
    'handle_trade_execution'
  )
  ORDER BY p.proname;
$$;

-- Revoke execute from public roles - only allow specific access
REVOKE EXECUTE ON FUNCTION private.get_security_status_report() FROM anon, authenticated, public;

-- Grant execute only to service_role for administrative access
GRANT EXECUTE ON FUNCTION private.get_security_status_report() TO service_role;

-- Create a security-invoker view that calls the definer function
CREATE OR REPLACE VIEW public.security_status_report
  WITH (security_invoker = on) AS
SELECT * FROM private.get_security_status_report();

-- Grant select on the view to authenticated users (for admin panel access)
GRANT SELECT ON public.security_status_report TO authenticated;

-- Also update the verify_function_security function to use proper security settings
CREATE OR REPLACE FUNCTION public.verify_function_security()
RETURNS TABLE (
    function_name TEXT,
    security_definer BOOLEAN,
    search_path_set BOOLEAN,
    security_status TEXT
) LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$
  SELECT 
    p.proname::TEXT,
    p.prosecdef,
    (p.proconfig IS NOT NULL AND 'search_path=' = ANY(p.proconfig)) OR 
    (p.proconfig IS NOT NULL AND 'search_path=""' = ANY(p.proconfig)) OR
    (p.proconfig IS NOT NULL AND array_to_string(p.proconfig, ',') LIKE '%search_path=%'),
    CASE 
      WHEN p.prosecdef AND (
        (p.proconfig IS NOT NULL AND 'search_path=' = ANY(p.proconfig)) OR 
        (p.proconfig IS NOT NULL AND 'search_path=""' = ANY(p.proconfig)) OR
        (p.proconfig IS NOT NULL AND array_to_string(p.proconfig, ',') LIKE '%search_path=%')
      ) THEN 'SECURE'::TEXT
      ELSE 'NEEDS_FIX'::TEXT
    END
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  AND p.proname IN (
    'update_updated_at_column',
    'handle_new_user', 
    'calculate_portfolio_value',
    'update_portfolio_holding',
    'calculate_win_rate',
    'get_dashboard_stats',
    'handle_trade_execution'
  )
  ORDER BY p.proname;
$$;

-- Grant execute on the verification function to authenticated users
GRANT EXECUTE ON FUNCTION public.verify_function_security() TO authenticated;

-- Add comments for documentation
COMMENT ON FUNCTION private.get_security_status_report() IS 'Private function to retrieve security status data with elevated permissions. Uses SECURITY DEFINER with fixed search_path.';
COMMENT ON VIEW public.security_status_report IS 'Security status report showing the configuration status of critical database functions. Uses security_invoker for safer access.';
COMMENT ON FUNCTION public.verify_function_security() IS 'Verification function to check database function security settings. Returns detailed status of SECURITY DEFINER and search_path configuration.';