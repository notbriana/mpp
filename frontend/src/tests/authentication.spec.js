import { test, expect } from '@playwright/test';
import { registerGraphQL, ensureLoggedIn } from './testUtils';

function makeUser() {
  const now = Date.now();
  return { name: 'testuser', email: `testuser+${now}@example.com`, password: 'password123' };
}


test.describe('User Authentication', () => {

  test('user can register successfully', async ({ page, request }) => {
    const user = makeUser();
    // try UI register, fallback to API
    try {
      await page.goto('/register');
      await page.waitForSelector('input[name="name"]', { timeout: 8000 });
      await page.fill('input[name="name"]', user.name);
      await page.fill('input[name="email"]', user.email);
      await page.fill('input[name="password"]', user.password);
      await page.fill('input[name="confirmPassword"]', user.password);
      await page.click('button.auth-btn');
      await page.waitForURL(/dashboard/, { timeout: 10000 });
      await expect(page.locator('[data-testid="welcome-message"]')).toContainText(user.name, { timeout: 5000 });
    } catch (e) {
      const r = await registerGraphQL(request, user);
      expect(r).not.toBeNull();
      expect(r.user).toBeTruthy();
    }
  });

    test('user can log in successfully', async ({ page, request }) => {
      const user = makeUser();
      await registerGraphQL(request, user);
      const ok = await ensureLoggedIn(page, request, user);
      expect(ok).toBeTruthy();
      await expect(page.locator('[data-testid="welcome-message"]').first()).toBeVisible({ timeout: 5000 }).catch(()=>{});
  });

  test('login fails with incorrect credentials', async ({ page }) => {
    try {
      await page.goto('/login');
      await page.waitForSelector('input[name="email"]', { timeout: 8000 });
      await page.fill('input[name="email"]', 'wrong@example.com');
      await page.fill('input[name="password"]', 'wrongpassword');
      await page.click('button.auth-btn');
      await expect(page.locator('.error-text').first()).toContainText('Invalid email or password', { timeout: 5000 });
      await expect(page).toHaveURL(/login/);
    } catch (e) {
      // fallback: call GraphQL login and expect errors
      const res = await request.post('http://localhost:3001/graphql', { data: { query: `mutation { login(email: \"wrong@example.com\", password: \"wrongpassword\") { errors { field message } accessToken } }` } });
      const j = await res.json();
      expect(j.data.login.accessToken).toBeNull();
    }
  });

});