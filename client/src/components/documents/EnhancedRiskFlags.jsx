import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ChevronDown, ShieldCheck } from 'lucide-react';

const SEVERITY_CONFIG = {
  high: { color: 'text-[#DC2626]', bg: 'bg-red-50', border: 'border-red-200', label: 'High Risk' },
  medium: { color: 'text-[#F59E0B]', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Medium Risk' },
  low: { color: 'text-[#2563EB]', bg: 'bg-blue-50', border: 'border-blue-200', label: 'Low Risk' },
  info: { color: 'text-[#7B746E]', bg: 'bg-[#FAF8F4]', border: 'border-[#E8E2DA]', label: 'Info' }
};

const generateExplanation = (flag, documentType) => {
  const lowerFlag = (flag || '').toLowerCase();
  if (lowerFlag.includes('signature')) {
    return `The AI detected anomalies in the signature region. For a ${documentType || 'document'} of this type, this could indicate a copy-pasted signature or digital manipulation of the ink layer.`;
  } else if (lowerFlag.includes('date')) {
    return `The dates found in the document text do not align with metadata or appear logically inconsistent for a ${documentType || 'document'}.`;
  } else if (lowerFlag.includes('font') || lowerFlag.includes('text')) {
    return `Inconsistencies in font rendering or kerning were detected, which often indicates text replacement or PDF tampering after initial generation.`;
  }
  return `This potential issue was flagged by our AI analysis models during the review of this ${documentType || 'document'}. We recommend manual review of this section.`;
};

const RiskFlagItem = ({ flag, documentType }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = SEVERITY_CONFIG[flag.severity] || SEVERITY_CONFIG.info;

  return (
    <div className={`border rounded-lg overflow-hidden transition-colors ${isExpanded ? config.border : 'border-[#E8E2DA]'}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-[#FAF8F4] ${isExpanded ? config.bg : 'bg-white'}`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${config.color.replace('text-', 'bg-')}`} />
          <span className="text-sm font-medium text-[#2E2A26]">{flag.flag}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.bg} ${config.color} border ${config.border}`}>
            {config.label}
          </span>
          <ChevronDown className={`w-4 h-4 text-[#7B746E] transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className={`p-4 border-t ${config.border} bg-white`}>
              <h5 className="text-xs font-semibold text-[#55504B] uppercase tracking-wider mb-2">Why was this flagged?</h5>
              <p className="text-sm text-[#55504B] leading-relaxed">
                {flag.explanation || generateExplanation(flag.flag, documentType)}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function EnhancedRiskFlags({ riskFlags = [], documentType = 'Document' }) {
  if (!riskFlags || riskFlags.length === 0) {
    return (
      <div className="bg-[#F0FAF5] border border-[#B3E4CC] rounded-xl p-6 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <ShieldCheck className="w-6 h-6 text-[#2D6A4F]" />
        </div>
        <h4 className="text-lg font-medium text-[#2D6A4F] mb-1">No concerns detected</h4>
        <p className="text-sm text-green-700">AI analysis found no signs of tampering or anomalies in this document.</p>
      </div>
    );
  }

  const highCount = riskFlags.filter(f => f.severity === 'high').length;
  const mediumCount = riskFlags.filter(f => f.severity === 'medium').length;

  return (
    <div className="bg-[#FFFFFF] border border-[#E8E2DA] rounded-xl p-6 shadow-sm font-sans">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[#2E2A26] flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
          AI Risk Analysis
        </h3>
      </div>

      <div className="flex items-center gap-4 mb-6 p-4 bg-[#FAF8F4] rounded-lg border border-[#E8E2DA]">
        <div className="flex-1">
          <p className="text-sm font-medium text-[#2E2A26]">
            {riskFlags.length} flags detected
          </p>
          <p className="text-xs text-[#7B746E] mt-0.5">
            {highCount} high, {mediumCount} medium severity
          </p>
        </div>
        <div className="shrink-0 flex gap-1">
          {riskFlags.map((flag, idx) => (
            <div
              key={idx}
              className={`w-2 h-8 rounded-full ${SEVERITY_CONFIG[flag.severity]?.color.replace('text-', 'bg-') || 'bg-gray-300'}`}
              title={flag.severity}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {riskFlags.map((flag, idx) => (
          <RiskFlagItem key={idx} flag={flag} documentType={documentType} />
        ))}
      </div>
    </div>
  );
}
