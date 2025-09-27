# Supabase Storage Setup Guide

This guide explains how to set up Supabase storage for image uploads in the Zignal trading dashboard.

## Overview

The application uses Supabase storage to store user profile images with the following structure:
- **Bucket**: `public_image`
- **Folder Structure**: `public_image/{username}/avatar-{timestamp}-{random}.{ext}`
- **Access**: Public read, authenticated write

## Prerequisites

1. Supabase project created
2. Environment variables configured
3. Database migrations applied

## Step 1: Environment Variables

Ensure these environment variables are set in your `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Step 2: Apply Storage Migration

Run the storage migration to create the bucket and policies:

```bash
# If using Supabase CLI
supabase db push

# Or manually run the migration in Supabase SQL Editor
# Copy and paste the contents of:
# supabase/migrations/20240101000003_storage_setup.sql
```

## Step 3: Verify Bucket Creation

In your Supabase dashboard:

1. Go to **Storage** section
2. Verify the `public_image` bucket exists
3. Check that it's set to **Public**

## Step 4: Test Storage Configuration

### Test 1: Check Bucket Exists
```sql
-- In Supabase SQL Editor
SELECT * FROM storage.buckets WHERE id = 'public_image';
```

Expected result: One row with bucket configuration

### Test 2: Check Storage Policies
```sql
-- In Supabase SQL Editor
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
```

Expected result: 4 policies (upload, update, delete, read)

### Test 3: Test File Upload
```javascript
// In browser console (after logging in)
const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
const formData = new FormData();
formData.append('file', file);

fetch('/api/upload/avatar', {
  method: 'POST',
  body: formData
}).then(res => res.json()).then(console.log);
```

Expected result: Success response with avatar URL

## Step 5: Configure CORS (if needed)

If you encounter CORS issues, add these headers to your Supabase project:

1. Go to **Settings** → **API**
2. Add your domain to **CORS origins**
3. Or use wildcard for development: `*`

## Storage Structure

### File Organization
```
public_image/
├── john_doe/
│   ├── avatar-1703123456789-abc123.jpg
│   └── avatar-1703123456790-def456.png
├── jane_smith/
│   └── avatar-1703123456791-ghi789.jpg
└── user123/
    └── avatar-1703123456792-jkl012.gif
```

### File Naming Convention
- Format: `avatar-{timestamp}-{random}.{extension}`
- Timestamp: Unix timestamp in milliseconds
- Random: 13-character random string
- Extension: Original file extension

## Security Features

### Row Level Security (RLS)
- Users can only upload to their own folder
- Users can only modify their own images
- Public read access for all images
- Automatic cleanup of old avatars

### File Validation
- File type validation (JPEG, PNG, GIF, WebP)
- File size limit (5MB)
- Content type verification
- Folder structure enforcement

### Automatic Cleanup
- Old avatar files are automatically deleted when new ones are uploaded
- Prevents storage bloat
- Maintains one avatar per user

## Monitoring and Maintenance

### Check Storage Usage
```sql
-- In Supabase SQL Editor
SELECT 
  bucket_id,
  COUNT(*) as file_count,
  SUM((metadata->>'size')::bigint) as total_size_bytes,
  ROUND(SUM((metadata->>'size')::bigint) / 1024.0 / 1024.0, 2) as total_size_mb
FROM storage.objects 
WHERE bucket_id = 'public_image'
GROUP BY bucket_id;
```

### List User Folders
```sql
-- In Supabase SQL Editor
SELECT DISTINCT 
  (string_to_array(name, '/'))[2] as user_folder,
  COUNT(*) as file_count
FROM storage.objects 
WHERE bucket_id = 'public_image'
GROUP BY (string_to_array(name, '/'))[2]
ORDER BY file_count DESC;
```

### Clean Up Orphaned Files
```sql
-- In Supabase SQL Editor
-- Find files older than 30 days
SELECT name, created_at
FROM storage.objects 
WHERE bucket_id = 'public_image'
  AND created_at < NOW() - INTERVAL '30 days'
ORDER BY created_at;
```

## Troubleshooting

### Common Issues

#### 1. Bucket Not Found
**Error**: `Bucket 'public_image' not found`
**Solution**: Run the storage migration

#### 2. Permission Denied
**Error**: `new row violates row-level security policy`
**Solution**: 
- Check if user is authenticated
- Verify RLS policies are applied
- Check user's name in JWT token

#### 3. File Upload Fails
**Error**: `Failed to upload file to storage`
**Solution**:
- Check file size (must be < 5MB)
- Check file type (must be image)
- Verify Supabase credentials
- Check network connectivity

#### 4. CORS Issues
**Error**: `CORS policy` errors
**Solution**:
- Add your domain to Supabase CORS settings
- Check if using HTTPS in production

### Debug Commands

#### Check User Authentication
```javascript
// In browser console
fetch('/api/auth/session')
  .then(res => res.json())
  .then(data => console.log('Session:', data));
```

#### Test Supabase Connection
```javascript
// In browser console
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
supabase.storage.from('public_image').list().then(console.log);
```

## Production Considerations

### 1. CDN Configuration
- Enable Supabase CDN for faster image delivery
- Configure cache headers for optimal performance

### 2. Backup Strategy
- Regular backups of storage bucket
- Consider cross-region replication

### 3. Monitoring
- Set up alerts for storage usage
- Monitor upload success rates
- Track file access patterns

### 4. Security
- Regular audit of RLS policies
- Monitor for unauthorized access
- Implement rate limiting if needed

## Migration from Local Storage

If migrating from local file storage:

1. **Backup existing files**:
   ```bash
   cp -r public/uploads/avatars/* backup/
   ```

2. **Upload to Supabase**:
   ```javascript
   // Script to migrate existing files
   const files = await fs.readdir('public/uploads/avatars');
   for (const file of files) {
     // Upload each file to Supabase
     // Update database with new URLs
   }
   ```

3. **Update database URLs**:
   ```sql
   -- Update avatar URLs to point to Supabase
   UPDATE users 
   SET avatar_url = REPLACE(avatar_url, '/uploads/avatars/', 'https://your-project.supabase.co/storage/v1/object/public/public_image/')
   WHERE avatar_url LIKE '/uploads/avatars/%';
   ```

4. **Remove old files**:
   ```bash
   rm -rf public/uploads/avatars/*
   ```

## Support

For additional help:
1. Check the troubleshooting guide: `docs/UPLOAD_PHOTO_TROUBLESHOOTING.md`
2. Review Supabase storage documentation
3. Check application logs for specific error messages
4. Verify environment variables are correctly set
