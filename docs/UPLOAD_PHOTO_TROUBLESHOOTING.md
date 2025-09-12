# Upload Photo Troubleshooting Guide

This guide helps diagnose and fix issues with the profile photo upload functionality in the Zignal trading dashboard.

## Common Issues and Solutions

### 1. 401 Unauthorized Error

**Symptoms:**
- Console shows: `Failed to load resource: the server responded with a status of 401 (Unauthorized)`
- Upload button doesn't work
- No error message shown to user

**Root Cause:**
User is not authenticated or session has expired.

**Solutions:**

#### Check Authentication Status
```javascript
// In browser console
console.log('Session:', window.sessionStorage.getItem('next-auth.session-token'));
```

#### Verify Session Provider
Ensure the app is wrapped with SessionProvider in `src/app/providers.tsx`:
```tsx
import { SessionProvider } from 'next-auth/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}
```

#### Check Authentication Flow
1. Navigate to `/login`
2. Complete authentication process
3. Verify redirect to dashboard
4. Check if session persists on page refresh

### 2. 500 Internal Server Error

**Symptoms:**
- Console shows: `Failed to load resource: the server responded with a status of 500 (Internal Server Error)`
- Upload fails with generic error message

**Root Cause:**
Server-side error in the upload API endpoint.

**Solutions:**

#### Check Server Logs
```bash
# In terminal where dev server is running
npm run dev
# Look for error messages in the console output
```

#### Verify File Upload Directory
Ensure the uploads directory exists and has proper permissions:
```bash
# Create uploads directory if it doesn't exist
mkdir -p public/uploads/avatars
chmod 755 public/uploads/avatars
```

#### Check File Size and Type Validation
The API validates:
- File types: `image/jpeg`, `image/jpg`, `image/png`, `image/gif`, `image/webp`
- File size: Maximum 5MB

#### Verify Database Connection
Check if the mock database is working:
```javascript
// In browser console
fetch('/api/profile')
  .then(res => res.json())
  .then(data => console.log('Profile API:', data));
```

### 3. File Upload Not Working

**Symptoms:**
- File selection works but upload doesn't start
- No network requests visible in DevTools
- Button remains disabled

**Root Cause:**
Frontend validation or state management issues.

**Solutions:**

#### Check File Input Validation
```javascript
// In browser console
const fileInput = document.querySelector('input[type="file"]');
console.log('File input:', fileInput);
console.log('Accept attribute:', fileInput?.accept);
```

#### Verify Form State
Check if the component state is correct:
```javascript
// In React DevTools, check ChangePhotoForm component state:
// - isSubmitting: should be false initially
// - selectedFile: should be set when file is selected
// - previewUrl: should be created for image preview
```

#### Check File Selection Handler
Ensure the file change handler is working:
```tsx
const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    // ... rest of validation
  }
};
```

### 4. Preview Not Showing

**Symptoms:**
- File is selected but preview image doesn't appear
- Avatar shows fallback icon instead of selected image

**Root Cause:**
URL.createObjectURL() not working or state not updating.

**Solutions:**

#### Check Browser Support
```javascript
// In browser console
console.log('URL.createObjectURL supported:', typeof URL.createObjectURL === 'function');
```

#### Verify State Updates
```javascript
// In React DevTools, check:
// - previewUrl state
// - selectedFile state
// - currentAvatarUrl from session
```

#### Check Image URL Format
```javascript
// In browser console
const file = document.querySelector('input[type="file"]').files[0];
if (file) {
  const url = URL.createObjectURL(file);
  console.log('Preview URL:', url);
  // Test if URL works
  const img = new Image();
  img.onload = () => console.log('Image loaded successfully');
  img.onerror = () => console.log('Image failed to load');
  img.src = url;
}
```

### 5. Session Update Issues

**Symptoms:**
- Upload succeeds but avatar doesn't update in UI
- Need to refresh page to see new avatar
- Session not reflecting changes

**Root Cause:**
Session update not working properly.

**Solutions:**

#### Check Session Update
```javascript
// In browser console
// After successful upload, check if session was updated
fetch('/api/auth/session')
  .then(res => res.json())
  .then(data => console.log('Updated session:', data));
```

#### Verify updateSession Call
Ensure the session update is called after successful upload:
```tsx
// In ChangePhotoForm.tsx
const result = await uploadResponse.json();

// Update session to reflect new avatar
await updateSession();
await refetchProfile();
```

#### Check NextAuth Configuration
Verify NextAuth is configured to update session:
```tsx
// In src/lib/auth.ts
callbacks: {
  async session({ session, token }) {
    // Ensure user data is included in session
    if (token) {
      session.user = { ...session.user, ...token };
    }
    return session;
  },
}
```

## Debugging Steps

### 1. Enable Detailed Logging

Add console logs to track the upload process:

```tsx
const handleSubmit = async () => {
  console.log('Upload started, file:', selectedFile);
  
  if (!selectedFile) {
    console.log('No file selected');
    toast.error('Please select a file');
    return;
  }

  setIsSubmitting(true);
  console.log('Setting isSubmitting to true');
  
  try {
    const formData = new FormData();
    formData.append('file', selectedFile);
    console.log('FormData created:', formData.get('file'));
    
    const uploadResponse = await fetch('/api/upload/avatar', {
      method: 'POST',
      body: formData,
    });
    
    console.log('Upload response status:', uploadResponse.status);
    console.log('Upload response headers:', uploadResponse.headers);
    
    if (!uploadResponse.ok) {
      const error = await uploadResponse.json();
      console.error('Upload error:', error);
      throw new Error(error.message || 'Failed to upload photo');
    }
    
    const result = await uploadResponse.json();
    console.log('Upload success:', result);
    
    // ... rest of the function
  } catch (error) {
    console.error('Upload exception:', error);
    // ... error handling
  }
};
```

### 2. Check Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to upload a photo
4. Look for:
   - POST request to `/api/upload/avatar`
   - Request headers (should include authentication)
   - Response status and body
   - Any CORS errors

### 3. Verify API Endpoint

Test the API endpoint directly:

```bash
# Test with curl (will return 401 without auth, which is expected)
curl -X POST http://localhost:3000/api/upload/avatar \
  -F "file=@/path/to/test-image.jpg"
```

### 4. Check File Permissions

Ensure the uploads directory has proper permissions:

```bash
# Check current permissions
ls -la public/uploads/avatars/

# Fix permissions if needed
chmod 755 public/uploads/avatars/
chown -R $(whoami) public/uploads/avatars/
```

## Prevention

### 1. Add Error Boundaries

Wrap the ChangePhotoForm in an error boundary to catch and display errors gracefully.

### 2. Implement Retry Logic

Add retry mechanism for failed uploads:

```tsx
const retryUpload = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      await handleSubmit();
      break;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

### 3. Add Loading States

Provide clear feedback during upload process:

```tsx
{isSubmitting && (
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <Loader2 className="h-4 w-4 animate-spin" />
    Uploading photo...
  </div>
)}
```

### 4. Validate Before Upload

Add comprehensive client-side validation:

```tsx
const validateFile = (file: File): string | null => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return 'Please select an image file';
  }
  
  // Check file size
  if (file.size > 5 * 1024 * 1024) {
    return 'File size must be less than 5MB';
  }
  
  // Check file dimensions (optional)
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      if (img.width > 2048 || img.height > 2048) {
        resolve('Image dimensions should be less than 2048x2048 pixels');
      } else {
        resolve(null);
      }
    };
    img.onerror = () => resolve('Invalid image file');
    img.src = URL.createObjectURL(file);
  });
};
```

## Quick Fixes

### Reset Component State
```javascript
// In browser console
// Clear any stuck state
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Clear Upload Directory
```bash
# Remove all uploaded files (be careful!)
rm -rf public/uploads/avatars/*
```

### Restart Development Server
```bash
# Stop current server (Ctrl+C)
# Clear Next.js cache
rm -rf .next
# Restart
npm run dev
```

## Getting Help

If issues persist:

1. Check the browser console for specific error messages
2. Look at the server logs in the terminal
3. Verify all dependencies are installed: `npm install`
4. Check if the issue occurs in different browsers
5. Test with different image files (different formats/sizes)

## Supabase Storage Configuration

### Storage Bucket Setup

The application uses Supabase storage with the following configuration:

- **Bucket Name**: `public_image`
- **Folder Structure**: `public_image/{username}/avatar-{timestamp}-{random}.{ext}`
- **File Size Limit**: 5MB
- **Allowed Types**: JPEG, PNG, GIF, WebP
- **Access**: Public read, authenticated write

### Environment Variables Required

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Storage Policies

The following RLS policies are applied:

1. **Upload Policy**: Users can only upload to their own folder
2. **Update Policy**: Users can only update their own images
3. **Delete Policy**: Users can only delete their own images
4. **Read Policy**: Public read access to all images

### Troubleshooting Supabase Storage

#### Check Bucket Exists
```sql
-- In Supabase SQL Editor
SELECT * FROM storage.buckets WHERE id = 'public_image';
```

#### Check Storage Policies
```sql
-- In Supabase SQL Editor
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
```

#### Test File Upload
```javascript
// In browser console
const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
const formData = new FormData();
formData.append('file', file);

fetch('/api/upload/avatar', {
  method: 'POST',
  body: formData
}).then(res => res.json()).then(console.log);
```

#### Check Storage Usage
```sql
-- In Supabase SQL Editor
SELECT 
  bucket_id,
  COUNT(*) as file_count,
  SUM((metadata->>'size')::bigint) as total_size
FROM storage.objects 
WHERE bucket_id = 'public_image'
GROUP BY bucket_id;
```

### Common Supabase Storage Issues

#### 1. Bucket Not Found
**Error**: `Bucket 'public_image' not found`
**Solution**: Run the storage migration to create the bucket

#### 2. Permission Denied
**Error**: `new row violates row-level security policy`
**Solution**: Check if user is authenticated and policies are correctly set

#### 3. File Size Exceeded
**Error**: `File size exceeds limit`
**Solution**: Check bucket file_size_limit setting (should be 5242880 bytes = 5MB)

#### 4. Invalid File Type
**Error**: `Invalid file type`
**Solution**: Check allowed_mime_types in bucket configuration

## Related Files

- `src/components/settings/ChangePhotoForm.tsx` - Main upload component
- `src/app/api/upload/avatar/route.ts` - Upload API endpoint with Supabase storage
- `src/hooks/api/useProfile.ts` - Profile data management
- `src/lib/auth.ts` - Authentication configuration
- `src/app/providers.tsx` - Session provider setup
- `src/lib/supabase/client.ts` - Supabase client configuration
- `src/lib/supabase/server.ts` - Supabase server client
- `supabase/migrations/20240101000003_storage_setup.sql` - Storage bucket and policies setup
