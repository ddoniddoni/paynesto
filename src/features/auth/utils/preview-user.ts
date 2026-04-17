export const PREVIEW_USER_ID = 'preview-user';

export function getNormalizedPreviewUserId(userId?: string | null) {
  return userId || PREVIEW_USER_ID;
}

export function isPreviewUserId(userId?: string | null) {
  return getNormalizedPreviewUserId(userId) === PREVIEW_USER_ID;
}
