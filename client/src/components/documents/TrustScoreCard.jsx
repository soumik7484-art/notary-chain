import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Shield, FileCheck, Fingerprint, Link2, Activity } from 'lucide-react';
// Following prompt instructions:
// import { TRUST_SCORE_CATEGORIES } from '../../utils/planConfig';

const AnimatedCounter = ({ value }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const end = value || 0;
    if (start === end) {
      setCount(end);
      return;
    }
    
    let startTime = null;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * (end - start) + start));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [value]);

  return <span>{count}</span>;
};

export default function TrustScoreCard({ trustScore = 0, hash, status, hasBlockchainProof, aiRiskFlags = [], uploadedBy }) {
  // Calculate breakdown
  const integrityScore = hash ? 25 : 0;
  const identityScore = uploadedBy?.isVerified ? 20 : (uploadedBy ? 10 : 0);
  const riskScore = Math.max(0, 20 - (aiRiskFlags.length * 5));
  const blockchainScore = hasBlockchainProof ? 20 : 0;
  const statusScore = status === 'verified' ? 15 : (status === 'pending' ? 5 : 0);
  
  const getScoreColor = (score) => {
    if (score >= 70) return '#2D6A4F'; // Primary Green
    if (score >= 40) return '#F59E0B'; // Amber
    return '#DC2626'; // Red
  };

  const color = getScoreColor(trustScore);
  
  // Calculate SVG stroke dash array
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((trustScore || 0) / 100) * circumference;

  const categories = [
    { label: 'Document Integrity', score: integrityScore, max: 25, icon: FileCheck },
    { label: 'Identity Verification', score: identityScore, max: 20, icon: Fingerprint },
    { label: 'AI Risk Analysis', score: riskScore, max: 20, icon: Activity },
    { label: 'Blockchain Proof', score: blockchainScore, max: 20, icon: Link2 },
    { label: 'Verification Status', score: statusScore, max: 15, icon: ShieldCheck }
  ];

  return (
    <div className="bg-[#FFFFFF] border border-[#E8E2DA] rounded-xl p-6 shadow-sm font-sans">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[#2E2A26] flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#2D6A4F]" />
          Trust Score Breakdown
        </h3>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div className="relative flex flex-col items-center justify-center shrink-0">
          <svg width="160" height="160" className="transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="#E8E2DA"
              strokeWidth="12"
              fill="transparent"
            />
            <motion.circle
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: "easeOut" }}
              cx="80"
              cy="80"
              r={radius}
              stroke={color}
              strokeWidth="12"
              fill="transparent"
              strokeLinecap="round"
              style={{ strokeDasharray: circumference }}
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-4xl font-bold" style={{ color }}>
              <AnimatedCounter value={trustScore} />
            </span>
            <span className="text-sm text-[#7B746E]">/ 100</span>
          </div>
        </div>

        <div className="flex-1 w-full space-y-4">
          {categories.map((cat, idx) => (
            <div key={idx}>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2 text-sm text-[#55504B]">
                  <cat.icon className="w-4 h-4 text-[#7B746E]" />
                  {cat.label}
                </div>
                <span className="text-sm font-medium text-[#2E2A26]">{cat.score}/{cat.max}</span>
              </div>
              <div className="w-full h-2 bg-[#E8E2DA] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(cat.score / cat.max) * 100}%` }}
                  transition={{ duration: 0.8, delay: idx * 0.1 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: getScoreColor((cat.score / cat.max) * 100) }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
