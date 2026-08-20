import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText, ShieldCheck, ArrowRight, LogIn, UserPlus, ChevronRight, Sun, Moon,
  Upload, Brain, Shield, AlertTriangle, Hash, Link as LinkIcon, QrCode, Globe,
  CreditCard, Activity, Building2, Key, Server
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

/* ── 3D Floating & Rotating Gold Coin Component ─────────────────────────── */
const AnimatedGoldCoin = () => {
  return (
    <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-8 perspective-1000">
      {/* Glow aura */}
      <div className="absolute inset-0 rounded-full bg-[#B5883D]/25 filter blur-xl animate-pulse" />

      {/* Floating and Rotating Coin Container */}
      <motion.div
        animate={{
          y: [0, -12, 0],
          rotateY: [0, 180, 360],
          rotateZ: [-2, 2, -2],
        }}
        transition={{
          y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
          rotateY: { duration: 12, repeat: Infinity, ease: 'linear' },
          rotateZ: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
        }}
        className="w-full h-full relative"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
          <defs>
            <linearGradient id="coinBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F9F0C8" />
              <stop offset="35%" stopColor="#B5883D" />
              <stop offset="70%" stopColor="#E1B84C" />
              <stop offset="100%" stopColor="#7A5218" />
            </linearGradient>
            
            <linearGradient id="coinFaceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2D6A4F" />
              <stop offset="60%" stopColor="#1B4532" />
              <stop offset="100%" stopColor="#143426" />
            </linearGradient>

            <linearGradient id="goldTextGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFDF9" />
              <stop offset="50%" stopColor="#F0D888" />
              <stop offset="100%" stopColor="#B5883D" />
            </linearGradient>
          </defs>

          {/* Outer Coin Edge Ring */}
          <circle cx="80" cy="80" r="76" fill="url(#coinBorderGrad)" />
          <circle cx="80" cy="80" r="71" fill="#1B4532" />
          <circle cx="80" cy="80" r="67" fill="url(#coinBorderGrad)" />
          <circle cx="80" cy="80" r="63" stroke="url(#coinBorderGrad)" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="80" cy="80" r="60" fill="url(#coinFaceGrad)" />

          {/* Shield Emblem */}
          <path
            d="M80 42 L105 54 V80 C105 97 80 110 80 110 C80 110 55 97 55 80 V54 L80 42 Z"
            fill="none"
            stroke="url(#goldTextGrad)"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Notary Emblem "N" */}
          <text
            x="80"
            y="85"
            fill="url(#goldTextGrad)"
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

const Landing = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [showAuthCards, setShowAuthCards] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#2E2A26] font-sans flex flex-col justify-between overflow-x-hidden select-none transition-colors relative">

      {/* ── Technical Blueprint Grid Overlay (Landing Page Only) ── */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: isDark
            ? `linear-gradient(to right, rgba(181, 136, 61, 0.08) 1px, transparent 1px),
               linear-gradient(to bottom, rgba(181, 136, 61, 0.08) 1px, transparent 1px)`
            : `linear-gradient(to right, rgba(62, 58, 52, 0.10) 1px, transparent 1px),
               linear-gradient(to bottom, rgba(62, 58, 52, 0.10) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 40%, black 30%, transparent 90%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 40%, black 30%, transparent 90%)'
        }}
      />

      {/* ── Sticky Full-Width Navbar ────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 bg-[#FAF8F4]/95 backdrop-blur-sm border-b border-[#E8E2DA] transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setShowAuthCards(false)}>
            <div className="w-8 h-8 rounded-xl bg-[#2D6A4F] flex items-center justify-center shadow-xs">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-700 text-xl text-[#2E2A26] tracking-tight">NotaryChain</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#pricing" className="hidden md:block text-sm font-semibold text-[#55504B] hover:text-[#2D6A4F] transition-colors">
              Pricing
            </a>
            <div className="flex items-center gap-3">
              {/* Dark/Bright Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${isDark ? 'Bright (Light)' : 'Dark'} Mode`}
              className="p-2.5 rounded-xl text-[#7B746E] hover:text-[#2E2A26] hover:bg-[#F6F3EE] border border-[#E8E2DA] transition-all flex items-center justify-center"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#52796F]" />}
            </button>

            <button
              onClick={() => navigate('/login')}
              className="text-sm font-semibold text-[#55504B] hover:text-[#2D6A4F] px-4 py-2.5 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => setShowAuthCards(true)}
              className="text-sm font-semibold bg-[#2D6A4F] text-white px-5 py-2.5 rounded-xl hover:bg-[#245741] transition-all shadow-xs"
            >
              Get Started
            </button>
          </div>
          </div>
        </div>
      </nav>

      {/* ── Hero Presentation Section ────────────────────────── */}
      <section className="pt-36 pb-20 px-6 relative overflow-hidden min-h-[85vh] flex items-center justify-center">
        <div className="absolute inset-0 bg-dots opacity-40 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center w-full">

          {/* Hero Content / Account Options AnimatePresence */}
          <AnimatePresence mode="wait">
            {!showAuthCards ? (
              <motion.div
                key="hero-main"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* 1. ANIMATED COIN */}
                <AnimatedGoldCoin />

                {/* Trust badge */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#2D6A4F] bg-[#F0FAF5] border border-[#B3E4CC] px-5 py-2 rounded-full mb-6 shadow-xs"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Polygon Blockchain Anchored · AI Verified · Legally Binding
                </motion.div>

                {/* 2. PRODUCT TITLE */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.05 }}
                  className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold text-[#2E2A26] dark:text-[#F3F1ED] leading-[1.12] tracking-tight mb-6"
                >
                  <span className="block font-800 text-[#2E2A26] dark:text-white tracking-tight">
                    Institutional-Grade
                  </span>
                  <span className="block font-800 tracking-tight mt-1">
                    <span
                      className="inline-block font-extrabold"
                      style={{
                        backgroundImage: isDark
                          ? 'linear-gradient(90deg, #2D6A4F 0%, #40916C 22%, #D4AF37 46%, #E1B84C 52%, #D4AF37 58%, #40916C 78%, #2D6A4F 100%)'
                          : 'linear-gradient(90deg, #1B4532 0%, #2D6A4F 22%, #B5883D 45%, #C89B3C 52%, #B5883D 58%, #2D6A4F 78%, #1B4532 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        color: 'transparent',
                        filter: isDark
                          ? 'drop-shadow(0 2px 14px rgba(82, 183, 136, 0.18))'
                          : 'drop-shadow(0 2px 8px rgba(45, 106, 79, 0.10))'
                      }}
                    >
                      Document Notarization
                    </span>{' '}
                    <span className="text-[#2E2A26] dark:text-[#F3F1ED]">for</span>
                  </span>
                  <span className="block font-800 text-[#2E2A26] dark:text-[#F3F1ED] tracking-tight mt-1">
                    Modern Teams.
                  </span>
                </motion.h1>

                {/* 3. SHORT DESCRIPTION */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-lg sm:text-xl text-[#55504B] leading-relaxed mb-10 max-w-2xl mx-auto font-normal"
                >
                  NotaryChain combines AI-powered OCR document analysis, biometric identity checks, and immutable Polygon smart contract anchoring for enterprise teams.
                </motion.p>

                {/* 4. GET STARTED BUTTON */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                  className="flex justify-center"
                >
                  <button
                    id="landing-get-started-btn"
                    onClick={() => setShowAuthCards(true)}
                    className="inline-flex items-center justify-center gap-3 bg-[#2D6A4F] text-white font-bold px-10 py-4.5 rounded-xl hover:bg-[#245741] transition-all shadow-card hover:shadow-card-hover text-base font-display"
                  >
                    Get Started
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </motion.div>
              </motion.div>
            ) : (
              /* INTERACTIVE CARDS REVEAL (Card 1: Sign In, Card 2: Create Account) */
              <motion.div
                key="hero-auth-cards"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-2xl mx-auto py-2"
              >
                <div className="text-center mb-8">
                  <span className="text-xs font-bold text-[#2D6A4F] dark:text-[#52B788] uppercase tracking-wider bg-[#F0FAF5] dark:bg-[#2D6A4F]/20 px-4 py-2 rounded-full border border-[#B3E4CC] dark:border-[#2D6A4F] shadow-xs">
                    Select Account Option
                  </span>
                  <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#2E2A26] dark:text-white mt-4 mb-2">
                    Welcome to NotaryChain
                  </h2>
                  <p className="text-sm text-[#55504B] dark:text-[#A3B8AD]">
                    Choose an option below to sign in to your vault or register a new identity
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-5 text-left">
                  {/* CARD 1: SIGN IN */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    onClick={() => navigate('/login')}
                    className="p-7 rounded-2xl shadow-card hover:shadow-card-hover cursor-pointer transition-all group flex flex-col justify-between"
                    style={{
                      backgroundColor: isDark ? '#1A231E' : '#FFFFFF',
                      border: `1px solid ${isDark ? '#2D4A3E' : '#E8E2DA'}`,
                    }}
                  >
                    <div>
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 group-hover:bg-[#2D6A4F] group-hover:text-white transition-colors"
                        style={{
                          backgroundColor: isDark ? 'rgba(45, 106, 79, 0.25)' : '#F0FAF5',
                          border: `1px solid ${isDark ? '#2D6A4F' : '#B3E4CC'}`,
                          color: isDark ? '#52B788' : '#2D6A4F',
                        }}
                      >
                        <LogIn className="w-7 h-7" />
                      </div>
                      <h3
                        className="font-display text-xl font-bold mb-2"
                        style={{ color: isDark ? '#FFFFFF' : '#2E2A26' }}
                      >
                        Sign In
                      </h3>
                      <p
                        className="text-sm leading-relaxed font-medium"
                        style={{ color: isDark ? '#A3B8AD' : '#55504B' }}
                      >
                        Access your existing document vault & verification records.
                      </p>
                    </div>
                    <div
                      className="mt-8 flex items-center justify-between text-sm font-bold"
                      style={{ color: isDark ? '#52B788' : '#2D6A4F' }}
                    >
                      <span>Log in to account</span>
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.div>

                  {/* CARD 2: CREATE ACCOUNT */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    onClick={() => navigate('/signup')}
                    className="p-7 rounded-2xl shadow-card hover:shadow-card-hover cursor-pointer transition-all group flex flex-col justify-between"
                    style={{
                      backgroundColor: isDark ? '#1A231E' : '#FFFFFF',
                      border: `2px solid ${isDark ? '#52B788' : '#2D6A4F'}`,
                      backgroundImage: isDark
                        ? 'linear-gradient(to bottom, #1A231E, rgba(45, 106, 79, 0.2))'
                        : 'linear-gradient(to bottom, #FFFFFF, rgba(240, 250, 245, 0.8))',
                    }}
                  >
                    <div>
                      <div className="w-14 h-14 rounded-xl bg-[#2D6A4F] text-white flex items-center justify-center mb-5 shadow-xs">
                        <UserPlus className="w-7 h-7" />
                      </div>
                      <h3
                        className="font-display text-xl font-bold mb-2"
                        style={{ color: isDark ? '#FFFFFF' : '#2E2A26' }}
                      >
                        Create Account
                      </h3>
                      <p
                        className="text-sm leading-relaxed font-medium"
                        style={{ color: isDark ? '#A3B8AD' : '#55504B' }}
                      >
                        Register a new Company, Bank, or Certified Notary profile.
                      </p>
                    </div>
                    <div
                      className="mt-8 flex items-center justify-between text-sm font-bold"
                      style={{ color: isDark ? '#52B788' : '#2D6A4F' }}
                    >
                      <span>Start registration</span>
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.div>
                </div>

                <div className="mt-8">
                  <button
                    onClick={() => setShowAuthCards(false)}
                    className="text-sm text-[#7B746E] hover:text-[#2D6A4F] underline font-medium transition-colors"
                  >
                    ← Back to introduction
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </section>

      {/* ── 'Trusted By' / Social Proof Section ──────────────────────── */}
      <section className="py-16 px-6 bg-white border-y border-[#E8E2DA] transition-colors relative z-10">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm font-bold text-[#7B746E] uppercase tracking-widest mb-10">
            Built for enterprises, law firms, banks, and governments
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Documents Verified', value: '2.4M+' },
              { label: 'Trust Score Accuracy', value: '99.9%' },
              { label: 'Blockchain Proofs', value: '5M+' },
              { label: 'Active Users', value: '120k+' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#FAF8F4] border border-[#E8E2DA]"
              >
                <div className="text-3xl md:text-4xl font-display font-800 text-[#2D6A4F] mb-2">{stat.value}</div>
                <div className="text-sm font-medium text-[#55504B]">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Product Positioning Statement ────────────────────────────── */}
      <section className="py-24 px-6 bg-[#1B4532] text-white relative z-10 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0,transparent_100%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-display font-bold leading-tight mb-12 text-[#FFFDF9]"
          >
            "NotaryChain is digital trust infrastructure for important documents."
          </motion.h2>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              'AI Analysis', 'Identity Verification', 'Cryptographic Proof', 'Blockchain Anchoring', 'Public Verification'
            ].map((prop, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="px-4 py-2 rounded-full bg-[#2D6A4F] text-[#F0FAF5] text-sm font-bold border border-[#52B788]/50 shadow-sm"
              >
                {prop}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* ── 'How It Works' Section ───────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#FAF8F4] relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-[#2E2A26] mb-4">How NotaryChain Works</h2>
            <p className="text-[#55504B] max-w-2xl mx-auto">A seamless 6-step process from upload to immutable public verification.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
            {/* Connecting Line for Desktop */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-[#E8E2DA] -translate-y-1/2 z-0" />
            
            {[
              { icon: Upload, title: '1. Upload Document', desc: 'Securely upload your files into the encrypted vault.' },
              { icon: Brain, title: '2. AI Analysis', desc: 'Models extract text and verify document structure.' },
              { icon: Shield, title: '3. Trust Score', desc: 'Assigns a reliability score based on biometric checks.' },
              { icon: AlertTriangle, title: '4. Risk Analysis', desc: 'Flags anomalies, tampering, or fraudulent patterns.' },
              { icon: Hash, title: '5. SHA-256 Hash', desc: 'Generates a unique cryptographic fingerprint.' },
              { icon: LinkIcon, title: '6. Blockchain Proof', desc: 'Anchors the hash to the Polygon network permanently.' },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-white p-8 rounded-2xl border border-[#E8E2DA] shadow-sm relative z-10 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-[#F0FAF5] text-[#2D6A4F] rounded-xl flex items-center justify-center mb-6 border border-[#B3E4CC]">
                  <step.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#2E2A26] mb-2">{step.title}</h3>
                <p className="text-[#7B746E] text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-12 flex justify-center gap-6">
             <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 bg-white px-6 py-4 rounded-xl border border-[#E8E2DA] shadow-sm"
              >
                <QrCode className="w-6 h-6 text-[#2D6A4F]" />
                <span className="text-sm font-bold text-[#2E2A26]">Scan QR Code</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-3 bg-white px-6 py-4 rounded-xl border border-[#E8E2DA] shadow-sm"
              >
                <Globe className="w-6 h-6 text-[#2D6A4F]" />
                <span className="text-sm font-bold text-[#2E2A26]">Public Verification</span>
              </motion.div>
          </div>
        </div>
      </section>

      {/* ── Business Model Section ───────────────────────────────────── */}
      <section className="py-24 px-6 bg-white border-t border-[#E8E2DA] relative z-10" id="pricing">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-[#2D6A4F] uppercase tracking-wider bg-[#F0FAF5] px-4 py-2 rounded-full border border-[#B3E4CC] mb-4 inline-block">
              Business Model
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-[#2E2A26] mb-4">Built as a sustainable business</h2>
            <p className="text-[#55504B] max-w-2xl mx-auto">Designed for long-term viability with enterprise-grade revenue streams.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: CreditCard, title: 'SaaS Subscriptions', desc: 'Tiered monthly plans for regular document verification.' },
              { icon: Activity, title: 'API Usage', desc: 'Metered access for developers integrating our trust engine.' },
              { icon: Building2, title: 'Enterprise Contracts', desc: 'Custom agreements for large scale law firms and banks.' },
              { icon: Key, title: 'Pay-per-Verification', desc: 'Usage-based pricing for one-off document anchoring.' },
              { icon: Server, title: 'White-Label Infrastructure', desc: 'Licensable tech stack for government and institution portals.' },
            ].map((model, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="p-8 rounded-2xl bg-[#FAF8F4] border border-[#E8E2DA] hover:border-[#2D6A4F] transition-colors"
              >
                <div className="w-10 h-10 bg-white text-[#2D6A4F] rounded-lg flex items-center justify-center mb-5 border border-[#E8E2DA] shadow-sm">
                  <model.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-[#2E2A26] mb-2">{model.title}</h3>
                <p className="text-[#7B746E] text-sm leading-relaxed">{model.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Minimal Footer ──────────────────────────────────── */}
      <footer className="border-t border-[#E8E2DA] bg-white py-6 px-6 transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#2D6A4F] flex items-center justify-center">
              <FileText className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-sm text-[#2E2A26]">NotaryChain</span>
          </div>
          <p className="text-xs text-[#7B746E]">
            © {new Date().getFullYear()} NotaryChain. Cryptographically secured digital notarization.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
