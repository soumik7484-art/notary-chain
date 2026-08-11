import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText, ShieldCheck, ArrowRight, LogIn, UserPlus, ChevronRight, Sun, Moon
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
          backgroundImage: `
            linear-gradient(to right, rgba(45, 106, 79, 0.07) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(45, 106, 79, 0.07) 1px, transparent 1px)
          `,
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
                  className="font-display text-5xl sm:text-6xl md:text-7xl font-800 text-[#2E2A26] leading-[1.1] tracking-tight mb-6"
                >
                  Secure Digital <span className="text-[#2D6A4F]">Document Verification</span>
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
                    className="p-7 bg-white dark:bg-[#1A231E] border border-[#E8E2DA] dark:border-[#2D4A3E] rounded-2xl shadow-card hover:shadow-card-hover hover:border-[#2D6A4F] dark:hover:border-[#52B788] cursor-pointer transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-14 h-14 rounded-xl bg-[#F0FAF5] dark:bg-[#2D6A4F]/30 border border-[#B3E4CC] dark:border-[#2D6A4F] text-[#2D6A4F] dark:text-[#52B788] flex items-center justify-center mb-5 group-hover:bg-[#2D6A4F] group-hover:text-white transition-colors">
                        <LogIn className="w-7 h-7" />
                      </div>
                      <h3 className="font-display text-xl font-bold text-[#2E2A26] dark:text-white mb-2">
                        Sign In
                      </h3>
                      <p className="text-sm text-[#55504B] dark:text-[#A3B8AD] leading-relaxed">
                        Access your existing document vault & verification records.
                      </p>
                    </div>
                    <div className="mt-8 flex items-center justify-between text-sm font-bold text-[#2D6A4F] dark:text-[#52B788]">
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
                    className="p-7 bg-white dark:bg-[#1A231E] border-2 border-[#2D6A4F] dark:border-[#52B788] rounded-2xl shadow-card hover:shadow-card-hover bg-gradient-to-b from-white dark:from-[#1A231E] to-[#F0FAF5]/50 dark:to-[#2D6A4F]/20 cursor-pointer transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-14 h-14 rounded-xl bg-[#2D6A4F] text-white flex items-center justify-center mb-5 shadow-xs">
                        <UserPlus className="w-7 h-7" />
                      </div>
                      <h3 className="font-display text-xl font-bold text-[#2E2A26] dark:text-white mb-2">
                        Create Account
                      </h3>
                      <p className="text-sm text-[#55504B] dark:text-[#A3B8AD] leading-relaxed font-normal">
                        Register a new Company, Bank, or Certified Notary profile.
                      </p>
                    </div>
                    <div className="mt-8 flex items-center justify-between text-sm font-bold text-[#2D6A4F] dark:text-[#52B788]">
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
