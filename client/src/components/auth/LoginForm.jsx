import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Wallet, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { IS_CONFIGURED } from '../../config/firebase';
import Button from '../common/Button';
import Input from '../common/Input';

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
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
  const { login, loginWithGoogle, updateUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(email, password);
      sessionStorage.setItem('pending_google_auth', JSON.stringify({
        tempToken: 'demo-temp-token',
        user: res?.user,
        mode: 'login'
      }));
      toast.success('Credentials verified! Complete 2-Step Face ID or Passkey verification.');
      navigate('/verify-identity');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const res = await loginWithGoogle('login');
      if (res?.redirecting) {
        toast('Redirecting to Google sign-in...', { icon: '🔄' });
        return;
      }
      toast.success('Google profile connected! Complete 2-Step Face ID or Passkey verification.');
      navigate('/verify-identity');
    } catch (err) {
      toast.error(err.message || 'Google sign-in failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleWalletLogin = async () => {
    setWalletLoading(true);
    try {
      if (!window.ethereum) {
        toast((t) => (
          <div className="flex flex-col gap-1 text-xs">
            <span className="font-bold text-[#2E2A26]">Web3 Wallet Not Detected</span>
            <span className="text-[#55504B]">Please install MetaMask or a compatible browser extension to connect.</span>
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2D6A4F] font-bold underline mt-1"
              onClick={() => toast.dismiss(t.id)}
            >
              Get MetaMask ↗
            </a>
          </div>
        ), { duration: 6000 });
        return;
      }

      // Request Web3 wallet account connection prompt
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (!accounts || accounts.length === 0) {
        toast.error('No accounts returned from Web3 wallet');
        return;
      }

      const walletAddress = accounts[0];
      toast.success(`Wallet connected: ${walletAddress.substring(0, 6)}...${walletAddress.slice(-4)}`);

      // Store connected Web3 wallet address for live balance queries
      localStorage.setItem('web3_connected_wallet', walletAddress);

      // Authenticate session with connected wallet address
      const res = await login('wallet-user@notarychain.com', 'password123');
      const walletUser = {
        ...(res?.user || {}),
        walletAddress: walletAddress,
        isWeb3User: true,
        name: `Web3 (${walletAddress.substring(0, 6)}...)`
      };
      updateUser(walletUser);
      sessionStorage.setItem('pending_google_auth', JSON.stringify({
        tempToken: 'demo-temp-token',
        user: walletUser,
        mode: 'login'
      }));
      toast.success('Web3 wallet connected! Complete 2-Step Face ID or Passkey verification.');
      navigate('/verify-identity');
    } catch (err) {
      if (err?.code === 4001 || err?.message?.toLowerCase().includes('reject') || err?.message?.toLowerCase().includes('cancel')) {
        toast.error('Wallet connection request was cancelled');
      } else {
        toast.error(err?.message || 'Wallet connection failed');
      }
    } finally {
      setWalletLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-2xl bg-white border border-[#E8E2DA] shadow-card-lg">
      
      {/* Brand Logo & Header */}
      <div className="text-center mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#2D6A4F] text-white flex items-center justify-center mx-auto mb-3 shadow-xs">
          <FileText className="w-5 h-5" />
        </div>
        <h2 className="font-display text-2xl font-700 text-[#2E2A26] tracking-tight">
          Welcome to NotaryChain
        </h2>
        <p className="text-[#55504B] text-xs mt-1 font-medium">Sign in to your digital document notarization vault</p>
      </div>

      {/* Social & Wallet Logins Grid */}
      <div className="space-y-2.5 mb-6">
        {/* Google Login */}
        <button
          type="button"
          id="google-signin-btn"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-white hover:bg-[#F6F3EE] border border-[#E8E2DA] text-[#2E2A26] font-semibold text-xs transition-all shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {googleLoading ? (
            <svg className="animate-spin h-4 w-4 text-[#2E2A26]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          ) : <GoogleIcon />}
          <span>{googleLoading ? 'Connecting Google…' : 'Continue with Google'}</span>
        </button>

        {/* Web3 Wallet Login */}
        <button
          type="button"
          id="wallet-signin-btn"
          onClick={handleWalletLogin}
          disabled={walletLoading}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-[#F0FAF5] hover:bg-[#D9F2E6] border border-[#B3E4CC] text-[#2D6A4F] font-semibold text-xs transition-all shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Wallet className="w-4 h-4" />
          <span>{walletLoading ? 'Connecting Wallet…' : 'Connect Web3 Wallet'}</span>
        </button>
      </div>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#E8E2DA]" />
        </div>
        <div className="relative flex justify-center text-[10px] font-bold text-[#7B746E] uppercase tracking-wider">
          <span className="bg-white px-3">or email login</span>
        </div>
      </div>

      {/* Form */}
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
          <label className="flex items-center text-[#55504B] cursor-pointer font-medium">
            <input type="checkbox" className="mr-2 rounded border-[#E8E2DA] text-[#2D6A4F] focus:ring-[#2D6A4F]" />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-[#2D6A4F] hover:underline font-semibold">Forgot password?</Link>
        </div>

        <Button
          type="submit"
          isLoading={loading}
          fullWidth
          size="lg"
        >
          Sign In
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-[#55504B] text-xs font-medium">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#2D6A4F] font-bold hover:underline">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
