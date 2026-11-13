import React, { useState } from 'react';
import { X, Lock, Mail, UserPlus, LogIn, Sparkles, WifiOff } from 'lucide-react';
import { api } from '../../services/api';
import { firebaseAuth, googleProvider } from '../../services/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import type { User } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        const tokens = await api.register(email.trim(), password);
        api.setTokens(tokens.access_token, tokens.refresh_token);
      } else {
        const tokens = await api.login(email.trim(), password);
        api.setTokens(tokens.access_token, tokens.refresh_token);
      }

      const user = await api.getMe();
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setOauthLoading(true);
    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      let user: User | null = null;
      try {
        await api.signInWithFirebase(idToken);
        user = await api.getMe();
      } catch (backendErr) {
        console.warn('Backend sync deferred, establishing Firebase session profile:', backendErr);
        user = {
          id: result.user.uid,
          email: result.user.email || `${result.user.uid}@daybit.app`,
          phone_number: result.user.phoneNumber || undefined,
          created_at: new Date().toISOString(),
        };
        api.setTokens('fb_' + idToken.slice(0, 32), 'fb_refresh');
        localStorage.setItem('daybit_user', JSON.stringify(user));
      }

      if (user) {
        onSuccess(user);
        onClose();
      }
    } catch (err: unknown) {
      await signOut(firebaseAuth).catch(() => undefined);
      const message = err instanceof Error ? err.message : 'Google sign-in failed.';
      setError(message);
    } finally {
      setOauthLoading(false);
    }
  };

  const handleOfflineMode = () => {
    const offlineUser = api.enableOfflineMode();
    onSuccess(offlineUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-linear-enter">
      <div 
        className="w-full max-w-sm backdrop-blur-2xl bg-white/95 dark:bg-black/95 rounded-3xl shadow-2xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200/60 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-black dark:text-white">
                {isRegister ? 'Create Daybit Account' : 'Welcome to Daybit'}
              </h3>
              <p className="text-[11px] text-zinc-400">Sync tasks across all devices</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-black dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold text-xs sm:text-sm active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
            ) : isRegister ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Register</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </>
            )}
          </button>

          <div className="relative flex items-center py-1">
            <div className="flex-1 border-t border-zinc-200 dark:border-zinc-800" />
            <span className="px-3 text-[10px] text-zinc-400">OR</span>
            <div className="flex-1 border-t border-zinc-200 dark:border-zinc-800" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading || oauthLoading}
            className="w-full py-2.5 rounded-full border border-zinc-200 dark:border-zinc-700 text-black dark:text-white font-semibold text-xs sm:text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {oauthLoading ? (
              <span className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span className="font-bold text-sm">G</span>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <div className="relative flex items-center py-1">
            <div className="flex-1 border-t border-zinc-200 dark:border-zinc-800" />
            <span className="px-3 text-[10px] text-zinc-400">NO INTERNET / LOCAL</span>
            <div className="flex-1 border-t border-zinc-200 dark:border-zinc-800" />
          </div>

          <button
            type="button"
            onClick={handleOfflineMode}
            className="w-full py-2.5 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 border border-zinc-200/80 dark:border-zinc-800 active:scale-98"
          >
            <WifiOff className="w-4 h-4 text-zinc-400" />
            <span>Continue in Offline Mode</span>
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
            >
              {isRegister
                ? 'Already have an account? Sign in'
                : "Don't have an account? Register free"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
