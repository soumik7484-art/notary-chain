import React, { useState, useEffect } from 'react';
import { BarChart3, Crown, ArrowUpRight, Check, Sparkles, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePlan } from '../../context/PlanContext';
import UpgradeModal from './UpgradeModal';

export default function UsageTracker() {
  const { currentPlan, currentPlanKey, verificationsUsed, verificationsLimit, remainingCount, isUnlimited, usagePercentage, resetDate, fetchQuota } = usePlan();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Live real-time ticking timer (updates every second)
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Trigger re-fetch when countdown hits 00s
  useEffect(() => {
    if (resetDate) {
      const diffMs = new Date(resetDate).getTime() - now;
      if (diffMs <= 0 && diffMs > -2000) {
        fetchQuota?.();
      }
    }
  }, [now, resetDate, fetchQuota]);

  const used = verificationsUsed ?? 0;
  const limit = verificationsLimit ?? 3;
  const isLimitReached = !isUnlimited && used >= limit;
  
  let progressColor = 'bg-[#2D6A4F]';
  if (usagePercentage >= 90 || isLimitReached) progressColor = 'bg-[#DC2626]';
  else if (usagePercentage >= 60) progressColor = 'bg-[#F59E0B]';

  const formatResetDateTime = (date) => {
    const d = date ? new Date(date) : new Date(now + 24 * 60 * 60 * 1000);
    const validD = isNaN(d.getTime()) ? new Date(now + 24 * 60 * 60 * 1000) : d;

    // Free tier reset is strictly 24 hours
    const clampedDate = validD.getTime() > now + 24 * 60 * 60 * 1000 + 1000
      ? new Date(now + 24 * 60 * 60 * 1000)
      : validD;

    const dateStr = clampedDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const timeStr = clampedDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    let tz = '';
    try {
      const parts = clampedDate.toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ');
      const last = parts[parts.length - 1];
      if (last && !last.includes(':') && !last.includes('/')) {
        tz = ` ${last}`;
      }
    } catch (e) {}

    return `Resets on ${dateStr} at ${timeStr}${tz}`;
  };

  const getCountdownText = () => {
    if (!resetDate) return '23h 59m 59s';
    const target = new Date(resetDate).getTime();
    const diffMs = target - now;

    if (diffMs <= 0) {
      return '00h 00m 00s';
    }

    const totalSecs = Math.floor(diffMs / 1000);
    // Strictly max 24 hours (23h 59m 59s)
    const boundedSecs = Math.min(totalSecs, 86399);
    const hours = Math.floor(boundedSecs / 3600);
    const mins = Math.floor((boundedSecs % 3600) / 60);
    const secs = boundedSecs % 60;

    const pad = (n) => String(n).padStart(2, '0');

    return `${pad(hours)}h ${pad(mins)}m ${pad(secs)}s`;
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
        
        {isLimitReached ? (
          <div className="pt-1.5 border-t border-[#E8E2DA]/60 space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-[#7B746E] font-medium leading-tight truncate mr-1" title={formatResetDateTime(resetDate)}>
                {formatResetDateTime(resetDate)}
              </span>
              <span className="text-[#DC2626] font-bold flex items-center gap-1 shrink-0">
                <AlertTriangle className="w-3 h-3" /> Limit reached
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-[#2D6A4F] font-mono font-bold tracking-tight">
                {getCountdownText()}
              </span>
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="text-[10px] font-bold text-[#2D6A4F] hover:underline cursor-pointer"
              >
                Upgrade now
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-1.5 border-t border-[#E8E2DA]/60 flex justify-between items-center text-[10px] text-[#7B746E]">
            <span>₹499/mo for Pro</span>
          </div>
        )}
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </>
  );
}
