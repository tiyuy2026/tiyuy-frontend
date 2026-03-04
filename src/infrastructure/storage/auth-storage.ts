const TOKEN_KEY = 'tiyuy-auth-token';
const USER_KEY = 'tiyuy-user';

export const authStorage = {
  setToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      // Guardar tanto en localStorage como en cookie
      localStorage.setItem(TOKEN_KEY, token);
      document.cookie = `jwt=${token}; path=/; max-age=86400; SameSite=Lax`;
    }
  },

  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      // Primero intentar cookie, luego localStorage
      const cookieMatch = document.cookie.match(/(^|;) ?jwt=([^;]*)(;|$)/);
      if (cookieMatch) return cookieMatch[2];
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  removeToken: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
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
