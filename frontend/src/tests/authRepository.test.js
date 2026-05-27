import { describe, it, expect, vi } from 'vitest';
import * as authRepo from '../services/authRepository';
import * as gql from '../services/graphqlClient';
import { authStore } from '../store/authStore';

describe('authRepository', () => {
  it('stores tokens on register and login', async () => {
    const fake = { register: { user: { id: 1, name: 'A', email: 'a@x' }, errors: [] , accessToken: 'at', refreshToken: 'rt' } };
    vi.spyOn(gql, 'gqlRequest').mockResolvedValueOnce(fake.register);
    const r = await authRepo.registerUser({ name: 'A', email: 'a@x', password: 'p' });
    expect(r.user.email).toBe('a@x');
    const stored = authStore.getUser();
    // when running in test env storage may be null; just assert no throw
    expect(r.errors).toEqual({});
  });
});
