import { describe, expect, it } from 'vitest';

import { getAuthCallbackParams } from '../../src/features/auth/utils/auth-callback-url';

describe('getAuthCallbackParams', () => {
  it('reads access and refresh tokens from a hash callback url', () => {
    const result = getAuthCallbackParams(
      'subscriptionmobile://auth/callback#access_token=token123&refresh_token=refresh456'
    );

    expect(result).toEqual({
      accessToken: 'token123',
      refreshToken: 'refresh456',
      code: undefined,
      errorCode: undefined,
      errorDescription: undefined,
    });
  });

  it('reads an auth code from a query callback url', () => {
    const result = getAuthCallbackParams('http://localhost:8081/auth/callback?code=oauth-code-1');

    expect(result).toEqual({
      accessToken: undefined,
      refreshToken: undefined,
      code: 'oauth-code-1',
      errorCode: undefined,
      errorDescription: undefined,
    });
  });

  it('prefers structured error details when oauth fails', () => {
    const result = getAuthCallbackParams(
      'subscriptionmobile://auth/callback#error=access_denied&error_description=User%20cancelled'
    );

    expect(result).toEqual({
      accessToken: undefined,
      refreshToken: undefined,
      code: undefined,
      errorCode: 'access_denied',
      errorDescription: 'User cancelled',
    });
  });
});
