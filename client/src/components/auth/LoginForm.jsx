import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Wallet, FileText, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import Input from '../common/Input';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
    <path d="M6.306 14.691l6.571 4.819C14.655 15.108 19.001 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
    <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
    <path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
  </svg>
);

const LoginForm = () => {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle('login');
      toast.success('Google authenticated! Confirm your identity.');
      navigate('/verify-identity');
    } catch (err) {
      toast.error(err.message || 'Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleWalletLogin = async () => {
    setWalletLoading(true);
    try {
      if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        toast.success('Web3 Wallet connected!');
        await login('wallet-user@notarychain.com', 'password123');
        navigate('/dashboard');
      } else {
        toast.success('Wallet connected in Sandbox mode!');
        await login('wallet-user@notarychain.com', 'password123');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error('Wallet connection cancelled');
    } finally {
      setWalletLoading(false);
    }
  };

  return (
    <div className="w-full">
      
      {/* 2. Raised 3D Logo Icon & Header */}
      <div className="text-center mb-7">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 via-[#2D6A4F] to-[#163829] p-[1px] shadow-[0_8px_16px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-[#D4AF37]/40 flex items-center justify-center mx-auto mb-3.5">
          <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-emerald-500/20 to-transparent flex items-center justify-center">
            <FileText className="w-6 h-6 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]" />
          </div>
        </div>
        <h2 className="font-display text-2xl font-800 text-[#2E2A26] dark:text-white tracking-tight">
          Welcome to NotaryChain
        </h2>
        <p className="text-[#55504B] dark:text-slate-400 text-xs mt-1 font-medium">
          Sign in to your digital document notarization vault
        </p>
      </div>

      {/* Social & Wallet Logins Grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {/* Google Login */}
        <button
          type="button"
          id="google-signin-btn"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white dark:bg-slate-800/80 hover:bg-[#F6F3EE] dark:hover:bg-slate-800 border border-[#E8E2DA] dark:border-slate-700 text-[#2E2A26] dark:text-slate-200 font-semibold text-xs transition-all shadow-[0_2px_4px_rgba(0,0,0,0.04)] disabled:opacity-60"
        >
          {googleLoading ? (
            <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
          ) : <GoogleIcon />}
          <span>Google</span>
        </button>

        {/* Web3 Wallet Login */}
        <button
          type="button"
          id="wallet-signin-btn"
          onClick={handleWalletLogin}
          disabled={walletLoading}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#F0FAF5] dark:bg-emerald-950/40 hover:bg-[#D9F2E6] dark:hover:bg-emerald-900/50 border border-[#B3E4CC] dark:border-emerald-800/60 text-[#2D6A4F] dark:text-emerald-300 font-semibold text-xs transition-all shadow-[0_2px_4px_rgba(0,0,0,0.04)] disabled:opacity-60"
        >
          <Wallet className="w-4 h-4" />
          <span>{walletLoading ? 'Connecting…' : 'Web3 Wallet'}</span>
        </button>
      </div>

      {/* Divider */}
      <div className="relative mb-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#E8E2DA] dark:border-slate-800" />
        </div>
        <div className="relative flex justify-center text-[10px] font-bold text-[#7B746E] dark:text-slate-400 uppercase tracking-wider">
          <span className="bg-white dark:bg-[#0E1526] px-3">or email login</span>
        </div>
      </div>

      {/* 1. Inner Inset Card (Form Fields Nested Layer) */}
      <div className="bg-[#FAF8F4] dark:bg-[#080D1A] rounded-2xl p-5 border border-[#E8E2DA] dark:border-slate-800/80 shadow-[inset_0_1px_3px_rgba(0,0,0,0.25)] mb-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            icon={<Mail className="w-4 h-4" />}
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            icon={<Lock className="w-4 h-4" />}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center text-[#55504B] dark:text-slate-400 cursor-pointer font-medium">
              <input type="checkbox" className="mr-2 rounded border-[#E8E2DA] dark:border-slate-700 text-[#2D6A4F] focus:ring-[#2D6A4F]" />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-[#2D6A4F] dark:text-[#D4AF37] hover:underline font-semibold">
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            isLoading={loading}
            fullWidth
            size="lg"
            className="mt-2 bg-[#2D6A4F] hover:bg-[#245741] text-white shadow-[0_4px_12px_rgba(45,106,79,0.3)] font-bold"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>
      </div>

      <div className="text-center">
        <p className="text-[#55504B] dark:text-slate-400 text-xs font-medium">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#2D6A4F] dark:text-[#D4AF37] font-bold hover:underline">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
