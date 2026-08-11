import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { confirmPasswordReset } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { FileText, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../common/Button';
import Input from '../common/Input';

const ResetPassword = () => {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get('oobCode') || token;
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      const msg = 'Password must be at least 8 characters long.';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (password !== confirmPassword) {
      const msg = 'Passwords do not match.';
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      if (auth && oobCode) {
        await confirmPasswordReset(auth, oobCode, password);
      }
      setCompleted(true);
      toast.success('Password updated successfully! Please sign in with your new password.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error('[Firebase confirmPasswordReset Error]:', err.code, err.message);
      let msg = 'Failed to reset password. The link may be expired or already used.';
      if (err.code === 'auth/invalid-action-code') {
        msg = 'This password reset link is invalid or has expired.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password is too weak. Please choose a stronger password.';
      }
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-2xl bg-white border border-[#E8E2DA] shadow-card-lg">
      <div className="text-center mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#2D6A4F] text-white flex items-center justify-center mx-auto mb-3 shadow-xs">
          <FileText className="w-5 h-5" />
        </div>
        <h2 className="font-display text-2xl font-700 text-[#2E2A26] tracking-tight">
          Create New Password
        </h2>
        <p className="text-[#55504B] text-xs mt-1 font-medium">
          Enter your new password below to update your account
        </p>
      </div>

      {completed ? (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-[#F0FAF5] border border-[#B3E4CC] text-[#2D6A4F] text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#2D6A4F] text-white flex items-center justify-center mx-auto mb-1">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold">Password Updated!</p>
            <p className="text-xs text-[#55504B]">
              Your password has been changed successfully. Redirecting to Sign In...
            </p>
          </div>
          <Link to="/login" className="block">
            <Button fullWidth size="lg">
              Sign In Now
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="New Password"
            icon={<Lock className="w-4 h-4" />}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }}
            required
          />

          <Input
            label="Confirm New Password"
            icon={<Lock className="w-4 h-4" />}
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); if (error) setError(''); }}
            error={error}
            required
          />

          <Button
            type="submit"
            isLoading={loading}
            fullWidth
            size="lg"
          >
            Update Password
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

export default ResetPassword;
