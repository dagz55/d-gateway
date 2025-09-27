import { test } from '@playwright/test';

test.describe('Visual Theme Validation', () => {
  test('Take screenshots of admin pages to verify text visibility', async ({ page }) => {
    // Try to navigate to statistics page and take screenshot
    try {
      await page.goto('/admin/dashboard/statistics');
      await page.waitForTimeout(3000); // Wait for page to load
      await page.screenshot({
        path: 'test-results/statistics-page.png',
        fullPage: true
      });
      console.log('Statistics page screenshot saved');
    } catch (error) {
      console.log('Statistics page error:', error);
      await page.screenshot({
        path: 'test-results/statistics-page-error.png',
        fullPage: true
      });
    }

    // Try to navigate to system status page and take screenshot
    try {
      await page.goto('/admin/dashboard/system-status');
      await page.waitForTimeout(3000);
      await page.screenshot({
        path: 'test-results/system-status-page.png',
        fullPage: true
      });
      console.log('System status page screenshot saved');
    } catch (error) {
      console.log('System status page error:', error);
      await page.screenshot({
        path: 'test-results/system-status-page-error.png',
        fullPage: true
      });
    }

    // Check what we get when we navigate to the pages
    await page.goto('/admin/dashboard/statistics');
    const title = await page.title();
    const url = page.url();
    console.log('Current URL:', url);
    console.log('Page title:', title);

    // Check if page content is there
    const bodyContent = await page.textContent('body');
    console.log('Page contains "System Statistics":', bodyContent?.includes('System Statistics'));
    console.log('Page contains "Sign in":', bodyContent?.includes('Sign in'));
  });
});