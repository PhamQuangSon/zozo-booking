import { test, expect } from '@playwright/test';

test.describe('Role Based Access Control', () => {
  
  test('Customer login should redirect to home page', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'user123');
    await page.click('button[type="submit"]');

    // Should redirect to homepage because customers cannot access admin
    await expect(page).toHaveURL('/');
  });

  test('Kitchen staff login should access KDS and see restricted sidebar', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'kitchen@example.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard or KDS
    await page.waitForURL('**/admin/dashboard');

    // Check sidebar for KDS link (assuming the default restaurant is selected)
    // Wait for the restaurant collapsible to be visible
    await expect(page.locator('text=Pasta Paradise')).toBeVisible({ timeout: 10000 });
    
    // Ensure "Kitchen Display (KDS)" is in the sidebar
    await expect(page.locator('text=Kitchen Display (KDS)')).toBeVisible();

    // Ensure "Categories" or "Menu Items" is NOT in the sidebar for Kitchen
    await expect(page.locator('text=Categories')).toBeHidden();
  });

  test('Cashier login should access POS and see restricted sidebar', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'cashier@example.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForURL('**/admin/dashboard');

    // Check sidebar for POS link
    await expect(page.locator('text=Pasta Paradise')).toBeVisible({ timeout: 10000 });
    
    // Ensure "POS / Cashier" is in the sidebar
    await expect(page.locator('text=POS / Cashier')).toBeVisible();

    // Ensure "Categories" is NOT in the sidebar for Cashier
    await expect(page.locator('text=Categories')).toBeHidden();
  });
});
