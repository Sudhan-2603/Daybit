import { useState, useCallback, useEffect } from 'react';
import type { User } from '../../domain/models';
import { api } from '../../infrastructure/api/apiClient';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const initAuth = useCallback(async () => {
    try {
      const current = await api.getMe();
      setUser(current);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const logout = useCallback(() => {
    api.logout();
    setUser(null);
  }, []);

  return {
    user,
    setUser,
    authModalOpen,
    setAuthModalOpen,
    isOffline: false,
    logout,
  };
}
