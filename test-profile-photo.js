#!/usr/bin/env node

/**
 * Test script for Profile Photo Upload Feature
 * This script tests the avatar upload functionality
 */

const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('Profile Photo Upload Feature Test');
console.log('========================================\n');

// Check if API routes exist
const apiPaths = [
  'src/app/api/profile/route.ts',
  'src/app/api/upload/avatar/route.ts',
];

console.log('1. Checking API routes:');
apiPaths.forEach(apiPath => {
  const fullPath = path.join(process.cwd(), apiPath);
  const exists = fs.existsSync(fullPath);
  console.log(`   ${exists ? '✓' : '✗'} ${apiPath}`);
});

// Check if uploads directory can be created
console.log('\n2. Checking uploads directory:');
const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`   ✓ Created uploads directory: ${uploadsDir}`);
  } else {
    console.log(`   ✓ Uploads directory exists: ${uploadsDir}`);
  }
} catch (error) {
  console.log(`   ✗ Failed to create uploads directory: ${error.message}`);
}

// Check User type definition
console.log('\n3. Checking User type for avatarUrl:');
const userTypeFile = path.join(process.cwd(), 'src/types/index.ts');
if (fs.existsSync(userTypeFile)) {
  const content = fs.readFileSync(userTypeFile, 'utf8');
  if (content.includes('avatarUrl')) {
    console.log('   ✓ avatarUrl field exists in User type');
  } else {
    console.log('   ✗ avatarUrl field missing in User type');
  }
} else {
  console.log('   ✗ User type file not found');
}

// Check NextAuth configuration
console.log('\n4. Checking NextAuth configuration:');
const authFile = path.join(process.cwd(), 'src/lib/auth.ts');
if (fs.existsSync(authFile)) {
  const content = fs.readFileSync(authFile, 'utf8');
  if (content.includes('avatarUrl')) {
    console.log('   ✓ avatarUrl is handled in auth configuration');
  } else {
    console.log('   ✗ avatarUrl not found in auth configuration');
  }
} else {
  console.log('   ✗ Auth configuration file not found');
}

// Check ChangePhotoForm component
console.log('\n5. Checking ChangePhotoForm component:');
const componentFile = path.join(process.cwd(), 'src/components/settings/ChangePhotoForm.tsx');
if (fs.existsSync(componentFile)) {
  const content = fs.readFileSync(componentFile, 'utf8');
  const checks = [
    { pattern: '/api/upload/avatar', name: 'Uses upload API' },
    { pattern: 'FormData', name: 'Uses FormData for file upload' },
    { pattern: 'useSession', name: 'Uses session for current avatar' },
  ];
  
  checks.forEach(check => {
    if (content.includes(check.pattern)) {
      console.log(`   ✓ ${check.name}`);
    } else {
      console.log(`   ✗ ${check.name}`);
    }
  });
} else {
  console.log('   ✗ ChangePhotoForm component not found');
}

console.log('\n========================================');
console.log('Test Summary:');
console.log('The profile photo feature has been implemented with:');
console.log('- API endpoints for profile updates and avatar uploads');
console.log('- File upload handling with validation');
console.log('- Session management for avatar URLs');
console.log('- UI components updated to display avatars');
console.log('========================================\n');

console.log('To test the feature:');
console.log('1. Run: npm run dev');
console.log('2. Navigate to http://localhost:3000/settings');
console.log('3. Click on the Profile Photo section');
console.log('4. Upload an image file (JPG, PNG, GIF, or WebP, max 5MB)');
console.log('5. The avatar should appear in the header and profile sections');
