import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth.js';
import { persistAuthSession, supabaseClient } from '../services/supabase.js';

const AuthContext = createContext(null);
const DEMO_ADMIN_TOKEN = 'hoardly-local-demo-admin';
const DEMO_ADMIN_USERNAME = import.meta.env.VITE_LOCAL_ADMIN_USERNAME || 'admin';
const DEMO_ADMIN_PASSWORD = import.meta.env.VITE_LOCAL_ADMIN_PASSWORD;
const DEMO_ADMIN_USER = {
  id: 'local-demo-admin',
  email: 'admin@hoardly.local',
  profile: { id: 'local-demo-admin', email: 'admin@hoardly.local', full_name: 'Hoardly Admin', role: 'admin' },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('auth_token'));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => setError(null), []);
  const syncProfile = useCallback((updatedProfile) => setProfile(updatedProfile), []);

  const initAuth = useCallback(async () => {
    let storedToken = localStorage.getItem('auth_token');
    if (supabaseClient && storedToken !== DEMO_ADMIN_TOKEN) {
      const { data } = await supabaseClient.auth.getSession();
      if (data.session) {
        storedToken = data.session.access_token;
        localStorage.setItem('auth_token', storedToken);
        setToken(storedToken);
      }
    }
    if (!storedToken) {
      setIsLoading(false);
      return;
    }
    if (import.meta.env.DEV && storedToken === DEMO_ADMIN_TOKEN) {
      setUser(DEMO_ADMIN_USER);
      setProfile(DEMO_ADMIN_USER.profile);
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.getMe();
      if (response && response.user) {
        setUser(response.user);
        setProfile(response.user.profile || null);
      }
    } catch (err) {
      console.warn('Authentication session restoration ended:', err.message);
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const subscription = supabaseClient?.auth.onAuthStateChange((event, session) => {
      if (!active || event === 'INITIAL_SESSION' || (import.meta.env.DEV && localStorage.getItem('auth_token') === DEMO_ADMIN_TOKEN)) return;
      if (!session) {
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
        setProfile(null);
        setIsLoading(false);
        return;
      }
      localStorage.setItem('auth_token', session.access_token);
      setToken(session.access_token);
      if (event === 'TOKEN_REFRESHED') return;
      // Fetch the profile through the API, outside the client's auth lock.
      authService.getMe().then((response) => {
        if (!active || localStorage.getItem('auth_token') !== session.access_token) return;
        setUser(response.user);
        setProfile(response.user.profile || null);
      }).catch(() => {}).finally(() => { if (active) setIsLoading(false); });
    }).data.subscription;
    initAuth();
    return () => { active = false; subscription?.unsubscribe(); };
  }, [initAuth]);

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      if (import.meta.env.DEV && email.trim().toLowerCase() !== 'admin' && email.trim().toLowerCase() === DEMO_ADMIN_USERNAME && password === DEMO_ADMIN_PASSWORD) {
        localStorage.setItem('auth_token', DEMO_ADMIN_TOKEN);
        setToken(DEMO_ADMIN_TOKEN);
        setUser(DEMO_ADMIN_USER);
        setProfile(DEMO_ADMIN_USER.profile);
        return { user: DEMO_ADMIN_USER, session: { access_token: DEMO_ADMIN_TOKEN } };
      }
      const res = await authService.login({ email, password });
      const accessToken = await persistAuthSession(res.session);
      setToken(accessToken);
      setUser(res.user);
      setProfile(res.user.profile || null);
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async ({ email, password, full_name, phone }) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authService.register({ email, password, full_name, phone });
      if (res.session?.access_token) {
        const accessToken = await persistAuthSession(res.session);
        setToken(accessToken);
        setUser(res.user);
        setProfile(res.user.profile || null);
      }
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (localStorage.getItem('auth_token') !== DEMO_ADMIN_TOKEN) {
        await authService.logout().catch(() => {});
        await supabaseClient?.auth.signOut({ scope: 'local' });
      }
    } finally {
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
      setProfile(null);
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authService.forgotPassword(email);
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (password) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authService.resetPassword(password);
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    profile,
    syncProfile,
    token,
    isAuthenticated: Boolean(user && token),
    isAdmin: profile?.role === 'admin',
    isDemoAdmin: import.meta.env.DEV && token === DEMO_ADMIN_TOKEN,
    isLoading,
    error,
    clearError,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return context;
}
