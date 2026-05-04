import type { User } from '../types/auth';

interface JwtPayload {
  exp?: number;
  sub?: string;
  email?: string;
  [key: string]: unknown;
}

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    '=',
  );

  return globalThis.atob(padded);
}

function parseJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    const jsonPayload = decodeURIComponent(
      decodeBase64Url(parts[1])
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );

    return JSON.parse(jsonPayload) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Decode JWT token without verification (client-side)
 * Chỉ dùng để extract payload, không verify signature
 */
export function decodeJWT(token: string): User | null {
  const decoded = parseJwtPayload(token);
  if (!decoded) {
    return null;
  }

  return {
    id: typeof decoded.sub === 'string' ? decoded.sub : '',
    email: typeof decoded.email === 'string' ? decoded.email : '',
    user_name:
      typeof decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ===
      'string'
        ? (decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] as string)
        : '',
    role:
      typeof decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ===
      'string'
        ? (decoded[
            'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
          ] as string)
        : '',
  };
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
  const decoded = parseJwtPayload(token);
  if (!decoded || typeof decoded.exp !== 'number') {
    return true;
  }

  return Date.now() >= decoded.exp * 1000;
}
