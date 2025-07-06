import { test, expect } from '@playwright/test';

test.describe('E2E Flow: Login, Create Issue, Verify', () => {
  test('Happy path: login, create issue, see issue', async ({ page }) => {
    await page.goto('http://localhost:5173/login');

    await page.locator('[data-testid="email-input"]').fill('admin@example.com');
    await page.locator('[data-testid="password-input"]').fill('password');
    await page.getByRole('button', { name: /sign in/i }).click();

    // ✅ Wait for home page ("/") instead of "/dashboard"
    await page.waitForURL('**/');
    await expect(page).toHaveURL(/\/$/);
    
    // Go to create issue page
    await page.getByText('Create Issue').click();
    await page.waitForURL('**/create-issue');

    // Fill issue form using test IDs
    await page.locator('[data-testid="title-input"]').fill('E2E Test Issue');
    await page.locator('[data-testid="description-input"]').fill('This issue was created by Playwright E2E test.');
    await page.locator('[data-testid="severity-select"]').selectOption('HIGH');
    await page.locator('[data-testid="tags-input"]').fill('e2e');
    await page.keyboard.press('Enter');

    // Submit the form
    await page.locator('[data-testid="submit-issue"]').click();

    // Wait for redirect to issues list or dashboard
    await page.waitForURL(/dashboard|issues/);

    // Validate issue appears
    await expect(page.locator('text=E2E Test Issue')).toBeVisible();
  });
});
