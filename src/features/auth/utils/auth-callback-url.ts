export type AuthCallbackParams = {
  accessToken?: string;
  refreshToken?: string;
  code?: string;
  errorCode?: string;
  errorDescription?: string;
};

function appendParams(target: URLSearchParams, rawValue?: string) {
  if (!rawValue) {
    return;
  }

  const normalized =
    rawValue.startsWith('?') || rawValue.startsWith('#') ? rawValue.slice(1) : rawValue;

  const params = new URLSearchParams(normalized);

  params.forEach((value, key) => {
    target.set(key, value);
  });
}

export function getAuthCallbackParams(url: string): AuthCallbackParams {
  const hash = url.includes('#') ? url.split('#', 2)[1] : '';
  const query = url.includes('?') ? url.split('?', 2)[1]?.split('#', 1)[0] : '';
  const params = new URLSearchParams();

  appendParams(params, query);
  appendParams(params, hash);

  return {
    accessToken: params.get('access_token') ?? undefined,
    refreshToken: params.get('refresh_token') ?? undefined,
    code: params.get('code') ?? undefined,
    errorCode: params.get('error_code') ?? params.get('error') ?? undefined,
    errorDescription: params.get('error_description') ?? undefined,
  };
}
