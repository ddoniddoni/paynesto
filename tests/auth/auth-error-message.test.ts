import { describe, expect, it } from 'vitest';

import { getAuthErrorMessage } from '../../src/features/auth/utils/auth-error-message';

describe('getAuthErrorMessage', () => {
  it('maps invalid credentials to a Korean helper message', () => {
    expect(getAuthErrorMessage(new Error('Invalid login credentials'))).toBe(
      '이메일 또는 비밀번호를 다시 확인해 주세요.'
    );
  });

  it('maps email confirmation errors to a verification message', () => {
    expect(getAuthErrorMessage(new Error('Email not confirmed'))).toBe(
      '이메일 인증을 완료한 뒤 로그인해 주세요.'
    );
  });

  it('falls back to the original error message when no mapping exists', () => {
    expect(getAuthErrorMessage(new Error('Something custom happened'))).toBe(
      'Something custom happened'
    );
  });

  it('returns a generic message for non-Error values', () => {
    expect(getAuthErrorMessage('plain string')).toBe(
      '인증 처리 중 알 수 없는 오류가 발생했어요.'
    );
  });
});
