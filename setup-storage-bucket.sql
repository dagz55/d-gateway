-- Setup Supabase Storage Bucket for Avatar Uploads
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

-- STEP 2: Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- STEP 3: Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can upload to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to images" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_upload_images" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_update_images" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_delete_images" ON storage.objects;
DROP POLICY IF EXISTS "public_read_images" ON storage.objects;

-- STEP 4: Create storage policies using proper template
-- Policy 1: Allow authenticated users to upload images
CREATE POLICY "authenticated_upload_images"
ON storage.objects FOR INSERT WITH CHECK (
  -- restrict bucket
  bucket_id = 'public_image'
  -- allow image file types
  AND storage."extension"(name) IN ('jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif')
  -- to authenticated users only
  AND auth.role() = 'authenticated'
);

-- Policy 2: Allow authenticated users to update their own images
CREATE POLICY "authenticated_update_images"
ON storage.objects FOR UPDATE USING (
  -- restrict bucket
  bucket_id = 'public_image'
  -- allow image file types
  AND storage."extension"(name) IN ('jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif')
  -- to authenticated users only
  AND auth.role() = 'authenticated'
) WITH CHECK (
  -- restrict bucket
  bucket_id = 'public_image'
  -- allow image file types
  AND storage."extension"(name) IN ('jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif')
  -- to authenticated users only
  AND auth.role() = 'authenticated'
);

-- Policy 3: Allow authenticated users to delete their own images
CREATE POLICY "authenticated_delete_images"
ON storage.objects FOR DELETE USING (
  -- restrict bucket
  bucket_id = 'public_image'
  -- allow image file types
  AND storage."extension"(name) IN ('jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif')
  -- to authenticated users only
  AND auth.role() = 'authenticated'
);

-- Policy 4: Allow public read access to all images
CREATE POLICY "public_read_images"
ON storage.objects FOR SELECT USING (
  -- restrict bucket
  bucket_id = 'public_image'
  -- allow image file types
  AND storage."extension"(name) IN ('jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif')
);

-- STEP 5: Grant permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- STEP 6: Verify the setup
DO $$
DECLARE
    bucket_info RECORD;
    policy_count INTEGER;
BEGIN
    -- Check bucket
    SELECT * INTO bucket_info FROM storage.buckets WHERE id = 'public_image';
    
    IF FOUND THEN
        RAISE NOTICE '✅ Storage bucket configured:';
        RAISE NOTICE '   ID: %', bucket_info.id;
        RAISE NOTICE '   Public: %', bucket_info.public;
        RAISE NOTICE '   Size Limit: % bytes (% MB)', bucket_info.file_size_limit, bucket_info.file_size_limit / 1024 / 1024;
        RAISE NOTICE '   MIME Types: %', bucket_info.allowed_mime_types;
    ELSE
        RAISE NOTICE '❌ Storage bucket NOT found';
    END IF;
    
    -- Check policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage'
    AND policyname LIKE '%public_image%';
    
    RAISE NOTICE '✅ Storage policies created: %', policy_count;
END $$;

-- Final message
DO $$
BEGIN
    RAISE NOTICE '=== STORAGE SETUP COMPLETED ===';
    RAISE NOTICE '✅ public_image bucket configured';
    RAISE NOTICE '✅ Simple storage policies created';
    RAISE NOTICE '✅ Photo upload/remove should now work';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 RESTART SERVER AND TEST PHOTO UPLOAD';
END $$;
