import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '@/lib/api';

export type User = {
  id: number;
  name: string;
  username: string;
  role: 'Admin' | 'Staff';
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const { user } = await api('/auth/me');
      setUser(user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function login(username: string, password: string) {
    const { user } = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    setUser(user);
  }

  async function logout() {
    await api('/auth/logout', { method: 'POST' });
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, isAdmin: user?.role === 'Admin', login, logout, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
