-- Simple Storage Bucket Setup (No Table Modifications)
-- Run this in Supabase SQL Editor

-- STEP 1: Create the public_image bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'public_image',
  'public_image',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif']
) ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'];

-- STEP 2: Check if bucket was created successfully
DO $$
DECLARE
    bucket_info RECORD;
BEGIN
    SELECT * INTO bucket_info FROM storage.buckets WHERE id = 'public_image';
    
    IF FOUND THEN
        RAISE NOTICE '✅ Storage bucket configured successfully:';
        RAISE NOTICE '   ID: %', bucket_info.id;
        RAISE NOTICE '   Public: %', bucket_info.public;
        RAISE NOTICE '   Size Limit: % MB', bucket_info.file_size_limit / 1024 / 1024;
        RAISE NOTICE '   MIME Types: %', bucket_info.allowed_mime_types;
        RAISE NOTICE '';
        RAISE NOTICE '🎉 Photo upload should now work!';
        RAISE NOTICE '🔄 Please restart your development server';
    ELSE
        RAISE NOTICE '❌ Failed to create storage bucket';
    END IF;
END $$;
