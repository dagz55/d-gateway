-- =====================================================
-- ZIGNAL - Verify Security Settings
-- Created: 2025-09-14
-- Description: Verify that security configurations are properly applied
-- =====================================================

-- Create a function to check if our database functions have proper security settings
CREATE OR REPLACE FUNCTION public.verify_function_security()
RETURNS TABLE (
    function_name TEXT,
    security_definer BOOLEAN,
    search_path_set BOOLEAN,
    security_status TEXT
) AS $$
BEGIN
    RETURN QUERY
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
            ) THEN 'SECURE'
            ELSE 'NEEDS_FIX'
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create a view for easy security monitoring
CREATE OR REPLACE VIEW public.security_status_report AS
SELECT 
    'Database Functions' as category,
    function_name as item,
    security_status as status,
    CASE 
        WHEN security_status = 'SECURE' THEN 'All security settings properly configured'
        ELSE 'Function needs SECURITY DEFINER SET search_path = "" setting'
    END as description
FROM public.verify_function_security();

-- Add comment for documentation
COMMENT ON FUNCTION public.verify_function_security() IS 'Verification function to check database function security settings. Returns status of SECURITY DEFINER and search_path configuration.';
COMMENT ON VIEW public.security_status_report IS 'Security status report showing the configuration status of critical database functions.';

-- Grant access to authenticated users to view security status (for admin users)
GRANT SELECT ON public.security_status_report TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_function_security() TO authenticated;

-- Create a simple query to check overall security status
-- This can be run manually to verify all functions are secure
-- SELECT * FROM public.security_status_report;