import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Lock, UserCheck, Database, ArrowLeft } from 'lucide-react';

const trust = [
  { icon: Lock,         label: 'Zero-Knowledge Client-Side Hashing' },
  { icon: UserCheck,    label: 'Live Biometric Identity Binding' },
  { icon: Database,     label: 'Immutable Public Ledger Anchoring' },
];

const AuthLayout = () => {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-[#FAF8F4] dark:bg-[#0B1120] flex text-[#2E2A26] dark:text-slate-100 transition-colors relative overflow-hidden">
      
      {/* ── Single Full-Bleed Continuous Hairline Grid Layer ──── */}
      <div className="absolute inset-0 pointer-events-none unified-grid-overlay z-0" />

      {/* ── 4. Page-Level Vignette / Spotlight (Pulling Focus to Center) ──── */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-75 dark:opacity-90"
        style={{
          background: 'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 40%, rgba(0, 0, 0, 0.4) 100%)'
        }}
      />

      {/* ── Left Brand Panel ─────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[560px] bg-[#2D6A4F]/95 backdrop-blur-md flex-col justify-between p-12 relative overflow-hidden shrink-0 border-r border-[#1B4532]/60 shadow-[10px_0_40px_rgba(0,0,0,0.25)] z-10">
        
        {/* Soft Ambient Radiance & Glows */}
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-emerald-400/20 filter blur-3xl pointer-events-none" />
        <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-[#D4AF37]/15 filter blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-emerald-300/10 filter blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* 2. Raised 3D Logo Icon */}
          <Link to="/" className="inline-flex items-center gap-3.5 mb-14 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 via-[#2D6A4F] to-[#163829] p-[1px] shadow-[0_8px_16px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-[#D4AF37]/40 flex items-center justify-center transition-transform group-hover:scale-105">
              <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-emerald-500/20 to-transparent flex items-center justify-center">
                <FileText className="w-5 h-5 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-display font-800 text-xl text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">NotaryChain</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-white/15 text-white border border-white/25 shadow-[0_2px_4px_rgba(0,0,0,0.15)]">
                Early Access
              </span>
            </div>
          </Link>

          {/* Headline */}
          <h1 className="font-display text-3xl sm:text-4xl font-800 text-white leading-tight mb-4 tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
            Institutional-Grade Document Notarization.
          </h1>
          <p className="text-[#D9F2E6] text-sm sm:text-base leading-relaxed mb-10 font-normal">
            Built specifically for legal counsel, title closing agencies, and corporate compliance teams.
          </p>

          {/* 3. Raised 3D Badge Tiles for Trust Icons */}
          <div className="space-y-3.5">
            {trust.map(({ icon: Icon, label }) => (
              <div 
                key={label} 
                className="flex items-center gap-3.5 p-2 rounded-xl bg-white/5 border-t border-l border-white/20 border-r border-b border-black/25 shadow-[0_4px_12px_rgba(0,0,0,0.15)] backdrop-blur-xs"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400/30 to-[#1B4532]/60 border-t border-l border-white/40 border-b border-r border-black/30 shadow-[0_2px_6px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.4)] flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-[#D9F2E6] drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]" />
                </div>
                <span className="text-sm font-medium text-white/95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3D Proof Points Tiles */}
        <div className="relative z-10 grid grid-cols-3 gap-3 pt-6">
          {[
            { v: '100%',  l: 'Client Privacy' },
            { v: 'SHA-256', l: 'FIPS Standard' },
            { v: 'eIDAS', l: 'ESIGN Aligned' },
          ].map((s) => (
            <div 
              key={s.l} 
              className="bg-white/10 backdrop-blur-md border-t border-l border-white/30 border-r border-b border-black/30 shadow-[0_6px_16px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.2)] rounded-xl p-3.5 text-center"
            >
              <div className="font-display text-base sm:text-lg font-bold text-white mb-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">{s.v}</div>
              <div className="text-[11px] text-white/80 font-medium">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Form Panel (1. 3D Master Auth Card with Glow & Depth) ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Top navigation back link */}
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-[#55504B] dark:text-slate-400 hover:text-[#2D6A4F] dark:hover:text-[#D4AF37] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to overview</span>
            </Link>

            {/* Mobile 3D logo */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-[#1B4532] border border-[#D4AF37]/30 shadow-md flex items-center justify-center">
                <FileText className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-display font-bold text-base text-[#2E2A26] dark:text-white">NotaryChain</span>
            </div>
          </div>

          {/* Master 3D Auth Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.99 }}
              transition={{ duration: 0.25 }}
              className="w-full bg-white dark:bg-[#0E1526] border border-[#D4AF37]/25 dark:border-[#D4AF37]/25 rounded-3xl p-7 sm:p-9 shadow-[0_24px_60px_rgba(0,0,0,0.45),0_10px_25px_rgba(0,0,0,0.25),0_0_30px_rgba(212,175,55,0.06)]"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>

          <p className="text-center text-xs text-[#7B746E] dark:text-slate-400 mt-8">
            © {new Date().getFullYear()} NotaryChain. Cryptographically secured digital notarization.
          </p>
        </div>
      </div>

    </div>
  );
};

export default AuthLayout;
