-- Create storage bucket for public images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'public_image',
  'public_image',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to upload images to their own folder
DROP POLICY IF EXISTS "Users can upload to their own folder" ON storage.objects;
CREATE POLICY "Users can upload to their own folder" ON storage.objects
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND
  bucket_id = 'public_image' AND
  (storage.foldername(name))[1] = auth.jwt() ->> 'name'
);

-- Policy: Allow authenticated users to update their own images
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
CREATE POLICY "Users can update their own images" ON storage.objects
FOR UPDATE USING (
  auth.role() = 'authenticated' AND
  bucket_id = 'public_image' AND
  (storage.foldername(name))[1] = auth.jwt() ->> 'name'
);

-- Policy: Allow authenticated users to delete their own images
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
CREATE POLICY "Users can delete their own images" ON storage.objects
FOR DELETE USING (
  auth.role() = 'authenticated' AND
  bucket_id = 'public_image' AND
  (storage.foldername(name))[1] = auth.jwt() ->> 'name'
);

-- Policy: Allow public read access to all images
DROP POLICY IF EXISTS "Public read access to images" ON storage.objects;
CREATE POLICY "Public read access to images" ON storage.objects
FOR SELECT USING (bucket_id = 'public_image');

-- Create function to get user's folder name
CREATE OR REPLACE FUNCTION get_user_folder_name()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(auth.jwt() ->> 'name', 'anonymous');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to validate file upload
CREATE OR REPLACE FUNCTION validate_image_upload()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user is authenticated
  IF auth.role() != 'authenticated' THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Check file size (5MB limit)
  IF NEW.metadata->>'size'::text IS NOT NULL AND
     (NEW.metadata->>'size')::bigint > 5242880 THEN
    RAISE EXCEPTION 'File size exceeds 5MB limit';
  END IF;
  
  -- Check file type
  IF NEW.metadata->>'mimetype' NOT IN (
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'
  ) THEN
    RAISE EXCEPTION 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.';
  END IF;
  
  -- Ensure file is in user's folder
  IF (storage.foldername(NEW.name))[1] != get_user_folder_name() THEN
    RAISE EXCEPTION 'Files must be uploaded to user''s own folder';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to validate uploads
DROP TRIGGER IF EXISTS validate_image_upload_trigger ON storage.objects;
CREATE TRIGGER validate_image_upload_trigger
  BEFORE INSERT ON storage.objects
  FOR EACH ROW
  WHEN (NEW.bucket_id = 'public_image')
  EXECUTE FUNCTION validate_image_upload();

-- Create function to clean up old avatars when new one is uploaded
CREATE OR REPLACE FUNCTION cleanup_old_avatar()
RETURNS TRIGGER AS $$
DECLARE
  user_folder TEXT;
  old_files TEXT[];
BEGIN
  -- Get user folder name
  user_folder := get_user_folder_name();
  
  -- Find old avatar files for this user
  SELECT ARRAY_AGG(name) INTO old_files
  FROM storage.objects
  WHERE bucket_id = 'public_image'
    AND (storage.foldername(name))[1] = user_folder
    AND name LIKE 'avatar-%'
    AND name != NEW.name;
  
  -- Delete old avatar files
  IF old_files IS NOT NULL AND array_length(old_files, 1) > 0 THEN
    DELETE FROM storage.objects
    WHERE bucket_id = 'public_image'
      AND name = ANY(old_files);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to cleanup old avatars
DROP TRIGGER IF EXISTS cleanup_old_avatar_trigger ON storage.objects;
CREATE TRIGGER cleanup_old_avatar_trigger
  AFTER INSERT ON storage.objects
  FOR EACH ROW
  WHEN (NEW.bucket_id = 'public_image' AND NEW.name LIKE 'avatar-%')
  EXECUTE FUNCTION cleanup_old_avatar();
