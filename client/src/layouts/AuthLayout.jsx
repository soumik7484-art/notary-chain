import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

const trust = [
  { icon: ShieldCheck, label: 'SOC 2 Compliant' },
  { icon: Lock,        label: 'End-to-End Encrypted' },
  { icon: CheckCircle2, label: 'Blockchain Verified' },
];

const AuthLayout = () => {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-[#FAF8F4] flex">

      {/* ── Left Brand Panel ──────────────────────────── */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[560px] bg-[#2D6A4F] flex-col justify-between p-12 relative overflow-hidden shrink-0">
        {/* Decorative dot grid */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        {/* Decorative circle */}
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-white/5" />

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-700 text-xl text-white tracking-tight">NotaryChain</span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl font-800 text-white leading-tight mb-4 tracking-tight">
            Notarize documents with AI-grade precision.
          </h1>
          <p className="text-[#B3E4CC] text-base leading-relaxed mb-10">
            Enterprise-grade digital notarization secured by blockchain. Trusted by 2,000+ organizations worldwide.
          </p>

          {/* Trust signals */}
          <div className="space-y-3">
            {trust.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-[#6DC8A0]" />
                </div>
                <span className="text-sm text-white/80">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { v: '50K+',   l: 'Documents' },
            { v: '99.99%', l: 'Uptime' },
            { v: '25+',    l: 'Countries' },
          ].map((s) => (
            <div key={s.l} className="bg-white/10 rounded-xl p-4 text-center">
              <div className="font-display text-xl font-700 text-white mb-0.5">{s.v}</div>
              <div className="text-xs text-white/60">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Form Panel ──────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-md"
          >
            {/* Mobile logo */}
            <div className="flex items-center gap-2 mb-8 lg:hidden">
              <div className="w-8 h-8 rounded-lg bg-[#2D6A4F] flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-700 text-lg text-[#2E2A26]">NotaryChain</span>
            </div>

            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AuthLayout;
