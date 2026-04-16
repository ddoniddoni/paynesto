export function getAuthErrorMessage(error: unknown) {
  if (error instanceof Error) {
    const normalizedMessage = error.message.toLowerCase();

    if (normalizedMessage.includes('invalid login credentials')) {
      return '이메일 또는 비밀번호를 다시 확인해 주세요.';
    }

    if (normalizedMessage.includes('email not confirmed')) {
      return '이메일 인증을 완료한 뒤 로그인해 주세요.';
    }

    if (normalizedMessage.includes('password should be at least')) {
      return '비밀번호 길이가 너무 짧아요. 6자 이상으로 입력해 주세요.';
    }

    if (normalizedMessage.includes('unable to validate email address')) {
      return '올바른 이메일 형식인지 다시 확인해 주세요.';
    }

    return error.message;
  }

  return '인증 처리 중 알 수 없는 오류가 발생했어요.';
}
