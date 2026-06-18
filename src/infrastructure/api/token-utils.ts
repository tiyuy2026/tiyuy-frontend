/**
 * Utilidades para manejo de tokens JWT en el frontend.
 * Permite detectar tokens expirados ANTES de hacer peticiones al backend.
 */

const TOKEN_KEYS = ['tiyuy-auth-token', 'tiyuy-auth-store', 'token', 'auth-token'] as const;

/**
 * Obtiene el token de localStorage, extrayéndolo de objetos Zustand si es necesario.
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;

  for (const key of TOKEN_KEYS) {
    const stored = localStorage.getItem(key);
    if (!stored) continue;

    let extracted: string = stored;
    while (extracted.startsWith('{"state":')) {
      try {
        const parsed = JSON.parse(extracted);
        const inner: string | undefined = parsed.state?.token;
        if (!inner || inner === extracted) break;
        extracted = inner;
      } catch {
        break;
      }
    }

    if (extracted) return extracted;
  }

  return null;
}

/**
 * Decodifica un JWT sin verificar firma (solo lectura del payload).
 * Útil para leer el campo `exp` y saber si expiró.
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null; // No es un JWT válido

    const payload = parts[1];
    // El payload viene en base64url, lo convertimos a base64 estándar
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(base64);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Verifica si un token JWT ha expirado.
 * Retorna true si el token es inválido, no tiene `exp`, o ya expiró.
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload) return true; // No se pudo decodificar → asumir expirado

  const exp = payload.exp as number | undefined;
  if (!exp) return true; // No tiene fecha de expiración → asumir expirado

  // `exp` está en segundos, `Date.now()` en milisegundos
  // Damos 30 segundos de margen para evitar race conditions
  const nowInSeconds = Math.floor(Date.now() / 1000);
  return exp <= nowInSeconds + 30;
}

/**
 * Limpia todos los tokens de localStorage.
 */
export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  for (const key of TOKEN_KEYS) {
    localStorage.removeItem(key);
  }
  localStorage.removeItem('tiyuy-auth-store');
}

/**
 * Verifica si hay un token guardado y si ha expirado.
 * Si expiró, lo limpia y retorna true.
 * Si no hay token o está vigente, retorna false.
 */
export function checkAndClearExpiredToken(): boolean {
  const token = getToken();
  if (!token) return false;

  if (isTokenExpired(token)) {
    clearTokens();
    return true;
  }

  return false;
}
