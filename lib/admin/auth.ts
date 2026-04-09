export const ADMIN_TOKEN_KEY = 'laroma_admin_token';
export const ADMIN_COOKIE_NAME = 'laroma_admin_token';

function readCookie(name: string) {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
}

export function getAdminToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem(ADMIN_TOKEN_KEY) || readCookie(ADMIN_COOKIE_NAME);
}

export function setAdminSession(token: string) {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  document.cookie = `${ADMIN_COOKIE_NAME}=${encodeURIComponent(token)}; Max-Age=604800; Path=/; SameSite=Lax`;
}

export function clearAdminSession() {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(ADMIN_TOKEN_KEY);
  document.cookie = `${ADMIN_COOKIE_NAME}=; Max-Age=0; Path=/; SameSite=Lax`;
}
