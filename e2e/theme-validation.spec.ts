import { test, expect } from '@playwright/test';

test.describe('Dashboard Theme Validation', () => {
  // Test will skip authentication by directly testing the rendered HTML and CSS

  test('System Statistics page uses theme-aware text classes', async ({ page }) => {
    // Go directly to the page to check the CSS classes without auth
    await page.goto('/admin/dashboard/statistics');

    // Check that main heading uses text-foreground instead of text-white
    const mainHeading = page.locator('h1:has-text("System Statistics")');
    await expect(mainHeading).toHaveClass(/text-foreground/);

    // Check that stat values use text-foreground
    const statValues = page.locator('[class*="text-2xl"][class*="font-bold"]');
    const firstStatValue = statValues.first();
    await expect(firstStatValue).toHaveClass(/text-foreground/);

    // Check card titles use text-foreground
    const cardTitles = page.locator('[class*="CardTitle"]:has-text("User Growth"), [class*="CardTitle"]:has-text("System Performance")');
    for (let i = 0; i < await cardTitles.count(); i++) {
      await expect(cardTitles.nth(i)).toHaveClass(/text-foreground/);
    }

    // Verify no hardcoded text-white classes exist (should all be replaced)
    const whiteTextElements = page.locator('[class*="text-white"]');
    const count = await whiteTextElements.count();
    expect(count).toBe(0); // Should be 0 after our fixes
  });

  test('System Status page uses theme-aware text classes', async ({ page }) => {
    await page.goto('/admin/dashboard/system-status');

    // Check main heading
    const mainHeading = page.locator('h1:has-text("System Status")');
    await expect(mainHeading).toHaveClass(/text-foreground/);

    // Check status card values
    const statusValues = page.locator('p:has-text("All Systems Operational"), p:has-text("99.8%"), p:has-text("245ms")');
    for (let i = 0; i < await statusValues.count(); i++) {
      await expect(statusValues.nth(i)).toHaveClass(/text-foreground/);
    }

    // Check service names and resource labels
    const serviceElements = page.locator('[class*="font-medium"][class*="text-foreground"]');
    expect(await serviceElements.count()).toBeGreaterThan(0);

    // Verify no hardcoded text-white classes
    const whiteTextElements = page.locator('[class*="text-white"]');
    const count = await whiteTextElements.count();
    expect(count).toBe(0);
  });

  test('Packages page already uses correct theme classes', async ({ page }) => {
    await page.goto('/admin/dashboard/packages');

    // Check that packages page uses text-foreground (it should already be correct)
    const mainHeading = page.locator('h1:has-text("Management")');
    await expect(mainHeading).toHaveClass(/text-foreground/);

    // This page should have been correctly implemented already
    const foregroundTextElements = page.locator('[class*="text-foreground"]');
    expect(await foregroundTextElements.count()).toBeGreaterThan(0);
  });

  test('Computed CSS values for text color', async ({ page }) => {
    await page.goto('/admin/dashboard/statistics');

    // Wait for the page to load
    await page.waitForSelector('h1:has-text("System Statistics")');

    // Get computed styles for elements that should use theme colors
    const mainHeading = page.locator('h1:has-text("System Statistics")');
    const computedColor = await mainHeading.evaluate(el =>
      window.getComputedStyle(el).color
    );

    // The color should be white (#ffffff) or rgb(255, 255, 255) in dark mode
    // which corresponds to our --foreground CSS variable
    expect(computedColor).toMatch(/rgb\(255,?\s*255,?\s*255\)|#ffffff/i);

    // Test a stat value as well
    const statValue = page.locator('[class*="text-2xl"][class*="font-bold"]').first();
    const statColor = await statValue.evaluate(el =>
      window.getComputedStyle(el).color
    );
    expect(statColor).toMatch(/rgb\(255,?\s*255,?\s*255\)|#ffffff/i);
  });
});