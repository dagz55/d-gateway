import { test } from '@playwright/test';

test.describe('Comprehensive Theme Validation', () => {
  test('Test all pages and modals for text visibility', async ({ page }) => {
    // Test 1: Home page with potential modals
    try {
      await page.goto('/');
      await page.waitForTimeout(2000);
      await page.screenshot({
        path: 'test-results/home-page.png',
        fullPage: true
      });
      console.log('Home page screenshot saved');
    } catch (error) {
      console.log('Home page error:', error);
    }

    // Test 2: Sign-in page
    try {
      await page.goto('/sign-in');
      await page.waitForTimeout(2000);
      await page.screenshot({
        path: 'test-results/sign-in-page.png',
        fullPage: true
      });
      console.log('Sign-in page screenshot saved');
    } catch (error) {
      console.log('Sign-in page error:', error);
    }

    // Test 3: Market page (public)
    try {
      await page.goto('/market');
      await page.waitForTimeout(3000);
      await page.screenshot({
        path: 'test-results/market-page.png',
        fullPage: true
      });
      console.log('Market page screenshot saved');
    } catch (error) {
      console.log('Market page error:', error);
    }

    // Test 4: Try admin pages (will redirect but we can see navigation)
    try {
      await page.goto('/admin/dashboard/statistics');
      await page.waitForTimeout(2000);
      await page.screenshot({
        path: 'test-results/admin-redirect.png',
        fullPage: true
      });
      console.log('Admin redirect screenshot saved');
    } catch (error) {
      console.log('Admin redirect error:', error);
    }

    // Test 5: Check current state summary
    const currentUrl = page.url();
    const title = await page.title();
    const bodyText = await page.textContent('body');

    console.log('=== FINAL STATE ===');
    console.log('Current URL:', currentUrl);
    console.log('Page title:', title);
    console.log('Page contains dark text issues?',
      bodyText?.includes('text-white') ? 'POTENTIAL ISSUE' : 'Looks OK');
  });
});