# Supabase Storage Policy Setup (Dashboard Method)

Since the SQL script is causing syntax errors, use the Supabase Dashboard policy editor instead:

## Step 1: Create the Bucket First

Run this simple SQL in the SQL Editor:

```sql
-- Create bucket only (no policies)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'public_image',
  'public_image',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif']
) ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'];
```

## Step 2: Add Policies via Dashboard

Go to **Storage** → **Policies** → **New Policy** and create these 4 policies:

### Policy 1: Upload Images (INSERT)
- **Name**: `authenticated_upload_images`
- **Operation**: `INSERT`
- **Target roles**: `authenticated`
- **USING expression**: (leave empty)
- **WITH CHECK expression**:
```sql
bucket_id = 'public_image' AND 
storage.extension(name) IN ('jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif')
```

### Policy 2: Update Images (UPDATE)
- **Name**: `authenticated_update_images`
- **Operation**: `UPDATE`
- **Target roles**: `authenticated`
- **USING expression**:
```sql
bucket_id = 'public_image' AND 
storage.extension(name) IN ('jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif')
```
- **WITH CHECK expression**:
```sql
bucket_id = 'public_image' AND 
storage.extension(name) IN ('jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif')
```

### Policy 3: Delete Images (DELETE)
- **Name**: `authenticated_delete_images`
- **Operation**: `DELETE`
- **Target roles**: `authenticated`
- **USING expression**:
```sql
bucket_id = 'public_image' AND 
storage.extension(name) IN ('jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif')
```

### Policy 4: Read Images (SELECT)
- **Name**: `public_read_images`
- **Operation**: `SELECT`
- **Target roles**: `public` (or leave empty for public access)
- **USING expression**:
```sql
bucket_id = 'public_image' AND 
storage.extension(name) IN ('jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif')
```

## Step 3: Verify Setup

After creating all policies, you should see:
- ✅ 1 bucket: `public_image`
- ✅ 4 policies: upload, update, delete, read
- ✅ Public bucket enabled

## Step 4: Test

Restart your dev server and test photo upload/remove functionality.
