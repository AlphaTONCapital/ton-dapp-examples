'use client';

import { useCallback, useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { initData, useSignal } from '@tma.js/sdk-react';
import { authenticateTelegram } from '@/lib/actions/auth';
import type { AuthResponse, User } from '@/types';

const AUTH_TOKEN_KEY = 'ton-dapp-auth-token';
const AUTH_USER_KEY = 'ton-dapp-auth-user';

export function useTelegramAuth() {
  const rawInitData = useSignal(initData.raw);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load stored auth on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    const storedUser = localStorage.getItem(AUTH_USER_KEY);

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setIsInitialized(true);
  }, []);

  const authMutation = useMutation({
    mutationFn: (data: string) => authenticateTelegram(data),
    onSuccess: (data: AuthResponse) => {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
    },
  });

  const authenticate = useCallback(async () => {
    if (!rawInitData) {
      // In development, skip auth if no init data (mock mode)
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          '[Dev] Skipping authentication - no Telegram init data available'
        );
        return null;
      }
      throw new Error('Telegram init data not available');
    }

    return authMutation.mutateAsync(rawInitData);
  }, [rawInitData, authMutation]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  }, []);

  return {
    user,
    token,
    isAuthenticated: !!token,
    isInitialized,
    isLoading: authMutation.isPending,
    error: authMutation.error,
    authenticate,
    logout,
  };
}
