export const SITE_ACCESS_COOKIE = 'zat_site_access';

function encodeHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function createSiteAccessToken(password: string) {
  const secret = process.env.AUTH_SECRET || 'zat-site-access';
  const payload = new TextEncoder().encode(`${password}:${secret}`);
  const digest = await crypto.subtle.digest('SHA-256', payload);
  return encodeHex(digest);
}

export async function getExpectedSiteAccessToken() {
  const password = process.env.SITE_ACCESS_PASSWORD;

  if (!password) {
    return null;
  }

  return createSiteAccessToken(password);
}
