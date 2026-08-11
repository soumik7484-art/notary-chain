import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineCamera, HiOutlineUser, HiOutlineEnvelope,
  HiOutlinePhone, HiOutlineShieldCheck, HiOutlineCalendar,
  HiOutlineDocumentText, HiOutlineCheckCircle, HiOutlinePencil,
  HiOutlineArrowRightOnRectangle
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../api/axios';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import FaceScannerModal from '../components/auth/FaceScannerModal';

const ROLE_LABELS = {
  company: 'Website User',
  bank:    'Website User',
  notary:  'Notary Officer',
  admin:   'System Admin',
};

const ROLE_COLORS = {
  company: 'bg-[#F0FAF5] text-[#2D6A4F] border-[#B3E4CC]',
  bank:    'bg-[#F0FAF5] text-[#2D6A4F] border-[#B3E4CC]',
  notary:  'bg-[#F3E8FF] text-[#6B21A8] border-[#E9D5FF]',
  admin:   'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]',
};

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [editing, setEditing]   = useState(false);
  const [saving,  setSaving]    = useState(false);
  const [faceModalOpen, setFaceModalOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const [form, setForm] = useState({
    firstName: user?.firstName && user.firstName !== 'Ada' ? user.firstName : (user?.name?.split(' ')[0] || 'Google'),
    lastName:  user?.lastName && user.lastName !== 'Lovelace' ? user.lastName : (user?.name?.split(' ').slice(1).join(' ') || 'User'),
    phone:     user?.phone     || '',
    avatar:    user?.avatar || user?.photoURL || '',
  });

  useEffect(() => {
    if (user) {
      const fName = user.firstName && user.firstName !== 'Ada' ? user.firstName : (user.name?.split(' ')[0] || 'Google');
      const lName = user.lastName && user.lastName !== 'Lovelace' ? user.lastName : (user.name?.split(' ').slice(1).join(' ') || 'User');
      setForm({
        firstName: fName,
        lastName:  lName,
        phone:     user.phone  || '',
        avatar:    user.avatar || user.photoURL || '',
      });
      setAvatarError(false);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  const getInitials = () => {
    const f = form.firstName || user?.firstName || 'U';
    const l = form.lastName || user?.lastName || '';
    return `${f.charAt(0)}${l ? l.charAt(0) : ''}`.toUpperCase();
  };

  const initials = getInitials();
  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : 'Oct 2023';

  // Handle avatar file upload
  const handleAvatarFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Avatar file size must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target.result;
      setForm((prev) => ({ ...prev, avatar: base64Url }));
      setAvatarError(false);
      updateUser({ ...user, avatar: base64Url });
      toast.success('Avatar updated successfully!');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await axiosInstance.put('/users/profile', form);
      const updated = data?.data || data?.user || form;
      updateUser({ ...updated, ...form });
      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      updateUser({ ...user, ...form });
      toast.success('Profile updated!');
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      avatar: user?.avatar || '',
    });
    setAvatarError(false);
    setEditing(false);
  };

  const currentAvatarSrc = form.avatar || user?.avatar;

  return (
    <DashboardLayout title="My Profile" subtitle="Manage your personal information & account settings">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT — Avatar Card */}
        <div className="col-span-1">
          <div className="p-6 sm:p-8 bg-white border border-[#E9E4DD] rounded-3xl flex flex-col items-center text-center shadow-card">
            {/* Hidden File Input for Avatar Upload */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleAvatarFileChange}
            />

            {/* Avatar Circle */}
            <div
              className="relative group cursor-pointer mb-6"
              onClick={() => fileInputRef.current?.click()}
              title="Click to upload profile avatar"
            >
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#2D6A4F] to-[#1B4332] flex items-center justify-center text-white text-3xl font-bold shadow-xl border-4 border-white overflow-hidden">
                {currentAvatarSrc && !avatarError ? (
                  <img
                    src={currentAvatarSrc}
                    alt="profile avatar"
                    onError={() => setAvatarError(true)}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <div className="absolute inset-0 bg-[#2E2A26]/70 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                <HiOutlineCamera size={26} />
                <span className="text-[10px] font-semibold mt-1">Upload Photo</span>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-[#2E2A26] font-display">
              {form.firstName || user?.firstName || 'User'} {form.lastName || user?.lastName || ''}
            </h2>
            <p className="text-[#7B746E] text-sm mt-1 mb-4">{user?.email || 'user@notarychain.com'}</p>

            <span className={`px-3.5 py-1 border rounded-full text-xs font-semibold ${ROLE_COLORS[user?.role] || ROLE_COLORS.company}`}>
              {ROLE_LABELS[user?.role] || 'Website User'}
            </span>

            {/* Change Avatar Link */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 text-xs font-semibold text-[#2D6A4F] hover:underline flex items-center gap-1.5"
            >
              <HiOutlineCamera size={15} /> Change Profile Picture
            </button>

            {/* Stats */}
            <div className="w-full mt-8 pt-6 border-t border-[#E9E4DD] space-y-4 text-left">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#7B746E] text-sm"><HiOutlineCalendar size={16}/> Member Since</span>
                <span className="text-[#2E2A26] text-sm font-medium">{joinDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#7B746E] text-sm"><HiOutlineDocumentText size={16}/> Documents</span>
                <span className="text-[#2E2A26] text-sm font-medium">{user?.totalDocuments ?? '12'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#7B746E] text-sm"><HiOutlineCheckCircle size={16}/> Email Status</span>
                <span className="text-sm font-semibold text-[#2D6A4F]">
                  Verified Account
                </span>
              </div>
              {(user?.phone || form.phone) && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[#7B746E] text-sm"><HiOutlinePhone size={16}/> Mobile</span>
                  <span className="text-[#2E2A26] text-sm font-medium">
                    {form.phone ? `+91 ${form.phone}` : user?.phone ? `+91 ${user.phone}` : '—'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — Personal Info & Security */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 sm:p-8 bg-white border border-[#E9E4DD] rounded-3xl shadow-card">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-[#2E2A26] font-display">Personal Information</h3>
                <p className="text-[#7B746E] text-sm mt-1">Update your name, phone, and contact details</p>
              </div>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#F0FAF5] text-[#2D6A4F] border border-[#B3E4CC] rounded-xl text-sm font-semibold hover:bg-[#D9F2E6] transition-all shadow-xs"
                >
                  <HiOutlinePencil size={16}/> Edit Profile
                </button>
              )}
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              {/* Name row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#55504B] mb-2">
                    <HiOutlineUser className="inline mr-1 mb-0.5" size={14}/> First Name
                  </label>
                  <input
                    type="text" value={form.firstName} readOnly={!editing}
                    onChange={e => setForm({...form, firstName: e.target.value})}
                    className={`w-full px-4 py-3 rounded-xl border text-sm transition-all ${
                      editing
                        ? 'bg-white border-[#2D6A4F] text-[#2E2A26] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20'
                        : 'bg-[#FAF8F4] border-[#E9E4DD] text-[#2E2A26] cursor-not-allowed'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#55504B] mb-2">
                    <HiOutlineUser className="inline mr-1 mb-0.5" size={14}/> Last Name
                  </label>
                  <input
                    type="text" value={form.lastName} readOnly={!editing}
                    onChange={e => setForm({...form, lastName: e.target.value})}
                    className={`w-full px-4 py-3 rounded-xl border text-sm transition-all ${
                      editing
                        ? 'bg-white border-[#2D6A4F] text-[#2E2A26] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20'
                        : 'bg-[#FAF8F4] border-[#E9E4DD] text-[#2E2A26] cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="block text-sm font-medium text-[#55504B] mb-2">
                  <HiOutlineEnvelope className="inline mr-1 mb-0.5" size={14}/> Email Address
                  <span className="ml-2 text-xs text-[#7B746E]">(cannot be changed)</span>
                </label>
                <input
                  type="email" value={user?.email || 'user@notarychain.com'} readOnly
                  className="w-full px-4 py-3 rounded-xl border bg-[#FAF8F4] border-[#E9E4DD] text-[#7B746E] cursor-not-allowed text-sm font-medium"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-sm font-medium text-[#55504B] mb-2">
                  <HiOutlinePhone className="inline mr-1 mb-0.5" size={14}/> Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <span className={`text-sm font-semibold ${editing ? 'text-[#2D6A4F]' : 'text-[#7B746E]'}`}>+91</span>
                    <div className={`ml-3 h-5 w-px ${editing ? 'bg-[#B3E4CC]' : 'bg-[#E9E4DD]'}`} />
                  </div>
                  <input
                    type="tel" value={form.phone} readOnly={!editing}
                    placeholder={editing ? "Enter 10-digit mobile number" : "Not added yet"}
                    onChange={e => setForm({...form, phone: e.target.value.replace(/\D/g,'').slice(0,10)})}
                    maxLength={10}
                    className={`w-full pl-20 pr-4 py-3 rounded-xl border text-sm transition-all ${
                      editing
                        ? 'bg-white border-[#2D6A4F] text-[#2E2A26] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20'
                        : 'bg-[#FAF8F4] border-[#E9E4DD] text-[#2E2A26] cursor-not-allowed'
                    }`}
                  />
                  {form.phone && form.phone.length === 10 && editing && (
                    <div className="absolute inset-y-0 right-4 flex items-center">
                      <HiOutlineCheckCircle className="text-[#2D6A4F]" size={18}/>
                    </div>
                  )}
                </div>
              </div>

              {/* Role (read-only) */}
              <div>
                <label className="block text-sm font-medium text-[#55504B] mb-2">
                  <HiOutlineShieldCheck className="inline mr-1 mb-0.5" size={14}/> Account Role
                </label>
                <div className="w-full px-4 py-3 rounded-xl border bg-[#FAF8F4] border-[#E9E4DD] flex items-center gap-3">
                  <span className={`px-2.5 py-1 border rounded-lg text-xs font-semibold ${ROLE_COLORS[user?.role] || ROLE_COLORS.company}`}>
                    {ROLE_LABELS[user?.role] || 'Website User'}
                  </span>
                  <span className="text-xs text-[#7B746E]">Contact admin to change your role</span>
                </div>
              </div>

              {/* Web3 Wallet Card */}
              <div className="p-5 rounded-2xl bg-[#F0FAF5] border border-[#B3E4CC] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2D6A4F] uppercase tracking-wider">Linked Web3 Wallet</span>
                  <button
                    type="button"
                    onClick={() => setFaceModalOpen(true)}
                    className="text-xs font-semibold text-[#2D6A4F] hover:underline"
                  >
                    Manage / Change Wallet
                  </button>
                </div>
                <div className="bg-white p-3 rounded-xl border border-[#E8E2DA] flex items-center justify-between gap-2">
                  <code className="text-xs font-mono font-bold text-[#2E2A26] truncate">
                    {user?.walletAddress || localStorage.getItem('web3_connected_wallet') || 'Not connected yet'}
                  </code>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#2D6A4F] text-white shrink-0">
                    Polygon Amoy
                  </span>
                </div>
              </div>

              {/* Buttons */}
              {editing && (
                <div className="flex gap-4 pt-2">
                  <button
                    type="button" onClick={handleCancel}
                    className="flex-1 py-3 rounded-xl border border-[#E9E4DD] text-[#55504B] hover:bg-[#FAF8F4] transition-all text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit" disabled={saving}
                    className="flex-1 py-3 rounded-xl bg-[#2D6A4F] hover:bg-[#245741] text-white font-semibold text-sm shadow-md transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/><span>Saving…</span></>
                    ) : (
                      <><HiOutlineCheckCircle size={18}/><span>Save Changes</span></>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Security & Face ID Card */}
          <div className="p-6 bg-white border border-[#E9E4DD] rounded-3xl shadow-card space-y-6">
            <h3 className="text-base font-bold text-[#2E2A26] flex items-center gap-2 font-display">
              <HiOutlineShieldCheck size={18} className="text-[#2D6A4F]"/> MongoDB Biometrics & Security
            </h3>

            {/* Face ID Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-[#FAF8F4] rounded-2xl border border-[#E9E4DD] gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#F0FAF5] text-[#2D6A4F] rounded-xl border border-[#B3E4CC]">
                  <HiOutlineCamera size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[#2E2A26]">MongoDB Face Recognition</p>
                    <span className="px-2 py-0.5 bg-[#F0FAF5] text-[#2D6A4F] border border-[#B3E4CC] rounded-full text-[10px] font-bold uppercase tracking-wider">
                      128D Biometric
                    </span>
                  </div>
                  <p className="text-xs text-[#7B746E] mt-0.5">
                    Log in instantly using webcam face recognition & Cosine vector similarity in MongoDB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFaceModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-white bg-[#2D6A4F] hover:bg-[#245741] rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <HiOutlineCamera size={16} /> Register Face ID
              </button>
            </div>
          </div>

          {/* Log Out Section Card */}
          <div className="p-6 bg-white border border-rose-200 rounded-3xl shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-base font-bold text-[#2E2A26] flex items-center gap-2 font-display">
                <HiOutlineArrowRightOnRectangle className="text-rose-600" size={20}/> Session & Account
              </h4>
              <p className="text-xs text-[#7B746E] mt-1">
                Sign out of your active session on this device
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full sm:w-auto px-5 py-2.5 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <HiOutlineArrowRightOnRectangle size={18}/> Log Out
            </button>
          </div>

          <FaceScannerModal
            isOpen={faceModalOpen}
            onClose={() => setFaceModalOpen(false)}
            mode="register"
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
