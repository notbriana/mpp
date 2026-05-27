import { test } from '@playwright/test';

test.setTimeout(60000);

test('simulate malicious clients: rapid failures and burst requests', async ({ page }) => {
  const apiBase = process.env.VITE_API_BASE_URL || 'http://localhost:3001';

  // ensure a page is open for any evaluate calls
  await page.goto('about:blank');

  // Rapid failed login attempts using REST login endpoint to generate failedAuth logs
  for (let i = 0; i < 30; i++) {
    try {
      await page.request.post(`${apiBase}/api/auth/login`, {
        data: { email: 'attacker@example.com', password: 'wrong' + i }
      });
    } catch (e) {
      // ignore network errors
    }
    await page.waitForTimeout(80);
  }

  // Burst of API GET requests (spam) using request context
  const promises = [];
  for (let i = 0; i < 200; i++) {
    promises.push(page.request.get(`${apiBase}/api/assignments`).catch(()=>{}));
  }
  await Promise.all(promises);
});
