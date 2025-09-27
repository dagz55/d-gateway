import { test } from '@playwright/test';

test.describe('Profile Page Validation', () => {
  test('Take screenshot of profile page to check text visibility', async ({ page }) => {
    try {
      // Navigate to profile page
      await page.goto('/profile');
      await page.waitForTimeout(3000); // Wait for page to load

      // Take screenshot to see current state
      await page.screenshot({
        path: 'test-results/profile-page.png',
        fullPage: true
      });
      console.log('Profile page screenshot saved');

      // Check what we get when we navigate to the profile page
      const title = await page.title();
      const url = page.url();
      console.log('Current URL:', url);
      console.log('Page title:', title);

      // Check if page content is there or if it redirects to sign-in
      const bodyContent = await page.textContent('body');
      console.log('Page contains "Profile Settings":', bodyContent?.includes('Profile Settings'));
      console.log('Page contains "Sign in":', bodyContent?.includes('Sign in'));
      console.log('Page contains "Account Information":', bodyContent?.includes('Account Information'));

    } catch (error) {
      console.log('Profile page error:', error);
      await page.screenshot({
        path: 'test-results/profile-page-error.png',
        fullPage: true
      });
    }
  });
});