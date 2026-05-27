const { test, request } = require('@playwright/test');

test('simulate rapid bot requests to naive endpoint', async ({}) => {
  const url = process.env.TARGET_URL || 'http://10.196.181.73:3001/api/analytics/naive/top-users';
  const req = await request.newContext();
  for (let i = 0; i < 200; i++) {
    await req.get(url);
  }
});
