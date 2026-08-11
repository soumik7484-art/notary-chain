import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Building, ShieldCheck, FileCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
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

const SignupForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ email: '', password: '', confirm: '', firstName: '', lastName: '', phone: '', role: 'company' });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      const res = await signup(formData);
      sessionStorage.setItem('pending_google_auth', JSON.stringify({
        tempToken: 'demo-temp-token',
        user: res?.user || { ...formData, name: `${formData.firstName} ${formData.lastName}` },
        mode: 'register'
      }));
      toast.success('Account created! Please complete security & Web3 wallet setup.');
      navigate('/verify-identity');
    } catch (err) {
      const msg = err.message || 'Signup failed';
      if (msg.includes('Already signed in') || msg.includes('already exists') || msg.includes('Please sign in')) {
        toast.error('Already signed in with this account. Please sign in instead.');
        setTimeout(() => navigate('/login'), 1200);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    try {
      const res = await loginWithGoogle('register');
      if (res?.redirecting) {
        toast('Redirecting to Google sign-in...', { icon: '🔄' });
        return;
      }
      toast.success('Google account created! Please complete 2-Step Face ID or Passkey registration.');
      navigate('/verify-identity');
    } catch (err) {
      const msg = err.message || 'Google sign-up failed.';
      if (msg.includes('Already signed in') || msg.includes('already exists') || msg.includes('Please sign in')) {
        toast.error('Already signed in with this account. Please sign in instead.');
        setTimeout(() => navigate('/login'), 1200);
      } else {
        toast.error(msg);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const p = formData.password;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  return (
    <div className="w-full max-w-lg p-8 rounded-2xl bg-white border border-[#E8E2DA] shadow-card relative overflow-hidden">
      {/* Progress bar header */}
      <div className="absolute top-0 left-0 w-full h-1 bg-[#F6F3EE]">
        <motion.div
          className="h-full bg-[#2D6A4F]"
          initial={{ width: '33%' }}
          animate={{ width: `${(step / 3) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="text-center mb-6">
        <h2 className="font-display text-2xl font-700 text-[#2E2A26] tracking-tight">Create Account</h2>
        <p className="text-[#7B746E] text-xs font-medium uppercase tracking-wider mt-1">Step {step} of 3</p>
      </div>

      {/* Google Sign-Up (only show on step 1) */}
      {step === 1 && (
        <div className="mb-5">
          <button
            type="button"
            id="google-signup-btn"
            onClick={handleGoogleSignup}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-[#F6F3EE] border border-[#E8E2DA] text-[#2E2A26] font-medium text-sm transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <svg className="animate-spin h-4 w-4 text-[#2E2A26]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : <GoogleIcon />}
            <span>{googleLoading ? 'Signing up…' : 'Sign up with Google'}</span>
          </button>
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#E8E2DA]" /></div>
            <div className="relative flex justify-center text-xs text-[#7B746E] uppercase tracking-wider"><span className="bg-white px-3">or create account with email</span></div>
          </div>
        </div>
      )}

      <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
              <Input label="Email Address" icon={<Mail className="w-4 h-4" />} type="email" placeholder="name@company.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
              <Input label="Password" icon={<Lock className="w-4 h-4" />} type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
              
              <div className="flex gap-1 h-1.5 mt-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`flex-1 rounded-full transition-all ${getPasswordStrength() >= i ? (getPasswordStrength() > 2 ? 'bg-[#2D6A4F]' : 'bg-[#D97706]') : 'bg-[#E8E2DA]'}`} />
                ))}
              </div>
              <p className="text-[11px] text-[#7B746E]">Min 8 characters with letters and numbers</p>
              
              <Input label="Confirm Password" icon={<Lock className="w-4 h-4" />} type="password" placeholder="••••••••" value={formData.confirm} onChange={e => setFormData({...formData, confirm: e.target.value})} required />
              <Button type="submit" fullWidth size="lg" className="mt-4">Next Step</Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
              <Input label="First Name" icon={<User className="w-4 h-4" />} type="text" placeholder="John" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} required />
              <Input label="Last Name" icon={<User className="w-4 h-4" />} type="text" placeholder="Doe" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} required />
              
              <div>
                <label className="block text-xs font-semibold text-[#2E2A26] mb-1.5 uppercase tracking-wider">Mobile Phone</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                    <span className="text-[#7B746E] text-xs font-medium">+91</span>
                  </div>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g,'').slice(0,10)})}
                    maxLength={10}
                    className="w-full pl-12 pr-3.5 py-2.5 bg-white border border-[#E8E2DA] text-[#2E2A26] rounded-xl text-sm focus:outline-none focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/15 transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <Button type="button" variant="secondary" onClick={handleBack} className="w-1/3">Back</Button>
                <Button type="submit" className="w-2/3">Next Step</Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
              <label className="block text-xs font-semibold text-[#2E2A26] uppercase tracking-wider mb-2">Select Account Type</label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'company', icon: Building, title: 'Company', desc: 'Upload & manage enterprise documents' },
                  { id: 'bank', icon: ShieldCheck, title: 'Bank', desc: 'Verify document integrity & client identity' },
                  { id: 'notary', icon: FileCheck, title: 'Notary', desc: 'Certify & notarize documents digitally' }
                ].map(role => (
                  <div
                    key={role.id}
                    onClick={() => setFormData({...formData, role: role.id})}
                    className={`p-3.5 rounded-xl cursor-pointer border transition-all flex items-center gap-3.5 ${formData.role === role.id ? 'border-[#2D6A4F] bg-[#F0FAF5]' : 'border-[#E8E2DA] bg-white hover:bg-[#F6F3EE]'}`}
                  > 
                    <div className={`p-2.5 rounded-lg shrink-0 ${formData.role === role.id ? 'bg-[#2D6A4F] text-white' : 'bg-[#F6F3EE] text-[#7B746E]'}`}>
                      <role.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-[#2E2A26] font-semibold text-sm">{role.title}</h4>
                      <p className="text-[#7B746E] text-xs">{role.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-4">
                <Button type="button" variant="secondary" onClick={handleBack} className="w-1/3">Back</Button>
                <Button type="submit" isLoading={loading} className="w-2/3">Complete Signup</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      <div className="mt-6 text-center text-xs text-[#55504B]">
        Already have an account?{' '}
        <Link to="/login" className="text-[#2D6A4F] font-semibold hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
};

export default SignupForm;
