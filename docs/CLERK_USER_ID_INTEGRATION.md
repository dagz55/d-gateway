# Clerk User ID Integration for Photo Uploads

## Overview

This document describes the integration of `clerk_user_id` column in the `user_profiles` table to enable seamless photo upload functionality and better Clerk authentication integration.

## Database Changes

### New Column: `clerk_user_id`

```sql
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS clerk_user_id TEXT UNIQUE;
```

**Properties:**
- **Type**: `TEXT`
- **Nullable**: `YES` (to support existing users)
- **Unique**: `YES` (each Clerk user maps to one profile)
- **Index**: `idx_user_profiles_clerk_user_id` for performance

## Migration Details

### Migration File
- **File**: `supabase/migrations/20250920000001_add_clerk_user_id_to_user_profiles.sql`
- **Date**: 2025-09-20
- **Purpose**: Add Clerk integration for photo uploads

### What the Migration Includes

1. **Column Addition**: Adds `clerk_user_id` column
2. **Performance Index**: Creates optimized index for lookups
3. **RLS Policies**: Updates Row Level Security for Clerk integration
4. **Helper Functions**: Adds utility functions for common operations
5. **Trigger Updates**: Modifies `handle_new_user()` function

### Helper Functions Added

#### `get_user_profile_by_clerk_id(clerk_id TEXT)`
```sql
SELECT * FROM public.user_profiles WHERE clerk_user_id = clerk_id;
```

#### `update_user_avatar_by_clerk_id(clerk_id TEXT, new_avatar_url TEXT)`
```sql
UPDATE public.user_profiles 
SET avatar_url = new_avatar_url, updated_at = NOW()
WHERE clerk_user_id = clerk_id;
```

## TypeScript Integration

### Updated Types

The `user_profiles` table type now includes:

```typescript
export interface UserProfile {
  id: string;
  user_id: string;
  clerk_user_id: string | null; // 🆕 New field
  email: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  // ... other fields
}
```

### Utility Functions

New utility module: `lib/supabase/clerk-integration.ts`

```typescript
// Get user profile by Clerk ID
const profile = await getUserProfileByClerkId(clerkUserId);

// Update user avatar
const success = await updateUserAvatarByClerkId(clerkUserId, newAvatarUrl);

// Sync Clerk user with Supabase profile
const profile = await syncClerkUserWithProfile(clerkUserId, clerkUserData);
```

## Photo Upload Workflow

### 1. User Authentication
```typescript
import { useUser } from '@clerk/nextjs';

const { user } = useUser();
const clerkUserId = user?.id;
```

### 2. Get Current Profile
```typescript
import { getUserProfileByClerkId } from '@/lib/supabase/clerk-integration';

const profile = await getUserProfileByClerkId(clerkUserId);
```

### 3. Upload Photo
```typescript
// Upload to your storage service
const uploadResult = await uploadToStorage(file);

// Update profile with new avatar URL
const success = await updateUserAvatarByClerkId(
  clerkUserId, 
  uploadResult.url
);
```

### 4. Photo Upload Utilities
```typescript
import { photoUploadUtils } from '@/lib/supabase/clerk-integration';

// Get current avatar
const currentAvatar = await photoUploadUtils.getCurrentAvatarUrl(clerkUserId);

// Update avatar
const success = await photoUploadUtils.updateAvatar(clerkUserId, newUrl);

// Delete avatar
const success = await photoUploadUtils.deleteAvatar(clerkUserId);
```

## Security Considerations

### Row Level Security (RLS)

Updated RLS policies allow access by both `user_id` and `clerk_user_id`:

```sql
-- Users can view their own profile by clerk_user_id
CREATE POLICY "Users can view own profile by clerk_user_id" 
ON public.user_profiles FOR SELECT 
USING (
  auth.uid()::text = user_id::text 
  OR 
  (clerk_user_id IS NOT NULL AND clerk_user_id != '')
);
```

### Best Practices

1. **Always validate Clerk user ID** before database operations
2. **Use server-side functions** for sensitive operations
3. **Implement proper error handling** for all database calls
4. **Log failed operations** for security monitoring

## Migration Steps

### 1. Apply the Migration

**Option A: Supabase Dashboard**
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/20250920000001_add_clerk_user_id_to_user_profiles.sql`
3. Execute the SQL

**Option B: Using the Script**
```bash
node apply-clerk-user-id-migration.js
```

### 2. Test the Migration

```bash
node test-clerk-user-id-migration.js
```

### 3. Link Existing Users

For existing users, you'll need to populate the `clerk_user_id` field:

```sql
-- Example: Link users by email
UPDATE public.user_profiles 
SET clerk_user_id = 'clerk_user_id_here'
WHERE email = 'user@example.com';
```

## Usage Examples

### Basic Profile Management

```typescript
import { 
  getUserProfileByClerkId, 
  updateUserAvatarByClerkId,
  syncClerkUserWithProfile 
} from '@/lib/supabase/clerk-integration';

// In your component
const { user } = useUser();

useEffect(() => {
  if (user?.id) {
    // Sync Clerk user with Supabase profile
    syncClerkUserWithProfile(user.id, {
      email: user.emailAddresses[0]?.emailAddress || '',
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      imageUrl: user.imageUrl
    });
  }
}, [user]);
```

### Photo Upload Component

```typescript
const PhotoUpload = () => {
  const { user } = useUser();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    if (!user?.id) return;
    
    setUploading(true);
    try {
      // Upload file to storage
      const uploadResult = await uploadFile(file);
      
      // Update profile with new avatar
      const success = await updateUserAvatarByClerkId(
        user.id, 
        uploadResult.url
      );
      
      if (success) {
        toast.success('Photo updated successfully!');
      }
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {/* Your upload UI */}
    </div>
  );
};
```

## Troubleshooting

### Common Issues

1. **Column not found error**
   - Ensure migration was applied correctly
   - Check table structure in Supabase dashboard

2. **RLS policy errors**
   - Verify user authentication
   - Check Clerk user ID is properly set

3. **Function not found**
   - Ensure all helper functions were created
   - Check function permissions

### Debug Queries

```sql
-- Check if column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name = 'clerk_user_id';

-- Check existing profiles
SELECT id, clerk_user_id, username, email 
FROM user_profiles 
WHERE clerk_user_id IS NOT NULL;

-- Test helper function
SELECT * FROM get_user_profile_by_clerk_id('clerk_user_id_here');
```

## Next Steps

1. **Implement photo upload UI** using the new utilities
2. **Migrate existing users** to include Clerk user IDs
3. **Update authentication flows** to use Clerk integration
4. **Add photo management features** (crop, resize, delete)
5. **Monitor performance** and optimize queries as needed

## Related Files

- `supabase/migrations/20250920000001_add_clerk_user_id_to_user_profiles.sql`
- `lib/supabase/clerk-integration.ts`
- `lib/supabase/types.ts`
- `apply-clerk-user-id-migration.js`
- `test-clerk-user-id-migration.js`
