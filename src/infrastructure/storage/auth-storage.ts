const TOKEN_KEY = 'tiyuy-auth-token';
const USER_KEY = 'tiyuy-user';
const OLD_STORE_KEY = 'tiyuy-auth-store';

function extractRawToken(stored: string | null): string | null {
  if (!stored) return null;

  let current: string = stored;
  while (current.startsWith('{"state":')) {
    try {
      const parsed = JSON.parse(current);
      const extracted: string | undefined = parsed.state?.token;
      if (!extracted || extracted === current) break;
      current = extracted;
    } catch {
      break;
    }
  }

  return current || null;
}

export const authStorage = {
  setToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
      document.cookie = `jwt=${token}; path=/; max-age=86400; SameSite=Lax`;
    }
  },

  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      const cookieMatch = document.cookie.match(/(^|;) ?jwt=([^;]*)(;|$)/);
      if (cookieMatch) return cookieMatch[2];

      let raw = extractRawToken(localStorage.getItem(TOKEN_KEY));
      if (!raw) {
        raw = extractRawToken(localStorage.getItem(OLD_STORE_KEY));
      }

      if (raw) {
        const current = localStorage.getItem(TOKEN_KEY);
        if (raw !== current) {
          localStorage.setItem(TOKEN_KEY, raw);
        }
      }

      return raw;
    }
    return null;
  },

  removeToken: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(OLD_STORE_KEY);
      document.cookie = 'jwt=; path=/; max-age=0';
    }
  },

  setUser: (user: any): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  getUser: (): any | null => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  removeUser: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(USER_KEY);
    }
  },

  clear: (): void => {
    authStorage.removeToken();
    authStorage.removeUser();
  },
};
