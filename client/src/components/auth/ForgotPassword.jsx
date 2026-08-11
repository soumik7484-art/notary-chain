import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { FileText, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axios';
import Button from '../common/Button';
import Input from '../common/Input';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      const msg = 'Please enter a valid email address.';
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);

    // 1. Try Firebase Auth sendPasswordResetEmail
    try {
      if (auth) {
        await sendPasswordResetEmail(auth, cleanEmail);
      }
    } catch (firebaseErr) {
      console.warn('[Firebase sendPasswordResetEmail Warning]:', firebaseErr.code, firebaseErr.message);
    }

    // 2. Also call backend API POST /auth/forgot-password (Nodemailer dispatch)
    try {
      await axiosInstance.post('/auth/forgot-password', { email: cleanEmail });
    } catch (backendErr) {
      console.warn('[Backend forgot-password API Warning]:', backendErr.message);
    }

    setSubmitted(true);
    toast.success('Password reset email sent! Please check your inbox.');
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md p-8 rounded-2xl bg-white border border-[#E8E2DA] shadow-card-lg">
      {/* Brand Logo & Header */}
      <div className="text-center mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#2D6A4F] text-white flex items-center justify-center mx-auto mb-3 shadow-xs">
          <FileText className="w-5 h-5" />
        </div>
        <h2 className="font-display text-2xl font-700 text-[#2E2A26] tracking-tight">
          Forgot Your Password?
        </h2>
        <p className="text-[#55504B] text-xs mt-1 font-medium">
          Enter your email address to receive a secure Firebase password reset link
        </p>
      </div>

      {submitted ? (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-[#F0FAF5] border border-[#B3E4CC] text-[#2D6A4F] text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#2D6A4F] text-white flex items-center justify-center mx-auto mb-1">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold">Check Your Inbox</p>
            <p className="text-xs text-[#55504B] leading-relaxed">
              If an account exists for <span className="font-semibold text-[#2E2A26]">{email}</span>, a secure password reset link has been sent.
            </p>
          </div>

          <Link to="/login" className="block">
            <Button fullWidth size="lg" variant="outline">
              Return to Sign In
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email Address"
            icon={<Mail className="w-4 h-4" />}
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError('');
            }}
            error={error}
            required
          />

          <Button
            type="submit"
            isLoading={loading}
            fullWidth
            size="lg"
          >
            Send Reset Link
          </Button>

          <div className="pt-2 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-[#2D6A4F] font-bold hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
