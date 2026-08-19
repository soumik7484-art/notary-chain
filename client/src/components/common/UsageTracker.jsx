import React, { useState } from 'react';
import { BarChart3, Crown, ArrowUpRight, Check, Sparkles, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePlan } from '../../context/PlanContext';
import UpgradeModal from './UpgradeModal';

export default function UsageTracker() {
  const { currentPlan, currentPlanKey, verificationsUsed, verificationsLimit, remainingCount, isUnlimited, usagePercentage, resetDate } = usePlan();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const used = verificationsUsed ?? 0;
  const limit = verificationsLimit ?? 3;
  const isLimitReached = !isUnlimited && used >= limit;
  
  let progressColor = 'bg-[#2D6A4F]';
  if (usagePercentage >= 90 || isLimitReached) progressColor = 'bg-[#DC2626]';
  else if (usagePercentage >= 60) progressColor = 'bg-[#F59E0B]';

  const getResetText = () => {
    if (!resetDate) return 'Resets in 24 hours';
    const diffMs = new Date(resetDate) - new Date();
    if (diffMs <= 0) return 'Resets soon';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (hours >= 24) return 'Resets in 24 hours';
    if (hours > 0) return `Resets in ${hours}h ${mins}m`;
    return `Resets in ${Math.max(1, mins)} mins`;
  };

  // Pro or Business active state
  if (isUnlimited || currentPlanKey !== 'FREE') {
    return (
      <div className="rounded-xl bg-[#F0FAF5] p-3.5 ring-1 ring-[#B3E4CC] shadow-xs font-sans flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Crown className="h-4 w-4 text-[#2D6A4F]" />
            <span className="text-xs font-bold text-[#1B4532] uppercase tracking-wide">
              NOTARYCHAIN {currentPlan?.name || 'PRO'}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2D6A4F] bg-white px-2 py-0.5 rounded-full border border-[#B3E4CC]">
            <Check className="w-3 h-3" /> Pro Active
          </span>
        </div>

        <div className="space-y-1 text-[11px] text-[#2D6A4F]">
          <p className="font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F]" />
            Unlimited* document verification
          </p>
          <p className="text-[10px] text-[#52796F]">
            *Fair use policy applies · Advanced verification active
          </p>
        </div>

        <div className="pt-1.5 border-t border-[#B3E4CC]/60 flex justify-between items-center text-[10px] text-[#52796F]">
          <span>Verifications completed: <strong>{used}</strong></span>
          <Link to="/pricing" className="font-bold text-[#2D6A4F] hover:underline">Manage</Link>
        </div>
      </div>
    );
  }

  // Free Plan State
  return (
    <>
      <div className="rounded-xl bg-white p-3.5 ring-1 ring-[#E8E2DA] shadow-xs font-sans flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4 text-[#7B746E]" />
            <span className="text-xs font-bold text-[#2E2A26] uppercase tracking-wide">
              Free Plan
            </span>
          </div>
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="text-[11px] font-bold text-[#2D6A4F] hover:text-[#1B4532] flex items-center gap-0.5 transition-colors cursor-pointer"
          >
            <span>Upgrade to Pro</span>
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>

        <div>
          <div className="flex justify-between items-end mb-1">
            <span className="text-[11px] font-medium text-[#55504B]">
              {isLimitReached ? `${limit} / ${limit} Limit Reached` : `${used} / ${limit} Free Verifications Used`}
            </span>
            <span className={`text-[11px] font-bold ${isLimitReached ? 'text-[#DC2626]' : 'text-[#2D6A4F]'}`}>
              {isLimitReached ? '0 left' : `${remainingCount} remaining`}
            </span>
          </div>
          
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#FAF8F4] ring-1 ring-inset ring-[#E8E2DA]">
            <div 
              className={`h-full ${progressColor} transition-all duration-500`} 
              style={{ width: `${Math.min((used / limit) * 100, 100)}%` }} 
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between text-[10px] text-[#7B746E] pt-1">
          <span>{getResetText()}</span>
          {isLimitReached ? (
            <span className="text-[#DC2626] font-bold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Limit reached
            </span>
          ) : (
            <span>₹499/mo for Pro</span>
          )}
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </>
  );
}
