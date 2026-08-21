import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

/**
 * Calculates a normalized risk score out of 10 (0.0 to 10.0)
 */
export function calculateRiskOutOf10(trustScore, riskLevel, customRisk) {
  if (typeof customRisk === 'number') {
    return Math.max(0, Math.min(10, customRisk > 10 ? customRisk / 10 : customRisk));
  }

  if (typeof trustScore === 'number') {
    const calculated = (100 - Math.max(0, Math.min(100, trustScore))) / 10;
    return Math.max(0, Math.min(10, parseFloat(calculated.toFixed(1))));
  }

  const level = (riskLevel || '').toUpperCase();
  if (level === 'CRITICAL') return 9.0;
  if (level === 'HIGH')     return 7.5;
  if (level === 'MEDIUM')   return 4.5;
  return 1.0;
}

/**
 * Returns color tokens and status text based on a 0-10 risk scale
 */
export function getRiskTier(riskOutOf10) {
  if (riskOutOf10 >= 7.0) {
    return {
      tier: 'HIGH',
      label: 'High Risk',
      sublabel: 'Strict Review Required',
      color: '#DC2626',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
      badgeBg: 'bg-red-100 text-red-800 border-red-200',
      icon: ShieldAlert,
      barGradient: 'from-amber-500 via-orange-500 to-red-600'
    };
  }
  if (riskOutOf10 >= 3.5) {
    return {
      tier: 'MEDIUM',
      label: 'Medium Risk',
      sublabel: 'Manual Inspection Suggested',
      color: '#D97706',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-700',
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: AlertTriangle,
      barGradient: 'from-emerald-500 via-yellow-500 to-amber-500'
    };
  }
  return {
    tier: 'LOW',
    label: 'Low Risk',
    sublabel: 'Document Appears Authentic',
    color: '#16A34A',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: ShieldCheck,
    barGradient: 'from-emerald-400 to-emerald-600'
  };
}

/**
 * RiskMeter Component
 * @param {number} trustScore (0-100)
 * @param {string} riskLevel ("LOW" | "MEDIUM" | "HIGH" | "CRITICAL")
 * @param {number} riskScore (optional explicit 0-10 score)
 * @param {string} size ("compact" | "card" | "badge")
 * @param {boolean} showSegments (render 10-bar tick meter)
 * @param {string} className
 */
const RiskMeter = ({
  trustScore = null,
  riskLevel = 'LOW',
  riskScore = null,
  size = 'card',
  showSegments = true,
  className = ''
}) => {
  const score = calculateRiskOutOf10(trustScore, riskLevel, riskScore);
  const tier = getRiskTier(score);
  const Icon = tier.icon;

  // 1. Compact inline badge mode (e.g. for card headers & table rows)
  if (size === 'compact' || size === 'badge') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono ${tier.bgColor} ${tier.borderColor} ${className}`}>
        <Icon className={`w-3.5 h-3.5 ${tier.textColor}`} />
        <div className="flex items-center gap-1 text-xs font-bold">
          <span className="text-[#7B746E]">Risk:</span>
          <span className={tier.textColor}>{score.toFixed(1)}</span>
          <span className="text-[10px] text-[#7B746E]">/10</span>
        </div>
      </div>
    );
  }

  // 2. Full interactive card mode with 10 segments
  return (
    <div className={`p-4 rounded-2xl border ${tier.bgColor} ${tier.borderColor} transition-all shadow-xs ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl ${tier.badgeBg} flex items-center justify-center shadow-xs`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#2E2A26] uppercase tracking-wider">Document Risk Meter</span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${tier.badgeBg}`}>
                {tier.tier} RISK
              </span>
            </div>
            <p className="text-[10px] text-[#7B746E]">{tier.sublabel}</p>
          </div>
        </div>

        {/* Score Readout out of 10 */}
        <div className="text-right">
          <div className="flex items-baseline justify-end gap-1">
            <span className={`font-mono text-2xl font-extrabold tracking-tight ${tier.textColor}`}>
              {score.toFixed(1)}
            </span>
            <span className="font-mono text-xs font-bold text-[#7B746E]">
              / 10
            </span>
          </div>
          {typeof trustScore === 'number' && (
            <p className="text-[10px] font-mono font-medium text-[#7B746E]">
              Trust: {trustScore}/100
            </p>
          )}
        </div>
      </div>

      {/* 10-Segment Risk Gauge */}
      {showSegments && (
        <div className="space-y-1.5 pt-1">
          <div className="grid grid-cols-10 gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((seg) => {
              const isFilled = score >= seg - 0.5;
              const segColor =
                seg <= 3 ? 'bg-emerald-500' :
                seg <= 6 ? 'bg-amber-500' :
                seg <= 8 ? 'bg-orange-500' : 'bg-red-600';

              return (
                <div
                  key={seg}
                  className="h-2.5 rounded-sm overflow-hidden bg-black/5 relative"
                >
                  {isFilled && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.25, delay: seg * 0.02 }}
                      className={`h-full w-full ${segColor}`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-between text-[9px] font-mono text-[#7B746E] font-medium px-0.5">
            <span className="text-emerald-700 font-bold">0.0 (Safe)</span>
            <span className="text-amber-700 font-bold">5.0 (Moderate)</span>
            <span className="text-red-700 font-bold">10.0 (Critical)</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskMeter;
