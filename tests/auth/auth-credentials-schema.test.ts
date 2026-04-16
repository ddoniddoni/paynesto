import { describe, expect, it } from 'vitest';

import { authCredentialsSchema } from '../../src/features/auth/schemas/auth-credentials-schema';

describe('authCredentialsSchema', () => {
  it('accepts a valid email/password pair', () => {
    const result = authCredentialsSchema.safeParse({
      email: 'hello@paynesto.app',
      password: 'secret12',
    });

    expect(result.success).toBe(true);
  });

  it('rejects an invalid email', () => {
    const result = authCredentialsSchema.safeParse({
      email: 'hello-at-paynesto.app',
      password: 'secret12',
    });

    expect(result.success).toBe(false);
  });

  it('rejects a password shorter than 6 characters', () => {
    const result = authCredentialsSchema.safeParse({
      email: 'hello@paynesto.app',
      password: '12345',
    });

    expect(result.success).toBe(false);
  });
});
