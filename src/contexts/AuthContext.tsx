import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/config/api';

interface SuperAdmin {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  is_password_changed: boolean;
}

interface AuthContextType {
  user: SuperAdmin | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<boolean>;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SuperAdmin | null>(() => {
    const stored = sessionStorage.getItem('admin_user');
    return stored ? JSON.parse(stored) : null;
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      sessionStorage.setItem('admin_user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('admin_user');
    }
  }, [user]);

  // Auto-refresh token every 28 minutes
  useEffect(() => {
    if (!user) return;

    const refreshInterval = setInterval(async () => {
      const success = await refreshAccessToken();
      if (!success) {
        console.warn('Auto-refresh failed');
      }
    }, 28 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [user]);

  const fetchMe = async (): Promise<SuperAdmin | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}admin/auth/me`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}admin/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.detail || 'Login failed');
    }

    const me = await fetchMe();
    if (!me) throw new Error('Failed to fetch user info');

    setUser(me);

    if (!me.is_password_changed) {
      navigate('/change-password');
      toast.info('Please change your password to continue');
    } else {
      navigate('/dashboard');
    }
  };

  const refreshAccessToken = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}admin/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        if (response.status === 400 || response.status === 401) {
          logout();
        }
        return false;
      }
      return true;
    } catch {
      return false;
    }
  };

  const authFetch = useCallback(async (url: string, options: RequestInit = {}): Promise<Response> => {
    const headers: HeadersInit = { ...options.headers };

    if (!(options.body instanceof FormData)) {
      (headers as Record<string, string>)['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers,
    });

    if (response.status === 401) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        const retryHeaders: HeadersInit = { ...options.headers };
        if (!(options.body instanceof FormData)) {
          (retryHeaders as Record<string, string>)['Content-Type'] = 'application/json';
        }
        return fetch(url, {
          ...options,
          credentials: 'include',
          headers: retryHeaders,
        });
      } else {
        throw new Error('Session expired. Please login again.');
      }
    }

    return response;
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE_URL}admin/auth/logout`, {
        method: 'GET',
        credentials: 'include',
      });
    } catch {
      // Continue with logout even if endpoint call fails
    } finally {
      setUser(null);
      sessionStorage.clear();
      navigate('/login');
    }
  }, [navigate]);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      refreshAccessToken,
      authFetch,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
