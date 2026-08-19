import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FileText, ShieldCheck, ArrowRight, LogIn, CheckCircle2,
  Lock, Sparkles, Database, Building2, Scale,
  Check, Sun, Moon, FileCheck, Layers, ChevronRight, X, UserCheck, Award
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

/* ── 3D Floating & Rotating Brand Pendant / Shield ───────────────────────── */
const AnimatedBrandPendant = ({ isDark }) => {
  return (
    <div className="relative w-32 h-32 sm:w-36 sm:h-36 mx-auto mb-8 perspective-1000">
      {/* Dynamic Ambient Glowing Aura */}
      <div 
        className={`absolute inset-0 rounded-full filter blur-2xl transition-all duration-500 animate-pulse ${
          isDark 
            ? 'bg-gradient-to-tr from-[#2D6A4F]/40 via-[#D4AF37]/35 to-[#B5883D]/25 opacity-90' 
            : 'bg-gradient-to-tr from-[#B5883D]/25 via-[#F9F0C8]/40 to-[#E1B84C]/20 opacity-80'
        }`} 
      />

      {/* Floating & Rotating 3D Container */}
      <motion.div
        animate={{
          y: [0, -10, 0],
          rotateY: [0, 180, 360],
          rotateZ: [-1.5, 1.5, -1.5],
        }}
        transition={{
          y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
          rotateY: { duration: 14, repeat: Infinity, ease: 'linear' },
          rotateZ: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
        }}
        className="w-full h-full relative"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
          <defs>
            <linearGradient id="pendantBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F9F0C8" />
              <stop offset="35%" stopColor="#B5883D" />
              <stop offset="70%" stopColor="#E1B84C" />
              <stop offset="100%" stopColor="#7A5218" />
            </linearGradient>
            
            <linearGradient id="pendantFaceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2D6A4F" />
              <stop offset="60%" stopColor="#1B4532" />
              <stop offset="100%" stopColor="#143426" />
            </linearGradient>

            <linearGradient id="goldDetailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFDF9" />
              <stop offset="50%" stopColor="#F0D888" />
              <stop offset="100%" stopColor="#B5883D" />
            </linearGradient>
          </defs>

          {/* Outer Gold Rings */}
          <circle cx="80" cy="80" r="76" fill="url(#pendantBorderGrad)" />
          <circle cx="80" cy="80" r="71" fill="#1B4532" />
          <circle cx="80" cy="80" r="67" fill="url(#pendantBorderGrad)" />
          <circle cx="80" cy="80" r="63" stroke="url(#pendantBorderGrad)" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="80" cy="80" r="60" fill="url(#pendantFaceGrad)" />

          {/* Shield Emblem */}
          <path
            d="M80 42 L105 54 V80 C105 97 80 110 80 110 C80 110 55 97 55 80 V54 L80 42 Z"
            fill="none"
            stroke="url(#goldDetailGrad)"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Notary Emblem 'N' */}
          <text
            x="80"
            y="85"
            fill="url(#goldDetailGrad)"
            fontSize="32"
            fontWeight="800"
            fontFamily="Manrope, sans-serif"
            textAnchor="middle"
          >
            N
          </text>
        </svg>
      </motion.div>
    </div>
  );
};

export default function Landing() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState('signup'); // 'signin' | 'signup'
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 'privacy',
      stepNumber: 'Step 1',
      title: 'Your Document Stays Private',
      badge: 'Zero Document Upload',
      icon: Lock,
      desc: 'We generate a secure digital fingerprint of your document on your own device. The file itself is never uploaded or exposed — only its unique fingerprint is used to verify it later.',
      details: [
        'Your sensitive contracts and deeds stay 100% on your device',
        'Only an unreadable digital fingerprint is ever used',
        'Complete confidentiality for attorney-client and title privacy'
      ],
      preview: {
        headline: 'Document Privacy Shield',
        status: 'Fingerprint Created Locally',
        target: 'Commercial_Deed_Transfer.pdf',
        privacyGuaranteed: true,
        note: 'Original document never leaves your browser'
      }
    },
    {
      id: 'identity',
      stepNumber: 'Step 2',
      title: "Confirming It's Really You",
      badge: 'Live Identity Check',
      icon: UserCheck,
      desc: "Before anything is finalized, we verify the signer's identity through a live face check — so no one can forge a signature or impersonate someone else.",
      details: [
        'Real-time live face match confirms the genuine signer',
        'Stops fraudulent impersonation and forged signatures',
        'Tied directly to the signed document record'
      ],
      preview: {
        headline: 'Signer Identity Verification',
        status: 'Live Identity Verified',
        target: 'Authorized Signatory Check',
        privacyGuaranteed: true,
        note: 'Biometric liveness confirmed — zero forgery risk'
      }
    },
    {
      id: 'permanent',
      stepNumber: 'Step 3',
      title: 'Permanently Recorded',
      badge: 'Tamper-Proof Digital Seal',
      icon: Database,
      desc: "Your document's fingerprint is sealed onto a public, tamper-proof digital ledger. Once recorded, it can never be altered, deleted, or backdated by anyone — including us.",
      details: [
        'Immutable public ledger timestamp',
        'Cannot be altered, replaced, or deleted by anyone',
        'Permanent proof valid 10, 20, or 50 years into the future'
      ],
      preview: {
        headline: 'Tamper-Proof Ledger Seal',
        status: 'Permanently Sealed & Timestamped',
        target: 'Public Ledger Registry',
        privacyGuaranteed: true,
        note: 'Mathematical certainty — impossible to backdate'
      }
    },
    {
      id: 'certificate',
      stepNumber: 'Step 4',
      title: 'Proof You Can Use Anywhere',
      badge: 'Court-Ready Certificate',
      icon: Award,
      desc: 'You receive an official verification certificate, accepted for audits, legal proceedings, and regulatory review — proof your document is authentic and untouched.',
      details: [
        'Official certificate with verifiable QR code',
        'Accepted for regulatory audits, legal disputes, and title closings',
        'Anyone can instantly verify authenticity with 1 click'
      ],
      preview: {
        headline: 'Official Verification Deed',
        status: 'Legally Binding & Court-Admissible',
        target: 'Audit & Compliance Certificate',
        privacyGuaranteed: true,
        note: 'Accepted under ESIGN Act & digital notarization standards'
      }
    }
  ];

  return (
    <div className={`min-h-screen font-sans antialiased transition-colors duration-200 ${
      isDark ? 'bg-[#0B1120] text-[#F8FAFC]' : 'bg-[#FAF8F4] text-[#1E242B]'
    }`}>

      {/* ── Sticky Modern Glass Navbar ───────────────────────────── */}
      <nav className={`fixed top-0 inset-x-0 z-50 h-20 transition-all backdrop-blur-md border-b ${
        isDark 
          ? 'bg-[#0B1120]/80 border-[#1E293B]/80' 
          : 'bg-[#FAF8F4]/85 border-[#E8E2DA]/80'
      }`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-full flex items-center justify-between">
          
          {/* Brand Logo & Tag */}
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm ${
              isDark 
                ? 'bg-gradient-to-br from-[#2D6A4F] to-[#1B4532] border border-[#D4AF37]/30 text-white' 
                : 'bg-[#2D6A4F] text-white shadow-[#2D6A4F]/20 shadow-md'
            }`}>
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-800 text-xl tracking-tight">NotaryChain</span>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                  isDark
                    ? 'bg-[#1E293B] text-[#D4AF37] border-[#D4AF37]/30'
                    : 'bg-[#F0FAF5] text-[#2D6A4F] border-[#B3E4CC]'
                }`}>
                  Early Access
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a 
              href="#how-it-works" 
              className={`transition-colors ${isDark ? 'text-slate-300 hover:text-white' : 'text-[#55504B] hover:text-[#2D6A4F]'}`}
            >
              How It Works
            </a>
            <a 
              href="#solutions" 
              className={`transition-colors ${isDark ? 'text-slate-300 hover:text-white' : 'text-[#55504B] hover:text-[#2D6A4F]'}`}
            >
              Legal & Real Estate
            </a>
            <a 
              href="#security" 
              className={`transition-colors ${isDark ? 'text-slate-300 hover:text-white' : 'text-[#55504B] hover:text-[#2D6A4F]'}`}
            >
              Security
            </a>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            {/* Dark / Light Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle visual theme"
              className={`p-2.5 rounded-xl border transition-all flex items-center justify-center ${
                isDark 
                  ? 'border-slate-800 bg-slate-900/60 text-[#D4AF37] hover:bg-slate-800' 
                  : 'border-[#E8E2DA] bg-white text-[#52796F] hover:bg-[#F6F3EE] shadow-xs'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                setAuthTab('signin');
                setShowAuthModal(true);
              }}
              className={`text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors hidden sm:block ${
                isDark 
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800/60' 
                  : 'text-[#55504B] hover:text-[#2D6A4F] hover:bg-[#F6F3EE]'
              }`}
            >
              Sign In
            </button>

            <button
              onClick={() => {
                setAuthTab('signup');
                setShowAuthModal(true);
              }}
              className={`text-sm font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-sm ${
                isDark
                  ? 'bg-[#2D6A4F] hover:bg-[#388463] text-white border border-[#D4AF37]/30 shadow-[#2D6A4F]/20'
                  : 'bg-[#2D6A4F] hover:bg-[#245741] text-white shadow-[#2D6A4F]/15'
              }`}
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ─────────────────────────────────────────── */}
      <section className="relative pt-36 sm:pt-44 pb-20 md:pb-28 overflow-hidden min-h-[92vh] flex items-center justify-center">
        
        {/* Subtle Architectural Grid Texture (Light: Charcoal / Dark: Warm Gold) */}
        <div 
          className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
            isDark ? 'hero-grid-dark opacity-100' : 'hero-grid-light opacity-100'
          }`} 
        />

        {/* Ambient Radial Glowing Aura */}
        <div 
          className={`absolute inset-0 pointer-events-none ${
            isDark ? 'emerald-aura-dark' : 'emerald-aura'
          }`} 
        />

        <div className="relative max-w-5xl mx-auto px-6 sm:px-8 text-center">

          {/* 3D Animated Brand Pendant / Shield Icon */}
          <AnimatedBrandPendant isDark={isDark} />

          {/* 1. Live Status & Early Access Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-semibold mb-8 border backdrop-blur-md cursor-default shadow-xs"
            style={{
              backgroundColor: isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(240, 250, 245, 0.85)',
              borderColor: isDark ? 'rgba(212, 175, 55, 0.25)' : 'rgba(179, 228, 204, 0.9)',
              color: isDark ? '#E2E8F0' : '#2D6A4F'
            }}
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-[12px]">
              Built for Legal, Real Estate & Compliance Teams
            </span>
            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${
              isDark ? 'bg-[#D4AF37]/15 text-[#F0D888]' : 'bg-[#2D6A4F]/10 text-[#2D6A4F]'
            }`}>
              Early Access
            </span>
          </motion.div>

          {/* 2. Oversized Confident Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-[76px] font-800 tracking-tight leading-[1.06] mb-8 max-w-5xl mx-auto"
          >
            Institutional-Grade{' '}
            <span className={isDark 
              ? 'bg-gradient-to-r from-emerald-300 via-[#E5C06E] to-emerald-200 bg-clip-text text-transparent' 
              : 'text-[#2D6A4F]'
            }>
              Document Notarization
            </span>{' '}
            for Modern Teams.
          </motion.h1>

          {/* 3. Targeted Subhead */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className={`text-lg sm:text-xl md:text-[22px] leading-relaxed max-w-3xl mx-auto mb-12 font-normal ${
              isDark ? 'text-slate-300' : 'text-[#55504B]'
            }`}
          >
            Eliminate document tampering, signature disputes, and closing delays. NotaryChain gives legal counsel, title agencies, and compliance officers a permanent, tamper-proof record for high-stakes documents.
          </motion.p>

          {/* 4. Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <button
              onClick={() => {
                setAuthTab('signup');
                setShowAuthModal(true);
              }}
              className={`w-full sm:w-auto text-base font-bold px-9 py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg ${
                isDark
                  ? 'bg-[#2D6A4F] hover:bg-[#388463] text-white border border-[#D4AF37]/30 shadow-[#2D6A4F]/25 hover:scale-[1.02]'
                  : 'bg-[#2D6A4F] hover:bg-[#245741] text-white shadow-[#2D6A4F]/20 hover:scale-[1.02]'
              }`}
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <a
              href="#how-it-works"
              className={`w-full sm:w-auto text-base font-semibold px-8 py-4 rounded-xl border transition-all flex items-center justify-center gap-2.5 ${
                isDark 
                  ? 'border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800 hover:border-slate-600' 
                  : 'border-[#E8E2DA] bg-white text-[#2E2A26] hover:bg-[#F6F3EE] shadow-sm'
              }`}
            >
              <span>See How It Works</span>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </a>
          </motion.div>

          {/* 5. Honest Credibility & Trust Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className={`pt-8 border-t max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-left ${
              isDark ? 'border-slate-800/80' : 'border-[#E8E2DA]'
            }`}
          >
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Privacy</span>
              </div>
              <p className="text-sm font-semibold">100% Private</p>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#7B746E]'}`}>Files never uploaded</p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Protection</span>
              </div>
              <p className="text-sm font-semibold">Identity Verified</p>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#7B746E]'}`}>Live face check</p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Durability</span>
              </div>
              <p className="text-sm font-semibold">Permanent Record</p>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#7B746E]'}`}>Cannot be altered</p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Validity</span>
              </div>
              <p className="text-sm font-semibold">Legal Certificate</p>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#7B746E]'}`}>Accepted for audits</p>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ── HOW IT WORKS SECTION (PLAIN-LANGUAGE BUYER FOCUS) ────── */}
      <section id="how-it-works" className={`py-24 sm:py-32 border-t transition-colors relative ${
        isDark ? 'border-slate-800/80 bg-transparent' : 'border-[#E8E2DA] bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
          
          {/* Section Header */}
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border ${
              isDark ? 'bg-slate-800 text-[#D4AF37] border-[#D4AF37]/30' : 'bg-[#F0FAF5] text-[#2D6A4F] border-[#B3E4CC]'
            }`}>
              <Layers className="w-3.5 h-3.5" />
              How It Works
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-800 tracking-tight mb-4">
              Every Document, Verified Beyond Doubt
            </h2>
            <p className={`text-base sm:text-lg ${isDark ? 'text-slate-300' : 'text-[#55504B]'}`}>
              Four simple steps stand between your document and a permanent, legally recognized record.
            </p>
          </div>

          {/* Interactive Steps Grid */}
          <div className="grid lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Step Selection List */}
            <div className="lg:col-span-6 flex flex-col gap-3.5 justify-between">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isActive = activeStep === idx;
                return (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(idx)}
                    className={`text-left p-5 sm:p-6 rounded-2xl border transition-all flex items-start gap-4 ${
                      isActive
                        ? isDark 
                          ? 'bg-slate-900 border-[#D4AF37]/60 shadow-lg shadow-black/40 ring-1 ring-[#D4AF37]/30'
                          : 'bg-white border-[#2D6A4F] shadow-md shadow-[#2D6A4F]/10 ring-1 ring-[#2D6A4F]'
                        : isDark
                          ? 'bg-slate-900/80 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                          : 'bg-white/80 border-[#E8E2DA] hover:bg-white hover:border-[#D4CECA]'
                    }`}
                  >
                    <div className={`p-3.5 rounded-xl shrink-0 transition-colors ${
                      isActive
                        ? 'bg-[#2D6A4F] text-white'
                        : isDark ? 'bg-slate-800 text-slate-400' : 'bg-[#FAF8F4] text-[#55504B]'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          isActive
                            ? isDark ? 'bg-[#D4AF37]/20 text-[#F0D888]' : 'bg-[#2D6A4F]/10 text-[#2D6A4F]'
                            : 'bg-slate-700/30 text-slate-400'
                        }`}>
                          {step.stepNumber}
                        </span>
                        <h3 className="font-display font-bold text-base sm:text-lg">{step.title}</h3>
                      </div>
                      <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-[#7B746E]'}`}>
                        {step.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Clear Visual Confirmation Card (No Code / No Jargon) */}
            <div className={`lg:col-span-6 rounded-3xl border p-8 sm:p-10 flex flex-col justify-between shadow-xl ${
              isDark 
                ? 'bg-slate-900 border-slate-800 shadow-black/50' 
                : 'bg-white border-[#E8E2DA] shadow-[#2E2A26]/5'
            }`}>
              <div>
                {/* Visual Card Header */}
                <div className="flex items-center justify-between pb-6 border-b border-slate-700/30 mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                      isDark ? 'bg-[#2D6A4F] text-white' : 'bg-[#F0FAF5] text-[#2D6A4F] border border-[#B3E4CC]'
                    }`}>
                      {React.createElement(steps[activeStep].icon, { className: 'w-6 h-6' })}
                    </div>
                    <div>
                      <div className="text-xs uppercase font-bold tracking-wider text-slate-400">
                        {steps[activeStep].stepNumber} Visual Guarantee
                      </div>
                      <h4 className="font-display font-bold text-lg">
                        {steps[activeStep].preview.headline}
                      </h4>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <Check className="w-3.5 h-3.5" />
                    Verified Safe
                  </span>
                </div>

                {/* Main Visual Box */}
                <div className={`p-6 rounded-2xl border mb-6 ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-[#FAF8F4] border-[#E8E2DA]'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-slate-400 font-medium">Protection Status:</span>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-md">
                      {steps[activeStep].preview.status}
                    </span>
                  </div>

                  <div className="text-sm font-semibold mb-2">
                    {steps[activeStep].preview.target}
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {steps[activeStep].preview.note}
                  </p>
                </div>

                {/* Key Benefits Checklist */}
                <div className="space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    What this means for your business:
                  </div>
                  {steps[activeStep].details.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className={isDark ? 'text-slate-200' : 'text-[#2E2A26]'}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-6 mt-6 border-t border-slate-700/30 flex items-center justify-between text-xs text-slate-400">
                <span>Step {activeStep + 1} of 4</span>
                <span className="font-semibold text-emerald-500">
                  Instant Legal Validity
                </span>
              </div>
            </div>

          </div>

          {/* Reassurance Guarantee Line Underneath */}
          <div className="mt-14 max-w-3xl mx-auto text-center">
            <div className={`p-5 rounded-2xl border inline-block text-sm font-medium ${
              isDark 
                ? 'bg-slate-900 border-slate-800 text-slate-300 shadow-xl' 
                : 'bg-white border-[#E8E2DA] text-[#55504B] shadow-sm'
            }`}>
              🛡️ <strong className={isDark ? 'text-white' : 'text-[#2E2A26]'}>Our Guarantee:</strong> Every record is legally binding, tamper-evident, and independently verifiable at any time — guaranteed by mathematical proof, not promises.
            </div>
          </div>

        </div>
      </section>

      {/* ── TAILORED ENTERPRISE SOLUTIONS (LEGAL, TITLE, COMPLIANCE) */}
      <section id="solutions" className={`py-24 sm:py-32 border-t transition-colors relative ${
        isDark ? 'border-slate-800/80 bg-transparent' : 'border-[#E8E2DA] bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
          
          <div className="max-w-3xl mx-auto text-center mb-20">
            <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border ${
              isDark ? 'bg-slate-800 text-[#D4AF37] border-[#D4AF37]/30' : 'bg-[#F0FAF5] text-[#2D6A4F] border-[#B3E4CC]'
            }`}>
              <Scale className="w-3.5 h-3.5" />
              Built for Institutional Workflows
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-800 tracking-tight mb-4">
              Engineered for High-Stakes Document Notarization
            </h2>
            <p className={`text-base sm:text-lg ${isDark ? 'text-slate-300' : 'text-[#55504B]'}`}>
              Replace vulnerable email PDFs and costly courier processes with mathematical certainty.
            </p>
          </div>

          {/* 3 High-Impact Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            
            {/* CARD 1: Legal Counsel */}
            <div className={`p-8 rounded-2xl border transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between ${
              isDark 
                ? 'bg-slate-900/90 border-slate-800 hover:border-[#D4AF37]/40 shadow-card-dark-glow' 
                : 'bg-white border-[#E8E2DA] hover:border-[#2D6A4F]/60 shadow-card hover:shadow-card-hover'
            }`}>
              <div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${
                  isDark ? 'bg-slate-800 text-[#D4AF37] border border-[#D4AF37]/20' : 'bg-[#F0FAF5] text-[#2D6A4F] border border-[#B3E4CC]'
                }`}>
                  <Scale className="w-6 h-6" />
                </div>
                <h3 className="font-display text-xl font-bold mb-3">
                  Legal & Corporate Counsel
                </h3>
                <p className={`text-sm leading-relaxed mb-6 ${isDark ? 'text-slate-300' : 'text-[#55504B]'}`}>
                  Notarize board resolutions, IP assignments, and commercial agreements with tamper-proof timestamps and indisputable signature certainty.
                </p>
              </div>

              <ul className="space-y-2.5 pt-6 border-t border-dashed border-slate-700/40 text-xs">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Court-admissible certificate of completion</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Multi-signatory authorization confirmation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Complete document content privacy</span>
                </li>
              </ul>
            </div>

            {/* CARD 2: Real Estate & Title */}
            <div className={`p-8 rounded-2xl border transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between ${
              isDark 
                ? 'bg-slate-900/90 border-slate-800 hover:border-[#D4AF37]/40 shadow-card-dark-glow' 
                : 'bg-white border-[#E8E2DA] hover:border-[#2D6A4F]/60 shadow-card hover:shadow-card-hover'
            }`}>
              <div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${
                  isDark ? 'bg-slate-800 text-[#D4AF37] border border-[#D4AF37]/20' : 'bg-[#F0FAF5] text-[#2D6A4F] border border-[#B3E4CC]'
                }`}>
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="font-display text-xl font-bold mb-3">
                  Real Estate & Title Escrow
                </h3>
                <p className={`text-sm leading-relaxed mb-6 ${isDark ? 'text-slate-300' : 'text-[#55504B]'}`}>
                  Secure deed transfers, mortgage notes, closing packets, and title filings. Guard escrow against wire fraud and forged paperwork.
                </p>
              </div>

              <ul className="space-y-2.5 pt-6 border-t border-dashed border-slate-700/40 text-xs">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Live face verification prevents impersonation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Instant county recorder verification portal</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Eliminates escrow wire intercept risk</span>
                </li>
              </ul>
            </div>

            {/* CARD 3: Compliance & Risk Officers */}
            <div className={`p-8 rounded-2xl border transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between ${
              isDark 
                ? 'bg-slate-900/90 border-slate-800 hover:border-[#D4AF37]/40 shadow-card-dark-glow' 
                : 'bg-white border-[#E8E2DA] hover:border-[#2D6A4F]/60 shadow-card hover:shadow-card-hover'
            }`}>
              <div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${
                  isDark ? 'bg-slate-800 text-[#D4AF37] border border-[#D4AF37]/20' : 'bg-[#F0FAF5] text-[#2D6A4F] border border-[#B3E4CC]'
                }`}>
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-display text-xl font-bold mb-3">
                  Compliance & Risk Officers
                </h3>
                <p className={`text-sm leading-relaxed mb-6 ${isDark ? 'text-slate-300' : 'text-[#55504B]'}`}>
                  Produce instant verifiable audit trails for regulators, internal reviews, and legal discovery without depending on proprietary third-party servers.
                </p>
              </div>

              <ul className="space-y-2.5 pt-6 border-t border-dashed border-slate-700/40 text-xs">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Tamper-evident audit trail with zero gaps</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Automated document alteration detection</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Independently verifiable at any time</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* ── SECURITY & INTEGRITY STANDARDS ────────────────────────── */}
      <section id="security" className={`py-24 sm:py-32 border-t transition-colors relative ${
        isDark ? 'border-slate-800/80 bg-transparent' : 'border-[#E8E2DA] bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
          
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6">
              <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border ${
                isDark ? 'bg-slate-800 text-[#D4AF37] border-[#D4AF37]/30' : 'bg-[#F0FAF5] text-[#2D6A4F] border-[#B3E4CC]'
              }`}>
                <Lock className="w-3.5 h-3.5" />
                Complete Document Privacy
              </div>
              <h2 className="font-display text-3xl sm:text-5xl font-800 tracking-tight mb-6">
                Your Sensitive Documents Stay in Your Hands. Always.
              </h2>
              <p className={`text-base sm:text-lg leading-relaxed mb-8 ${isDark ? 'text-slate-300' : 'text-[#55504B]'}`}>
                Unlike traditional electronic signature tools that store your sensitive confidential contracts in plain readable text on their servers, NotaryChain guarantees total privacy.
              </p>

              <div className="space-y-4 text-sm font-medium">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className={isDark ? 'text-white' : 'text-[#2E2A26]'}>Local Fingerprint Creation:</strong>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-[#7B746E]'}`}>
                      Your document text and contents never leave your computer or mobile device.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className={isDark ? 'text-white' : 'text-[#2E2A26]'}>Bank-Grade Encryption:</strong>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-[#7B746E]'}`}>
                      All communications and organization vaults are secured with the highest enterprise standards.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className={isDark ? 'text-white' : 'text-[#2E2A26]'}>Verifiable Decades Later:</strong>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-[#7B746E]'}`}>
                      Your proof remains valid 50 years from now, even without active software subscriptions.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Security Box */}
            <div className="lg:col-span-6">
              <div className={`p-8 rounded-3xl border shadow-xl ${
                isDark 
                  ? 'bg-slate-900 border-slate-800 shadow-black/60' 
                  : 'bg-white border-[#E8E2DA] shadow-[#2E2A26]/5'
              }`}>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700/40">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Integrity & Compliance Summary</h4>
                      <p className="text-xs text-slate-400">Institutional Security Standards</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                    Legally Recognized
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                    isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-[#FAF8F4] border-[#E8E2DA]'
                  }`}>
                    <span className="text-slate-400">Document Content Storage:</span>
                    <span className="font-bold text-emerald-400">Never Stored on External Servers</span>
                  </div>

                  <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                    isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-[#FAF8F4] border-[#E8E2DA]'
                  }`}>
                    <span className="text-slate-400">Signer Identity Verification:</span>
                    <span className="font-bold text-slate-200">Live 3D Face Liveness Check</span>
                  </div>

                  <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                    isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-[#FAF8F4] border-[#E8E2DA]'
                  }`}>
                    <span className="text-slate-400">Record Permanence:</span>
                    <span className="font-bold text-slate-200">Immutable Public Ledger Seal</span>
                  </div>

                  <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                    isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-[#FAF8F4] border-[#E8E2DA]'
                  }`}>
                    <span className="text-slate-400">Legal Enforceability:</span>
                    <span className="font-bold text-emerald-400">ESIGN Act & eIDAS Standard</span>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-700/40 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Status:</span>
                  <span className="font-bold text-emerald-500 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Audit-Ready Certificate Standard
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── EARLY ACCESS CTA CALLOUT ─────────────────────────────── */}
      <section className="py-24 sm:py-32 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 text-center relative z-10">
          
          <div className={`p-10 sm:p-16 rounded-3xl border shadow-2xl relative overflow-hidden ${
            isDark 
              ? 'bg-gradient-to-b from-slate-900 to-[#0A1222] border-[#D4AF37]/30 shadow-black/80' 
              : 'bg-gradient-to-b from-white to-[#F0FAF5] border-[#2D6A4F]/30 shadow-card-lg'
          }`}>
            <div className="max-w-2xl mx-auto">
              <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border ${
                isDark ? 'bg-slate-800 text-[#D4AF37] border-[#D4AF37]/30' : 'bg-[#F0FAF5] text-[#2D6A4F] border-[#B3E4CC]'
              }`}>
                <Building2 className="w-3.5 h-3.5" />
                Early Access Program
              </div>

              <h2 className="font-display text-3xl sm:text-5xl font-800 tracking-tight mb-6">
                Upgrade Your Notarization & Closing Infrastructure
              </h2>

              <p className={`text-base sm:text-lg mb-10 leading-relaxed ${isDark ? 'text-slate-300' : 'text-[#55504B]'}`}>
                Join corporate legal departments, title agencies, and compliance teams using tamper-proof document verification.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => {
                    setAuthTab('signup');
                    setShowAuthModal(true);
                  }}
                  className={`w-full sm:w-auto text-base font-bold px-10 py-4.5 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg ${
                    isDark
                      ? 'bg-[#2D6A4F] hover:bg-[#388463] text-white border border-[#D4AF37]/30 shadow-[#2D6A4F]/25 hover:scale-[1.02]'
                      : 'bg-[#2D6A4F] hover:bg-[#245741] text-white shadow-[#2D6A4F]/20 hover:scale-[1.02]'
                  }`}
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  onClick={() => {
                    setAuthTab('signin');
                    setShowAuthModal(true);
                  }}
                  className={`w-full sm:w-auto text-base font-semibold px-8 py-4.5 rounded-xl border transition-all ${
                    isDark 
                      ? 'border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200' 
                      : 'border-[#E8E2DA] bg-white hover:bg-[#FAF8F4] text-[#2E2A26]'
                  }`}
                >
                  Sign In to Document Vault
                </button>
              </div>

              <p className="text-xs text-slate-400 mt-6">
                No credit card required · Instant organization testnet access
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className={`border-t py-12 px-6 sm:px-8 transition-colors ${
        isDark ? 'bg-[#080D1A] border-slate-800 text-slate-400' : 'bg-white border-[#E8E2DA] text-[#7B746E]'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isDark ? 'bg-[#2D6A4F] text-white' : 'bg-[#2D6A4F] text-white'
            }`}>
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className={`font-bold text-base ${isDark ? 'text-white' : 'text-[#2E2A26]'}`}>
                NotaryChain
              </span>
              <p className="text-xs">
                Permanent, tamper-proof document verification.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-medium">
            <a href="#how-it-works" className="hover:text-emerald-500 transition-colors">How It Works</a>
            <a href="#solutions" className="hover:text-emerald-500 transition-colors">Solutions</a>
            <a href="#security" className="hover:text-emerald-500 transition-colors">Security</a>
            <span className="text-slate-500">·</span>
            <span className="text-xs">
              © {new Date().getFullYear()} NotaryChain. Built for legal & compliance teams.
            </span>
          </div>
        </div>
      </footer>

      {/* ── INTERACTIVE AUTH MODAL / DRAWER ──────────────────────── */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2 }}
              className={`relative w-full max-w-lg p-8 rounded-3xl border shadow-2xl z-10 ${
                isDark 
                  ? 'bg-slate-900 border-slate-700 text-white shadow-black/80' 
                  : 'bg-white border-[#E8E2DA] text-[#2E2A26] shadow-2xl'
              }`}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowAuthModal(false)}
                className={`absolute top-6 right-6 p-2 rounded-xl border transition-colors ${
                  isDark ? 'border-slate-700 hover:bg-slate-800 text-slate-400' : 'border-[#E8E2DA] hover:bg-[#FAF8F4] text-slate-500'
                }`}
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Header */}
              <div className="text-center mb-6">
                <div className={`w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center ${
                  isDark ? 'bg-[#2D6A4F] text-white border border-[#D4AF37]/30' : 'bg-[#2D6A4F] text-white'
                }`}>
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-display text-2xl font-bold">
                  {authTab === 'signup' ? 'Access NotaryChain' : 'Sign In to Vault'}
                </h3>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-[#7B746E]'}`}>
                  {authTab === 'signup' 
                    ? 'Register your organization or team for early access' 
                    : 'Access your tamper-evident document registry'}
                </p>
              </div>

              {/* Tab Switcher */}
              <div className={`grid grid-cols-2 p-1 rounded-xl mb-6 border ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-[#F6F3EE] border-[#E8E2DA]'
              }`}>
                <button
                  onClick={() => setAuthTab('signup')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    authTab === 'signup' 
                      ? isDark ? 'bg-slate-800 text-white shadow-xs' : 'bg-white text-[#2D6A4F] shadow-xs' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Create Account / Register
                </button>
                <button
                  onClick={() => setAuthTab('signin')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    authTab === 'signin' 
                      ? isDark ? 'bg-slate-800 text-white shadow-xs' : 'bg-white text-[#2D6A4F] shadow-xs' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
              </div>

              {/* Options Grid */}
              <div className="space-y-3">
                {authTab === 'signup' ? (
                  <>
                    <button
                      onClick={() => navigate('/signup')}
                      className={`w-full p-4 rounded-xl border text-left flex items-center justify-between group transition-all ${
                        isDark 
                          ? 'bg-slate-800/80 border-slate-700 hover:border-[#D4AF37] hover:bg-slate-800' 
                          : 'bg-[#FAF8F4] border-[#E8E2DA] hover:border-[#2D6A4F] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-lg bg-[#2D6A4F] text-white flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-sm">Enterprise / Legal Team</div>
                          <div className="text-xs text-slate-400">Corporate legal, title escrow & compliance</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                      onClick={() => navigate('/signup')}
                      className={`w-full p-4 rounded-xl border text-left flex items-center justify-between group transition-all ${
                        isDark 
                          ? 'bg-slate-800/80 border-slate-700 hover:border-[#D4AF37] hover:bg-slate-800' 
                          : 'bg-[#FAF8F4] border-[#E8E2DA] hover:border-[#2D6A4F] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-lg bg-[#1B4532] text-white flex items-center justify-center shrink-0">
                          <Scale className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-sm">Certified Notary Public</div>
                          <div className="text-xs text-slate-400">Commissioned state notary attestation portal</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => navigate('/login')}
                    className={`w-full p-4 rounded-xl border text-left flex items-center justify-between group transition-all ${
                      isDark 
                        ? 'bg-slate-800/80 border-slate-700 hover:border-[#D4AF37] hover:bg-slate-800' 
                        : 'bg-[#FAF8F4] border-[#E8E2DA] hover:border-[#2D6A4F] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-lg bg-[#2D6A4F] text-white flex items-center justify-center shrink-0">
                        <LogIn className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm">Sign in to Document Vault</div>
                        <div className="text-xs text-slate-400">Access existing verification records</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>

              <div className="mt-6 text-center">
                <p className="text-xs text-slate-400">
                  Cryptographically secured by tamper-proof public ledgers.
                </p>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
