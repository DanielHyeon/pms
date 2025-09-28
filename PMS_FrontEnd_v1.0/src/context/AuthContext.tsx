import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { User } from '../api/types';
import { fetchCurrentUser } from '../api';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  setAuth: (nextUser: User, nextToken: string) => void;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      setAuth: (nextUser, nextToken) => {
        setUser(nextUser);
        setToken(nextToken);
        localStorage.setItem('pms.auth.token', nextToken);
        localStorage.setItem('pms.auth.user', JSON.stringify(nextUser));
      },
      clearAuth: () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('pms.auth.token');
        localStorage.removeItem('pms.auth.user');
      },
    }),
    [user, token],
  );

  useEffect(() => {
    const storedToken = localStorage.getItem('pms.auth.token');
    const storedUser = localStorage.getItem('pms.auth.user');

    if (storedToken) {
      setToken(storedToken);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser) as User);
        } catch (err) {
          console.warn('Failed to parse stored user', err);
        }
      }
    }

    setIsBootstrapping(false);
  }, []);

  useEffect(() => {
    if (!token || user) {
      return;
    }

    let isCancelled = false;

    fetchCurrentUser(token)
      .then((fetchedUser) => {
        if (!isCancelled) {
          setUser(fetchedUser);
          localStorage.setItem('pms.auth.user', JSON.stringify(fetchedUser));
        }
      })
      .catch((err) => {
        console.error('Failed to restore user from token', err);
        if (!isCancelled) {
          localStorage.removeItem('pms.auth.token');
          localStorage.removeItem('pms.auth.user');
          setToken(null);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [token, user]);

  if (isBootstrapping) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
