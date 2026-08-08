import { createContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axios';
import { auth, googleProvider, IS_CONFIGURED } from '../config/firebase';
import { signInWithPopup } from 'firebase/auth';

export const AuthContext = createContext();

const DEMO_USER = {
  id: 'demo-user-123',
  _id: 'demo-user-123',
  firstName: 'Ada',
  lastName: 'Lovelace',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  role: 'company',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
};

const extract = (res) => res?.data?.data ?? res?.data ?? {};

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token && token !== 'demo-token') {
        try {
          const res = await axiosInstance.get('/auth/me');
          const payload = extract(res);
          if (payload) setUser(payload);
          else setUser(DEMO_USER);
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setUser(null);
        }
      } else if (token === 'demo-token') {
        setUser(DEMO_USER);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const res = await axiosInstance.post('/auth/login', { email, password });
      const payload = extract(res);

      const accessToken  = payload?.tokens?.accessToken;
      const refreshToken = payload?.tokens?.refreshToken;
      const userData     = payload?.user;

      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken || '');
      } else {
        localStorage.setItem('accessToken', 'demo-token');
      }

      const loggedInUser = userData || { ...DEMO_USER, email };
      setUser(loggedInUser);
      return payload;
    } catch (err) {
      if (!err.response) {
        localStorage.setItem('accessToken', 'demo-token');
        const demoAccount = { ...DEMO_USER, email };
        setUser(demoAccount);
        return { user: demoAccount };
      }
      const msg = err.response?.data?.message || 'Invalid email or password';
      throw new Error(msg);
    }
  }, []);

  const signup = useCallback(async (formData) => {
    try {
      const res = await axiosInstance.post('/auth/signup', formData);
      const payload = extract(res);

      const accessToken  = payload?.tokens?.accessToken;
      const refreshToken = payload?.tokens?.refreshToken;
      const userData     = payload?.user;

      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken || '');
      } else {
        localStorage.setItem('accessToken', 'demo-token');
      }

      const newUser = userData || {
        ...DEMO_USER,
        ...formData,
        name: `${formData.firstName} ${formData.lastName}`
      };
      setUser(newUser);
      return payload;
    } catch (err) {
      if (!err.response) {
        localStorage.setItem('accessToken', 'demo-token');
        const newUser = { ...DEMO_USER, ...formData, name: `${formData.firstName} ${formData.lastName}` };
        setUser(newUser);
        return { user: newUser };
      }
      const msg = err.response?.data?.message || 'Signup failed';
      throw new Error(msg);
    }
  }, []);

  const logout = useCallback(async () => {
    try { await axiosInstance.post('/auth/logout'); } catch {}
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  }, []);

  const refreshToken = useCallback(async () => {
    const refresh = localStorage.getItem('refreshToken');
    if (!refresh || refresh === 'demo-token') return 'demo-token';
    try {
      const res = await axiosInstance.post('/auth/refresh-token', { token: refresh });
      const payload = extract(res);
      const newToken = payload?.accessToken || payload?.tokens?.accessToken;
      if (newToken) {
        localStorage.setItem('accessToken', newToken);
        return newToken;
      }
      return 'demo-token';
    } catch {
      return 'demo-token';
    }
  }, []);

  const loginWithGoogle = useCallback(async (mode = 'login') => {
    try {
      let idToken = 'demo-google-id-token';

      if (IS_CONFIGURED && auth && googleProvider) {
        try {
          const result = await signInWithPopup(auth, googleProvider);
          idToken = await result.user.getIdToken();
        } catch (popupErr) {
          console.warn('Firebase popup sign-in fallback triggered:', popupErr);
        }
      }

      const res = await axiosInstance.post('/auth/google/init', { idToken, mode });
      const payload = extract(res);

      sessionStorage.setItem('pending_google_auth', JSON.stringify({
        tempToken: payload.tempToken,
        user: payload.user,
        mode: mode || payload.mode || 'login'
      }));

      return payload;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Google authentication failed';
      throw new Error(msg);
    }
  }, []);

  const updateUser = useCallback((data) => setUser((prev) => ({ ...prev, ...data })), []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, login, signup, logout, refreshToken, updateUser, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};
