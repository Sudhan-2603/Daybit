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
      const offlineUser = api.enableOfflineMode();
      setUser(offlineUser);
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const logout = useCallback(() => {
    api.logout();
    setUser(api.enableOfflineMode());
  }, []);

  return {
    user,
    setUser,
    authModalOpen,
    setAuthModalOpen,
    isOffline: api.isOfflineSession(),
    logout,
  };
}
