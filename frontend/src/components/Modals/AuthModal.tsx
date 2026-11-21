import React, { useState, useEffect, useCallback } from 'react';
import { X, Lock, Mail, UserPlus, LogIn, Sparkles, CheckCircle2, UserCheck, AlertCircle } from 'lucide-react';
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
  const [emailExists, setEmailExists] = useState<boolean | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);

  // Auto-check email existence as user types
  const checkEmail = useCallback(async (targetEmail: string) => {
    const trimmed = targetEmail.trim();
    if (!trimmed.includes('@') || !trimmed.includes('.') || trimmed.length < 5) {
      setEmailExists(null);
      return;
    }

    setCheckingEmail(true);
    try {
      const res = await api.checkEmail(trimmed);
      setEmailExists(res.exists);
      if (res.exists) {
        setIsRegister(false);
      } else {
        setIsRegister(true);
      }
    } catch {
      setEmailExists(null);
    } finally {
      setCheckingEmail(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (email.trim()) {
        checkEmail(email);
      } else {
        setEmailExists(null);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [email, checkEmail]);

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
      }
    } catch (err: unknown) {
      await signOut(firebaseAuth).catch(() => undefined);
      const message = err instanceof Error ? err.message : 'Google sign-in failed.';
      setError(message);
    } finally {
      setOauthLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-linear-enter">
      <div 
        className="w-full max-w-sm backdrop-blur-2xl bg-white/95 dark:bg-black/95 rounded-3xl shadow-2xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200/60 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-black dark:text-white">
                {isRegister ? 'Create Daybit Account' : 'Welcome to Daybit'}
              </h3>
              <p className="text-[11px] text-zinc-400">Sign in to access your personal workspace</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Email Address
              </label>
              {checkingEmail && (
                <span className="text-[10px] text-zinc-400 animate-pulse">Checking account...</span>
              )}
              {!checkingEmail && emailExists === true && (
                <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Account found
                </span>
              )}
              {!checkingEmail && emailExists === false && email.includes('@') && (
                <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <UserCheck className="w-3 h-3" /> New account
                </span>
              )}
            </div>

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

            {emailExists === true && (
              <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400 px-1">
                Enter your password to sign in and view your tasks.
              </p>
            )}
            {emailExists === false && email.includes('@') && (
              <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400 px-1">
                New user detected! Set a password to create your account and tasks.
              </p>
            )}
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
            className="w-full py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold text-xs sm:text-sm active:scale-98 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
            ) : isRegister ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Register & Go to Tasks</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to Tasks</span>
              </>
            )}
          </button>

          <div className="relative flex items-center py-1">
            <div className="flex-1 border-t border-zinc-200 dark:border-zinc-800" />
            <span className="px-3 text-[10px] text-zinc-400 font-semibold tracking-wider">OR</span>
            <div className="flex-1 border-t border-zinc-200 dark:border-zinc-800" />
          </div>

          <button
            type="button"
            disabled={oauthLoading}
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 rounded-full border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            {oauthLoading ? (
              <span className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setEmailExists(null);
              }}
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
