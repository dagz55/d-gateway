# Profile Photo Upload Feature Documentation

## Overview
The Profile Photo Upload feature allows users to upload, update, and remove their profile photos (avatars) in the member dashboard. The feature includes file validation, secure upload handling, and real-time UI updates across all components that display user avatars.

## Architecture

### Components
1. **ChangePhotoForm Component** (`src/components/settings/ChangePhotoForm.tsx`)
   - Handles file selection and preview
   - Validates file type and size
   - Manages upload state and user feedback
   - Integrates with session management for real-time updates

2. **API Routes**
   - `/api/profile` - Handles profile updates including avatar URL
   - `/api/upload/avatar` - Manages file uploads and storage

3. **UI Components**
   - Header Avatar (`src/components/layout/Header.tsx`)
   - Account Menu Avatar (`src/components/dashboard/AccountMenu.tsx`)
   - Settings Page Avatar (`src/components/settings/ChangePhotoForm.tsx`)

## Features

### File Upload
- **Supported Formats**: JPEG, PNG, GIF, WebP
- **Maximum File Size**: 5MB
- **Validation**: Client-side and server-side validation
- **Storage**: Local file system (development), configurable for cloud storage (production)

### User Experience
- Real-time preview before upload
- Progress indication during upload
- Success/error notifications via toast messages
- Automatic session update after successful upload
- Avatar displayed across all relevant UI components

## API Documentation

### GET /api/profile
Retrieves the current user's profile including avatar URL.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "fullName": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "avatarUrl": "/uploads/avatars/avatar-1-timestamp.jpg",
    // ... other user fields
  }
}
```

### PATCH /api/profile
Updates user profile information including avatar URL.

**Request Body:**
```json
{
  "action": "updateProfile",
  "avatarUrl": "/uploads/avatars/avatar-1-timestamp.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    // Updated user object
  }
}
```

### POST /api/upload/avatar
Uploads a new avatar image file.

**Request:** Multipart form data with file field
**Response:**
```json
{
  "success": true,
  "data": {
    "avatarUrl": "/uploads/avatars/avatar-1-timestamp.jpg",
    "filename": "avatar-1-timestamp.jpg",
    "message": "Avatar uploaded successfully"
  }
}
```

### DELETE /api/upload/avatar
Removes the current user's avatar.

**Response:**
```json
{
  "success": true,
  "message": "Avatar removed successfully"
}
```

## Development Setup

### File Storage
In development, uploaded files are stored in:
```
public/uploads/avatars/
```

This directory is:
- Created automatically on first upload
- Excluded from version control via `.gitignore`
- Accessible via public URL paths

### Environment Variables
No additional environment variables required for development.

## Production Deployment

### Cloud Storage Migration

For production deployment, migrate from local file storage to cloud storage (e.g., AWS S3, Cloudinary, or Vercel Blob Storage).

#### AWS S3 Integration Example

1. **Install AWS SDK:**
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

2. **Environment Variables:**
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=your-bucket-name
```

3. **Update Upload Handler:**
```typescript
// src/app/api/upload/avatar/route.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// In POST handler:
const command = new PutObjectCommand({
  Bucket: process.env.AWS_S3_BUCKET,
  Key: `avatars/${filename}`,
  Body: buffer,
  ContentType: file.type,
});

await s3Client.send(command);
const avatarUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/avatars/${filename}`;
```

#### Vercel Blob Storage Integration

1. **Install Vercel Blob:**
```bash
npm install @vercel/blob
```

2. **Environment Variables:**
```env
BLOB_READ_WRITE_TOKEN=your-token
```

3. **Update Upload Handler:**
```typescript
import { put } from '@vercel/blob';

// In POST handler:
const blob = await put(`avatars/${filename}`, buffer, {
  access: 'public',
});
const avatarUrl = blob.url;
```

### Database Considerations

For production with a real database:

1. **Add avatarUrl column to users table:**
```sql
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255);
```

2. **Update database queries to include avatarUrl:**
```typescript
// Example with Prisma
const user = await prisma.user.update({
  where: { id: userId },
  data: { avatarUrl },
});
```

### Security Considerations

1. **File Type Validation**: Always validate MIME types server-side
2. **File Size Limits**: Enforce maximum file sizes
3. **Filename Sanitization**: Use generated filenames to prevent path traversal
4. **Rate Limiting**: Implement rate limiting on upload endpoints
5. **Authentication**: Ensure all endpoints require authentication
6. **CORS**: Configure appropriate CORS policies for production

## Testing

### Manual Testing
1. Run the development server: `npm run dev`
2. Navigate to Settings page
3. Test file upload with various formats and sizes
4. Verify avatar appears in header and profile sections
5. Test avatar removal functionality

### Automated Testing
Run the test script:
```bash
node test-profile-photo.js
```

This validates:
- API routes existence
- Directory permissions
- Type definitions
- Component integration

## Troubleshooting

### Common Issues

1. **Upload fails with 500 error**
   - Check file permissions for `public/uploads/avatars/`
   - Verify Node.js has write access to the directory

2. **Avatar not displaying after upload**
   - Clear browser cache
   - Check if the file was successfully saved
   - Verify the avatarUrl is correctly stored in the database

3. **Session not updating**
   - Ensure `updateSession()` is called after upload
   

## Future Enhancements

1. **Image Processing**
   - Automatic resizing and optimization
   - Generate multiple sizes for responsive display
   - Convert to WebP for better performance

2. **Advanced Features**
   - Crop and rotate functionality
   - Avatar history/gallery
   - Default avatar options
   - Gravatar integration fallback

3. **Performance Optimizations**
   - CDN integration for avatar delivery
   - Lazy loading for avatar images
   - Progressive image loading

## Support

For issues or questions about the profile photo feature:
1. Check this documentation
2. Review the test script output
3. Check browser console for errors
4. Verify all dependencies are installed

## Version History

- **v1.0.0** (Current) - Initial implementation with local storage
  - File upload and validation
  - Session integration
  - UI components update
  - Basic error handling
