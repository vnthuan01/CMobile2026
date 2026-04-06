import { User } from '../store/authStore';

/**
 * Decode JWT token without verification (client-side)
 * Chỉ dùng để extract payload, không verify signature
 */
export function decodeJWT(token: string): User | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    // Decode base64url
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );

    const decoded = JSON.parse(jsonPayload);

    console.log('JWT PAYLOAD:', decoded);

    return {
      id: decoded.sub,
      email: decoded.email,
      user_name:
        decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
        '',
      role:
        decoded[
          'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
        ] || '',
    };
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

export function getUserFromToken(token: string): User | null {
  const decoded = decodeJWT(token);
  if (!decoded) {
    return null;
  }
  return decoded.role ? decoded : null;
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;

    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );

    const decoded = JSON.parse(jsonPayload);
    const exp = decoded.exp;

    if (!exp) return true;

    // Check if expired (exp is in seconds, Date.now() is in milliseconds)
    return Date.now() >= exp * 1000;
  } catch (error) {
    return true;
  }
}
