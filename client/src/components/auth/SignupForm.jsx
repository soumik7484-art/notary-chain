import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Building, ShieldCheck, FileCheck, FileText, ArrowRight } from 'lucide-react';
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
      await signup(formData);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle('register');
      toast.success('Google profile verified! Complete face & passkey registration.');
      navigate('/verify-identity');
    } catch (err) {
      toast.error(err.message || 'Google sign-up failed');
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
    <div className="w-full">
      {/* 2. Raised 3D Logo Icon & Header */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 via-[#2D6A4F] to-[#163829] p-[1px] shadow-[0_8px_16px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-[#D4AF37]/40 flex items-center justify-center mx-auto mb-3">
          <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-emerald-500/20 to-transparent flex items-center justify-center">
            <FileText className="w-6 h-6 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]" />
          </div>
        </div>
        <h2 className="font-display text-2xl font-800 text-[#2E2A26] dark:text-white tracking-tight">
          Create Account
        </h2>
        <div className="flex items-center justify-center gap-2 mt-1">
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step >= s ? 'w-6 bg-[#2D6A4F] dark:bg-[#D4AF37]' : 'w-2 bg-[#E8E2DA] dark:bg-slate-800'
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] font-bold text-[#7B746E] dark:text-slate-400 uppercase tracking-wider">
            Step {step} of 3
          </span>
        </div>
      </div>

      {/* Google Sign-Up (only show on step 1) */}
      {step === 1 && (
        <div className="mb-5">
          <button
            type="button"
            id="google-signup-btn"
            onClick={handleGoogleSignup}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-white dark:bg-slate-800/80 hover:bg-[#F6F3EE] dark:hover:bg-slate-800 border border-[#E8E2DA] dark:border-slate-700 text-[#2E2A26] dark:text-slate-200 font-semibold text-xs transition-all shadow-[0_2px_4px_rgba(0,0,0,0.04)] disabled:opacity-60"
          >
            {googleLoading ? (
              <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
            ) : <GoogleIcon />}
            <span>Sign up with Google</span>
          </button>
          
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E8E2DA] dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[10px] font-bold text-[#7B746E] dark:text-slate-400 uppercase tracking-wider">
              <span className="bg-white dark:bg-[#0E1526] px-3">or register with email</span>
            </div>
          </div>
        </div>
      )}

      {/* 1. Inner Inset Card (Form Fields Nested Layer) */}
      <div className="bg-[#FAF8F4] dark:bg-[#080D1A] rounded-2xl p-5 border border-[#E8E2DA] dark:border-slate-800/80 shadow-[inset_0_1px_3px_rgba(0,0,0,0.25)] mb-5">
        <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                <Input label="Email Address" icon={<Mail className="w-4 h-4" />} type="email" placeholder="name@company.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                <Input label="Password" icon={<Lock className="w-4 h-4" />} type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
                
                <div className="flex gap-1 h-1.5 mt-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`flex-1 rounded-full transition-all ${getPasswordStrength() >= i ? (getPasswordStrength() > 2 ? 'bg-[#2D6A4F] dark:bg-emerald-500' : 'bg-[#D97706]') : 'bg-[#E8E2DA] dark:bg-slate-800'}`} />
                  ))}
                </div>
                <p className="text-[11px] text-[#7B746E] dark:text-slate-400">Min 8 characters with letters and numbers</p>
                
                <Input label="Confirm Password" icon={<Lock className="w-4 h-4" />} type="password" placeholder="••••••••" value={formData.confirm} onChange={e => setFormData({...formData, confirm: e.target.value})} required />
                <Button type="submit" fullWidth size="lg" className="mt-4 bg-[#2D6A4F] hover:bg-[#245741] text-white shadow-[0_4px_12px_rgba(45,106,79,0.3)] font-bold">
                  <span>Next Step</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                <Input label="First Name" icon={<User className="w-4 h-4" />} type="text" placeholder="John" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} required />
                <Input label="Last Name" icon={<User className="w-4 h-4" />} type="text" placeholder="Doe" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} required />
                
                <div>
                  <label className="block text-xs font-semibold text-[#2E2A26] dark:text-slate-200 mb-1.5 uppercase tracking-wider">Mobile Phone</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                      <span className="text-[#7B746E] dark:text-slate-400 text-xs font-medium">+91</span>
                    </div>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g,'').slice(0,10)})}
                      maxLength={10}
                      className="w-full pl-12 pr-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[#E8E2DA] dark:border-slate-700 text-[#2E2A26] dark:text-slate-100 rounded-xl text-sm focus:outline-none focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/15 transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <Button type="button" variant="secondary" onClick={handleBack} className="w-1/3">Back</Button>
                  <Button type="submit" className="w-2/3 bg-[#2D6A4F] hover:bg-[#245741] text-white shadow-[0_4px_12px_rgba(45,106,79,0.3)] font-bold">
                    <span>Next Step</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-3">
                <label className="block text-xs font-semibold text-[#2E2A26] dark:text-slate-200 uppercase tracking-wider mb-2">Select Account Type</label>
                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    { id: 'company', icon: Building, title: 'Company', desc: 'Upload & manage enterprise documents' },
                    { id: 'bank', icon: ShieldCheck, title: 'Bank / Escrow', desc: 'Verify document integrity & identity' },
                    { id: 'notary', icon: FileCheck, title: 'Legal Notary', desc: 'Certify & notarize documents' }
                  ].map(role => (
                    <div
                      key={role.id}
                      onClick={() => setFormData({...formData, role: role.id})}
                      className={`p-3 rounded-xl cursor-pointer border transition-all flex items-center gap-3 ${
                        formData.role === role.id 
                          ? 'border-[#2D6A4F] dark:border-[#D4AF37] bg-[#F0FAF5] dark:bg-slate-800 shadow-sm' 
                          : 'border-[#E8E2DA] dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-[#F6F3EE] dark:hover:bg-slate-800/80'
                      }`}
                    > 
                      <div className={`p-2 rounded-lg shrink-0 ${
                        formData.role === role.id 
                          ? 'bg-[#2D6A4F] dark:bg-[#D4AF37] text-white dark:text-slate-950' 
                          : 'bg-[#F6F3EE] dark:bg-slate-800 text-[#7B746E] dark:text-slate-400'
                      }`}>
                        <role.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-[#2E2A26] dark:text-white font-semibold text-xs">{role.title}</h4>
                        <p className="text-[#7B746E] dark:text-slate-400 text-[11px]">{role.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 mt-4">
                  <Button type="button" variant="secondary" onClick={handleBack} className="w-1/3">Back</Button>
                  <Button type="submit" isLoading={loading} className="w-2/3 bg-[#2D6A4F] hover:bg-[#245741] text-white shadow-[0_4px_12px_rgba(45,106,79,0.3)] font-bold">
                    <span>Complete Signup</span>
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>

      <div className="text-center text-xs text-[#55504B] dark:text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="text-[#2D6A4F] dark:text-[#D4AF37] font-bold hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
};

export default SignupForm;
