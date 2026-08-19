import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ArrowUpRight, Check, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlan } from '../../context/PlanContext';
import toast from 'react-hot-toast';

export default function UpgradeModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { upgradePlan, currentPlanKey } = usePlan();
  const [upgrading, setUpgrading] = useState(false);

  const handleUpgradeToPro = async () => {
    try {
      setUpgrading(true);
      await upgradePlan('PRO');
      toast.success('🎉 Successfully upgraded to NotaryChain Pro!');
      onClose();
    } catch (err) {
      navigate('/pricing');
      onClose();
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#2E2A26]/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl ring-1 ring-[#E8E2DA]"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-1 text-[#7B746E] hover:bg-[#FAF8F4] hover:text-[#2E2A26] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#F0FAF5] text-[#2D6A4F] border border-[#B3E4CC]">
              <Sparkles className="h-6 w-6" />
            </div>

            <h3 className="text-lg font-bold text-[#2E2A26] tracking-tight">
              Your free verification limit has been reached
            </h3>
            
            <p className="mt-1 text-xs text-[#55504B]">
              You've verified 3 documents in the last 24 hours. Upgrade to NotaryChain Pro to continue verifying documents without interruption.
            </p>

            {/* Plan highlight card */}
            <div className="my-5 rounded-xl bg-[#FAF8F4] p-4 border border-[#E8E2DA] space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-[#E8E2DA]">
                <div>
                  <span className="text-xs font-bold text-[#2D2A27]">NotaryChain Pro</span>
                  <p className="text-[11px] text-[#7B746E]">Unlimited* document verification</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-[#2D6A4F]">₹499</span>
                  <span className="text-[10px] text-[#7B746E]">/month</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-[#55504B]">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" />
                  <span>Unlimited* cryptographic verifications (*fair use)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" />
                  <span>Downloadable verification reports & QR codes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" />
                  <span>Advanced AI risk explanation & audit trail</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row-reverse gap-2.5">
              <button
                onClick={handleUpgradeToPro}
                disabled={upgrading}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#2D6A4F] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#1B4532] sm:w-auto cursor-pointer shadow-xs"
              >
                {upgrading ? 'Upgrading…' : 'Upgrade to Pro — ₹499/mo'}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={onClose}
                className="inline-flex w-full items-center justify-center rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-[#55504B] ring-1 ring-inset ring-[#E8E2DA] transition-colors hover:bg-[#FAF8F4] sm:w-auto cursor-pointer"
              >
                Maybe Later
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
