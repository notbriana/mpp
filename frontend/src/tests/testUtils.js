import { expect } from '@playwright/test';

const GRAPHQL_URL = process.env.API_URL || 'http://localhost:3001/graphql';
const STORAGE_KEY = 'authUser_v1';

export async function registerGraphQL(request, user) {
  const res = await request.post(GRAPHQL_URL, {
    data: {
      query: `mutation Register($name:String!,$email:String!,$password:String!,$confirmPassword:String!){ register(name:$name,email:$email,password:$password,confirmPassword:$confirmPassword){ user { id name email } errors { field message } accessToken refreshToken } }`,
      variables: { name: user.name, email: user.email, password: user.password, confirmPassword: user.password }
    }
  });
  const body = await res.json();
  return body.data && body.data.register ? body.data.register : null;
}

export async function loginGraphQLSetSession(page, request, user) {
  const res = await request.post(GRAPHQL_URL, {
    data: {
      query: `mutation Login($email:String!,$password:String!){ login(email:$email,password:$password){ user { id name email roles } accessToken refreshToken errors { field message } } }`,
      variables: { email: user.email, password: user.password }
    }
  });
  const body = await res.json();
  const payload = body.data && body.data.login ? body.data.login : null;
  if (payload && payload.accessToken) {
    const storeObj = { ...payload.user, accessToken: payload.accessToken, refreshToken: payload.refreshToken };
    await page.evaluate((k, v) => sessionStorage.setItem(k, v), STORAGE_KEY, JSON.stringify(storeObj));
    return storeObj;
  }
  return null;
}

export async function ensureLoggedIn(page, request, user) {
  // try UI login first
  try {
    await page.goto('/login');
    await page.waitForSelector('input[name="email"]', { timeout: 5000 });
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    await page.click('button.auth-btn');
    // UI should navigate to dashboard
    await page.waitForURL(/dashboard/, { timeout: 8000 });
    return true;
  } catch (e) {
    // fallback to GraphQL login and set sessionStorage
    const s = await loginGraphQLSetSession(page, request, user);
    if (s) {
      // navigate to dashboard to exercise UI bits
      try { await page.goto('/dashboard'); } catch(e){}
      return true;
    }
    return false;
  }
}

export async function createAssignmentViaAPI(request, user, input) {
  // fetch user via login to get id
  const login = await request.post(GRAPHQL_URL, {
    data: { query: `mutation Login($email:String!,$password:String!){ login(email:$email,password:$password){ user { id } accessToken } }`, variables: { email: user.email, password: user.password } }
  });
  const body = await login.json();
  const payload = body.data && body.data.login ? body.data.login : null;
  const userId = payload && payload.user ? payload.user.id : null;
  if (!userId) return null;
  const res = await request.post(GRAPHQL_URL, {
    data: {
      query: `mutation Create($userId:ID!, $input:AssignmentInput!){ createAssignment(userId:$userId, input:$input){ assignment { id title course_name } errors { field message } } }`,
      variables: { userId, input }
    }
  });
  const j = await res.json();
  return j.data && j.data.createAssignment ? j.data.createAssignment : null;
}

export async function queryAssignments(request, user) {
  const res = await request.post(GRAPHQL_URL, {
    data: { query: `query($userId:ID!){ assignments(userId:$userId, page:1, pageSize:20){ items { id title course_name } total } }`, variables: { userId: user.id || null } }
  });
  const j = await res.json();
  return j.data && j.data.assignments ? j.data.assignments : null;
}
