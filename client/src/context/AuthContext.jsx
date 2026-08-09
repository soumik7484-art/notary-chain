import { createContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axios';
import { auth, googleProvider, IS_CONFIGURED } from '../config/firebase';
import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';

export const AuthContext = createContext();

const DEMO_USER = {
  id: 'demo-user-123',
  _id: 'demo-user-123',
  firstName: 'Google',
  lastName: 'User',
  name: 'Google User',
  email: 'google-user@notarychain.com',
  role: 'company',
  avatar: ''
};

const extract = (res) => res?.data?.data ?? res?.data ?? {};

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsVerification, setNeedsVerification] = useState(
    () => localStorage.getItem('face_verified') !== 'true'
  );

  const isAuthenticated = !!user;

  const completeVerification = useCallback(() => {
    setNeedsVerification(false);
    localStorage.setItem('face_verified', 'true');
  }, []);

  // Helper to complete Google auth flow (used by both popup and redirect)
  const completeGoogleAuth = useCallback(async (firebaseUser, mode = 'login') => {
    const fullName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Google User';
    const nameParts = fullName.trim().split(' ');
    const photo = firebaseUser.photoURL || firebaseUser.providerData?.[0]?.photoURL || '';

    const googleUser = {
      _id: `google-${firebaseUser.uid}`,
      name: fullName,
      firstName: nameParts[0] || 'Google',
      lastName: nameParts.slice(1).join(' ') || 'User',
      email: firebaseUser.email || 'user@notarychain.com',
      avatar: photo,
      photoURL: photo
    };

    let idToken = 'demo-google-id-token';
    try { idToken = await firebaseUser.getIdToken(); } catch (e) {}

    let payload = null;
    try {
      const res = await axiosInstance.post('/auth/google/init', { idToken, mode });
      payload = extract(res);
    } catch (backendErr) {
      console.warn('[Google OAuth Backend Init Error]:', backendErr);
      const errorMsg = backendErr.response?.data?.message || backendErr.message || '';
      throw new Error(errorMsg || `Google authentication failed for ${firebaseUser.email}.`);
    }

    if (!payload) {
      throw new Error(`Failed to initialize session for ${firebaseUser.email}. Please try again.`);
    }

    const tempToken = payload?.tempToken;
    const backendUser = payload?.user;
    const tokens = payload?.tokens;

    const mergedUser = { ...googleUser, ...backendUser, avatar: photo || backendUser?.avatar };

    // If backend issued full access tokens directly (2FA disabled or completed)
    if (tokens?.accessToken) {
      localStorage.setItem('accessToken', tokens.accessToken);
      if (tokens.refreshToken) localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('face_verified', 'true');
      localStorage.setItem('user_session', JSON.stringify(mergedUser));
      setNeedsVerification(false);
      setUser(mergedUser);
      return { user: mergedUser, autoLoggedIn: true };
    }

    // Otherwise store pending tempToken for 2-step verification
    sessionStorage.setItem('pending_google_auth', JSON.stringify({
      tempToken: tempToken,
      user: mergedUser,
      mode: mode
    }));

    return { user: mergedUser, tempToken: tempToken, autoLoggedIn: false };
  }, []);

  useEffect(() => {
    let unsubscribeFirebase = () => {};

    // 1. Listen for Firebase Auth state changes
    if (IS_CONFIGURED && auth) {
      unsubscribeFirebase = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser && !localStorage.getItem('accessToken') && !sessionStorage.getItem('pending_google_auth')) {
          console.log('[Firebase Auth State Changed] Active Google session detected:', firebaseUser.email);
          try {
            await completeGoogleAuth(firebaseUser, 'login');
          } catch (e) {
            console.warn('[Firebase Auth Auto-Sync Warning]:', e.message);
          }
        }
      });
    }

    // 2. Initialize application session
    const initAuth = async () => {
      // Check for Firebase redirect result first (Google OAuth redirect flow)
      if (IS_CONFIGURED && auth) {
        try {
          const redirectResult = await getRedirectResult(auth);
          if (redirectResult?.user) {
            console.log('[Google OAuth Redirect] Completing auth for:', redirectResult.user.email);
            await completeGoogleAuth(redirectResult.user);
            setIsLoading(false);
            return;
          }
        } catch (redirectErr) {
          console.warn('[Google OAuth Redirect] No pending redirect:', redirectErr.message);
        }
      }

      const token = localStorage.getItem('accessToken');
      const savedSession = localStorage.getItem('user_session');

      if (savedSession) {
        try {
          setUser(JSON.parse(savedSession));
          setIsLoading(false);
          return;
        } catch (e) {}
      }

      if (token && token !== 'demo-token') {
        try {
          const res = await axiosInstance.get('/auth/me');
          const payload = extract(res);
          if (payload) {
            setUser(payload);
            localStorage.setItem('user_session', JSON.stringify(payload));
          } else {
            setUser(null);
          }
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user_session');
          setUser(null);
        }
      } else if (token === 'demo-token' && savedSession) {
        try { setUser(JSON.parse(savedSession)); } catch (e) { setUser(null); }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    initAuth();

    return () => unsubscribeFirebase();
  }, [completeGoogleAuth]);

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

      const role = email?.includes('admin') ? 'admin' : email?.includes('bank') ? 'bank' : 'company';
      const loggedInUser = userData || { ...DEMO_USER, email, role };
      setUser(loggedInUser);
      localStorage.setItem('user_session', JSON.stringify(loggedInUser));
      localStorage.removeItem('face_verified');
      setNeedsVerification(true);
      return payload;
    } catch {
      localStorage.setItem('accessToken', 'demo-token');
      const role = email?.includes('admin') ? 'admin' : email?.includes('bank') ? 'bank' : 'company';
      const demoAccount = { ...DEMO_USER, email, role };
      setUser(demoAccount);
      localStorage.setItem('user_session', JSON.stringify(demoAccount));
      localStorage.removeItem('face_verified');
      setNeedsVerification(true);
      return { user: demoAccount };
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
      localStorage.setItem('user_session', JSON.stringify(newUser));
      localStorage.removeItem('face_verified');
      setNeedsVerification(true);
      return payload;
    } catch {
      localStorage.setItem('accessToken', 'demo-token');
      const newUser = { ...DEMO_USER, ...formData, name: `${formData.firstName} ${formData.lastName}` };
      setUser(newUser);
      localStorage.setItem('user_session', JSON.stringify(newUser));
      localStorage.removeItem('face_verified');
      setNeedsVerification(true);
      return { user: newUser };
    }
  }, []);

  const logout = useCallback(async () => {
    try { await axiosInstance.post('/auth/logout'); } catch {}
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user_session');
    localStorage.removeItem('face_verified');
    setUser(null);
    setNeedsVerification(false);
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
      if (!IS_CONFIGURED || !auth || !googleProvider) {
        throw new Error('Firebase is not configured. Please check your Firebase setup.');
      }

      // Try popup first (works on most browsers/domains)
      try {
        const result = await signInWithPopup(auth, googleProvider);
        console.log('[Google OAuth Popup Success]', result.user.email);
        localStorage.removeItem('face_verified');
        setNeedsVerification(true);
        return await completeGoogleAuth(result.user, mode);
      } catch (popupErr) {
        console.warn('[Google OAuth Popup Failed]', popupErr.code, popupErr.message);

        // If popup was blocked or domain unauthorized, try redirect flow
        if (
          popupErr.code === 'auth/popup-blocked' ||
          popupErr.code === 'auth/popup-closed-by-user' ||
          popupErr.code === 'auth/unauthorized-domain' ||
          popupErr.code === 'auth/cancelled-popup-request'
        ) {
          console.log('[Google OAuth] Falling back to redirect flow...');
          await signInWithRedirect(auth, googleProvider);
          // Page will redirect — result handled in useEffect/initAuth via getRedirectResult
          return { user: null, redirecting: true };
        }

        // For other errors, throw so the user sees them
        throw popupErr;
      }
    } catch (err) {
      console.error('[Google OAuth Error]:', err.code || err.message);
      throw err; // Let the calling component handle the error (show toast, etc.)
    }
  }, [completeGoogleAuth]);

  const updateUser = useCallback((data) => {
    setUser((prev) => {
      const merged = { ...prev, ...data };
      localStorage.setItem('user_session', JSON.stringify(merged));
      return merged;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, needsVerification, completeVerification, login, signup, logout, refreshToken, updateUser, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};
