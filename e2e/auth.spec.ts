import { test, expect } from '@playwright/test';

test.describe('Role Based Access Control', () => {
  
  test('Customer login should redirect to home page', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'user123');
    await page.click('button[type="submit"]');

    // Nên dùng Regular Expression (Regex) để khớp với cả /, /en, hoặc /vi
    await expect(page).toHaveURL(/.*(\/(en|vi))?\/?$/);
  });

  test('Kitchen staff login should access KDS and see restricted sidebar', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'kitchen@example.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL('**/admin/dashboard');

    // Màn hình sẽ có thẻ h2 báo hiệu đây là Dashboard
    await expect(page.locator('h2', { hasText: 'Dashboard' })).toBeVisible({ timeout: 10000 });
    
    // Ensure "Kitchen Display (KDS)" is in the sidebar
    // Dùng getByRole thay vì text= để linh hoạt hơn và ít lỗi
    await expect(page.getByRole('link', { name: /Kitchen Display/i })).toBeVisible();

    // Ensure "Categories" or "Menu Items" is NOT in the sidebar for Kitchen
    await expect(page.getByRole('link', { name: /Categories/i })).toBeHidden();
  });

  test('Cashier login should access POS and see restricted sidebar', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'cashier@example.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForURL('**/admin/dashboard');

    // Màn hình sẽ có thẻ h2 báo hiệu đây là Dashboard
    await expect(page.locator('h2', { hasText: 'Dashboard' })).toBeVisible({ timeout: 10000 });
    
    // Ensure "POS / Cashier" is in the sidebar
    await expect(page.getByRole('link', { name: /POS \/ Cashier/i })).toBeVisible();

    // Ensure "Categories" is NOT in the sidebar for Cashier
    await expect(page.getByRole('link', { name: /Categories/i })).toBeHidden();
  });
});
