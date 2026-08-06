import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Bell, ShieldAlert, KeyRound, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Settings = () => {
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [notifications, setNotifications] = useState({ email: true, docs: true, fraud: true });
  const [updating, setUpdating] = useState(false);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwords.current || !passwords.newPass) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    setUpdating(true);
    setTimeout(() => {
      setUpdating(false);
      toast.success('Password updated successfully');
      setPasswords({ current: '', newPass: '', confirm: '' });
    }, 600);
  };

  const toggleNotification = (key) => {
    if (key === 'fraud') return; // Cannot disable critical fraud alerts
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    toast.success('Preference saved');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-[22px] font-bold text-[#2D2A27] tracking-tight">Account & Security Settings</h1>
        <p className="text-[13px] text-[#9B9490] mt-0.5">Manage your credentials, notification triggers, and cryptographic preferences</p>
      </div>

      {/* ── Change Password Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-white border border-[#E9E4DD] rounded-xl shadow-xs space-y-4"
      >
        <div className="flex items-center gap-2.5 pb-4 border-b border-[#E9E4DD]">
          <div className="w-8 h-8 rounded-lg bg-[#F0FAF5] text-[#2D6A4F] flex items-center justify-center font-bold">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#2D2A27]">Security Credentials</h3>
            <p className="text-[11px] text-[#9B9490]">Update your account password and authentication keys</p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md pt-2">
          <div>
            <label className="block text-[12px] font-semibold text-[#2D2A27] mb-1">Current Password</label>
            <input
              type="password"
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              placeholder="••••••••••••"
              className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E9E4DD] rounded-lg text-xs focus:outline-none focus:border-[#2D6A4F] text-[#2D2A27]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-[#2D2A27] mb-1">New Password</label>
              <input
                type="password"
                value={passwords.newPass}
                onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E9E4DD] rounded-lg text-xs focus:outline-none focus:border-[#2D6A4F] text-[#2D2A27]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#2D2A27] mb-1">Confirm New Password</label>
              <input
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E9E4DD] rounded-lg text-xs focus:outline-none focus:border-[#2D6A4F] text-[#2D2A27]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={updating}
            className="px-4 py-2 bg-[#2D6A4F] hover:bg-[#245741] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
          >
            {updating ? 'Updating Password…' : 'Save Password Changes'}
          </button>
        </form>
      </motion.div>

      {/* ── Notification Preferences Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="p-6 bg-white border border-[#E9E4DD] rounded-xl shadow-xs space-y-4"
      >
        <div className="flex items-center gap-2.5 pb-4 border-b border-[#E9E4DD]">
          <div className="w-8 h-8 rounded-lg bg-[#F0FAF5] text-[#2D6A4F] flex items-center justify-center font-bold">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#2D2A27]">Notification Triggers</h3>
            <p className="text-[11px] text-[#9B9490]">Configure alerts for document verification events and transactions</p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {[
            { key: 'email', label: 'Email Activity Digests', desc: 'Receive daily verification and transaction summaries' },
            { key: 'docs', label: 'Document Status Alerts', desc: 'Instant alerts when documents are notarized or rejected' },
            { key: 'fraud', label: 'Critical Fraud & Tamper Alerts', desc: 'Immediate notification on signature anomaly (Required)' },
          ].map((n) => (
            <div key={n.key} className="flex items-center justify-between p-3.5 bg-[#FAF8F4] border border-[#E9E4DD] rounded-xl">
              <div>
                <h4 className="text-xs font-bold text-[#2D2A27]">{n.label}</h4>
                <p className="text-[11px] text-[#9B9490]">{n.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleNotification(n.key)}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors relative ${
                  notifications[n.key] ? 'bg-[#2D6A4F]' : 'bg-[#D4CECA]'
                } ${n.key === 'fraud' ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform shadow-xs ${
                    notifications[n.key] ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Danger Zone Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 bg-white border border-red-200 rounded-xl shadow-xs space-y-3"
      >
        <div className="flex items-center gap-2 text-red-600">
          <ShieldAlert className="w-4 h-4" />
          <h3 className="text-sm font-bold">Danger Zone</h3>
        </div>
        <p className="text-xs text-[#7B746E]">
          Deactivating your account will archive your custodial address and seal remaining audit records immutably on Polygon Amoy.
        </p>
        <button
          type="button"
          onClick={() => toast.error('Account deletion requires admin authorization.')}
          className="px-4 py-2 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-lg transition-colors"
        >
          Deactivate Enterprise Workspace
        </button>
      </motion.div>
    </div>
  );
};

export default Settings;
